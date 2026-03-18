/**
 * Admin API - Updated to remove Thumbnail Generation and Sharp Dependency
 * Optimized for R2 + Edge Cache
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
    
    // Özel durumlar için eşleştirme (Örn: "the arts" -> "The Arts")
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

// Function to sync all_vectors to R2
async function syncToR2(kv, r2) {
    const allVectorsRaw = await kv.get("all_vectors");
    if (allVectorsRaw) {
        await r2.put("all_vectors.json", allVectorsRaw, { httpMetadata: { contentType: "application/json" } });
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
    return new Response(JSON.stringify({ error: e.message }), { status: 500, headers });
  }
}

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

    if (!jsonFile || !jpegFile) return new Response(JSON.stringify({ error: "Missing JSON or JPEG" }), { status: 400, headers });

    const metadata = JSON.parse(await jsonFile.text());
    const jpegBuffer = await jpegFile.arrayBuffer();
    const zipBuffer = zipFile ? await zipFile.arrayBuffer() : null;
    
    const id = jsonFile.name.replace(/\.json$/, "");
    
    // 1. Tür Belirleme (Dosya adında -jpeg- varsa)
    const isJpegFromFilename = id.toLowerCase().includes('-jpeg-');
    const contentTypeToSet = isJpegFromFilename ? 'jpeg' : 'vector';

    // 2. Kategori Belirleme (Dosya adından, -jpeg- hériç)
    let rawCat = id.toLowerCase();
    if (rawCat.includes('-jpeg-')) {
        rawCat = rawCat.split('-jpeg-')[0];
    } else {
        const parts = rawCat.split('-');
        rawCat = parts[0];
    }
    const category = resolveCategory(rawCat, id);

    const title = metadata.title || id;
    const description = metadata.description || "";
    let keywords = Array.isArray(metadata.keywords) ? metadata.keywords : (metadata.keywords || "").split(",").map(k => k.trim()).filter(Boolean);

    const VECTOR_KEYWORDS_TO_ADD = ['free vector', 'free svg', 'free svg icon', 'free eps', 'free jpeg', 'free', 'fre', 'vector eps', 'svg', 'jpeg'];
    const JPEG_KEYWORDS_TO_ADD = ['free jpeg', 'free', 'fre', 'jpeg'];
    
    const prefixKeywords = contentTypeToSet === 'jpeg' ? JPEG_KEYWORDS_TO_ADD : VECTOR_KEYWORDS_TO_ADD;
    keywords = [...new Set([...prefixKeywords, ...keywords])];

    if (contentTypeToSet === 'jpeg') {
        const fullText = (title + " " + description + " " + keywords.join(" ")).toLowerCase();
        for (const word of FORBIDDEN_WORDS_JPEG) {
            if (fullText.includes(word)) return new Response(JSON.stringify({ error: `Forbidden word in JPEG: ${word}` }), { status: 400, headers });
        }
    }

    // Determine type folder (vector or jpeg) based on filename
    const typeFolder = isJpegFromFilename ? 'jpeg' : 'vector';
    
    const r2JpgKey = `${category}/${typeFolder}/${id}.jpg`;
    const r2ZipKey = `${category}/${typeFolder}/${id}.zip`;
    const r2JsonKey = `${category}/${typeFolder}/${id}.json`;

    await r2.put(r2JpgKey, jpegBuffer, { httpMetadata: { contentType: "image/jpeg" } });
    // Thumbnail generation removed - using original JPEG directly

    let fileSizeStr = `${(jpegBuffer.byteLength / (1024 * 1024)).toFixed(1)} MB`;
    if (zipBuffer) {
        await r2.put(r2ZipKey, zipBuffer, { httpMetadata: { contentType: "application/zip" } });
        fileSizeStr = `${(zipBuffer.byteLength / (1024 * 1024)).toFixed(1)} MB`;
    }

    await r2.put(r2JsonKey, JSON.stringify(metadata), { httpMetadata: { contentType: "application/json" } });

    const vectorRecord = {
      name: id,
      category: category,
      title: title,
      description: description,
      keywords: keywords,
      date: new Date().toISOString(),
      downloads: 0,
      fileSize: fileSizeStr,
      contentType: contentTypeToSet
    };

    const allVectorsRaw = await kv.get("all_vectors");
    let allVectors = allVectorsRaw ? JSON.parse(allVectorsRaw) : [];
    const existingIndex = allVectors.findIndex(v => v.name === id);
    if (existingIndex > -1) allVectors[existingIndex] = vectorRecord;
    else allVectors.unshift(vectorRecord);
    
    const updatedRaw = JSON.stringify(allVectors);
    await kv.put("all_vectors", updatedRaw);
    
    // Sync to R2
    await r2.put("all_vectors.json", updatedRaw, { httpMetadata: { contentType: "application/json" } });

    return new Response(JSON.stringify({ success: true, vector: vectorRecord }), { status: 200, headers });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500, headers });
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
    if (!slug) return new Response(JSON.stringify({ error: "Missing slug" }), { status: 400, headers });

    const allVectorsRaw = await kv.get("all_vectors");
    let allVectors = allVectorsRaw ? JSON.parse(allVectorsRaw) : [];
    const vector = allVectors.find(v => v.name === slug);
    if (!vector) return new Response(JSON.stringify({ error: "Not found" }), { status: 404, headers });

    const category = vector.category || 'Miscellaneous';
    const contentType = vector.contentType || 'vector';
    const typeFolder = contentType === 'jpeg' ? 'jpeg' : 'vector';
    
    await r2.delete(`${category}/${typeFolder}/${slug}.jpg`);
    await r2.delete(`${category}/${typeFolder}/${slug}.zip`);
    await r2.delete(`${category}/${typeFolder}/${slug}.json`);

    allVectors = allVectors.filter(v => v.name !== slug);
    const updatedRaw = JSON.stringify(allVectors);
    await kv.put("all_vectors", updatedRaw);
    
    // Sync to R2
    await r2.put("all_vectors.json", updatedRaw, { httpMetadata: { contentType: "application/json" } });

    return new Response(JSON.stringify({ success: true }), { status: 200, headers });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500, headers });
  }
}
