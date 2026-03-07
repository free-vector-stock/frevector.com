/**
 * Admin API - Protected endpoints for managing vectors
 * Fixed: Improved category matching (Levenshtein, prefix, and normalization)
 * Fixed: Flat R2 storage with legacy support hints.
 */

const ADMIN_PASSWORD = "vector2026";
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1000;

const VALID_CATEGORIES = [
  "Abstract", "Animals/Wildlife", "The Arts", "Backgrounds/Textures", "Beauty/Fashion",
  "Buildings/Landmarks", "Business/Finance", "Celebrities", "Drink", "Education",
  "Font", "Food", "Healthcare/Medical", "Holidays", "Icon", "Industrial",
  "Interiors", "Logo", "Miscellaneous", "Nature", "Objects", "Parks/Outdoor",
  "People", "Religion", "Science", "Signs/Symbols", "Sports/Recreation",
  "Technology", "Transportation", "Vintage"
];

/**
 * Normalizes strings for better comparison (removes Turkish accents, lowers case)
 */
function normalizeString(str) {
    if (!str) return "";
    return str.toString().toLowerCase().trim()
        .replace(/ı/g, 'i')
        .replace(/ğ/g, 'g')
        .replace(/ü/g, 'u')
        .replace(/ş/g, 's')
        .replace(/ö/g, 'o')
        .replace(/ç/g, 'c');
}

/**
 * Simple Levenshtein distance
 */
function levenshtein(a, b) {
  const m = a.length, n = b.length;
  const dp = Array.from({ length: m + 1 }, (_, i) => [i, ...Array(n).fill(0)]);
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = a[i - 1] === b[j - 1]
        ? dp[i - 1][j - 1]
        : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
    }
  }
  return dp[m][n];
}

/**
 * Advanced category matching
 */
function resolveCategory(raw) {
    if (!raw) return "Miscellaneous";
    const s = normalizeString(raw);
    
    // 1. Exact or Prefix Match
    for (const cat of VALID_CATEGORIES) {
        const normCat = normalizeString(cat);
        // "backgrounds" matches "backgrounds/textures"
        if (normCat.includes(s) || s.includes(normCat)) return cat;
        // Check first part (e.g. "animals" matches "animals/wildlife")
        const firstPart = normCat.split('/')[0];
        if (firstPart.includes(s) || s.includes(firstPart)) return cat;
    }

    // 2. Levenshtein Distance
    let best = "Miscellaneous", bestDist = 4;
    for (const cat of VALID_CATEGORIES) {
        const d = levenshtein(s, normalizeString(cat));
        if (d < bestDist) {
            bestDist = d;
            best = cat;
        }
    }
    
    return best;
}

function authenticate(request) {
  const authHeader = request.headers.get("X-Admin-Key") || request.headers.get("Authorization");
  if (!authHeader) return false;
  const key = authHeader.replace("Bearer ", "").trim();
  return key === ADMIN_PASSWORD;
}

async function uploadWithRetry(r2, key, buffer, metadata, retries = MAX_RETRIES) {
  let lastError;
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      await r2.put(key, buffer, { httpMetadata: metadata });
      const check = await r2.head(key);
      if (check) return { success: true, attempt };
      throw new Error("Upload verification failed");
    } catch (e) {
      lastError = e;
      if (attempt < retries) {
        await new Promise(r => setTimeout(r, RETRY_DELAY_MS * attempt));
      }
    }
  }
  return { success: false, error: lastError?.message, attempts: retries };
}

