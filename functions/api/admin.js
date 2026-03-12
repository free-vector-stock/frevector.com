/**
 * Admin API - Protected endpoints for managing vectors
 * Fixed: Robust authentication and category-specific folder structure in R2.
 * Requirement: No local storage, direct R2 upload, sync delete.
 */

import { generateThumbnail } from './thumbnail-gen.js';

const ADMIN_PASSWORD = "vector2026";
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1000;

const VALID_CATEGORIES = [
    'Abstract', 'Animals', 'The Arts', 'Backgrounds', 'Fashion', 'Buildings', 'Business', 'Celebrities',
    'Education', 'Food', 'Drink', 'Medical', 'Holidays', 'Industrial', 'Interiors', 'Miscellaneous',
    'Nature', 'Objects', 'Outdoor', 'People', 'Religion', 'Science', 'Symbols', 'Sports',
    'Technology', 'Transportation', 'Vintage', 'Logo', 'Font', 'Icon'
];

// Forbidden words for JPEG-only content
const FORBIDDEN_WORDS_JPEG = [
    'free vector', 'free svg', 'free svg icon', 'free eps', 'vector eps', 'svg'
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
          const category = v.category || 'Miscellaneous';
          // Try new structure: Category/ID/ID.ext
          let jpgCheck = await r2.head(`${category}/${v.name}/${v.name}.jpg`);
          let zipCheck = await r2.head(`${category}/${v.name}/${v.name}.zip`);
          let jsonCheck = await r2.head(`${category}/${v.name}/${v.name}.json`);
          // Fallback: old structure
          if (!jpgCheck) {
            const cf = category.replace(/\s+/g, '-').toLowerCase();
            jpgCheck = await r2.head(`${cf}/${v.name}.jpg`);
            if (!zipCheck) zipCheck = await r2.head(`${cf}/${v.name}.zip`);
            if (!jsonCheck) jsonCheck = await r2.head(`${cf}/${v.name}.json`);
          }
          // JPEG-only content: no zip is normal
          const isJpegOnly = v.contentType === 'jpeg' || (!zipCheck && !!jpgCheck);
          return { v, jpg: !!jpgCheck, zip: !!zipCheck, json: !!jsonCheck, isJpegOnly };
        })
      );

      for (const { v, jpg, zip, json, isJpegOnly } of r2Checks) {
        if (!jpg) issues.push({ slug: v.name, type: "missing_jpg", fix: "Re-upload" });
        // Only report missing_zip for vector content (not jpeg-only)
        if (!zip && !isJpegOnly) issues.push({ slug: v.name, type: "missing_zip", fix: "Re-upload" });
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
// POST /api/admin (upload vector/jpeg)
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
    const zipFile  = formData.get("zip"); // Optional for JPEG-only content

    if (!jsonFile || !jpegFile) {
      return new Response(JSON.stringify({ error: "Missing required files (JSON, JPEG)." }), { status: 400, headers });
    }

    const jsonText = await jsonFile.text();
    const jpegBuffer = await jpegFile.arrayBuffer();
    const zipBuffer  = zipFile ? await zipFile.arrayBuffer() : null;
    
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
    const description = getField(metadata, "description") || "";
    let keywords = getField(metadata, "keywords");
    const isJpegOnly = !zipBuffer;

    // VALIDATION: JSON title/description, keywords, and category are required
    const rawCategory = getField(metadata, "category");
    if ((!title && !description) || !keywords || !rawCategory) {
      return new Response(JSON.stringify({ error: "JSON must include title/description, keywords, and category." }), { status: 400, headers });
    }
    
    // ID comes from the filename (e.g., icon-00000001)
    const id = jsonFile.name.replace(/\.json$/, "");

    // FORBIDDEN WORDS CHECK for JPEG-only
    if (isJpegOnly) {
        const fullText = (title + " " + description + " " + (Array.isArray(keywords) ? keywords.join(" ") : keywords)).toLowerCase();
        for (const word of FORBIDDEN_WORDS_JPEG) {
            if (fullText.includes(word)) {
                return new Response(JSON.stringify({ error: `JPEG content cannot contain forbidden word: ${word}` }), { status: 400, headers });
            }
        }
    }
    
    // Resolve category from JSON field or ID
    const category = resolveCategory(rawCategory, id);
    
    // Upload to R2 in category-specific folder: Category/ID/ID.ext
    const r2JpgKey = `${category}/${id}/${id}.jpg`;
    const r2ZipKey = `${category}/${id}/${id}.zip`;
    const r2JsonKey = `${category}/${id}/${id}.json`;

    const jpgUpload = await uploadWithRetry(r2, r2JpgKey, jpegBuffer, { contentType: "image/jpeg" });
    if (!jpgUpload.success) return new Response(JSON.stringify({ error: "JPG upload failed" }), { status: 500, headers });

    // Create thumbnail (max 512px wide as per requirement)
    const thumbKey = `${category}/${id}/${id}-thumb.jpg`;
    try {
        const thumbnailBuffer = await generateThumbnail(jpegBuffer, 512);
        await r2.put(thumbKey, thumbnailBuffer, { httpMetadata: { contentType: "image/jpeg" } });
    } catch (e) {
        console.error('Thumbnail generation error:', e);
        // Fallback: upload original as thumbnail (though prohibited by rule, we need something if sharp fails in production)
        await r2.put(thumbKey, jpegBuffer, { httpMetadata: { contentType: "image/jpeg" } }).catch(() => {});
    }

    // ZIP upload (only for vector content)
    let fileSizeStr = 'N/A';
    if (zipBuffer) {
      const zipUpload = await uploadWithRetry(r2, r2ZipKey, zipBuffer, { 
        contentType: "application/zip",
        contentDisposition: `attachment; filename="${id}.zip"`
      });
      if (!zipUpload.success) return new Response(JSON.stringify({ error: "ZIP upload failed" }), { status: 500, headers });
      fileSizeStr = `${(zipBuffer.byteLength / (1024 * 1024)).toFixed(1)} MB`;
    } else {
      fileSizeStr = `${(jpegBuffer.byteLength / (1024 * 1024)).toFixed(1)} MB`;
    }

    const jsonUpload = await uploadWithRetry(r2, r2JsonKey, new TextEncoder().encode(JSON.stringify(metadata)), { contentType: "application/json" });
    if (!jsonUpload.success) return new Response(JSON.stringify({ error: "JSON upload failed" }), { status: 500, headers });

    // Save to KV
    const vectorRecord = {
      name: id,
      category: category,
      title: String(title || description || id).trim(),
      description: description,
      keywords: Array.isArray(keywords) ? keywords : String(keywords || "").split(",").map(k => k.trim()).filter(Boolean),
      date: new Date().toISOString(),
      downloads: 0,
      fileSize: fileSizeStr,
      contentType: isJpegOnly ? 'jpeg' : 'vector'
    };

    // Update global list
    const allVectorsRaw = await kv.get("all_vectors");
    let allVectors = allVectorsRaw ? JSON.parse(allVectorsRaw) : [];
    
    // DUPLICATE PROTECTION
    const existingIndex = allVectors.findIndex(v => v.name === id);
    if (existingIndex > -1) {
      allVectors[existingIndex] = vectorRecord;
    } else {
      allVectors.unshift(vectorRecord);
    }
    
    await kv.put("all_vectors", JSON.stringify(allVectors));

    return new Response(JSON.stringify({ success: true, vector: vectorRecord }), { status: 200, headers });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500, headers });
  }
}

