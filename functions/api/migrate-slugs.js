/**
 * POST /api/migrate-slugs
 * Admin-only endpoint to migrate old slugs to SEO-friendly format
 * Format: free-vector-[title-in-lowercase-with-dashes]
 */

const ADMIN_PASSWORD = "Frevector@2026!";

function authenticate(request) {
  const authHeader = request.headers.get("X-Admin-Key") || request.headers.get("Authorization");
  if (!authHeader) return false;
  const key = authHeader.replace("Bearer ", "").trim();
  return key === ADMIN_PASSWORD;
}

function generateSeoSlug(title) {
  if (!title) return null;
  
  let slug = title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')  // Remove special characters
    .replace(/\s+/g, '-')            // Replace spaces with dashes
    .replace(/-+/g, '-')              // Replace multiple dashes
    .replace(/^-|-$/g, '');           // Remove leading/trailing dashes
  
  return slug ? `free-vector-${slug}` : null;
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
    if (!allVectorsRaw) {
      return new Response(JSON.stringify({ error: "No vectors found" }), { status: 404, headers });
    }

    let allVectors = JSON.parse(allVectorsRaw);
    const migrationResults = {
      total: allVectors.length,
      migrated: 0,
      alreadySeo: 0,
      failed: 0,
      errors: []
    };

    const updatedVectors = [];

    for (const vector of allVectors) {
      const oldSlug = vector.name;
      
      // Skip if already in SEO format
      if (oldSlug.startsWith("free-vector-")) {
        migrationResults.alreadySeo++;
        updatedVectors.push(vector);
        continue;
      }

      // Generate new SEO slug from title
      const newSlug = generateSeoSlug(vector.title || vector.name);
      
      if (!newSlug) {
        migrationResults.failed++;
        migrationResults.errors.push(`Failed to generate slug for: ${oldSlug}`);
        updatedVectors.push(vector);
        continue;
      }

      try {
        // Rename files in R2
        const category = vector.category || "Miscellaneous";
        
        // Get old files
        const oldJpg = await r2.get(`assets/${category}/${oldSlug}.jpg`);
        const oldZip = await r2.get(`assets/${category}/${oldSlug}.zip`);

        // Copy to new location
        if (oldJpg) {
          await r2.put(`assets/${category}/${newSlug}.jpg`, await oldJpg.arrayBuffer(), { httpMetadata: { contentType: "image/jpeg" } });
        }
        if (oldZip) {
          await r2.put(`assets/${category}/${newSlug}.zip`, await oldZip.arrayBuffer(), { httpMetadata: { contentType: "application/zip" } });
        }

        // Delete old files
        try {
          await r2.delete(`assets/${category}/${oldSlug}.jpg`);
          await r2.delete(`assets/${category}/${oldSlug}.zip`);
        } catch (e) {
          // Ignore deletion errors
        }

        // Update vector record
        vector.name = newSlug;
        updatedVectors.push(vector);
        migrationResults.migrated++;

      } catch (e) {
        migrationResults.failed++;
        migrationResults.errors.push(`Error migrating ${oldSlug}: ${e.message}`);
        updatedVectors.push(vector);  // Keep original if migration fails
      }
    }

    // Save updated vectors to KV
    await kv.put("all_vectors", JSON.stringify(updatedVectors));

    return new Response(JSON.stringify({
      success: true,
      message: "Migration completed",
      results: migrationResults
    }), { status: 200, headers });

  } catch (e) {
    console.error("Migration error:", e);
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
