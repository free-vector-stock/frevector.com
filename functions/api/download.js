/**
 * GET /api/download?slug=xxx
 * Increments download counter and serves ZIP file from R2
 */
export async function onRequestGet(context) {
  try {
    const kv = context.env.VECTOR_DB;
    const r2 = context.env.VECTOR_ASSETS;
    const url = new URL(context.request.url);
    const slug = url.searchParams.get("slug");

    if (!slug) {
      return new Response("Missing slug parameter", { status: 400 });
    }

    // Get vector metadata
    const vectorRaw = await kv.get(`vector:${slug}`);
    if (!vectorRaw) {
      return new Response("Vector not found", { status: 404 });
    }

    const vector = JSON.parse(vectorRaw);
    const zipKey = `assets/${vector.category}/${slug}.zip`;

    // Get ZIP from R2
    const object = await r2.get(zipKey);
    if (!object) {
      return new Response("ZIP file not found", { status: 404 });
    }

    // Increment download counter (fire and forget)
    context.waitUntil((async () => {
      try {
        vector.downloads = (vector.downloads || 0) + 1;
        await kv.put(`vector:${slug}`, JSON.stringify(vector));

        // Update in all_vectors index
        const allVectorsRaw = await kv.get("all_vectors");
        if (allVectorsRaw) {
          const allVectors = JSON.parse(allVectorsRaw);
          const idx = allVectors.findIndex(v => v.name === slug);
          if (idx !== -1) {
            allVectors[idx].downloads = vector.downloads;
            await kv.put("all_vectors", JSON.stringify(allVectors));
          }
        }
      } catch (e) {
        console.error("Counter update failed:", e);
      }
    })());

    return new Response(object.body, {
      status: 200,
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="${slug}.zip"`,
        "Cache-Control": "no-cache",
        "Access-Control-Allow-Origin": "*"
      }
    });

  } catch (e) {
    return new Response(e.message, { status: 500 });
  }
}
