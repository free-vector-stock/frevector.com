/**
 * POST /api/fix-titles
 * Admin-only endpoint to fix invalid titles that contain numeric IDs
 * Removes titles with 5+ digit codes and replaces them with slug-based titles
 */

const ADMIN_PASSWORD = "vector2026";

function authenticate(request) {
  const authHeader = request.headers.get("X-Admin-Key") || request.headers.get("Authorization");
  if (!authHeader) return false;
  const key = authHeader.replace("Bearer ", "").trim();
  return key === ADMIN_PASSWORD;
}

function generateTitleFromSlug(slug) {
  if (!slug) return null;
  // Remove "free-vector-" prefix if present
  let title = slug.replace(/^free-vector-/, "");
  // Replace hyphens with spaces
  title = title.replace(/-/g, " ");
  // Capitalize each word
  title = title.split(" ")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
  return title;
}

export async function onRequestPost(context) {
  const headers = { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" };

  if (!authenticate(context.request)) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers });
  }

  try {
    const kv = context.env.VECTOR_DB;

    if (!kv) {
      return new Response(JSON.stringify({ error: "KV not configured" }), { status: 500, headers });
    }

    const allVectorsRaw = await kv.get("all_vectors");
    const allVectors = allVectorsRaw ? JSON.parse(allVectorsRaw) : [];

    let fixedCount = 0;
    const fixed = [];

    for (const v of allVectors) {
      const title = v.title || "";
      
      // Check if title contains 5+ digit numeric codes (file IDs)
      if (/\d{5,}/.test(title)) {
        // Generate new title from slug
        const newTitle = generateTitleFromSlug(v.name);
        if (newTitle && newTitle !== title) {
          v.title = newTitle;
          fixedCount++;
          fixed.push({ slug: v.name, oldTitle: title, newTitle });
        }
      }
    }

    if (fixedCount > 0) {
      await kv.put("all_vectors", JSON.stringify(allVectors));
    }

    return new Response(JSON.stringify({
      success: true,
      message: `Fixed ${fixedCount} titles with numeric IDs`,
      fixedCount,
      fixed
    }), { status: 200, headers });

  } catch (e) {
    console.error("Fix titles error:", e);
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
