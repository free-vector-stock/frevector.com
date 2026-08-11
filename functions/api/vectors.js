/**
 * GET /api/vectors
 * Returns paginated vector list with public previews from R2 with Edge Cache.
 */

const CORS_HEADERS = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Cache-Control": "public, max-age=30"
};

export async function onRequestGet(context) {
    const cache = caches.default;
    const url = new URL(context.request.url);
    const cacheResponse = await cache.match(context.request);
    if (cacheResponse) return cacheResponse;

    try {
        const r2 = context.env.VECTOR_ASSETS;
        const slug = url.searchParams.get("slug");
        const fetchAllForSlug = url.searchParams.get("fetchAllForSlug");
        const category = url.searchParams.get("category") || "";
        const page = Math.max(1, parseInt(url.searchParams.get("page") || "1"));
        const limit = Math.min(100, Math.max(1, parseInt(url.searchParams.get("limit") || "24")));
        const search = (url.searchParams.get("search") || "").toLowerCase().trim();
        const sort = url.searchParams.get("sort") || "";
        const type = url.searchParams.get("type") || "";

        const kv = context.env.VECTOR_DB;
        let allVectorsRaw = await kv.get("all_vectors");
        if (!allVectorsRaw) {
            const r2Object = await r2.get("all_vectors.json");
            if (r2Object) allVectorsRaw = await r2Object.text();
        }
        if (!allVectorsRaw) {
            return new Response(JSON.stringify({ vectors: [], total: 0, page: 1, totalPages: 0 }), { status: 200, headers: CORS_HEADERS });
        }

        let allVectors = JSON.parse(allVectorsRaw);
        const watermarkEnabled = (await kv.get('preview_watermark_enabled')) !== 'false';

        if (slug) {
            const vector = allVectors.find(v => v.name === slug);
            if (!vector) return new Response(JSON.stringify({ error: "Vector not found" }), { status: 404, headers: CORS_HEADERS });
            const response = new Response(JSON.stringify(enrichVector(vector, watermarkEnabled)), { status: 200, headers: CORS_HEADERS });
            context.waitUntil(cache.put(context.request, response.clone()));
            return response;
        }

        if (category && category !== "all") {
            const catLower = category.toLowerCase().trim();
            allVectors = allVectors.filter(v => (v.category || "").toLowerCase().trim() === catLower);
        }
        if (type === "vector") allVectors = allVectors.filter(v => v.contentType !== "jpeg");
        else if (type === "jpeg") allVectors = allVectors.filter(v => v.contentType === "jpeg");
        if (search) {
            const terms = search.split(/\s+/).filter(Boolean);
            allVectors = allVectors.filter(v => {
                const title = (v.title || "").toLowerCase();
                const keywords = (v.keywords || []).map(k => k.toLowerCase());
                const description = (v.description || "").toLowerCase();
                return terms.some(t => title.includes(t) || keywords.some(k => k.includes(t)) || description.includes(t));
            });
        }
        if (sort === "oldest") allVectors.sort((a, b) => new Date(a.date || 0) - new Date(b.date || 0));
        else if (sort === "newest") allVectors.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
        else allVectors.sort((a, b) => (parseInt(b.downloads) || 0) - (parseInt(a.downloads) || 0) || new Date(b.date || 0) - new Date(a.date || 0));

        const total = allVectors.length;
        const totalPages = Math.max(1, Math.ceil(total / limit));
        const validPage = Math.min(page, totalPages);
        let pageVectors = allVectors.slice((validPage - 1) * limit, (validPage - 1) * limit + limit);
        if (fetchAllForSlug) {
            const slugMatch = allVectors.find(v => v.name === fetchAllForSlug);
            if (slugMatch && !pageVectors.find(v => v.name === fetchAllForSlug)) pageVectors.unshift(slugMatch);
        }

        const response = new Response(JSON.stringify({ vectors: pageVectors.map(vector => enrichVector(vector, watermarkEnabled)), total, page: validPage, totalPages, category: category || "all" }), { status: 200, headers: CORS_HEADERS });
        context.waitUntil(cache.put(context.request, response.clone()));
        return response;
    } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: CORS_HEADERS });
    }
}

function enrichVector(v, watermarkEnabled) {
    const id = v.name;
    const category = v.category || "Miscellaneous";
    const sourceKey = `${category}/${id}/${id}.jpg`;
    const previewKey = v.previewKey || `${category}/${id}/${id}-preview-wm.jpg`;
    return {
        ...v,
        title: v.title || v.name.replace(/-\d+$/, "").replace(/-/g, " ").replace(/\b\w/g, l => l.toUpperCase()),
        // Watermark enabled: use a separate, 750px-high preview copy when it exists.
        // During the one-time migration, the existing safe endpoint covers not-yet-copied items.
        thumbnail: watermarkEnabled
            ? (v.previewReady ? `https://assets.frevector.com/${previewKey}` : `https://frevector.com/api/preview?key=${encodeURIComponent(sourceKey)}`)
            : `https://assets.frevector.com/${sourceKey}`,
        isJpegOnly: v.contentType === 'jpeg'
    };
}
