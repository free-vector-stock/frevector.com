/**
 * Admin API - Protected endpoints for managing vectors
 * Enhanced: Auto category detection, fuzzy match, upload validation, duplicate check, post-upload tests
 */

const ADMIN_PASSWORD = "vector2026";

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

/**
 * Fuzzy / typo-tolerant category matching.
 * 1. Exact match (case-insensitive)
 * 2. Starts-with match (e.g. "transportatıon" → "Transportation")
 * 3. Levenshtein distance ≤ 2 for short words, ≤ 3 for longer ones
 */
function normalizeCategory(raw) {
  if (!raw) return null;
  const s = String(raw).trim();

  // 1. Exact case-insensitive match
  const exact = VALID_CATEGORIES.find(c => c.toLowerCase() === s.toLowerCase());
  if (exact) return exact;

  // 2. Starts-with match on the first word segment (handles "Animals" → "Animals/Wildlife")
  const firstWord = s.split(/[/\s]/)[0].toLowerCase();
  const startsWith = VALID_CATEGORIES.find(c => c.toLowerCase().startsWith(firstWord) && firstWord.length >= 4);
  if (startsWith) return startsWith;

  // 3. Levenshtein distance on full string vs each category (and each category's first word)
  const threshold = s.length <= 6 ? 2 : 3;
  let best = null, bestDist = Infinity;
  for (const cat of VALID_CATEGORIES) {
    // Compare against the full category name
    const d1 = levenshtein(s.toLowerCase(), cat.toLowerCase());
    if (d1 < bestDist) { bestDist = d1; best = cat; }
    // Compare against the first word of the category (e.g. "Animals" from "Animals/Wildlife")
    const catFirst = cat.split(/[/\s]/)[0].toLowerCase();
    const d2 = levenshtein(s.toLowerCase(), catFirst);
    if (d2 < bestDist) { bestDist = d2; best = cat; }
  }
  if (best && bestDist <= threshold) return best;

  return null;
}

/**
 * Detect category from filename prefix.
 * e.g. "transportation-00000001" → "Transportation"
 *      "Transportatıon-00000001" → "Transportation"  (typo-tolerant)
 */
function categoryFromFilename(filename) {
  if (!filename) return null;
  const base = filename.replace(/\.[^/.]+$/, ""); // remove extension
  const prefix = base.split(/[-_\s]/)[0];         // first segment
  return normalizeCategory(prefix);
}

/** Simple Levenshtein distance */
function levenshtein(a, b) {
  const m = a.length, n = b.length;
  const dp = Array.from({ length: m + 1 }, (_, i) => [i, ...Array(n).fill(0)]);
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = a[i - 1] === b[j - 1]
        ? dp[i - 1][j - 1]
        : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
    }
  }
  return dp[m][n];
}

function authenticate(request) {
  const authHeader = request.headers.get("X-Admin-Key") || request.headers.get("Authorization");
  if (!authHeader) return false;
  const key = authHeader.replace("Bearer ", "").trim();
  return key === ADMIN_PASSWORD;
}

function generateSeoSlug(title) {
  if (!title || title.trim() === "") return null;
  const slug = title.toString().trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  return slug ? `free-vector-${slug}` : null;
}

