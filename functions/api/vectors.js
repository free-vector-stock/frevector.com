/**
 * GET /api/vectors
 * ULTRA OPTIMIZED VERSION (10K+ READY)
 */

const CORS_HEADERS = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Cache-Control": "public, max-age=300"
};

// 🔥 GLOBAL MEMORY CACHE
let MEMORY_CACHE = null;
let MEMORY_CACHE_TIME = 0;
const MEMORY_TTL = 1000 * 60 * 5; // 5 dakika

export async function onRequestGet(context) {
    const cache = caches.default;
    const url = new URL(context.request.url);

    // EDGE CACHE
    const cacheResponse = await cache.match(context.request);
    if (cacheResponse) return cacheResponse;

    try {
        const r2 = context.env.VECTOR_ASSETS;

        const slug = url.searchParams.get("slug");
        const category = url.searchParams.get("category") || "";
        const page = Math.max(1, parseInt(url.searchParams.get("page") || "1"));
        const limit = Math.min(100, Math.max(1, parseInt(url.searchParams.get("limit") || "24")));
        const search = (url.searchParams.get("search") || "").toLowerCase().trim();
        const sort = url.searchParams.get("sort") || "";
        const type = url.searchParams.get("type") || "";

        // 🔥 MEMORY CACHE KULLAN
        if (!MEMORY_CACHE || Date.now() - MEMORY_CACHE_TIME > MEMORY_TTL) {
            let raw;

            const r2Object = await r2.get("all_vectors.json");
            if (r2Object) {
                raw = await r2Object.text();
            } else {
                const kv = context.env.VECTOR_DB;
                raw = await kv.get("all_vectors");
            }

            if (!raw) {
                return new Response(JSON.stringify({ vectors: [], total: 0, page: 1, totalPages: 0 }), { status: 200, headers: CORS_HEADERS });
            }

            MEMORY_CACHE = JSON.parse(raw);

            // 🔥 TEK SEFER SORT
            MEMORY_CACHE.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));

            MEMORY_CACHE_TIME = Date.now();
        }

        let allVectors = MEMORY_CACHE;

        // SINGLE
        if (slug) {
            const vector = allVectors.find(v => v.name === slug);
            if (!vector) return new Response(JSON.stringify({ error: "Vector not found" }), { status: 404, headers: CORS_HEADERS });

            const response = new Response(JSON.stringify(enrichVector(vector)), { status: 200, headers: CORS_HEADERS });
            context.waitUntil(cache.put(context.request, response.clone()));
            return response;
        }

        // CATEGORY
        if (category && category !== "all") {
            const c = category.toLowerCase();
            allVectors = allVectors.filter(v => (v.category || "").toLowerCase() === c);
        }

        // TYPE
        if (type === "vector") {
            allVectors = allVectors.filter(v => v.contentType !== "jpeg");
        } else if (type === "jpeg") {
            allVectors = allVectors.filter(v => v.contentType === "jpeg");
        }

        // 🔥 FAST SEARCH (NO HEAVY LOOP)
        if (search) {
            const terms = search.split(/\s+/);
            allVectors = allVectors.filter(v => {
                const text = (v.title + " " + (v.description || "") + " " + (v.keywords || []).join(" ")).toLowerCase();
                return terms.some(t => text.includes(t));
            });
        }

        // PAGINATION
        const total = allVectors.length;
        const totalPages = Math.max(1, Math.ceil(total / limit));
        const validPage = Math.min(page, totalPages);
        const offset = (validPage - 1) * limit;

        const pageVectors = allVectors.slice(offset, offset + limit);

        const result = {
            vectors: pageVectors.map(enrichVector),
            total,
            page: validPage,
            totalPages,
            category: category || "all"
        };

        const response = new Response(JSON.stringify(result), { status: 200, headers: CORS_HEADERS });

        context.waitUntil(cache.put(context.request, response.clone()));

        return response;

    } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: CORS_HEADERS });
    }
}

function enrichVector(v) {
    const id = v.name;
    const category = v.category || "Miscellaneous";

    const thumbKey = `${category}/${id}/${id}.jpg`;

    return {
        ...v,
        title: v.title || v.name || "",
        thumbnail: `/api/asset?key=${encodeURIComponent(thumbKey)}`,
        isJpegOnly: v.contentType === 'jpeg'
    };
}
