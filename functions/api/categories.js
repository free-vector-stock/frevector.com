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

    // All defined categories (sorted A-Z)
    const allCategories = [
      "Abstract", "Animals/Wildlife", "The Arts", "Backgrounds/Textures",
      "Beauty/Fashion", "Buildings/Landmarks", "Business/Finance", "Celebrities",
      "Education", "Food", "Drink", "Healthcare/Medical", "Holidays",
      "Industrial", "Interiors", "Miscellaneous", "Nature", "Objects",
      "Parks/Outdoor", "People", "Religion", "Science", "Signs/Symbols",
      "Sports/Recreation", "Technology", "Transportation", "Vintage",
      "Logo", "Font", "Icon"
    ];

    const categories = allCategories
      .filter(cat => categoryCounts[cat] > 0)
      .map(cat => ({
        name: cat,
        count: categoryCounts[cat] || 0
      }));

    return new Response(JSON.stringify({ categories }), { status: 200, headers });

  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500, headers });
  }
}
