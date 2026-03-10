/**
 * Admin API - Protected endpoints for managing vectors
 * Fixed: Robust authentication and category-specific folder structure in R2.
 * Requirement: No local storage, direct R2 upload, sync delete.
 */

const ADMIN_PASSWORD = "vector2026";
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1000;

const VALID_CATEGORIES = [
    'Abstract', 'Animals', 'The Arts', 'Backgrounds', 'Fashion', 'Buildings', 'Business', 'Celebrities',
    'Education', 'Food', 'Drink', 'Medical', 'Holidays', 'Industrial', 'Interiors', 'Miscellaneous',
    'Nature', 'Objects', 'Outdoor', 'People', 'Religion', 'Science', 'Symbols', 'Sports',
    'Technology', 'Transportation', 'Vintage', 'Logo', 'Font', 'Icon'
];

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
 * Advanced category matching - resolves to valid KV category name
 */
function resolveCategory(raw, id) {
    if (!raw && !id) return "Miscellaneous";
    
    // Try to infer from ID if raw is missing or Miscellaneous
    let searchStr = (raw || "").toString().toLowerCase();
    if ((!raw || searchStr === "miscellaneous") && id) {
        searchStr = id.toString().toLowerCase();
    }
    
    const s = normalizeString(searchStr);
    
    // 1. Exact match
    for (const cat of VALID_CATEGORIES) {
        if (normalizeString(cat) === s) return cat;
    }
    
    // 2. Prefix/contains match
    for (const cat of VALID_CATEGORIES) {
        const normCat = normalizeString(cat);
        if (normCat.includes(s) || s.includes(normCat)) return cat;
    }

    return "Miscellaneous";
}

/**
 * Robust authentication check
 */
function authenticate(request) {
  const authHeader = request.headers.get("X-Admin-Key") || request.headers.get("Authorization") || "";
  const key = authHeader.replace("Bearer ", "").trim();
  
  // Also check for password in URL as a fallback for some legacy calls
  const url = new URL(request.url);
  const urlKey = url.searchParams.get("key");
  
  return key === ADMIN_PASSWORD || urlKey === ADMIN_PASSWORD;
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
  const headers = { 
    "Content-Type": "application/json", 
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, DELETE, PATCH, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, X-Admin-Key, Authorization"
  };
  
  if (!authenticate(context.request)) {
    return new Response(JSON.stringify({ error: "Unauthorized", message: "Invalid admin password" }), { status: 401, headers });
  }

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
          const categoryFolder = v.category.replace(/\s+/g, '-').toLowerCase();
          const jpgCheck = await r2.head(`${categoryFolder}/${v.name}.jpg`);
          const zipCheck = await r2.head(`${categoryFolder}/${v.name}.zip`);
          const jsonCheck = await r2.head(`${categoryFolder}/${v.name}.json`);
          
          return { v, jpg: !!jpgCheck, zip: !!zipCheck, json: !!jsonCheck };
        })
      );

      for (const { v, jpg, zip, json } of r2Checks) {
        if (!jpg) issues.push({ slug: v.name, type: "missing_jpg", fix: "Re-upload" });
        if (!zip) issues.push({ slug: v.name, type: "missing_zip", fix: "Re-upload" });
        if (!json) issues.push({ slug: v.name, type: "missing_json", fix: "Re-upload" });
      }

      return new Response(JSON.stringify({
        totalVectors: allVectors.length,
        issueCount: issues.length,
        issues,
        r2SampleSize: sampleSize
      }), { status: 200, headers });
    }

    // Default: return all vectors
    return new Response(JSON.stringify({ vectors: allVectors }), { status: 200, headers });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500, headers });
  }
}

