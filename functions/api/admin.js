/**
 * Admin API - FIXED VERSION v2
 * - Improved batch upload handling
 * - Better error recovery
 * - Optimized KV/R2 operations
 * - Proper timeout handling
 */

const ADMIN_PASSWORD = "vector2026";

const VALID_CATEGORIES = [
    'Abstract', 'Animals', 'The Arts', 'Backgrounds', 'Fashion', 'Buildings', 'Business', 'Celebrities',
    'Education', 'Food', 'Drink', 'Medical', 'Holidays', 'Industrial', 'Interiors', 'Miscellaneous',
    'Nature', 'Objects', 'Outdoor', 'People', 'Religion', 'Science', 'Symbols', 'Sports',
    'Technology', 'Transportation', 'Vintage', 'Logo', 'Font', 'Icon'
];

const FORBIDDEN_WORDS_JPEG = [
    'free vector', 'free svg', 'free svg icon', 'free eps', 'vector eps', 'svg'
];

function authenticate(request) {
  const authHeader = request.headers.get("X-Admin-Key") || request.headers.get("Authorization") || "";
  const key = authHeader.replace("Bearer ", "").trim();
  const url = new URL(request.url);
  const urlKey = url.searchParams.get("key");
  return key === ADMIN_PASSWORD || urlKey === ADMIN_PASSWORD;
}

function resolveCategory(raw, id) {
    if (!raw) return "Miscellaneous";
    const s = raw.toString().trim().toLowerCase();
    
    const specialCats = {
        'arts': 'The Arts',
        'thearts': 'The Arts',
        'the-arts': 'The Arts'
    };
    
    if (specialCats[s]) return specialCats[s];

    for (const cat of VALID_CATEGORIES) {
        if (cat.toLowerCase() === s) return cat;
    }
    return "Miscellaneous";
}

// Retry wrapper for R2 operations with exponential backoff
async function uploadWithRetry(r2, key, body, options, retries = 5) {
  for (let i = 0; i < retries; i++) {
    try {
      await r2.put(key, body, options);
      return { success: true };
    } catch (e) {
      console.error(`R2 upload attempt ${i+1}/${retries} failed for ${key}:`, e.message);
      if (i === retries - 1) return { success: false, error: e.message };
      const delay = Math.min(1000 * Math.pow(2, i), 10000);
      await new Promise(r => setTimeout(r, delay));
    }
  }
}

export async function onRequestGet(context) {
  const headers = { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" };
  if (!authenticate(context.request)) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers });
  try {
    const kv = context.env.VECTOR_DB;
    const allVectorsRaw = await kv.get("all_vectors");
    const allVectors = allVectorsRaw ? JSON.parse(allVectorsRaw) : [];
    return new Response(JSON.stringify({ vectors: allVectors }), { status: 200, headers });
  } catch (e) {
    console.error("GET error:", e);
    return new Response(JSON.stringify({ error: e.message }), { status: 500, headers });
  }
}

