/**
 * GET /api/sync
 * Utility to manually sync KV to R2
 */

const ADMIN_PASSWORD = "vector2026";

const CORS_HEADERS = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
};

export async function onRequestGet(context) {
    const url = new URL(context.request.url);
    const key = url.searchParams.get("key");

    if (key !== ADMIN_PASSWORD) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: CORS_HEADERS });
    }

    try {
        const kv = context.env.VECTOR_DB;
        const r2 = context.env.VECTOR_ASSETS;

        const allVectorsRaw = await kv.get("all_vectors");
        if (!allVectorsRaw) {
            return new Response(JSON.stringify({ error: "No data in KV to sync" }), { status: 404, headers: CORS_HEADERS });
        }

        await r2.put("all_vectors.json", allVectorsRaw, { 
            httpMetadata: { contentType: "application/json" } 
        });

        return new Response(JSON.stringify({ success: true, message: "KV synced to R2 successfully" }), { 
            status: 200, 
            headers: CORS_HEADERS 
        });

    } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: CORS_HEADERS });
    }
}
