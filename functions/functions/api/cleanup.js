/**
 * POST /api/cleanup
 * Admin-only endpoint to sync KV and R2, removing orphaned entries
 * Requirement: Strict "icon/" folder structure.
 */

const ADMIN_PASSWORD = "vector2026";

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
    const r2 = context.env.VECTOR_ASSETS;

    if (!kv || !r2) {
      return new Response(JSON.stringify({ error: "Services not configured" }), { status: 500, headers });
    }

    const allVectorsRaw = await kv.get("all_vectors");
    const allVectors = allVectorsRaw ? JSON.parse(allVectorsRaw) : [];

    let removedCount = 0;
    const orphanedVectors = [];
    const validVectors = [];

    for (const vector of allVectors) {
      // Requirement: Files must be in "icon/" folder
      const jpgKey = `icon/${vector.name}.jpg`;
      const zipKey = `icon/${vector.name}.zip`;

      const [jpgExists, zipExists] = await Promise.all([
        r2.head(jpgKey),
        r2.head(zipKey)
      ]);

      if (jpgExists && zipExists) {
        validVectors.push(vector);
      } else {
        orphanedVectors.push({
          name: vector.name,
          category: vector.category,
          jpgExists: !!jpgExists,
          zipExists: !!zipExists
        });
        removedCount++;
      }
    }

    if (removedCount > 0) {
      await kv.put("all_vectors", JSON.stringify(validVectors));
    }

    return new Response(JSON.stringify({
      success: true,
      message: `Cleanup complete. Removed ${removedCount} orphaned entries from KV.`,
      removedCount,
      orphanedVectors,
      totalVectorsAfter: validVectors.length
    }), { status: 200, headers });

  } catch (e) {
    console.error("Cleanup error:", e);
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
