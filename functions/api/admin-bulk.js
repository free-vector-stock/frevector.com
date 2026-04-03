/**
 * Admin Bulk API - Optimized for Large Batches
 * Updated to support batch KV updates and prevent rate limits
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
    for (const cat of VALID_CATEGORIES) {
        if (cat.toLowerCase() === s) return cat;
    }
    return "Miscellaneous";
}

async function uploadWithRetry(r2, key, body, options, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      await r2.put(key, body, options);
      return { success: true };
    } catch (e) {
      if (i === retries - 1) return { success: false, error: e.message };
      await new Promise(r => setTimeout(r, 1000 * (i + 1)));
    }
  }
}

export async function onRequestPost(context) {
  const headers = { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" };
  if (!authenticate(context.request)) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers });

  try {
    const kv = context.env.VECTOR_DB;
    const r2 = context.env.VECTOR_ASSETS;
    const formData = await context.request.formData();
    const action = formData.get("action");

    if (action === "bulk-upload") {
      const jsonFile = formData.get("json");
      const jpegFile = formData.get("jpeg");
      const zipFile = formData.get("zip");
      const skipIndexUpdate = formData.get("skipIndexUpdate") === "true";

      if (!jsonFile || !jpegFile) {
        return new Response(JSON.stringify({ error: "Missing JSON or JPEG" }), { status: 400, headers });
      }

      const metadata = JSON.parse(await jsonFile.text());
      const jpegBuffer = await jpegFile.arrayBuffer();
      const zipBuffer = zipFile ? await zipFile.arrayBuffer() : null;

      const slug = jsonFile.name.replace(/\.json$/, "");
      const isJpegFromFilename = slug.toLowerCase().includes('-jpeg-');
      const contentTypeToSet = isJpegFromFilename ? 'jpeg' : 'vector';

      let rawCat = slug.toLowerCase();
      if (rawCat.includes('-jpeg-')) {
          rawCat = rawCat.split('-jpeg-')[0];
      } else {
          const parts = rawCat.split('-');
          rawCat = parts[0];
      }
      const resolvedCategory = resolveCategory(rawCat, slug);

      const title = metadata.title || slug;
      const description = metadata.description || "";
      let keywords = Array.isArray(metadata.keywords) ? metadata.keywords : (metadata.keywords || "").split(",").map(k => k.trim()).filter(Boolean);

      const VECTOR_KEYWORDS_TO_ADD = ['free vector', 'free svg', 'free svg icon', 'free eps', 'free jpeg', 'free', 'fre', 'vector eps', 'svg', 'jpeg'];
      const JPEG_KEYWORDS_TO_ADD = ['free jpeg', 'free', 'fre', 'jpeg'];
      
      const prefixKeywords = contentTypeToSet === 'jpeg' ? JPEG_KEYWORDS_TO_ADD : VECTOR_KEYWORDS_TO_ADD;
      keywords = [...new Set([...prefixKeywords, ...keywords])];

      const r2JpgKey = `${resolvedCategory}/${slug}/${slug}.jpg`;
      const r2ZipKey = `${resolvedCategory}/${slug}/${slug}.zip`;
      const r2JsonKey = `${resolvedCategory}/${slug}/${slug}.json`;

      // Upload Assets to R2
      const uploads = [
        uploadWithRetry(r2, r2JpgKey, jpegBuffer, { httpMetadata: { contentType: "image/jpeg" } }),
        uploadWithRetry(r2, r2JsonKey, JSON.stringify(metadata), { httpMetadata: { contentType: "application/json" } })
      ];
      if (zipBuffer) {
        uploads.push(uploadWithRetry(r2, r2ZipKey, zipBuffer, { httpMetadata: { contentType: "application/zip" } }));
      }

      const results = await Promise.all(uploads);
      for (const res of results) {
        if (!res.success) return new Response(JSON.stringify({ error: "R2 upload failed: " + res.error }), { status: 500, headers });
      }

      const vectorRecord = {
        name: slug,
        category: resolvedCategory,
        title: title,
        description: description,
        keywords: keywords,
        date: new Date().toISOString(),
        downloads: 0,
        fileSize: zipBuffer ? `${(zipBuffer.byteLength / (1024 * 1024)).toFixed(1)} MB` : `${(jpegBuffer.byteLength / (1024 * 1024)).toFixed(1)} MB`,
        contentType: contentTypeToSet
      };

      // Index update can be skipped for batch operations to be handled at the end
      if (!skipIndexUpdate) {
        const allVectorsRaw = await kv.get("all_vectors");
        let allVectors = allVectorsRaw ? JSON.parse(allVectorsRaw) : [];
        const existingIndex = allVectors.findIndex(v => v.name === slug);
        if (existingIndex > -1) allVectors[existingIndex] = vectorRecord;
        else allVectors.unshift(vectorRecord);
        
        const updatedRaw = JSON.stringify(allVectors);
        await Promise.all([
            kv.put("all_vectors", updatedRaw),
            r2.put("all_vectors.json", updatedRaw, { httpMetadata: { contentType: "application/json" } })
        ]);
      }

      return new Response(JSON.stringify({ success: true, vector: vectorRecord }), { status: 200, headers });
    }

    if (action === "finalize-bulk") {
      const newVectorsJson = formData.get("vectors");
      if (!newVectorsJson) return new Response(JSON.stringify({ error: "Missing vectors data" }), { status: 400, headers });
      
      const newVectors = JSON.parse(newVectorsJson);
      const allVectorsRaw = await kv.get("all_vectors");
      let allVectors = allVectorsRaw ? JSON.parse(allVectorsRaw) : [];
      
      // Merge new vectors
      for (const v of newVectors) {
        const idx = allVectors.findIndex(old => old.name === v.name);
        if (idx > -1) allVectors[idx] = v;
        else allVectors.unshift(v);
      }
      
      const updatedRaw = JSON.stringify(allVectors);
      await Promise.all([
          kv.put("all_vectors", updatedRaw),
          r2.put("all_vectors.json", updatedRaw, { httpMetadata: { contentType: "application/json" } })
      ]);
      
      return new Response(JSON.stringify({ success: true, count: newVectors.length }), { status: 200, headers });
    }

    return new Response(JSON.stringify({ error: "Unknown action" }), { status: 400, headers });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500, headers });
  }
}