// ─────────────────────────────────────────────
// GET /api/admin
// ─────────────────────────────────────────────
export async function onRequestGet(context) {
  const headers = { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" };
  if (!authenticate(context.request)) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers });

  try {
    const kv = context.env.VECTOR_DB;
    const url = new URL(context.request.url);
    const action = url.searchParams.get("action");

    const allVectorsRaw = await kv.get("all_vectors");
    const allVectors = allVectorsRaw ? JSON.parse(allVectorsRaw) : [];

    if (action === "stats") {
      const stats = {};
      let totalDownloads = 0;
      for (const v of allVectors) {
        const cat = v.category || "Unknown";
        if (!stats[cat]) stats[cat] = { count: 0, downloads: 0 };
        stats[cat].count++;
        stats[cat].downloads += v.downloads || 0;
        totalDownloads += v.downloads || 0;
      }
      const categories = Object.entries(stats).sort(([a], [b]) => a.localeCompare(b)).map(([name, data]) => ({ name, ...data }));
      return new Response(JSON.stringify({ totalVectors: allVectors.length, totalDownloads, categories }), { status: 200, headers });
    }

    if (action === "health") {
      const r2 = context.env.VECTOR_ASSETS;
      const issues = [];
      const sampleSize = Math.min(200, Math.max(1, parseInt(url.searchParams.get("sample") || "50")));
      const sample = allVectors.slice(0, sampleSize);
      
      const r2Checks = await Promise.all(
        sample.map(async (v) => {
          // Check flat structure first, then legacy structure
          const jpgFlat = await r2.head(`${v.name}.jpg`);
          const jpgLegacy = !jpgFlat ? await r2.head(`assets/${v.category}/${v.name}.jpg`) : null;
          
          const zipFlat = await r2.head(`${v.name}.zip`);
          const zipLegacy = !zipFlat ? await r2.head(`assets/${v.category}/${v.name}.zip`) : null;
          
          return { v, jpg: !!(jpgFlat || jpgLegacy), zip: !!(zipFlat || zipLegacy) };
        })
      );

      for (const { v, jpg, zip } of r2Checks) {
        if (!jpg) issues.push({ slug: v.name, type: "missing_jpg", fix: "Re-upload" });
        if (!zip) issues.push({ slug: v.name, type: "missing_zip", fix: "Re-upload" });
      }

      return new Response(JSON.stringify({
        totalVectors: allVectors.length,
        issueCount: issues.length,
        issues,
        r2SampleSize: sampleSize
      }), { status: 200, headers });
    }

    return new Response(JSON.stringify({ vectors: allVectors }), { status: 200, headers });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500, headers });
  }
}

// ─────────────────────────────────────────────
// POST /api/admin (upload vector)
// ─────────────────────────────────────────────
export async function onRequestPost(context) {
  const headers = { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" };
  if (!authenticate(context.request)) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers });

  try {
    const kv = context.env.VECTOR_DB;
    const r2 = context.env.VECTOR_ASSETS;
    const formData = await context.request.formData();

    const jsonFile = formData.get("json");
    const jpegFile = formData.get("jpeg");
    const zipFile  = formData.get("zip");

    if (!jsonFile || !jpegFile || !zipFile) {
      return new Response(JSON.stringify({ error: "Missing required files (JSON, JPEG, ZIP)." }), { status: 400, headers });
    }

    const jpegBuffer = await jpegFile.arrayBuffer();
    const zipBuffer  = await zipFile.arrayBuffer();
    
    let metadata;
    try {
      metadata = JSON.parse(await jsonFile.text());
    } catch (e) {
      return new Response(JSON.stringify({ error: "Invalid JSON: " + e.message }), { status: 400, headers });
    }

    const getField = (obj, field) => {
      const key = Object.keys(obj).find(k => k.toLowerCase() === field.toLowerCase());
      return key ? obj[key] : null;
    };

    const title    = getField(metadata, "title");
    const keywords = getField(metadata, "keywords");
    
    // Improved category resolution
    const rawCategory = getField(metadata, "category");
    const category = resolveCategory(rawCategory);
    
    // ID comes from the filename (e.g., backgrounds-textures-00000317)
    const id = jsonFile.name.replace(/\.json$/, "");

    // 1. Upload to R2 (Flat structure)
    const jpgUpload = await uploadWithRetry(r2, `${id}.jpg`, jpegBuffer, { contentType: "image/jpeg" });
    if (!jpgUpload.success) return new Response(JSON.stringify({ error: "JPG upload failed" }), { status: 500, headers });

    const zipUpload = await uploadWithRetry(r2, `${id}.zip`, zipBuffer, { 
      contentType: "application/zip",
      contentDisposition: `attachment; filename="${id}.zip"`
    });
    if (!zipUpload.success) return new Response(JSON.stringify({ error: "ZIP upload failed" }), { status: 500, headers });

    // 2. Save to KV
    const vectorRecord = {
      name: id,
      category: category,
      title: String(title || id).trim(),
      description: getField(metadata, "description") || "",
      keywords: Array.isArray(keywords) ? keywords : String(keywords || "").split(",").map(k => k.trim()).filter(Boolean),
      date: new Date().toISOString().split("T")[0],
      downloads: 0,
      fileSize: `${(zipBuffer.byteLength / (1024 * 1024)).toFixed(1)} MB`
    };

    const allVectorsRaw = await kv.get("all_vectors");
    let allVectors = allVectorsRaw ? JSON.parse(allVectorsRaw) : [];
    
    // Replace if exists, otherwise unshift
    const index = allVectors.findIndex(v => v.name === id);
    if (index !== -1) allVectors[index] = vectorRecord;
    else allVectors.unshift(vectorRecord);

    await kv.put("all_vectors", JSON.stringify(allVectors));

    return new Response(JSON.stringify({ success: true, id, category }), { status: 200, headers });

  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500, headers });
  }
}

