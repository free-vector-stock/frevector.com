/**
 * GET /api/vectors
 * Returns paginated vector list with thumbnails from R2.
 * Requirement: Strict "icon/" folder structure.
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
        if (!allVectorsRaw) {
            return new Response(JSON.stringify({ vectors: [], total: 0, page: 1, totalPages: 0 }), { status: 200, headers: CORS_HEADERS });
        }

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

        // Search filter with relevance scoring (Keywords focused)
        if (search) {
            const terms = search.split(/\s+/).filter(Boolean);
            allVectors = allVectors
                .map(v => {
                    const title = (v.title || "").toLowerCase();
                    const keywords = (v.keywords || []).map(k => k.toLowerCase());
                    const description = (v.description || "").toLowerCase();
                    const name = (v.name || "").toLowerCase();
                    
                    let score = 0;
                    let matchCount = 0;
                    
                    for (const term of terms) {
                        let termMatched = false;
                        
                        // Keywords match (Highest priority as per requirement)
                        for (const kw of keywords) {
                            if (kw === term) {
                                score += 50;
                                termMatched = true;
                            } else if (kw.includes(term)) {
                                score += 20;
                                termMatched = true;
                            }
                        }

                        // Title match
                        if (title.includes(term)) {
                            score += 15;
                            termMatched = true;
                        }
                        // Name match
                        if (name.includes(term)) {
                            score += 10;
                            termMatched = true;
                        }
                        // Description match
                        if (description.includes(term)) {
                            score += 5;
                            termMatched = true;
                        }
                        if (termMatched) matchCount++;
                    }
                    
                    // Must match at least one term
                    if (matchCount > 0) {
                        return { ...v, _score: score };
                    }
                    return null;
                })
                .filter(v => v !== null)
                .sort((a, b) => b._score - a._score)
                .map(({ _score, ...v }) => v);
        }

        // Sort (only if no search query - preserve relevance for search)
        if (!search) {
            if (sort === "oldest") {
                allVectors.sort((a, b) => new Date(a.date || 0) - new Date(b.date || 0));
            } else {
                allVectors.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
            }
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
    
    // New structure: Category/ID/ID.ext
    const thumbKey = `${category}/${id}/${id}-thumb.jpg`;
    const jpgKey = `${category}/${id}/${id}.jpg`;
    const zipKey = `${category}/${id}/${id}.zip`;
    const isJpegOnly = v.contentType === 'jpeg';

    return {
        ...v,
        title: v.title || v.name || "",
        // Use thumbnail if available, NO FALLBACK to original jpg as per requirement (must be re-generated)
        thumbnail: `/api/asset?key=${encodeURIComponent(thumbKey)}`,
        originalUrl: `/api/asset?key=${encodeURIComponent(jpgKey)}`,
        zipUrl: isJpegOnly ? `/api/asset?key=${encodeURIComponent(jpgKey)}` : `/api/asset?key=${encodeURIComponent(zipKey)}`,
        fileSize: v.fileSize || null,
        isJpegOnly: isJpegOnly
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