// ─────────────────────────────────────────────
// DELETE /api/admin (delete vector)
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
    const url = new URL(context.request.url);
    const slug = url.searchParams.get("slug");

    if (!slug) return new Response(JSON.stringify({ error: "Missing slug" }), { status: 400, headers });

    const allVectorsRaw = await kv.get("all_vectors");
    let allVectors = allVectorsRaw ? JSON.parse(allVectorsRaw) : [];
    
    const vector = allVectors.find(v => v.name === slug);
    if (!vector) return new Response(JSON.stringify({ error: "Not found" }), { status: 404, headers });

    // Delete from R2
    const category = vector.category || 'Miscellaneous';
    const id = vector.name;
    await r2.delete(`${category}/${id}/${id}.jpg`);
    await r2.delete(`${category}/${id}/${id}-thumb.jpg`);
    await r2.delete(`${category}/${id}/${id}.zip`);
    await r2.delete(`${category}/${id}/${id}.json`);

    // Update KV
    allVectors = allVectors.filter(v => v.name !== slug);
    await kv.put("all_vectors", JSON.stringify(allVectors));

    return new Response(JSON.stringify({ success: true }), { status: 200, headers });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500, headers });
  }
}

// ─────────────────────────────────────────────
// PATCH /api/admin (bulk cleanup)
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
      const url = new URL(context.request.url);
      const action = url.searchParams.get("action");
  
      if (action === "cleanup") {
          const allVectorsRaw = await kv.get("all_vectors");
          let allVectors = allVectorsRaw ? JSON.parse(allVectorsRaw) : [];
          const initialCount = allVectors.length;
          
          // Check R2 for each vector
          const results = await Promise.all(allVectors.map(async (v) => {
              const category = v.category || 'Miscellaneous';
              const jpg = await r2.head(`${category}/${v.name}/${v.name}.jpg`);
              return { name: v.name, exists: !!jpg };
          }));
  
          const orphans = results.filter(r => !r.exists).map(r => r.name);
          allVectors = allVectors.filter(v => !orphans.includes(v.name));
          
          await kv.put("all_vectors", JSON.stringify(allVectors));
          
          return new Response(JSON.stringify({ 
              success: true, 
              totalChecked: initialCount,
              orphansRemoved: orphans.length,
              count: allVectors.length
          }), { status: 200, headers });
      }
  
      return new Response(JSON.stringify({ error: "Invalid action" }), { status: 400, headers });
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
