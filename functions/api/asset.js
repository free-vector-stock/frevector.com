/**
 * GET /api/asset?key=assets/Category/filename.jpg
 * Serves files from R2 bucket through Pages Function
 */

export async function onRequestGet(context) {
    try {
        const r2 = context.env.VECTOR_ASSETS;
        if (!r2) {
            return new Response("R2 not configured", { status: 500 });
        }

        const url = new URL(context.request.url);
        const key = url.searchParams.get("key");

        if (!key) {
            return new Response("Missing key parameter", { status: 400 });
        }

        // Security: only allow assets/ prefix
        if (!key.startsWith("assets/")) {
            return new Response("Forbidden", { status: 403 });
        }

        // Decode URL-encoded key
        const decodedKey = decodeURIComponent(key);

        const object = await r2.get(decodedKey);

        if (!object) {
            // Log missing file for debugging
            console.warn(`Missing R2 file: ${decodedKey}`);
            
            // Return placeholder for missing images
            if (decodedKey.endsWith(".jpg") || decodedKey.endsWith(".jpeg") || decodedKey.endsWith(".png")) {
                return Response.redirect("https://placehold.co/400x300/f5f5f5/999999?text=Preview", 302);
            }
            
            // For ZIP files, return 404 to prevent broken downloads
            if (decodedKey.endsWith(".zip")) {
                return new Response(JSON.stringify({ error: "File not found in storage" }), { status: 404, headers: { "Content-Type": "application/json" } });
            }
            
            return new Response("File not found", { status: 404 });
        }

        const isZip = decodedKey.endsWith(".zip");
        const isJpeg = decodedKey.endsWith(".jpg") || decodedKey.endsWith(".jpeg");

        const headers = {
            "Cache-Control": "public, max-age=86400",
            "Access-Control-Allow-Origin": "*"
        };

        if (isZip) {
            const filename = decodedKey.split("/").pop();
            headers["Content-Type"] = "application/zip";
            headers["Content-Disposition"] = `attachment; filename="${filename}"`;
        } else if (isJpeg) {
            headers["Content-Type"] = "image/jpeg";
        } else {
            headers["Content-Type"] = object.httpMetadata?.contentType || "application/octet-stream";
        }

        // Add content length if available
        if (object.size) {
            headers["Content-Length"] = String(object.size);
        }

        return new Response(object.body, { status: 200, headers });

    } catch (e) {
        console.error("Asset error:", e);
        return new Response(e.message, { status: 500 });
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
