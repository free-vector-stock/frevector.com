/**
 * GET /api/vectors
 * Mevcut frevector.com sitesi için geliştirilmiş API
 */
export async function onRequestGet(context) {
  const headers = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Cache-Control": "public, max-age=60"
  };

  try {
    const kv = context.env.VECTOR_DB;
    if (!kv) {
      return new Response(JSON.stringify({ error: "KV not configured" }), { status: 500, headers });
    }

    const url = new URL(context.request.url);
    const slug = url.searchParams.get("slug");
    const category = url.searchParams.get("category");
    const page = parseInt(url.searchParams.get("page") || "1");
    const limit = parseInt(url.searchParams.get("limit") || "24");
    const search = (url.searchParams.get("search") || "").toLowerCase().trim();

    // Tekil vektör detayı
    if (slug) {
      const vectorData = await kv.get(`vector:${slug}`);
      if (!vectorData) {
        return new Response(JSON.stringify({ error: "Vector not found" }), { status: 404, headers });
      }
      const vector = JSON.parse(vectorData);
      // URL'leri ekle
      vector.thumbnail = `/api/asset?key=assets/${vector.category}/${vector.name}.jpg`;
      vector.zipUrl = `/api/asset?key=assets/${vector.category}/${vector.name}.zip`;
      return new Response(JSON.stringify(vector), { status: 200, headers });
    }

    // Tüm vektörleri getir
    const allVectorsRaw = await kv.get("all_vectors");
    if (!allVectorsRaw) {
      return new Response(JSON.stringify({ vectors: [], total: 0, page: 1, totalPages: 0 }), { status: 200, headers });
    }

    let allVectors = JSON.parse(allVectorsRaw);

    // Kategori filtresi
    if (category && category !== "all") {
      allVectors = allVectors.filter(v => v.category === category);
    }

    // Arama filtresi (Keywords bazlı)
    if (search) {
      const terms = search.split(/\s+/).filter(Boolean);
      allVectors = allVectors.filter(v => {
        const searchText = [
          v.title || "",
          v.description || "",
          ...(v.keywords || [])
        ].join(" ").toLowerCase();
        return terms.every(term => searchText.includes(term));
      });
    }

    const total = allVectors.length;
    const totalPages = Math.ceil(total / limit);
    const offset = (page - 1) * limit;
    const pageVectors = allVectors.slice(offset, offset + limit);

    // URL'leri ekle
    const vectorsWithUrls = pageVectors.map(v => ({
      ...v,
      thumbnail: `/api/asset?key=assets/${v.category}/${v.name}.jpg`,
      zipUrl: `/api/asset?key=assets/${v.category}/${v.name}.zip`
    }));

    return new Response(JSON.stringify({
      vectors: vectorsWithUrls,
      total,
      page,
      totalPages,
      category: category || "all"
    }), { status: 200, headers });

  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500, headers });
  }
}
