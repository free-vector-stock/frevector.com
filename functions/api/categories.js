/**
 * GET /api/categories
 * Returns list of all categories with vector counts
 */
export async function onRequestGet(context) {
  const headers = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Cache-Control": "public, max-age=300"
  };

  try {
    const kv = context.env.VECTOR_DB;
    if (!kv) {
      return new Response(JSON.stringify({ error: "KV not configured" }), { status: 500, headers });
    }

    const allVectorsRaw = await kv.get("all_vectors");
    const allVectors = allVectorsRaw ? JSON.parse(allVectorsRaw) : [];

    // Count by category
    const categoryCounts = {};
    for (const v of allVectors) {
      const cat = v.category || "Miscellaneous";
      categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
    }

    // Sort by count (descending) then by name (ascending)
    const categories = Object.entries(categoryCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));

    return new Response(JSON.stringify({ categories }), { status: 200, headers });

  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500, headers });
  }
}