export async function onRequestPost(context) {
  const headers = { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" };
  if (!authenticate(context.request)) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers });

  try {
    const kv = context.env.VECTOR_DB;
    const r2 = context.env.VECTOR_ASSETS;
    
    let formData;
    try {
      formData = await context.request.formData();
    } catch (e) {
      console.error("FormData parsing error:", e);
      return new Response(JSON.stringify({ error: "Invalid form data: " + e.message }), { status: 400, headers });
    }

    const jsonFile = formData.get("json");
    const jpegFile = formData.get("jpeg");
    const zipFile  = formData.get("zip");

    if (!jsonFile) return new Response(JSON.stringify({ error: "Missing JSON metadata file" }), { status: 400, headers });
    if (!jpegFile) return new Response(JSON.stringify({ error: "Missing JPEG preview image" }), { status: 400, headers });

    // Parse metadata
    let metadata;
    try {
      const jsonText = await jsonFile.text();
      metadata = JSON.parse(jsonText);
    } catch (e) {
      console.error("JSON parsing error:", e);
      return new Response(JSON.stringify({ error: "Invalid JSON: " + e.message }), { status: 400, headers });
    }

    let jpegBuffer, zipBuffer;
    try {
      jpegBuffer = await jpegFile.arrayBuffer();
      zipBuffer = zipFile ? await zipFile.arrayBuffer() : null;
    } catch (e) {
      console.error("File buffer error:", e);
      return new Response(JSON.stringify({ error: "Error reading file buffers: " + e.message }), { status: 400, headers });
    }
    
    const id = jsonFile.name.replace(/\.json$/, "").trim();
    if (!id) return new Response(JSON.stringify({ error: "Invalid JSON filename" }), { status: 400, headers });
    
    const isJpegFromFilename = id.toLowerCase().includes('-jpeg-');
    const contentTypeToSet = isJpegFromFilename ? 'jpeg' : 'vector';

    // Improved category extraction
    let rawCat = id.toLowerCase();
    if (rawCat.includes('-jpeg-')) {
        rawCat = rawCat.split('-jpeg-')[0];
    }
    
    let category = "Miscellaneous";
    const sortedCategories = [...VALID_CATEGORIES].sort((a, b) => b.length - a.length);
    for (const cat of sortedCategories) {
        const catLower = cat.toLowerCase().replace(/\s+/g, '');
        const catHyphen = cat.toLowerCase().replace(/\s+/g, '-');
        if (rawCat.startsWith(catLower) || rawCat.startsWith(catHyphen)) {
            category = cat;
            break;
        }
    }
    
    if (category === "Miscellaneous") {
        const parts = rawCat.split('-');
        category = resolveCategory(parts[0], id);
    }

    const title = (metadata.title || id).trim();
    const description = (metadata.description || "").trim();
    let keywords = Array.isArray(metadata.keywords) ? metadata.keywords : (metadata.keywords || "").split(",").map(k => k.trim()).filter(Boolean);

    const VECTOR_KEYWORDS_TO_ADD = ['free vector', 'free svg', 'free svg icon', 'free eps', 'free jpeg', 'free', 'fre', 'vector eps', 'svg', 'jpeg'];
    const JPEG_KEYWORDS_TO_ADD = ['free jpeg', 'free', 'fre', 'jpeg'];
    
    const prefixKeywords = contentTypeToSet === 'jpeg' ? JPEG_KEYWORDS_TO_ADD : VECTOR_KEYWORDS_TO_ADD;
    keywords = [...new Set([...prefixKeywords, ...keywords])];

    if (contentTypeToSet === 'jpeg') {
        const fullText = (title + " " + description + " " + keywords.join(" ")).toLowerCase();
        for (const word of FORBIDDEN_WORDS_JPEG) {
            if (fullText.includes(word)) {
                return new Response(JSON.stringify({ error: `Forbidden word in JPEG metadata: "${word}"` }), { status: 400, headers });
            }
        }
    }

    const r2JpgKey = `${category}/${id}/${id}.jpg`;
    const r2ZipKey = `${category}/${id}/${id}.zip`;
    const r2JsonKey = `${category}/${id}/${id}.json`;

    console.log(`Uploading ${id} to category ${category}...`);

    // Upload files to R2 with retry
    const uploadResults = await Promise.all([
        uploadWithRetry(r2, r2JpgKey, jpegBuffer, { httpMetadata: { contentType: "image/jpeg" } }),
        uploadWithRetry(r2, r2JsonKey, JSON.stringify(metadata), { httpMetadata: { contentType: "application/json" } }),
        zipBuffer ? uploadWithRetry(r2, r2ZipKey, zipBuffer, { httpMetadata: { contentType: "application/zip" } }) : Promise.resolve({ success: true })
    ]);

    for (const result of uploadResults) {
        if (!result.success) {
            console.error("R2 upload failed:", result.error);
            return new Response(JSON.stringify({ error: "R2 upload failed: " + result.error }), { status: 500, headers });
        }
    }

    const fileSize = zipBuffer ? `${(zipBuffer.byteLength / (1024 * 1024)).toFixed(1)} MB` : `${(jpegBuffer.byteLength / (1024 * 1024)).toFixed(1)} MB`;
    
    const vectorRecord = {
      name: id,
      category: category,
      title: title,
      description: description,
      keywords: keywords,
      date: new Date().toISOString(),
      downloads: 0,
      fileSize: fileSize,
      contentType: contentTypeToSet
    };

    // Update index in KV
    const allVectorsRaw = await kv.get("all_vectors");
    let allVectors = allVectorsRaw ? JSON.parse(allVectorsRaw) : [];
    
    const existingIndex = allVectors.findIndex(v => v.name === id);
    if (existingIndex > -1) {
        allVectors[existingIndex] = vectorRecord;
    } else {
        allVectors.unshift(vectorRecord);
    }
    
    const updatedRaw = JSON.stringify(allVectors);
    
    // Write to both KV and R2
    try {
      await Promise.all([
          kv.put("all_vectors", updatedRaw),
          r2.put("all_vectors.json", updatedRaw, { httpMetadata: { contentType: "application/json" } })
      ]);
    } catch (e) {
      console.error("KV/R2 index update error:", e);
      return new Response(JSON.stringify({ error: "Index update failed: " + e.message }), { status: 500, headers });
    }

    console.log(`Successfully uploaded ${id}`);
    return new Response(JSON.stringify({ 
        success: true, 
        vector: vectorRecord,
        message: `Successfully uploaded ${id}`
    }), { status: 200, headers });
  } catch (e) {
    console.error("Upload error:", e);
    return new Response(JSON.stringify({ error: "Server error: " + e.message }), { status: 500, headers });
  }
}

export async function onRequestDelete(context) {
  const headers = { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" };
  if (!authenticate(context.request)) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers });
  try {
    const kv = context.env.VECTOR_DB;
    const r2 = context.env.VECTOR_ASSETS;
    const url = new URL(context.request.url);
    const slug = url.searchParams.get("slug");
    
    if (!slug) return new Response(JSON.stringify({ error: "Missing slug parameter" }), { status: 400, headers });

    const allVectorsRaw = await kv.get("all_vectors");
    let allVectors = allVectorsRaw ? JSON.parse(allVectorsRaw) : [];
    const vector = allVectors.find(v => v.name === slug);
    
    if (!vector) return new Response(JSON.stringify({ error: "Vector not found" }), { status: 404, headers });

    const category = vector.category || 'Miscellaneous';
    
    await Promise.all([
        r2.delete(`${category}/${slug}/${slug}.jpg`),
        r2.delete(`${category}/${slug}/${slug}.zip`),
        r2.delete(`${category}/${slug}/${slug}.json`)
    ]);

    allVectors = allVectors.filter(v => v.name !== slug);
    const updatedRaw = JSON.stringify(allVectors);
    
    await Promise.all([
        kv.put("all_vectors", updatedRaw),
        r2.put("all_vectors.json", updatedRaw, { httpMetadata: { contentType: "application/json" } })
    ]);

    return new Response(JSON.stringify({ 
        success: true, 
        message: `Successfully deleted ${slug}`
    }), { status: 200, headers });
  } catch (e) {
    console.error("Delete error:", e);
    return new Response(JSON.stringify({ error: "Server error: " + e.message }), { status: 500, headers });
  }
}
