export async function onRequest(context) {
  const url = new URL(context.request.url);

  if (!url.pathname.startsWith("/details/")) {
    return context.next();
  }

  // Extract slug from URL: /details/{slug}
  const slug = url.pathname.replace(/^\/details\//, "").replace(/\/$/, "").trim();

  // Fetch the root index.html shell
  const rootRequest = new Request(new URL("/", url.origin).toString(), {
    method: "GET",
    headers: context.request.headers
  });
  const rootResponse = await context.env.ASSETS.fetch(rootRequest);

  // If no slug or fetch failed, fall back to original behaviour
  if (!slug || rootResponse.status !== 200) {
    const headers = new Headers(rootResponse.headers);
    headers.set("x-frevector-spa-fallback", "details-route");
    return new Response(rootResponse.body, {
      status: 200,
      statusText: "OK",
      headers
    });
  }

  // --- Load vector data (R2 first, KV fallback) ---
  let vector = null;
  let allVectors = null;
  try {
    let allVectorsRaw = null;

    // OPTIMIZATION: Check KV for individual vector first to avoid loading 10MB JSON
    const kv = context.env.VECTOR_DB;
    if (kv) {
      const individualVectorRaw = await kv.get(`v_${slug}`);
      if (individualVectorRaw) {
        vector = JSON.parse(individualVectorRaw);
      }
    }

    // If not found in individual KV, fallback to the big JSON (original logic)
    if (!vector) {
      const r2 = context.env.VECTOR_ASSETS;
      if (r2) {
        const r2Object = await r2.get("all_vectors.json");
        if (r2Object) {
          allVectorsRaw = await r2Object.text();
        }
      }

      if (!allVectorsRaw && kv) {
        allVectorsRaw = await kv.get("all_vectors");
      }

      if (allVectorsRaw) {
        allVectors = JSON.parse(allVectorsRaw);
        vector = allVectors.find(v => v.name === slug) || null;
      }
    }
  } catch (e) {
    vector = null;
  }

  // If slug not found return 404
  if (!vector) {
    return new Response("404 | Vector not found", { status: 404 });
  }

  // --- Build SSR-enriched HTML ---
  const title    = vector.title       || slug.replace(/-\d+$/, "").replace(/-/g, " ").replace(/\b\w/g, l => l.toUpperCase());
  const desc     = vector.description || `Download ${title} free vector illustration from frevector.com`;
  const keywords = Array.isArray(vector.keywords) ? vector.keywords.slice(0, 20).join(", ") : (vector.keywords || "");
  const category = vector.category    || "";
  const fileSize = vector.fileSize    || "N/A";
  const thumbKey = `${category}/${slug}/${slug}.jpg`;
  const thumbUrl = `https://assets.frevector.com/${thumbKey}`;
  const canonical = `https://frevector.com/details/${slug}`;
  // Smart title building: avoid "Free Vector" duplication
  // If title already contains "Free Vector", use "Download" suffix instead
  let pageTitle;
  if (title.includes("Free Vector") || title.includes("free vector")) {
    // Title already has "Free Vector", so use minimal suffix
    pageTitle = `${title} — Download frevector.com`;
  } else {
    // Title doesn't have "Free Vector", so add full suffix
    pageTitle = `${title} — Free Vector Download frevector.com`;
  }
  const finalPageTitle = pageTitle;

  // Build smart-truncated meta description (word-boundary safe)
  function smartTruncate(text, maxLen) {
    if (!text || text.length <= maxLen) return text;
    
    // Attempt to cut at the last space within maxLen - 3 (to account for "...")
    const cutAt = maxLen - 3;
    const lastSpace = text.lastIndexOf(' ', cutAt);
    
    if (lastSpace > cutAt * 0.7) {
      return text.slice(0, lastSpace).trim() + "...";
    }
    
    // Fallback: cut at exactly cutAt
    return text.slice(0, cutAt).trim() + "...";
  }
  const metaDesc = smartTruncate(desc, 160);

  // Read HTML shell as text
  let html = await rootResponse.text();

  // Efficient Replacements
  html = html.replace(/<title>[^<]*<\/title>/, `<title>${escapeHtml(finalPageTitle)}</title>`);
  
  // Meta tags insertion (GÖREV 2: Removed hreflang tags)
  const metaTags = `
<meta name="description" content="${escapeHtml(metaDesc)}">
<meta name="keywords" content="${escapeHtml(keywords)}">
<link rel="canonical" href="${canonical}">
<meta property="og:title" content="${escapeHtml(pageTitle)}">
<meta property="og:description" content="${escapeHtml(desc)}">
<meta property="og:image" content="${escapeHtml(thumbUrl)}">
<meta property="og:url" content="${escapeHtml(canonical)}">
<meta property="og:type" content="website">
`;

  // Remove existing meta/canonical to avoid duplicates
  html = html.replace(/<meta\s+name=["']description["'][^>]*>/gi, "");
  html = html.replace(/<meta\s+name=["']keywords["'][^>]*>/gi, "");
  html = html.replace(/<link\s+rel=["']canonical["'][^>]*>/gi, "");
  html = html.replace(/<link\s+rel=["']alternate["'][^>]*hreflang[^>]*>/gi, "");
  html = html.replace("</head>", `${metaTags}\n</head>`);

  // GÖREV 2 SSR FIX: Replace static H1
  html = html.replace(
    /<h1 id="categoryTitle"[^>]*>[^<]*<\/h1>/,
    `<h1 id="categoryTitle" class="category-title">${escapeHtml(title)}</h1>`
  );

  // GÖREV 1 SSR FIX: Inject category and fileSize
  html = html.replace(
    /<div id="totalVectorCount"[^>]*>/,
    `<div id="totalVectorCount" data-ssr-category="${escapeHtml(category)}" data-ssr-filesize="${escapeHtml(fileSize)}" data-ssr-total="${allVectors ? allVectors.length : 0}">`
  );

  // GÖREV 1: Inject product-unique-content and hide home-seo-content
  const productUniqueContent = `
 <section class="product-unique-content" style="padding:24px 0 32px;max-width:100%;margin:24px 0 0;font-family:Arial,sans-serif;color:#2c3e50;border-top:1px solid #eee">
 <h2 style="font-size:20px;font-weight:700;margin-bottom:12px;color:#1a5276">${escapeHtml(title)} - Vector Details</h2>
 <p style="font-size:14px;line-height:1.7;margin-bottom:20px">${escapeHtml(desc)}</p>
 <div style="background:#f9f9f9; padding:20px; border-radius:8px; border:1px solid #eee;">
 <table style="width:100%; border-collapse:collapse; font-size:13px;">
 <tr style="border-bottom:1px solid #eee;"><td style="padding:10px 0; font-weight:bold; color:#555; width:150px;">FILE FORMAT</td><td style="color:#2c3e50;">SVG & JPEG</td></tr>
 <tr style="border-bottom:1px solid #eee;"><td style="padding:10px 0; font-weight:bold; color:#555;">CATEGORY</td><td style="color:#2c3e50;">${escapeHtml(category)}</td></tr>
 <tr style="border-bottom:1px solid #eee;"><td style="padding:10px 0; font-weight:bold; color:#555;">RESOLUTION</td><td style="color:#2c3e50;">High Quality / Fully Scalable</td></tr>
 <tr style="border-bottom:1px solid #eee;"><td style="padding:10px 0; font-weight:bold; color:#555;">LICENSE</td><td style="color:#2c3e50;">Free for Personal & Commercial Use</td></tr>
 <tr style="border-bottom:1px solid #eee;"><td style="padding:10px 0; font-weight:bold; color:#555;">FILE SIZE</td><td style="color:#2c3e50;">${escapeHtml(fileSize)}</td></tr>
 </table>
 </div>
 </section>`;

  // Inject unique content (home-seo-content removed from /details/ pages)
  html = html.replace(/<section class="home-seo-content"[^>]*>[\s\S]*?<\/section>/, productUniqueContent);

  // "Our Picks" Section Optimization
  if (allVectors && allVectors.length > 0) {
    // CPU Efficient Filtering: only take first 50 of same category then pick 6
    const sameCategory = [];
    for (let i = 0; i < allVectors.length && sameCategory.length < 50; i++) {
      const v = allVectors[i];
      if (v.category === category && v.name !== slug && !v.isJpegOnly) {
        sameCategory.push(v);
      }
    }
    
    let picks = sameCategory.sort(() => 0.5 - Math.random()).slice(0, 6);

    const picksHTML = picks.map(v => {
      const pickThumbUrl = `https://assets.frevector.com/${v.category}/${v.name}/${v.name}.jpg`;
      return `
 <a href="/details/${v.name}" class="vector-card" style="text-decoration:none;">
 <div class="vc-img-wrap">
 <img class="vc-img" src="${escapeHtml(pickThumbUrl)}" alt="${escapeHtml(v.title || '')}" loading="lazy" width="300" height="300">
 <span class="vc-type-badge vector">VECTOR</span>
 </div>
 <div style="font-size:11px; color:#555; padding:4px 0 0 0; text-align:center; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${escapeHtml(v.title || v.name)}</div>
 </a>`;
    }).join("");

    const picksData = picks.map(v => JSON.stringify({name: v.name, title: v.title, category: v.category, fileSize: v.fileSize, isJpegOnly: v.isJpegOnly})).join(",");
    html = html.replace(
      /(<div class="our-picks-track" id="ourPicksTrack">)/,
      `$1\n <div id="our-picks-ssr-data" data-picks='[${picksData}]' style="position:absolute;width:0;height:0;overflow:hidden;"></div>\n <div class="our-picks-static-list" style="display:flex; flex-wrap:wrap; gap:8px; padding:12px 0;">${picksHTML}</div>`
    );

    if (allVectors) {
      html = html.replace(/\(free vectors available\)/, `(${allVectors.length.toLocaleString()} free vectors available)`);
    }
  }

  // Pre-fill placeholders
  html = html.replace(/<td id="dpCategory" class="dt-value">-/g, `<td id="dpCategory" class="dt-value" data-ssr-category="${escapeHtml(category)}">${escapeHtml(category)}`);
  html = html.replace(/<td id="dpFileSize" class="dt-value">-/g, `<td id="dpFileSize" class="dt-value" data-ssr-filesize="${escapeHtml(fileSize)}">${escapeHtml(fileSize)}`);

  // Schema.org JSON-LD (Compact) | Product/Offer schema kaldırıldı (GÖREV 1)
  const schemas = `
<script type="application/ld+json">{"@context":"https://schema.org","@type":"BreadcrumbList","itemListElement":[{"@type":"ListItem","position":1,"name":"Home","item":"https://frevector.com/"},{"@type":"ListItem","position":2,"name":"${escapeHtml(category)}","item":"https://frevector.com/?category=${encodeURIComponent(category)}"},{"@type":"ListItem","position":3,"name":"${escapeHtml(title)}","item":"${canonical}"}]}</script>`;

  html = html.replace("<body", `${schemas}\n<body`);

  const headers = new Headers(rootResponse.headers);
  headers.set("Content-Type", "text/html; charset=utf-8");
  headers.set("x-frevector-ssr", "1");

  return new Response(html, { status: 200, headers });
}

function escapeHtml(str) {
  return String(str).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}