// ─────────────────────────────────────────────
// DELETE /api/admin?slug=xxx
// ─────────────────────────────────────────────
export async function onRequestDelete(context) {
  const headers = { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" };
  if (!authenticate(context.request)) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers });

  try {
    const kv = context.env.VECTOR_DB;
    const r2 = context.env.VECTOR_ASSETS;
    const id = new URL(context.request.url).searchParams.get("slug");

    if (!id) return new Response(JSON.stringify({ error: "Missing ID" }), { status: 400, headers });

    const allVectorsRaw = await kv.get("all_vectors");
    if (allVectorsRaw) {
      let allVectors = JSON.parse(allVectorsRaw);
      allVectors = allVectors.filter(v => v.name !== id);
      await kv.put("all_vectors", JSON.stringify(allVectors));
    }

    // Try deleting from both flat and legacy structure
    await r2.delete(`${id}.jpg`);
    await r2.delete(`${id}.zip`);
    // Note: We don't know the category here for legacy delete, 
    // but flat delete is the priority. Legacy files will stay but won't be in KV.

    return new Response(JSON.stringify({ success: true }), { status: 200, headers });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500, headers });
  }
}

// ─────────────────────────────────────────────
// PATCH /api/admin?action=cleanup
// ─────────────────────────────────────────────
export async function onRequestPatch(context) {
  const headers = { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" };
  if (!authenticate(context.request)) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers });

  try {
    const kv = context.env.VECTOR_DB;
    const r2 = context.env.VECTOR_ASSETS;
    const action = new URL(context.request.url).searchParams.get("action");

    if (action === "cleanup") {
      const allVectorsRaw = await kv.get("all_vectors");
      const allVectors = allVectorsRaw ? JSON.parse(allVectorsRaw) : [];
      const cleaned = [];

      for (const v of allVectors) {
        // Check flat structure first, then legacy structure
        const jpgFlat = await r2.head(`${v.name}.jpg`);
        const jpgLegacy = !jpgFlat ? await r2.head(`assets/${v.category}/${v.name}.jpg`) : null;
        
        const zipFlat = await r2.head(`${v.name}.zip`);
        const zipLegacy = !zipFlat ? await r2.head(`assets/${v.category}/${v.name}.zip`) : null;

        if ((jpgFlat || jpgLegacy) && (zipFlat || zipLegacy)) cleaned.push(v);
      }

      await kv.put("all_vectors", JSON.stringify(cleaned));
      return new Response(JSON.stringify({ success: true, count: cleaned.length }), { status: 200, headers });
    }
    return new Response(JSON.stringify({ error: "Unknown action" }), { status: 400, headers });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500, headers });
  }
}

export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, DELETE, PATCH, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, X-Admin-Key, Authorization"
    }
  });
}
