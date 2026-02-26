/**
 * GET /api/asset?key=assets/Category/filename.jpg
 * Serves files from R2 bucket through Worker
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

    const object = await r2.get(key);

    if (!object) {
      // Return placeholder for missing images
      if (key.endsWith(".jpg") || key.endsWith(".jpeg") || key.endsWith(".png")) {
        return Response.redirect("https://placehold.co/400x300/1a1a1a/666666?text=Preview", 302);
      }
      return new Response("File not found", { status: 404 });
    }

    const isZip = key.endsWith(".zip");
    const isJpeg = key.endsWith(".jpg") || key.endsWith(".jpeg");

    const headers = {
      "Cache-Control": "public, max-age=86400",
      "Access-Control-Allow-Origin": "*"
    };

    if (isZip) {
      const filename = key.split("/").pop();
      headers["Content-Type"] = "application/zip";
      headers["Content-Disposition"] = `attachment; filename="${filename}"`;
    } else if (isJpeg) {
      headers["Content-Type"] = "image/jpeg";
    } else {
      headers["Content-Type"] = object.httpMetadata?.contentType || "application/octet-stream";
    }

    return new Response(object.body, { status: 200, headers });

  } catch (e) {
    return new Response(e.message, { status: 500 });
  }
}
