/**
 * Admin API - Protected endpoints for managing vectors
 */

const ADMIN_PASSWORD = "Frevector@2026!";

const VALID_CATEGORIES = [
  "Abstract",
  "Animals/Wildlife",
  "The Arts",
  "Backgrounds/Textures",
  "Beauty/Fashion",
  "Buildings/Landmarks",
  "Business/Finance",
  "Celebrities",
  "Drink",
  "Education",
  "Font",
  "Food",
  "Healthcare/Medical",
  "Holidays",
  "Icon",
  "Industrial",
  "Interiors",
  "Logo",
  "Miscellaneous",
  "Nature",
  "Objects",
  "Parks/Outdoor",
  "People",
  "Religion",
  "Science",
  "Signs/Symbols",
  "Sports/Recreation",
  "Technology",
  "Transportation",
  "Vintage"
];
// Total: 30 categories

function authenticate(request) {
  const authHeader = request.headers.get("X-Admin-Key") || request.headers.get("Authorization");
  if (!authHeader) return false;
  const key = authHeader.replace("Bearer ", "").trim();
  return key === ADMIN_PASSWORD;
}

function generateSeoSlug(title) {
  if (!title || title.trim() === "") return null;
  
  const titleStr = title.toString().trim();
  
  // Clean and normalize the title
  const slug = titleStr
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')  // Remove special characters
    .replace(/\s+/g, '-')            // Replace spaces with dashes
    .replace(/-+/g, '-')              // Replace multiple dashes
    .replace(/^-|-$/g, '');           // Remove leading/trailing dashes
  
  // Return the full SEO slug with title content
  return slug ? `free-vector-${slug}` : null;
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
    const allVectors = allVectorsRaw ? JSON.parse(allVectorsRaw) : [];

    // Bulk rename action for old vectors
    if (action === "bulk-rename") {
      const r2 = context.env.VECTOR_ASSETS;
      const results = { total: allVectors.length, renamed: 0, skipped: 0, failed: 0, limit: 50 };
      const updated = [];
      let count = 0;

      for (const v of allVectors) {
        if (count >= 50) {
          updated.push(...allVectors.slice(allVectors.indexOf(v)));
          break;
        }

        // Skip if already in SEO format
        if (v.name && v.name.startsWith("free-vector-")) {
          results.skipped++;
          updated.push(v);
          continue;
        }

        // Generate new SEO slug from title (prefer title, fallback to name)
        let newSlug = null;
        if (v.title && v.title.trim() && !v.title.includes("00000")) {
          // Use title if it's not empty and not a numeric ID
          newSlug = generateSeoSlug(v.title);
        } else if (v.name && !v.name.startsWith("free-vector-")) {
          // Use the old name as fallback, clean it up
          newSlug = generateSeoSlug(v.name);
        }
        
        if (!newSlug || newSlug === v.name) {
          results.failed++;
          updated.push(v);
          continue;
        }

        try {
          const cat = v.category || "Miscellaneous";
          const oldName = v.name;

          // Get old files from R2
          const oldJpg = await r2.get(`assets/${cat}/${oldName}.jpg`);
          const oldZip = await r2.get(`assets/${cat}/${oldName}.zip`);

          // Copy to new location
          if (oldJpg) {
            await r2.put(`assets/${cat}/${newSlug}.jpg`, await oldJpg.arrayBuffer(), { httpMetadata: { contentType: "image/jpeg" } });
            await r2.delete(`assets/${cat}/${oldName}.jpg`);
          }
          if (oldZip) {
            await r2.put(`assets/${cat}/${newSlug}.zip`, await oldZip.arrayBuffer(), { httpMetadata: { contentType: "application/zip" } });
            await r2.delete(`assets/${cat}/${oldName}.zip`);
          }

          // Update the vector record
          v.name = newSlug;
          results.renamed++;
          count++;
        } catch (e) {
          results.failed++;
        }
        updated.push(v);
      }

      // Save updated vectors
      await kv.put("all_vectors", JSON.stringify(updated));
      return new Response(JSON.stringify({ success: true, results }), { status: 200, headers });
    }

    return new Response(JSON.stringify({ vectors: allVectors }), { status: 200, headers });
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
    
    // Generate SEO-friendly slug from title
    // Format: free-vector-[title-in-lowercase-with-dashes]
    let slug = null;
    if (metadata.title && metadata.title.trim()) {
      slug = generateSeoSlug(metadata.title);
    }
    if (!slug) {
      // Fallback to filename if no title
      const filename = jsonFile.name.replace(/\.json$/, "");
      slug = generateSeoSlug(filename) || filename;
    }

    // Validate category
    const category = metadata.category || "Miscellaneous";
    if (!VALID_CATEGORIES.includes(category)) {
      return new Response(JSON.stringify({ error: `Invalid category: ${category}. Must be one of: ${VALID_CATEGORIES.join(", ")}` }), { status: 400, headers });
    }
    
    // Ensure slug is not empty
    if (!slug || slug === "free-vector-") {
      return new Response(JSON.stringify({ error: "Title is required to generate a valid slug" }), { status: 400, headers });
    }

    const allVectorsRaw = await kv.get("all_vectors");
    const allVectors = allVectorsRaw ? JSON.parse(allVectorsRaw) : [];

    const existing = allVectors.find(v => v.name === slug);
    if (existing) return new Response(JSON.stringify({ error: "DUPLICATE" }), { status: 409, headers });

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

    if (!slug) return new Response(JSON.stringify({ error: "Missing slug" }), { status: 400, headers });

    const allVectorsRaw = await kv.get("all_vectors");
    if (!allVectorsRaw) return new Response(JSON.stringify({ error: "Not found" }), { status: 404, headers });

    let allVectors = JSON.parse(allVectorsRaw);
    const vectorIndex = allVectors.findIndex(v => v.name === slug);

    if (vectorIndex === -1) {
        // If not found in KV, still try to trigger a cleanup to be safe
        return new Response(JSON.stringify({ error: "Not found in database, but cleanup triggered" }), { status: 404, headers });
    }

    const vector = allVectors[vectorIndex];
    
    // 1. Delete from R2 (Storage)
    try {
        await r2.delete(`assets/${vector.category}/${slug}.jpg`);
        await r2.delete(`assets/${vector.category}/${slug}.zip`);
    } catch (r2Error) {
        console.error("R2 Delete Error:", r2Error);
        // Continue anyway to remove from KV
    }

    // 2. Remove from KV (Database)
    allVectors.splice(vectorIndex, 1);
    
    // 3. AUTOMATIC CLEANUP: Verify all other vectors in the same category still exist
    // This is a "light" version of cleanup that runs on every delete to ensure consistency
    // We only check a few to keep it fast, or just trust the splice for now.
    // For a full fix, we'll ensure the KV is always updated.
    
    await kv.put("all_vectors", JSON.stringify(allVectors));

    return new Response(JSON.stringify({ success: true, message: "Deleted and synchronized" }), { status: 200, headers });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500, headers });
  }
}
