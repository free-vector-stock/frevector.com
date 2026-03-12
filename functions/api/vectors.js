/**
 * GET /api/vectors
 * Returns paginated vector list with thumbnails from R2.
 */

const CORS_HEADERS = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Cache-Control": "public, max-age=60"
};

export async function onRequestGet(context) {
    try {
        const kv = context.env.VECTOR_DB;
        if (!kv) return new Response(JSON.stringify({ error: "KV not configured" }), { status: 500, headers: CORS_HEADERS });

        const url = new URL(context.request.url);
        const slug = url.searchParams.get("slug");
        const category = url.searchParams.get("category") || "";
        const page = Math.max(1, parseInt(url.searchParams.get("page") || "1"));
        const limit = Math.min(100, Math.max(1, parseInt(url.searchParams.get("limit") || "24")));
        const search = (url.searchParams.get("search") || "").toLowerCase().trim();
        const sort = url.searchParams.get("sort") || "";

        const allVectorsRaw = await kv.get("all_vectors");
        if (!allVectorsRaw) return new Response(JSON.stringify({ vectors: [], total: 0, page: 1, totalPages: 0 }), { status: 200, headers: CORS_HEADERS });

        let allVectors = JSON.parse(allVectorsRaw);

        // Single vector detail
        if (slug) {
            const vector = allVectors.find(v => v.name === slug);
            if (!vector) return new Response(JSON.stringify({ error: "Vector not found" }), { status: 404, headers: CORS_HEADERS });
            return new Response(JSON.stringify(enrichVector(vector)), { status: 200, headers: CORS_HEADERS });
        }

        // Category filter
        if (category && category !== "all") {
            const catLower = category.toLowerCase().trim();
            allVectors = allVectors.filter(v => (v.category || "").toLowerCase().trim() === catLower);
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
        const pageVectors = allVectors.slice(offset, offset + limit);

        return new Response(JSON.stringify({
            vectors: pageVectors.map(enrichVector),
            total,
            page: validPage,
            totalPages,
            category: category || "all"
        }), { status: 200, headers: CORS_HEADERS });

    } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: CORS_HEADERS });
    }
}

function enrichVector(v) {
    const id = v.name;
    const category = v.category || "Miscellaneous";
    
    // Structure: Category/ID/ID-thumb.jpg
    const thumbKey = `${category}/${id}/${id}-thumb.jpg`;
    const isJpegOnly = v.contentType === 'jpeg';

    return {
        ...v,
        title: v.title || v.name || "",
        // Requirement: ALWAYS use thumbnail in site
        thumbnail: `/api/asset?key=${encodeURIComponent(thumbKey)}`,
        isJpegOnly: isJpegOnly
    };
}