// ─────────────────────────────────────────────
// POST /api/admin (upload vector)
// ─────────────────────────────────────────────
export async function onRequestPost(context) {
  const headers = { 
    "Content-Type": "application/json", 
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, DELETE, PATCH, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, X-Admin-Key, Authorization"
  };
  
  if (!authenticate(context.request)) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers });
  }

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

    const jsonText = await jsonFile.text();
    const jsonBuffer = new TextEncoder().encode(jsonText);
    const jpegBuffer = await jpegFile.arrayBuffer();
    const zipBuffer  = await zipFile.arrayBuffer();
    
    let metadata;
    try {
      metadata = JSON.parse(jsonText);
    } catch (e) {
      return new Response(JSON.stringify({ error: "Invalid JSON: " + e.message }), { status: 400, headers });
    }

    const getField = (obj, field) => {
      const key = Object.keys(obj).find(k => k.toLowerCase() === field.toLowerCase());
      return key ? obj[key] : null;
    };

    const title    = getField(metadata, "title");
    let keywords = getField(metadata, "keywords");
    
    // ID comes from the filename (e.g., icon-00000001)
    const id = jsonFile.name.replace(/\.json$/, "");
    
    // Resolve category from JSON field or ID
    const rawCategory = getField(metadata, "category");
    const category = resolveCategory(rawCategory, id);
    
    // Upload to R2 in category-specific folder: Category/ID/ID.ext
    // Requirement: "aynı ada sahip işleri (jpeg + json + zip) bir klasör oluşturup aynı ada sahip klasöre koyması lazım"
    const r2JpgKey = `${category}/${id}/${id}.jpg`;
    const r2ZipKey = `${category}/${id}/${id}.zip`;
    const r2JsonKey = `${category}/${id}/${id}.json`;

    const jpgUpload = await uploadWithRetry(r2, r2JpgKey, jpegBuffer, { contentType: "image/jpeg" });
    if (!jpgUpload.success) return new Response(JSON.stringify({ error: "JPG upload failed" }), { status: 500, headers });

    const zipUpload = await uploadWithRetry(r2, r2ZipKey, zipBuffer, { 
      contentType: "application/zip",
      contentDisposition: `attachment; filename="${id}.zip"`
    });
    if (!zipUpload.success) return new Response(JSON.stringify({ error: "ZIP upload failed" }), { status: 500, headers });

    const jsonUpload = await uploadWithRetry(r2, r2JsonKey, jsonBuffer, { contentType: "application/json" });
    if (!jsonUpload.success) return new Response(JSON.stringify({ error: "JSON upload failed" }), { status: 500, headers });

    // Save to KV
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
  const headers = { 
    "Content-Type": "application/json", 
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, DELETE, PATCH, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, X-Admin-Key, Authorization"
  };
  
  if (!authenticate(context.request)) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers });
  }

  try {
    const kv = context.env.VECTOR_DB;
    const r2 = context.env.VECTOR_ASSETS;
    const id = new URL(context.request.url).searchParams.get("slug");

    if (!id) return new Response(JSON.stringify({ error: "Missing ID" }), { status: 400, headers });

    // Get the vector to find its category folder
    const allVectorsRaw = await kv.get("all_vectors");
    let allVectors = allVectorsRaw ? JSON.parse(allVectorsRaw) : [];
    const vector = allVectors.find(v => v.name === id);
    const category = vector ? vector.category : null;
    
    // Delete from R2 category-specific folder: Category/ID/ID.ext
    if (category) {
      await r2.delete(`${category}/${id}/${id}.jpg`).catch(() => {});
      await r2.delete(`${category}/${id}/${id}.zip`).catch(() => {});
      await r2.delete(`${category}/${id}/${id}.json`).catch(() => {});
    } else {
      // Fallback: search in all categories if category not in KV
      for (const cat of VALID_CATEGORIES) {
        await r2.delete(`${cat}/${id}/${id}.jpg`).catch(() => {});
        await r2.delete(`${cat}/${id}/${id}.zip`).catch(() => {});
        await r2.delete(`${cat}/${id}/${id}.json`).catch(() => {});
      }
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
  const headers = { 
    "Content-Type": "application/json", 
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, DELETE, PATCH, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, X-Admin-Key, Authorization"
  };
  
  if (!authenticate(context.request)) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers });
  }

  try {
    const kv = context.env.VECTOR_DB;
    const r2 = context.env.VECTOR_ASSETS;
    const action = new URL(context.request.url).searchParams.get("action");

    if (action === "cleanup") {
      const allVectorsRaw = await kv.get("all_vectors");
      const allVectors = allVectorsRaw ? JSON.parse(allVectorsRaw) : [];
      
      // Get all objects in R2 to avoid repeated head requests (optimization)
      const r2Objects = new Set();
      let truncated = true;
      let cursor = undefined;
      
      while (truncated) {
        const list = await r2.list({ cursor });
        list.objects.forEach(obj => r2Objects.add(obj.key));
        truncated = list.truncated;
        cursor = list.cursor;
      }

      const cleaned = [];
      let orphanCount = 0;

      for (const v of allVectors) {
        const categoryFolder = v.category.replace(/\s+/g, '-').toLowerCase();
        const hasJpg = r2Objects.has(`${categoryFolder}/${v.name}.jpg`);
        const hasZip = r2Objects.has(`${categoryFolder}/${v.name}.zip`);
        const hasJson = r2Objects.has(`${categoryFolder}/${v.name}.json`);

        if (hasJpg && hasZip && hasJson) {
          cleaned.push(v);
        } else {
          orphanCount++;
        }
      }

      if (orphanCount > 0) {
        await kv.put("all_vectors", JSON.stringify(cleaned));
      }
      
      return new Response(JSON.stringify({ 
        success: true, 
        count: cleaned.length, 
        orphansRemoved: orphanCount,
        totalChecked: allVectors.length 
      }), { status: 200, headers });
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
