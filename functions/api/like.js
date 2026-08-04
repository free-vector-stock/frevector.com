/**
 * POST /api/like?slug=SLUG&action=like|unlike
 * Toggles like for a given vector slug.
 * action=like  → increments likes_count
 * action=unlike → decrements likes_count (min 0)
 */
const CORS_HEADERS = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Cache-Control": "no-store"
};

export async function onRequestPost(context) {
    try {
        const kv = context.env.VECTOR_DB;
        const url = new URL(context.request.url);
        const slug = url.searchParams.get("slug");
        const action = url.searchParams.get("action") || "like"; // "like" or "unlike"
        if (!slug) {
            return new Response(JSON.stringify({ error: "slug required" }), { status: 400, headers: CORS_HEADERS });
        }
        const countKey = `likes_count:${slug}`;
        const current = await kv.get(countKey);
        let newCount = parseInt(current) || 0;
        if (action === "unlike") {
            newCount = Math.max(0, newCount - 1);
        } else {
            newCount = newCount + 1;
        }
        await kv.put(countKey, newCount.toString());
        return new Response(JSON.stringify({ likes: newCount }), { status: 200, headers: CORS_HEADERS });
    } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: CORS_HEADERS });
    }
}

export async function onRequestOptions() {
    return new Response(null, {
        status: 204,
        headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type",
            "Access-Control-Max-Age": "86400"
        }
    });
}
