/**
 * Admin Bulk API - Specialized for high-volume uploads
 * - Supports skipIndexUpdate to avoid 503 errors
 * - Supports finalize-bulk to update index once
 */

const ADMIN_PASSWORD = "vector2026";

const VALID_CATEGORIES = [
    'Abstract', 'Animals', 'The Arts', 'Backgrounds', 'Fashion', 'Buildings', 'Business', 'Celebrities',
    'Education', 'Food', 'Drink', 'Medical', 'Holidays', 'Industrial', 'Interiors', 'Miscellaneous',
    'Nature', 'Objects', 'Outdoor', 'People', 'Religion', 'Science', 'Symbols', 'Sports',
    'Technology', 'Transportation', 'Vintage', 'Logo', 'Font', 'Icon'
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
    const specialCats = { 'arts': 'The Arts', 'thearts': 'The Arts', 'the-arts': 'The Arts' };
    if (specialCats[s]) return specialCats[s];
    for (const cat of VALID_CATEGORIES) {
        if (cat.toLowerCase() === s) return cat;
    }
    return "Miscellaneous";
}

async function uploadWithRetry(r2, key, body, options, retries = 5) {
  for (let i = 0; i < retries; i++) {
    try {
      await r2.put(key, body, options);
      return { success: true };
    } catch (e) {
      if (i === retries - 1) return { success: false, error: e.message };
      await new Promise(r => setTimeout(r, 1000 * Math.pow(2, i)));
    }
  }
}

export async function onRequestPost(context) {
  const headers = { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" };
  if (!authenticate(context.request)) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers });

  try {
    const kv = context.env.VECTOR_DB;
    const r2 = context.env.VECTOR_ASSETS;
    const contentType = context.request.headers.get("content-type") || "";

    // Handle JSON Finalize Action (from fetch with JSON body)
    if (contentType.includes("application/json")) {
        const body = await context.request.json();
        if (body.action === 'finalize-bulk' && Array.isArray(body.vectors)) {
            const allVectorsRaw = await kv.get("all_vectors");
            let allVectors = allVectorsRaw ? JSON.parse(allVectorsRaw) : [];
            
            for (const v of body.vectors) {
                const idx = allVectors.findIndex(item => item.name === v.name);
                if (idx > -1) allVectors[idx] = v;
                else allVectors.unshift(v);
            }
            
            const updatedRaw = JSON.stringify(allVectors);
            await Promise.all([
                kv.put("all_vectors", updatedRaw),
                r2.put("all_vectors.json", updatedRaw, { httpMetadata: { contentType: "application/json" } })
            ]);
            return new Response(JSON.stringify({ success: true, count: body.vectors.length }), { status: 200, headers });
        }
    }

    // Handle Multipart Upload (from FormData)
    const formData = await context.request.formData();
    
    // Check if it's a finalize action sent via FormData
    if (formData.get("action") === "finalize-bulk") {
        const vectorsJson = formData.get("vectors");
        if (!vectorsJson) return new Response(JSON.stringify({ error: "Missing vectors" }), { status: 400, headers });
        const vectors = JSON.parse(vectorsJson);
        const allVectorsRaw = await kv.get("all_vectors");
        let allVectors = allVectorsRaw ? JSON.parse(allVectorsRaw) : [];
        for (const v of vectors) {
            const idx = allVectors.findIndex(item => item.name === v.name);
            if (idx > -1) allVectors[idx] = v;
            else allVectors.unshift(v);
        }
        const updatedRaw = JSON.stringify(allVectors);
        await Promise.all([
            kv.put("all_vectors", updatedRaw),
            r2.put("all_vectors.json", updatedRaw, { httpMetadata: { contentType: "application/json" } })
        ]);
        return new Response(JSON.stringify({ success: true, count: vectors.length }), { status: 200, headers });
    }

    const jsonFile = formData.get("json");
    const jpegFile = formData.get("jpeg");
    const zipFile  = formData.get("zip");
    const skipIndexUpdate = formData.get("skipIndexUpdate") === "true";

    if (!jsonFile || !jpegFile) return new Response(JSON.stringify({ error: "Missing files" }), { status: 400, headers });

    const metadata = JSON.parse(await jsonFile.text());
    const jpegBuffer = await jpegFile.arrayBuffer();
    const zipBuffer = zipFile ? await zipFile.arrayBuffer() : null;
    const id = jsonFile.name.replace(/\.json$/, "").trim();
    
    const isJpegFromFilename = id.toLowerCase().includes('-jpeg-');
    const contentTypeToSet = isJpegFromFilename ? 'jpeg' : 'vector';

    let rawCat = id.toLowerCase();
    if (rawCat.includes('-jpeg-')) rawCat = rawCat.split('-jpeg-')[0];
    
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
    if (category === "Miscellaneous") category = resolveCategory(rawCat.split('-')[0], id);

    const r2JpgKey = `${category}/${id}/${id}.jpg`;
    const r2ZipKey = `${category}/${id}/${id}.zip`;
    const r2JsonKey = `${category}/${id}/${id}.json`;

    await Promise.all([
        uploadWithRetry(r2, r2JpgKey, jpegBuffer, { httpMetadata: { contentType: "image/jpeg" } }),
        uploadWithRetry(r2, r2JsonKey, JSON.stringify(metadata), { httpMetadata: { contentType: "application/json" } }),
        zipBuffer ? uploadWithRetry(r2, r2ZipKey, zipBuffer, { httpMetadata: { contentType: "application/zip" } }) : Promise.resolve({ success: true })
    ]);

    const vectorRecord = {
      name: id,
      category: category,
      title: (metadata.title || id).trim(),
      description: (metadata.description || "").trim(),
      keywords: Array.isArray(metadata.keywords) ? metadata.keywords : (metadata.keywords || "").split(",").map(k => k.trim()).filter(Boolean),
      date: new Date().toISOString(),
      downloads: 0,
      fileSize: zipBuffer ? `${(zipBuffer.byteLength / (1024 * 1024)).toFixed(1)} MB` : `${(jpegBuffer.byteLength / (1024 * 1024)).toFixed(1)} MB`,
      contentType: contentTypeToSet
    };

    if (!skipIndexUpdate) {
        const allVectorsRaw = await kv.get("all_vectors");
        let allVectors = allVectorsRaw ? JSON.parse(allVectorsRaw) : [];
        const idx = allVectors.findIndex(v => v.name === id);
        if (idx > -1) allVectors[idx] = vectorRecord;
        else allVectors.unshift(vectorRecord);
        const updatedRaw = JSON.stringify(allVectors);
        await Promise.all([
            kv.put("all_vectors", updatedRaw),
            r2.put("all_vectors.json", updatedRaw, { httpMetadata: { contentType: "application/json" } })
        ]);
    }

    return new Response(JSON.stringify({ success: true, vector: vectorRecord }), { status: 200, headers });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500, headers });
  }
}
