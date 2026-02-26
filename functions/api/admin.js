/**
 * Admin API - Protected endpoints for managing vectors
 */

const ADMIN_PASSWORD = "Frevector@2026!";

function authenticate(request) {
  const authHeader = request.headers.get("X-Admin-Key") || request.headers.get("Authorization");
  if (!authHeader) return false;
  const key = authHeader.replace("Bearer ", "").trim();
  return key === ADMIN_PASSWORD;
}

export async function onRequestGet(context) {
  const headers = { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" };
  if (!authenticate(context.request)) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers });

  try {
    const kv = context.env.VECTOR_DB;
    const url = new URL(context.request.url);
    const action = url.searchParams.get("action");

    if (action === "stats") {
      const allVectorsRaw = await kv.get("all_vectors");
      const allVectors = allVectorsRaw ? JSON.parse(allVectorsRaw) : [];
      const stats = {};
      let totalDownloads = 0;
      for (const v of allVectors) {
        const cat = v.category || "Unknown";
        if (!stats[cat]) stats[cat] = { count: 0, downloads: 0 };
        stats[cat].count++;
        stats[cat].downloads += v.downloads || 0;
        totalDownloads += v.downloads || 0;
      }
      const categories = Object.entries(stats).sort(([a], [b]) => a.localeCompare(b)).map(([name, data]) => ({ name, ...data }));
      return new Response(JSON.stringify({ totalVectors: allVectors.length, totalDownloads, categories }), { status: 200, headers });
    }

    const allVectorsRaw = await kv.get("all_vectors");
    return new Response(allVectorsRaw || JSON.stringify({ vectors: [] }), { status: 200, headers });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500, headers });
  }
}

export async function onRequestPost(context) {
  const headers = { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" };
  if (!authenticate(context.request)) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers });

  try {
    const kv = context.env.VECTOR_DB;
    const r2 = context.env.VECTOR_ASSETS;
    const formData = await context.request.formData();

    const jsonFile = formData.get("json");
    const jpegFile = formData.get("jpeg");
    const zipFile = formData.get("zip");

    if (!jsonFile || !jpegFile || !zipFile) return new Response(JSON.stringify({ error: "Missing files" }), { status: 400, headers });

    const metadata = JSON.parse(await jsonFile.text());
    const slug = jsonFile.name.replace(/\.json$/, "");

    const existing = await kv.get(`vector:${slug}`);
    if (existing) return new Response(JSON.stringify({ error: "DUPLICATE" }), { status: 409, headers });

    const category = metadata.category || "Miscellaneous";
    await r2.put(`assets/${category}/${slug}.jpg`, await jpegFile.arrayBuffer(), { httpMetadata: { contentType: "image/jpeg" } });
    await r2.put(`assets/${category}/${slug}.zip`, await zipFile.arrayBuffer(), { httpMetadata: { contentType: "application/zip" } });

    const vectorRecord = {
      name: slug,
      category,
      title: metadata.title || slug,
      description: metadata.description || "",
      keywords: metadata.keywords || [],
      date: new Date().toISOString().split("T")[0],
      downloads: 0,
      fileSize: `${(zipFile.size / (1024 * 1024)).toFixed(1)} MB`
    };

    await kv.put(`vector:${slug}`, JSON.stringify(vectorRecord));
    const allVectorsRaw = await kv.get("all_vectors");
    const allVectors = allVectorsRaw ? JSON.parse(allVectorsRaw) : [];
    allVectors.unshift(vectorRecord);
    await kv.put("all_vectors", JSON.stringify(allVectors));

    return new Response(JSON.stringify({ success: true, message: `Uploaded: ${slug}` }), { status: 200, headers });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500, headers });
  }
}

export async function onRequestDelete(context) {
  const headers = { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" };
  if (!authenticate(context.request)) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers });

  try {
    const kv = context.env.VECTOR_DB;
    const r2 = context.env.VECTOR_ASSETS;
    const slug = new URL(context.request.url).searchParams.get("slug");

    const vectorRaw = await kv.get(`vector:${slug}`);
    if (!vectorRaw) return new Response(JSON.stringify({ error: "Not found" }), { status: 404, headers });

    const vector = JSON.parse(vectorRaw);
    await r2.delete(`assets/${vector.category}/${slug}.jpg`);
    await r2.delete(`assets/${vector.category}/${slug}.zip`);
    await kv.delete(`vector:${slug}`);

    const allVectorsRaw = await kv.get("all_vectors");
    if (allVectorsRaw) {
      const allVectors = JSON.parse(allVectorsRaw);
      await kv.put("all_vectors", JSON.stringify(allVectors.filter(v => v.name !== slug)));
    }

    return new Response(JSON.stringify({ success: true }), { status: 200, headers });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500, headers });
  }
}
