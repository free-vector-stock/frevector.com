/**
 * POST /api/fix-categories
 * Admin-only endpoint to fix vectors assigned to "Miscellaneous" 
 * by inferring the correct category from their ID/slug.
 */

const ADMIN_PASSWORD = "vector2026";

const VALID_CATEGORIES = [
    'Abstract', 'Animals', 'The Arts', 'Backgrounds', 'Fashion', 'Buildings', 'Business', 'Celebrities',
    'Education', 'Food', 'Drink', 'Medical', 'Holidays', 'Industrial', 'Interiors', 'Miscellaneous',
    'Nature', 'Objects', 'Outdoor', 'People', 'Religion', 'Science', 'Symbols', 'Sports',
    'Technology', 'Transportation', 'Vintage', 'Logo', 'Font', 'Icon'
];

function normalizeString(str) {
    if (!str) return "";
    return str.toString().toLowerCase().trim()
        .replace(/ı/g, 'i')
        .replace(/ğ/g, 'g')
        .replace(/ü/g, 'u')
        .replace(/ş/g, 's')
        .replace(/ö/g, 'o')
        .replace(/ç/g, 'c');
}

function resolveCategoryFromId(id) {
    if (!id) return null;
    const s = normalizeString(id);
    
    // 1. Exact match
    for (const cat of VALID_CATEGORIES) {
        if (normalizeString(cat) === s) return cat;
    }
    
    // 2. Prefix/contains match
    for (const cat of VALID_CATEGORIES) {
        const normCat = normalizeString(cat);
        if (s.includes(normCat)) return cat;
    }

    return null;
}

function authenticate(request) {
  const authHeader = request.headers.get("X-Admin-Key") || request.headers.get("Authorization");
  if (!authHeader) return false;
  const key = authHeader.replace("Bearer ", "").trim();
  return key === ADMIN_PASSWORD;
}

export async function onRequestPost(context) {
  const headers = { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" };

  if (!authenticate(context.request)) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers });
  }

  try {
    const kv = context.env.VECTOR_DB;
    if (!kv) return new Response(JSON.stringify({ error: "KV not configured" }), { status: 500, headers });

    const allVectorsRaw = await kv.get("all_vectors");
    const allVectors = allVectorsRaw ? JSON.parse(allVectorsRaw) : [];

    let fixedCount = 0;
    const fixed = [];

    for (const v of allVectors) {
      // Only fix if category is Miscellaneous or missing
      if (!v.category || v.category === "Miscellaneous") {
        const inferredCategory = resolveCategoryFromId(v.name);
        if (inferredCategory && inferredCategory !== v.category) {
          const oldCategory = v.category;
          v.category = inferredCategory;
          fixedCount++;
          fixed.push({ slug: v.name, oldCategory, newCategory: inferredCategory });
        }
      }
    }

    if (fixedCount > 0) {
      await kv.put("all_vectors", JSON.stringify(allVectors));
    }

    return new Response(JSON.stringify({
      success: true,
      message: `Fixed ${fixedCount} vectors with inferred categories`,
      fixedCount,
      fixed
    }), { status: 200, headers });

  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500, headers });
  }
}

export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, X-Admin-Key"
    }
  });
}
