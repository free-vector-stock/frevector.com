/**
 * POST /api/view?slug=SLUG
 * Increments view counter for a given vector slug.
 * IP-based throttle: same IP cannot increment more than once per 5 minutes.
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
        if (!slug) {
            return new Response(JSON.stringify({ error: "slug required" }), { status: 400, headers: CORS_HEADERS });
        }
        // IP-based throttle: 5 minutes
        const ip = context.request.headers.get("CF-Connecting-IP") || "unknown";
        const throttleKey = `view_throttle:${slug}:${ip}`;
        const throttled = await kv.get(throttleKey);
        if (throttled) {
            // Already counted recently — return current count without incrementing
            const current = await kv.get(`views_count:${slug}`);
            return new Response(JSON.stringify({ views: parseInt(current) || 0, throttled: true }), { status: 200, headers: CORS_HEADERS });
        }
        // Increment
        const countKey = `views_count:${slug}`;
        const current = await kv.get(countKey);
        const newCount = (parseInt(current) || 0) + 1;
        await Promise.all([
            kv.put(countKey, newCount.toString()),
            kv.put(throttleKey, "1", { expirationTtl: 300 }) // 5 minutes
        ]);
        return new Response(JSON.stringify({ views: newCount }), { status: 200, headers: CORS_HEADERS });
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
