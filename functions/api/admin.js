/**
 * Admin API - Protected endpoints for managing vectors
 * Enhanced: Auto category detection, fuzzy match, upload validation, duplicate check, post-upload tests
 * Updated: Triple existence check (KV + R2 JPG + R2 ZIP), correct upload flow order,
 *          JSON error tolerance, title validation, hash-based duplicate detection
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
    const d1 = levenshtein(s.toLowerCase(), cat.toLowerCase());
    if (d1 < bestDist) { bestDist = d1; best = cat; }
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
 */
function categoryFromFilename(filename) {
  if (!filename) return null;
  const base = filename.replace(/\.[^/.]+$/, "");
  const prefix = base.split(/[-_\s]/)[0];
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

/**
 * Validate title: must have at least 3 words, not be only numbers, not contain 5+ digit codes
 */
function validateTitle(title) {
  if (!title || String(title).trim() === "") {
    return { valid: false, reason: "Title is required." };
  }
  const t = String(title).trim();
  // Must not be only numbers
  if (/^\d+$/.test(t)) {
    return { valid: false, reason: "Title cannot consist only of numbers." };
  }
  // Must not contain 5+ digit numeric codes (file IDs)
  if (/\d{5,}/.test(t)) {
    return { valid: false, reason: "Title contains numeric file ID codes. Please use a descriptive title." };
  }
  // Must have at least 3 words
  const wordCount = t.split(/\s+/).filter(w => w.length > 0).length;
  if (wordCount < 3) {
    return { valid: false, reason: `Title must contain at least 3 words. Current: "${t}" (${wordCount} word${wordCount !== 1 ? 's' : ''}).` };
  }
  return { valid: true };
}

/**
 * Simple hash of a buffer for duplicate detection (FNV-1a 32-bit)
 */
function simpleHash(buffer) {
  const bytes = new Uint8Array(buffer);
  let hash = 2166136261;
  for (let i = 0; i < Math.min(bytes.length, 65536); i++) {
    hash ^= bytes[i];
    hash = (hash * 16777619) >>> 0;
  }
  return hash.toString(16).padStart(8, '0');
}

/**
 * Triple existence check: KV record + R2 JPG + R2 ZIP
 * A file is truly "existing" only if ALL THREE are present.
 * If any is missing, it should be re-uploaded.
 */
async function checkTripleExistence(kv, r2, slug, category, allVectors) {
  const kvExists = allVectors.some(v => v.name === slug);
  if (!kvExists) return { exists: false, reason: "not_in_kv" };

  // Check R2 assets
  try {
    const [jpgCheck, zipCheck] = await Promise.all([
      r2.head(`assets/${category}/${slug}.jpg`),
      r2.head(`assets/${category}/${slug}.zip`)
    ]);
    if (!jpgCheck) return { exists: false, reason: "missing_jpg_in_r2" };
    if (!zipCheck) return { exists: false, reason: "missing_zip_in_r2" };
    return { exists: true };
  } catch (e) {
    return { exists: false, reason: "r2_check_failed" };
  }
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

      const url2 = new URL(context.request.url);
      const sampleSize = Math.min(200, Math.max(1, parseInt(url2.searchParams.get("sample") || "50")));

      // Phase 1: KV-only checks (fast, all vectors)
      for (const v of allVectors) {
        // Duplicate slug
        if (slugsSeen.has(v.name)) {
          issues.push({ slug: v.name, type: "duplicate_slug", fix: "Delete duplicate entry" });
        }
        slugsSeen.add(v.name);

        // Invalid title (numeric-only, empty, or contains 5+ digit codes)
        const titleCheck = validateTitle(v.title);
        if (!titleCheck.valid) {
          issues.push({ slug: v.name, type: "invalid_title", reason: titleCheck.reason, fix: "Update title in metadata" });
        }

        // Bad category
        if (!VALID_CATEGORIES.includes(v.category)) {
          issues.push({ slug: v.name, type: "bad_category", current: v.category, fix: "Re-upload with correct category" });
        }
      }

      // Phase 2: R2 file existence check (sampled to avoid Worker CPU timeout)
      if (r2) {
        const sample = allVectors.slice(0, sampleSize);
        const r2Checks = await Promise.all(
          sample.map(async (v) => {
            const jpgKey = `assets/${v.category}/${v.name}.jpg`;
            const zipKey = `assets/${v.category}/${v.name}.zip`;
            const [jpg, zip] = await Promise.all([r2.head(jpgKey), r2.head(zipKey)]);
            return { v, jpg: !!jpg, zip: !!zip };
          })
        );
        for (const { v, jpg, zip } of r2Checks) {
          if (!jpg) issues.push({ slug: v.name, type: "missing_jpg", fix: "Re-upload JPEG" });
          if (!zip) issues.push({ slug: v.name, type: "missing_zip", fix: "Re-upload ZIP" });
        }
      }

      return new Response(JSON.stringify({
        totalVectors: allVectors.length,
        issueCount: issues.length,
        issues,
        r2SampleSize: sampleSize,
        note: `R2 file checks performed on the ${sampleSize} most recent vectors. Use ?sample=200 for a larger sample.`
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
      return new Response(JSON.stringify({
        error: "Missing required files. Please upload: JSON metadata, JPEG preview, and ZIP archive."
      }), { status: 400, headers });
    }

    // ── 2. JPEG validation (FIRST - before JSON parse for performance) ──
    const jpegBuffer = await jpegFile.arrayBuffer();
    const jpegBytes  = new Uint8Array(jpegBuffer);
    // JPEG magic bytes: FF D8 FF
    if (jpegBytes[0] !== 0xFF || jpegBytes[1] !== 0xD8 || jpegBytes[2] !== 0xFF) {
      return new Response(JSON.stringify({ error: "Invalid JPEG file: file does not start with JPEG magic bytes." }), { status: 400, headers });
    }
    if (jpegBuffer.byteLength < 1024) {
      return new Response(JSON.stringify({ error: "JPEG file is too small (< 1 KB). Possibly corrupt." }), { status: 400, headers });
    }

    // ── 3. ZIP validation (BEFORE JSON parse) ──
    const zipBuffer = await zipFile.arrayBuffer();
    const zipBytes  = new Uint8Array(zipBuffer);
    // ZIP magic bytes: 50 4B 03 04
    if (zipBytes[0] !== 0x50 || zipBytes[1] !== 0x4B) {
      return new Response(JSON.stringify({ error: "Invalid ZIP file: file does not start with ZIP magic bytes." }), { status: 400, headers });
    }

    // ── 4. JSON metadata validation (after file checks) ──
    let metadata;
    try {
      metadata = JSON.parse(await jsonFile.text());
    } catch (e) {
      // JSON error must NOT stop the system - log and reject this file only
      return new Response(JSON.stringify({
        error: "Invalid JSON file: " + e.message,
        skipped: true,
        reason: "json_parse_error"
      }), { status: 400, headers });
    }

    // Case-insensitive field getter
    const getField = (obj, field) => {
      const key = Object.keys(obj).find(k => k.toLowerCase() === field.toLowerCase());
      return key ? obj[key] : null;
    };

    const title    = getField(metadata, "title");
    const keywords = getField(metadata, "keywords");
    let   category = getField(metadata, "category");

    // ── 5. Title validation ──
    const titleCheck = validateTitle(title);
    if (!titleCheck.valid) {
      return new Response(JSON.stringify({
        error: "Metadata validation failed: " + titleCheck.reason,
        skipped: true,
        reason: "invalid_title"
      }), { status: 400, headers });
    }

    // Required field: keywords
    if (!keywords || (Array.isArray(keywords) && keywords.length === 0)) {
      return new Response(JSON.stringify({
        error: "Metadata validation failed: 'keywords' is required.",
        skipped: true,
        reason: "missing_keywords"
      }), { status: 400, headers });
    }

    // ── 6. Auto category resolution ──
    let resolvedCategory = null;
    let categorySource = "";

    if (category) {
      resolvedCategory = normalizeCategory(String(category));
      categorySource = resolvedCategory ? "json (normalized)" : "";
    }

    if (!resolvedCategory) {
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

    metadata.category = resolvedCategory;

    // ── 7. Slug generation ──
    let slug = generateSeoSlug(String(title));
    if (!slug || slug === "free-vector-") {
      const filename = jsonFile.name.replace(/\.json$/, "");
      slug = generateSeoSlug(filename) || filename;
    }
    if (!slug) {
      return new Response(JSON.stringify({ error: "Could not generate a valid slug from title." }), { status: 400, headers });
    }

    // ── 8. Load existing vectors ──
    const allVectorsRaw = await kv.get("all_vectors");
    const allVectors = allVectorsRaw ? JSON.parse(allVectorsRaw) : [];

    // ── 9. Triple existence check (KV + R2 JPG + R2 ZIP) ──
    // A file is only "existing" if ALL THREE are present
    const existenceCheck = await checkTripleExistence(kv, r2, slug, resolvedCategory, allVectors);
    if (existenceCheck.exists) {
      return new Response(JSON.stringify({
        error: "DUPLICATE",
        message: "This file has already been uploaded. Duplicate upload is not allowed."
      }), { status: 409, headers });
    }
    // If partial existence (KV but missing R2), we allow re-upload to fix broken state

    // ── 10. Hash-based duplicate detection ──
    const jpegHash = simpleHash(jpegBuffer);
    const hashDuplicate = allVectors.find(v => v.imageHash === jpegHash);
    if (hashDuplicate) {
      return new Response(JSON.stringify({
        error: "DUPLICATE",
        message: `This file has already been uploaded. Duplicate upload is not allowed. Same image found as: "${hashDuplicate.title || hashDuplicate.name}"`
      }), { status: 409, headers });
    }

    // ── 11. Title similarity duplicate check ──
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

    // ── 12. Upload to R2 ──
    await r2.put(`assets/${resolvedCategory}/${slug}.jpg`, jpegBuffer, { httpMetadata: { contentType: "image/jpeg" } });
    await r2.put(`assets/${resolvedCategory}/${slug}.zip`, zipBuffer, { httpMetadata: { contentType: "application/zip" } });

    // ── 13. Save to KV ──
    const vectorRecord = {
      name: slug,
      category: resolvedCategory,
      title: String(title).trim(),
      description: getField(metadata, "description") || "",
      keywords: Array.isArray(keywords) ? keywords : String(keywords).split(",").map(k => k.trim()).filter(Boolean),
      date: new Date().toISOString().split("T")[0],
      downloads: 0,
      fileSize: `${(zipBuffer.byteLength / (1024 * 1024)).toFixed(1)} MB`,
      imageHash: jpegHash
    };

    // Remove any partial/broken record with same slug before inserting
    const cleanedVectors = allVectors.filter(v => v.name !== slug);
    cleanedVectors.unshift(vectorRecord);
    await kv.put("all_vectors", JSON.stringify(cleanedVectors));

    // ── 14. Post-upload verification ──
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
        const rollbackVectors = cleanedVectors.filter(v => v.name !== slug);
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
// PATCH  /api/admin?action=cleanup (remove orphans)
// ─────────────────────────────────────────────
export async function onRequestPatch(context) {
  const headers = { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" };
  if (!authenticate(context.request)) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers });

  try {
    const kv = context.env.VECTOR_DB;
    const r2 = context.env.VECTOR_ASSETS;
    const url = new URL(context.request.url);
    const action = url.searchParams.get("action");

    // ── CLEANUP: Remove orphaned records ──
    if (action === "cleanup") {
      const allVectorsRaw = await kv.get("all_vectors");
      const allVectors = allVectorsRaw ? JSON.parse(allVectorsRaw) : [];
      
      const results = { total: allVectors.length, removed: 0, fixed: 0, errors: [] };
      const cleaned = [];

      for (const v of allVectors) {
        try {
          // Check if R2 files exist
          const [jpgCheck, zipCheck] = await Promise.all([
            r2.head(`assets/${v.category}/${v.name}.jpg`),
            r2.head(`assets/${v.category}/${v.name}.zip`)
          ]);

          if (!jpgCheck || !zipCheck) {
            // Missing files - remove from KV
            results.removed++;
            continue;
          }

          // Validate category
          if (!VALID_CATEGORIES.includes(v.category)) {
            v.category = normalizeCategory(v.category) || "Miscellaneous";
            results.fixed++;
          }

          // Validate title
          const titleCheck = validateTitle(v.title);
          if (!titleCheck.valid) {
            results.removed++;
            continue;
          }

          cleaned.push(v);
        } catch (e) {
          results.errors.push({ slug: v.name, error: e.message });
        }
      }

      await kv.put("all_vectors", JSON.stringify(cleaned));
      return new Response(JSON.stringify({ success: true, results }), { status: 200, headers });
    }

    return new Response(JSON.stringify({ error: "Unknown action" }), { status: 400, headers });
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
      "Access-Control-Allow-Methods": "GET, POST, DELETE, PATCH, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, X-Admin-Key, Authorization"
    }
  });
}
