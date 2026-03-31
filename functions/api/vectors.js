/**
 * GET /api/vectors
 * Returns paginated vector list with thumbnails from R2 with Edge Cache.
 */

const CORS_HEADERS = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Cache-Control": "public, max-age=60"
};

export async function onRequestGet(context) {
    const cache = caches.default;
    const url = new URL(context.request.url);
    
    // Check Edge Cache
    const cacheResponse = await cache.match(context.request);
    if (cacheResponse) {
        return cacheResponse;
    }

    try {
        const r2 = context.env.VECTOR_ASSETS;
        const slug = url.searchParams.get("slug");
        const fetchAllForSlug = url.searchParams.get("fetchAllForSlug");
        const category = url.searchParams.get("category") || "";
        const page = Math.max(1, parseInt(url.searchParams.get("page") || "1"));
        const limit = Math.min(100, Math.max(1, parseInt(url.searchParams.get("limit") || "24")));
        const search = (url.searchParams.get("search") || "").toLowerCase().trim();
        const sort = url.searchParams.get("sort") || "";
        const type = url.searchParams.get("type") || ""; // 'vector', 'jpeg', or empty for all

        // Try to get all_vectors from R2 first (optimized)
        let allVectorsRaw;
        const r2Object = await r2.get("all_vectors.json");
        if (r2Object) {
            allVectorsRaw = await r2Object.text();
        } else {
            // Fallback to KV if R2 is not yet populated
            const kv = context.env.VECTOR_DB;
            allVectorsRaw = await kv.get("all_vectors");
        }

        if (!allVectorsRaw) {
            return new Response(JSON.stringify({ vectors: [], total: 0, page: 1, totalPages: 0 }), { status: 200, headers: CORS_HEADERS });
        }

        let allVectors = JSON.parse(allVectorsRaw);

        // Single vector detail
        if (slug) {
            const vector = allVectors.find(v => v.name === slug);
            if (!vector) return new Response(JSON.stringify({ error: "Vector not found" }), { status: 404, headers: CORS_HEADERS });
            const response = new Response(JSON.stringify(enrichVector(vector)), { status: 200, headers: CORS_HEADERS });
            context.waitUntil(cache.put(context.request, response.clone()));
            return response;
        }

        // Category filter
        if (category && category !== "all") {
            const catLower = category.toLowerCase().trim();
            allVectors = allVectors.filter(v => (v.category || "").toLowerCase().trim() === catLower);
        }

        // Type filter (vector or jpeg)
        if (type === "vector") {
            allVectors = allVectors.filter(v => v.contentType !== "jpeg");
        } else if (type === "jpeg") {
            allVectors = allVectors.filter(v => v.contentType === "jpeg");
        }

        // Search filter
        if (search) {
            const terms = search.split(/\s+/).filter(Boolean);
            allVectors = allVectors.filter(v => {
                const title = (v.title || "").toLowerCase();
                const keywords = (v.keywords || []).map(k => k.toLowerCase());
                const description = (v.description || "").toLowerCase();
                return terms.some(t => title.includes(t) || keywords.some(k => k.includes(t)) || description.includes(t));
            });
        }

        // Sort
        if (sort === "oldest") {
            allVectors.sort((a, b) => new Date(a.date || 0) - new Date(b.date || 0));
        } else {
            allVectors.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
        }

        const total = allVectors.length;
        const totalPages = Math.max(1, Math.ceil(total / limit));
        const validPage = Math.min(page, totalPages);
        const offset = (validPage - 1) * limit;
        let pageVectors = allVectors.slice(offset, offset + limit);

        if (fetchAllForSlug) {
            const slugMatch = allVectors.find(v => v.name === fetchAllForSlug);
            if (slugMatch && !pageVectors.find(v => v.name === fetchAllForSlug)) {
                pageVectors.unshift(slugMatch);
            }
        }

        const result = {
            vectors: pageVectors.map(enrichVector),
            total,
            page: validPage,
            totalPages,
            category: category || "all"
        };

        const response = new Response(JSON.stringify(result), { status: 200, headers: CORS_HEADERS });
        
        // Cache the response for 1 minute (as defined in max-age)
        context.waitUntil(cache.put(context.request, response.clone()));

        return response;

    } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: CORS_HEADERS });
    }
}

function enrichVector(v) {
    const id = v.name;
    const category = v.category || "Miscellaneous";
    
    // Structure: Category/ID/ID-thumb.jpg
    const thumbKey = `${category}/${id}/${id}.jpg`;
    const isJpegOnly = v.contentType === 'jpeg';

    return {
        ...v,
        title: v.title || v.name || "",
        // Requirement: ALWAYS use thumbnail in site
        thumbnail: `https://vector-assets.r2.cloudflarestorage.com/${thumbKey}`,
        isJpegOnly: isJpegOnly
    };
}
