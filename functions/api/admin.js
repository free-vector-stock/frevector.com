/**
 * Admin API - Protected endpoints for managing vectors
 * Fixed: Correct R2 folder mapping for category names
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

// Maps KV category names to R2 folder names
const CATEGORY_TO_R2_FOLDER = {
    "Abstract": "Abstract",
    "Animals/Wildlife": "Animals",
    "The Arts": "The Arts",
    "Backgrounds/Textures": "Backgrounds-Textures",
    "Beauty/Fashion": "Beauty-Fashion",
    "Buildings/Landmarks": "Buildings-Landmarks",
    "Business/Finance": "Business",
    "Celebrities": "Celebrities",
    "Drink": "Drink",
    "Education": "Education",
    "Font": "Font",
    "Food": "Food",
    "Healthcare/Medical": "Healthcare",
    "Holidays": "Holidays",
    "Icon": "Icon",
    "Industrial": "Industrial",
    "Interiors": "Interiors",
    "Logo": "Logo",
    "Miscellaneous": "Miscellaneous",
    "Nature": "Nature",
    "Objects": "Objects",
    "Parks/Outdoor": "Parks",
    "People": "People",
    "Religion": "Religion",
    "Science": "Science",
    "Signs/Symbols": "Signs",
    "Sports/Recreation": "Sports",
    "Technology": "Technology",
    "Transportation": "Transportation",
    "Vintage": "Vintage"
};

/**
 * Normalizes strings for better comparison
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
 * Advanced category matching - resolves to valid KV category name
 */
