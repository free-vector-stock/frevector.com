/**
 * GET /api/stats?slug=SLUG
 * Returns views, downloads, and likes counts for a given vector slug.
 */
const CORS_HEADERS = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Cache-Control": "no-store"
};

export async function onRequestGet(context) {
    try {
        const kv = context.env.VECTOR_DB;
        const url = new URL(context.request.url);
        const slug = url.searchParams.get("slug");
        if (!slug) {
            return new Response(JSON.stringify({ error: "slug required" }), { status: 400, headers: CORS_HEADERS });
        }
        const [views, downloads, likes] = await Promise.all([
            kv.get(`views_count:${slug}`),
            kv.get(`downloads_count:${slug}`),
            kv.get(`likes_count:${slug}`)
        ]);
        return new Response(JSON.stringify({
            slug,
            views: parseInt(views) || 0,
            downloads: parseInt(downloads) || 0,
            likes: parseInt(likes) || 0
        }), { status: 200, headers: CORS_HEADERS });
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
            "Access-Control-Allow-Headers": "Content-Type",
            "Access-Control-Max-Age": "86400"
        }
    });
}