// ─────────────────────────────────────────────
// GET  /api/admin  (list vectors, stats, bulk-rename)
// ─────────────────────────────────────────────
export async function onRequestGet(context) {
  const headers = { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" };
  if (!authenticate(context.request)) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers });

  try {
    const kv = context.env.VECTOR_DB;
    const url = new URL(context.request.url);
    const action = url.searchParams.get("action");

    // ── STATS ──
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

    // ── HEALTH CHECK ──
    if (action === "health") {
      const r2 = context.env.VECTOR_ASSETS;
      const issues = [];
      const slugsSeen = new Set();

      for (const v of allVectors) {
        // Duplicate slug
        if (slugsSeen.has(v.name)) {
          issues.push({ slug: v.name, type: "duplicate_slug", fix: "Delete duplicate entry" });
        }
        slugsSeen.add(v.name);

        // Invalid title (numeric-only or empty)
        if (!v.title || /^\d+$/.test(v.title) || /\d{5,}/.test(v.title)) {
          issues.push({ slug: v.name, type: "invalid_title", fix: "Update title in metadata" });
        }

        // Bad category
        if (!VALID_CATEGORIES.includes(v.category)) {
          issues.push({ slug: v.name, type: "bad_category", current: v.category, fix: "Re-upload with correct category" });
        }

        // Missing R2 files (check only a sample to avoid timeout — check all in small sets)
        if (r2) {
          const jpgKey = `assets/${v.category}/${v.name}.jpg`;
          const zipKey = `assets/${v.category}/${v.name}.zip`;
          const [jpg, zip] = await Promise.all([r2.head(jpgKey), r2.head(zipKey)]);
          if (!jpg) issues.push({ slug: v.name, type: "missing_jpg", fix: "Re-upload JPEG" });
          if (!zip) issues.push({ slug: v.name, type: "missing_zip", fix: "Re-upload ZIP" });
        }
      }

      return new Response(JSON.stringify({
        totalVectors: allVectors.length,
        issueCount: issues.length,
        issues
      }), { status: 200, headers });
    }

    // ── BULK RENAME ──
    if (action === "bulk-rename") {
      const r2 = context.env.VECTOR_ASSETS;
      const results = { total: allVectors.length, renamed: 0, skipped: 0, failed: 0, limit: 50 };
      const updated = [];
      let count = 0;

      for (const v of allVectors) {
        if (count >= 50) { updated.push(...allVectors.slice(allVectors.indexOf(v))); break; }
        if (v.name && v.name.startsWith("free-vector-")) { results.skipped++; updated.push(v); continue; }

        let newSlug = null;
        if (v.title && v.title.trim() && !v.title.includes("00000")) {
          newSlug = generateSeoSlug(v.title);
        } else if (v.name && !v.name.startsWith("free-vector-")) {
          newSlug = generateSeoSlug(v.name);
        }

        if (!newSlug || newSlug === v.name) { results.failed++; updated.push(v); continue; }

        try {
          const cat = v.category || "Miscellaneous";
          const oldName = v.name;
          const oldJpg = await r2.get(`assets/${cat}/${oldName}.jpg`);
          const oldZip = await r2.get(`assets/${cat}/${oldName}.zip`);
          if (oldJpg) {
            await r2.put(`assets/${cat}/${newSlug}.jpg`, await oldJpg.arrayBuffer(), { httpMetadata: { contentType: "image/jpeg" } });
            await r2.delete(`assets/${cat}/${oldName}.jpg`);
          }
          if (oldZip) {
            await r2.put(`assets/${cat}/${newSlug}.zip`, await oldZip.arrayBuffer(), { httpMetadata: { contentType: "application/zip" } });
            await r2.delete(`assets/${cat}/${oldName}.zip`);
          }
          v.name = newSlug;
          results.renamed++;
          count++;
        } catch (e) { results.failed++; }
        updated.push(v);
      }

      await kv.put("all_vectors", JSON.stringify(updated));
      return new Response(JSON.stringify({ success: true, results }), { status: 200, headers });
    }

    return new Response(JSON.stringify({ vectors: allVectors }), { status: 200, headers });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500, headers });
  }
}