function resolveCategory(raw) {
    if (!raw) return "Miscellaneous";
    const s = normalizeString(raw);
    
    // 1. Exact match
    for (const cat of VALID_CATEGORIES) {
        if (normalizeString(cat) === s) return cat;
    }
    
    // 2. Prefix/contains match
    for (const cat of VALID_CATEGORIES) {
        const normCat = normalizeString(cat);
        if (normCat.includes(s) || s.includes(normCat)) return cat;
        const firstPart = normCat.split('/')[0];
        if (firstPart.includes(s) || s.includes(firstPart)) return cat;
    }

    // 3. Levenshtein Distance
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

/**
 * Resolve category from filename prefix
 * e.g., "abstract-00000002" → "Abstract"
 * e.g., "backgrounds-textures-00000307" → "Backgrounds/Textures"
 */
function resolveCategoryFromFilename(filename) {
    const lower = filename.toLowerCase();
    
    const prefixMap = [
        { prefix: "abstract-", cat: "Abstract" },
        { prefix: "animals-", cat: "Animals/Wildlife" },
        { prefix: "the-arts-", cat: "The Arts" },
        { prefix: "backgrounds-textures-", cat: "Backgrounds/Textures" },
        { prefix: "beauty-fashion-", cat: "Beauty/Fashion" },
        { prefix: "buildings-landmarks-", cat: "Buildings/Landmarks" },
        { prefix: "business-finance-", cat: "Business/Finance" },
        { prefix: "celebrities-", cat: "Celebrities" },
        { prefix: "drink-", cat: "Drink" },
        { prefix: "education-", cat: "Education" },
        { prefix: "font-", cat: "Font" },
        { prefix: "food-", cat: "Food" },
        { prefix: "healthcare-medical-", cat: "Healthcare/Medical" },
        { prefix: "holidays-", cat: "Holidays" },
        { prefix: "icon-", cat: "Icon" },
        { prefix: "industrial-", cat: "Industrial" },
        { prefix: "interiors-", cat: "Interiors" },
        { prefix: "logo-", cat: "Logo" },
        { prefix: "miscellaneous-", cat: "Miscellaneous" },
        { prefix: "nature-", cat: "Nature" },
        { prefix: "objects-", cat: "Objects" },
        { prefix: "parks-outdoor-", cat: "Parks/Outdoor" },
        { prefix: "people-", cat: "People" },
        { prefix: "religion-", cat: "Religion" },
        { prefix: "science-", cat: "Science" },
        { prefix: "signs-symbols-", cat: "Signs/Symbols" },
        { prefix: "sports-recreation-", cat: "Sports/Recreation" },
        { prefix: "technology-", cat: "Technology" },
        { prefix: "transportation-", cat: "Transportation" },
        { prefix: "vintage-", cat: "Vintage" },
    ];
    
    for (const { prefix, cat } of prefixMap) {
        if (lower.startsWith(prefix)) return cat;
    }
    
    return null;
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
          const cat = v.category || "Miscellaneous";
          const r2cat = v.r2_category || CATEGORY_TO_R2_FOLDER[cat] || cat;
          
          // Check nested structure (primary)
          const jpgNested = await r2.head(`assets/${r2cat}/${v.name}.jpg`);
          // Check flat structure
          const jpgFlat = !jpgNested ? await r2.head(`${v.name}.jpg`) : null;
          
          const zipNested = await r2.head(`assets/${r2cat}/${v.name}.zip`);
          const zipFlat = !zipNested ? await r2.head(`${v.name}.zip`) : null;
          
          return { v, jpg: !!(jpgNested || jpgFlat), zip: !!(zipNested || zipFlat) };
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
    
    // ID comes from the filename (e.g., backgrounds-textures-00000317)
    const id = jsonFile.name.replace(/\.json$/, "");
    
    // Resolve category: first try filename prefix, then JSON field
    let category = resolveCategoryFromFilename(id);
    if (!category) {
        const rawCategory = getField(metadata, "category");
        category = resolveCategory(rawCategory);
    }
    
    // Get R2 folder name for this category
    const r2Folder = CATEGORY_TO_R2_FOLDER[category] || category;
    
    // Upload to R2 using nested structure: assets/R2Folder/filename
    const r2JpgKey = `assets/${r2Folder}/${id}.jpg`;
    const r2ZipKey = `assets/${r2Folder}/${id}.zip`;

    const jpgUpload = await uploadWithRetry(r2, r2JpgKey, jpegBuffer, { contentType: "image/jpeg" });
    if (!jpgUpload.success) return new Response(JSON.stringify({ error: "JPG upload failed" }), { status: 500, headers });

    const zipUpload = await uploadWithRetry(r2, r2ZipKey, zipBuffer, { 
      contentType: "application/zip",
      contentDisposition: `attachment; filename="${id}.zip"`
    });
    if (!zipUpload.success) return new Response(JSON.stringify({ error: "ZIP upload failed" }), { status: 500, headers });

    // Save to KV
    const vectorRecord = {
      name: id,
      category: category,
      r2_category: r2Folder,
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

    return new Response(JSON.stringify({ success: true, id, category, r2Folder }), { status: 200, headers });

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

    // Get vector info to find R2 folder
    const allVectorsRaw = await kv.get("all_vectors");
    let allVectors = allVectorsRaw ? JSON.parse(allVectorsRaw) : [];
    const vector = allVectors.find(v => v.name === id);
    
    if (vector) {
        const cat = vector.category || "Miscellaneous";
        const r2cat = vector.r2_category || CATEGORY_TO_R2_FOLDER[cat] || cat;
        
        // Delete from R2 (try both nested and flat)
        await r2.delete(`assets/${r2cat}/${id}.jpg`).catch(() => {});
        await r2.delete(`assets/${r2cat}/${id}.zip`).catch(() => {});
        await r2.delete(`${id}.jpg`).catch(() => {});
        await r2.delete(`${id}.zip`).catch(() => {});
    }

    // Remove from KV
    allVectors = allVectors.filter(v => v.name !== id);
    await kv.put("all_vectors", JSON.stringify(allVectors));

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
        const cat = v.category || "Miscellaneous";
        const r2cat = v.r2_category || CATEGORY_TO_R2_FOLDER[cat] || cat;
        
        const jpgNested = await r2.head(`assets/${r2cat}/${v.name}.jpg`);
        const jpgFlat = !jpgNested ? await r2.head(`${v.name}.jpg`) : null;
        
        const zipNested = await r2.head(`assets/${r2cat}/${v.name}.zip`);
        const zipFlat = !zipNested ? await r2.head(`${v.name}.zip`) : null;

        if ((jpgNested || jpgFlat) && (zipNested || zipFlat)) cleaned.push(v);
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
