/**
 * GET /api/categories
 * Returns list of all categories with vector counts, sorted A-Z
 * Optimized for R2 + Edge Cache
 */

const CORS_HEADERS = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Cache-Control": "public, max-age=300"
};

const ALL_CATEGORIES = [
    'Icon', 'Logo', 'Abstract', 'Animals', 'The Arts', 'Backgrounds', 'Business', 'Buildings', 'Celebrities',
    'Drink', 'Education', 'Fashion', 'Food', 'Font', 'Holidays', 'Industrial', 'Interiors', 'Medical',
    'Miscellaneous', 'Nature', 'Objects', 'Outdoor', 'People', 'Religion', 'Science', 'Symbols', 'Sports',
    'Technology', 'Transportation', 'Vintage'
];

export async function onRequestGet(context) {
    const cache = caches.default;
    const cacheResponse = await cache.match(context.request);
    if (cacheResponse) return cacheResponse;

    try {
        const r2 = context.env.VECTOR_ASSETS;
        
        // Try to get all_vectors from R2 first
        let allVectorsRaw;
        const r2Object = await r2.get("all_vectors.json");
        if (r2Object) {
            allVectorsRaw = await r2Object.text();
        } else {
            const kv = context.env.VECTOR_DB;
            allVectorsRaw = await kv.get("all_vectors");
        }

        const allVectors = allVectorsRaw ? JSON.parse(allVectorsRaw) : [];

        const categoryCounts = {};
        for (const v of allVectors) {
            const cat = v.category || "Miscellaneous";
            categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
        }

        const categories = ALL_CATEGORIES.map(name => ({
            name,
            count: categoryCounts[name] || 0
        }));

        // Order: Icon first, then Logo, then others in ALL_CATEGORIES order
        categories.sort((a, b) => {
            const idxA = ALL_CATEGORIES.indexOf(a.name);
            const idxB = ALL_CATEGORIES.indexOf(b.name);
            return idxA - idxB;
        });

        const result = { categories, total: allVectors.length };
        const response = new Response(JSON.stringify(result), { status: 200, headers: CORS_HEADERS });
        
        context.waitUntil(cache.put(context.request, response.clone()));
        return response;

    } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: CORS_HEADERS });
    }
}

export async function onRequestOptions() {
    return new Response(null, {
        status: 204,
        headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type"
        }
    });
}