// ─────────────────────────────────────────────
// POST  /api/admin  (upload vector)
// ─────────────────────────────────────────────
export async function onRequestPost(context) {
  const headers = { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" };
  if (!authenticate(context.request)) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers });

  try {
    const kv = context.env.VECTOR_DB;
    const r2 = context.env.VECTOR_ASSETS;
    const formData = await context.request.formData();

    const jsonFile = formData.get("json");
    const jpegFile = formData.get("jpeg");
    const zipFile  = formData.get("zip");

    // ── 1. File presence check ──
    if (!jsonFile || !jpegFile || !zipFile) {
      return new Response(JSON.stringify({ error: "Missing files: json, jpeg and zip are all required." }), { status: 400, headers });
    }

    // ── 2. JSON metadata validation ──
    let metadata;
    try {
      metadata = JSON.parse(await jsonFile.text());
    } catch (e) {
      return new Response(JSON.stringify({ error: "Invalid JSON file: " + e.message }), { status: 400, headers });
    }

    // Case-insensitive field getter
    const getField = (obj, field) => {
      const key = Object.keys(obj).find(k => k.toLowerCase() === field.toLowerCase());
      return key ? obj[key] : null;
    };

    const title    = getField(metadata, "title");
    const keywords = getField(metadata, "keywords");
    let   category = getField(metadata, "category");

    // Required field: title
    if (!title || String(title).trim() === "") {
      return new Response(JSON.stringify({ error: "Metadata validation failed: 'title' is required." }), { status: 400, headers });
    }

    // Required field: keywords
    if (!keywords || (Array.isArray(keywords) && keywords.length === 0)) {
      return new Response(JSON.stringify({ error: "Metadata validation failed: 'keywords' is required." }), { status: 400, headers });
    }

    // ── 3. Auto category resolution ──
    // Priority: JSON category → filename prefix → fallback Miscellaneous
    let resolvedCategory = null;
    let categorySource = "";

    if (category) {
      resolvedCategory = normalizeCategory(String(category));
      categorySource = resolvedCategory ? "json (normalized)" : "";
    }

    if (!resolvedCategory) {
      // Try from filename
      const filenameGuess = categoryFromFilename(jsonFile.name);
      if (filenameGuess) {
        resolvedCategory = filenameGuess;
        categorySource = "filename prefix";
      }
    }

    if (!resolvedCategory) {
      resolvedCategory = "Miscellaneous";
      categorySource = "default fallback";
    }

    // Update metadata with resolved category
    metadata.category = resolvedCategory;

    // ── 4. JPEG validation ──
    const jpegBuffer = await jpegFile.arrayBuffer();
    const jpegBytes  = new Uint8Array(jpegBuffer);
    // JPEG magic bytes: FF D8 FF
    if (jpegBytes[0] !== 0xFF || jpegBytes[1] !== 0xD8 || jpegBytes[2] !== 0xFF) {
      return new Response(JSON.stringify({ error: "Invalid JPEG file: file does not start with JPEG magic bytes." }), { status: 400, headers });
    }
    if (jpegBuffer.byteLength < 1024) {
      return new Response(JSON.stringify({ error: "JPEG file is too small (< 1 KB). Possibly corrupt." }), { status: 400, headers });
    }

    // ── 5. ZIP validation ──
    const zipBuffer = await zipFile.arrayBuffer();
    const zipBytes  = new Uint8Array(zipBuffer);
    // ZIP magic bytes: 50 4B 03 04
    if (zipBytes[0] !== 0x50 || zipBytes[1] !== 0x4B) {
      return new Response(JSON.stringify({ error: "Invalid ZIP file: file does not start with ZIP magic bytes." }), { status: 400, headers });
    }

    // ── 6. Slug generation ──
    let slug = generateSeoSlug(String(title));
    if (!slug || slug === "free-vector-") {
      const filename = jsonFile.name.replace(/\.json$/, "");
      slug = generateSeoSlug(filename) || filename;
    }
    if (!slug) {
      return new Response(JSON.stringify({ error: "Could not generate a valid slug from title." }), { status: 400, headers });
    }

    // ── 7. Duplicate check (slug + title similarity) ──
    const allVectorsRaw = await kv.get("all_vectors");
    const allVectors = allVectorsRaw ? JSON.parse(allVectorsRaw) : [];

    const existingBySlug = allVectors.find(v => v.name === slug);
    if (existingBySlug) {
      return new Response(JSON.stringify({ error: "DUPLICATE", message: "This file has already been uploaded. Duplicate upload is not allowed." }), { status: 409, headers });
    }

    // Title similarity duplicate check (Levenshtein ≤ 3 on normalized titles)
    const normalizedNewTitle = String(title).toLowerCase().replace(/\s+/g, " ").trim();
    const titleDuplicate = allVectors.find(v => {
      const existing = (v.title || "").toLowerCase().replace(/\s+/g, " ").trim();
      return levenshtein(normalizedNewTitle, existing) <= 3 && normalizedNewTitle.length > 5;
    });
    if (titleDuplicate) {
      return new Response(JSON.stringify({
        error: "DUPLICATE",
        message: `This file has already been uploaded. Duplicate upload is not allowed. Similar title found: "${titleDuplicate.title}"`
      }), { status: 409, headers });
    }

    // ── 8. Upload to R2 ──
    await r2.put(`assets/${resolvedCategory}/${slug}.jpg`, jpegBuffer, { httpMetadata: { contentType: "image/jpeg" } });
    await r2.put(`assets/${resolvedCategory}/${slug}.zip`, zipBuffer, { httpMetadata: { contentType: "application/zip" } });

    // ── 9. Save to KV ──
    const vectorRecord = {
      name: slug,
      category: resolvedCategory,
      title: String(title).trim(),
      description: getField(metadata, "description") || "",
      keywords: Array.isArray(keywords) ? keywords : String(keywords).split(",").map(k => k.trim()).filter(Boolean),
      date: new Date().toISOString().split("T")[0],
      downloads: 0,
      fileSize: `${(zipBuffer.byteLength / (1024 * 1024)).toFixed(1)} MB`
    };

    allVectors.unshift(vectorRecord);
    await kv.put("all_vectors", JSON.stringify(allVectors));

    // ── 10. Post-upload verification ──
    const postTests = { slug_in_kv: false, jpg_in_r2: false, zip_in_r2: false };
    try {
      const freshRaw = await kv.get("all_vectors");
      const freshVectors = freshRaw ? JSON.parse(freshRaw) : [];
      postTests.slug_in_kv = freshVectors.some(v => v.name === slug);
      const [jpgCheck, zipCheck] = await Promise.all([
        r2.head(`assets/${resolvedCategory}/${slug}.jpg`),
        r2.head(`assets/${resolvedCategory}/${slug}.zip`)
      ]);
      postTests.jpg_in_r2 = !!jpgCheck;
      postTests.zip_in_r2 = !!zipCheck;
    } catch (_) {}

    const allTestsPassed = postTests.slug_in_kv && postTests.jpg_in_r2 && postTests.zip_in_r2;
    if (!allTestsPassed) {
      // Rollback
      try {
        await r2.delete(`assets/${resolvedCategory}/${slug}.jpg`);
        await r2.delete(`assets/${resolvedCategory}/${slug}.zip`);
        const rollbackVectors = allVectors.filter(v => v.name !== slug);
        await kv.put("all_vectors", JSON.stringify(rollbackVectors));
      } catch (_) {}
      return new Response(JSON.stringify({
        error: "Post-upload verification failed. Upload rolled back.",
        tests: postTests
      }), { status: 500, headers });
    }

    return new Response(JSON.stringify({
      success: true,
      message: `Uploaded: ${slug}`,
      slug,
      category: resolvedCategory,
      categorySource,
      tests: postTests
    }), { status: 200, headers });

  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500, headers });
  }
}

// ─────────────────────────────────────────────
// DELETE  /api/admin?slug=xxx
// ─────────────────────────────────────────────
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
      return new Response(JSON.stringify({ error: "Not found in database" }), { status: 404, headers });
    }

    const vector = allVectors[vectorIndex];

    // Delete from R2
    try {
      await r2.delete(`assets/${vector.category}/${slug}.jpg`);
      await r2.delete(`assets/${vector.category}/${slug}.zip`);
    } catch (r2Error) {
      console.error("R2 Delete Error:", r2Error);
    }

    // Remove from KV
    allVectors.splice(vectorIndex, 1);
    await kv.put("all_vectors", JSON.stringify(allVectors));

    return new Response(JSON.stringify({ success: true, message: "Deleted and synchronized" }), { status: 200, headers });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500, headers });
  }
}

// ─────────────────────────────────────────────
// OPTIONS  (CORS preflight)
// ─────────────────────────────────────────────
export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, X-Admin-Key, Authorization"
    }
  });
}
