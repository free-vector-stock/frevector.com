/**
 * GET /api/vectors
 * Returns paginated vector list with thumbnails from R2
 */

const CORS_HEADERS = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Cache-Control": "public, max-age=60"
};

export async function onRequestGet(context) {
    try {
        const kv = context.env.VECTOR_DB;
        if (!kv) {
            return new Response(JSON.stringify({ error: "KV not configured" }), { status: 500, headers: CORS_HEADERS });
        }

        const url = new URL(context.request.url);
        const slug = url.searchParams.get("slug");
        const category = url.searchParams.get("category") || "";
        const page = Math.max(1, parseInt(url.searchParams.get("page") || "1"));
        const limit = Math.min(100, Math.max(1, parseInt(url.searchParams.get("limit") || "24")));
        const search = (url.searchParams.get("search") || "").toLowerCase().trim();
        const sort = url.searchParams.get("sort") || "";

        const allVectorsRaw = await kv.get("all_vectors");
        if (!allVectorsRaw) {
            return new Response(JSON.stringify({ vectors: [], total: 0, page: 1, totalPages: 0 }), {
                status: 200,
                headers: CORS_HEADERS
            });
        }

        let allVectors = JSON.parse(allVectorsRaw);

        // Single vector detail
        if (slug) {
            const vector = allVectors.find(v => v.name === slug);
            if (!vector) {
                return new Response(JSON.stringify({ error: "Vector not found" }), { status: 404, headers: CORS_HEADERS });
            }
            return new Response(JSON.stringify(enrichVector(vector)), { status: 200, headers: CORS_HEADERS });
        }

        // Category filter
        if (category && category !== "all") {
            allVectors = allVectors.filter(v =>
                (v.category || "").toLowerCase() === category.toLowerCase()
            );
        }

        // Search filter (keywords + title + description)
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

        // Sort
        if (sort === "newest") {
            allVectors.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
        } else if (sort === "oldest") {
            allVectors.sort((a, b) => new Date(a.date || 0) - new Date(b.date || 0));
        }

        const total = allVectors.length;
        const totalPages = Math.max(1, Math.ceil(total / limit));
        const offset = (page - 1) * limit;
        const pageVectors = allVectors.slice(offset, offset + limit);

        return new Response(JSON.stringify({
            vectors: pageVectors.map(enrichVector),
            total,
            page,
            totalPages,
            category: category || "all"
        }), { status: 200, headers: CORS_HEADERS });

    } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: CORS_HEADERS });
    }
}

function enrichVector(v) {
    return {
        ...v,
        title: v.title || v.name || "",
        thumbnail: `/api/asset?key=assets/${encodeURIComponent(v.category)}/${encodeURIComponent(v.name)}.jpg`,
        zipUrl: `/api/asset?key=assets/${encodeURIComponent(v.category)}/${encodeURIComponent(v.name)}.zip`,
        fileSize: v.fileSize || null
    };
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
