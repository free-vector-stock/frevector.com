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
    } else {
        // We still need allVectors for "Our Picks" section
        // but we'll try to load it only if absolutely necessary or use a smaller version
        // For now, let's keep it but be mindful of CPU
    }
  } catch (e) {
    vector = null;
  }

  // If slug not found return 404
  if (!vector) {
    return new Response("404 — Vector not found", { status: 404 });
  }

  // --- Build SSR-enriched HTML ---
  const title    = vector.title       || slug;
  const desc     = vector.description || `Download ${title} free vector illustration from frevector.com`;
  const keywords = Array.isArray(vector.keywords) ? vector.keywords.slice(0, 20).join(", ") : (vector.keywords || "");
  const category = vector.category    || "";
  const fileSize = vector.fileSize    || "N/A";
  const thumbKey = `${category}/${slug}/${slug}.jpg`;
  const thumbUrl = `https://assets.frevector.com/${thumbKey}`;
  const canonical = `https://frevector.com/details/${slug}`;
  const pageTitle = `${title} — Free Vector Download | frevector.com`;

  // Build smart-truncated meta description
  function smartTruncate(text, maxLen) {
    if (text.length <= maxLen) return text;
    const boundary = text.lastIndexOf('.', maxLen);
    if (boundary > maxLen * 0.7) return text.slice(0, boundary + 1);
    return text.slice(0, maxLen).trim() + "...";
  }
  const metaDesc = smartTruncate(desc, 160);

  // Read HTML shell as text
  let html = await rootResponse.text();

  // Efficient Replacements
  html = html.replace(/<title>[^<]*<\/title>/, `<title>${escapeHtml(pageTitle)}</title>`);
  
  // Meta tags insertion
  const metaTags = `
<meta name="description" content="${escapeHtml(metaDesc)}">
<meta name="keywords" content="${escapeHtml(keywords)}">
<link rel="canonical" href="${canonical}">
<link rel="alternate" hreflang="en" href="${canonical}?lang=en">
<link rel="alternate" hreflang="x-default" href="${canonical}">
<meta property="og:title" content="${escapeHtml(pageTitle)}">
<meta property="og:description" content="${escapeHtml(desc)}">
<meta property="og:image" content="${escapeHtml(thumbUrl)}">
<meta property="og:url" content="${escapeHtml(canonical)}">
<meta property="og:type" content="website">`;

  // Remove existing meta/canonical to avoid duplicates
  html = html.replace(/<meta\s+name=["']description["'][^>]*>/gi, "");
  html = html.replace(/<meta\s+name=["']keywords["'][^>]*>/gi, "");
  html = html.replace(/<link\s+rel=["']canonical["'][^>]*>/gi, "");
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
      `$1\n    <div id="our-picks-ssr-data" data-picks='[${picksData}]' style="position:absolute;width:0;height:0;overflow:hidden;"></div>\n    <div class="our-picks-static-list" style="display:flex; flex-wrap:wrap; gap:8px; padding:12px 0;">${picksHTML}</div>`
    );

    html = html.replace(/\(free vectors available\)/, `(${allVectors.length.toLocaleString()} free vectors available)`);
  }

  // Pre-fill placeholders
  html = html.replace(/<td id="dpCategory" class="dt-value">-/g, `<td id="dpCategory" class="dt-value" data-ssr-category="${escapeHtml(category)}">${escapeHtml(category)}`);
  html = html.replace(/<td id="dpFileSize" class="dt-value">-/g, `<td id="dpFileSize" class="dt-value" data-ssr-filesize="${escapeHtml(fileSize)}">${escapeHtml(fileSize)}`);

  // Schema.org JSON-LD (Compact)
  const schemas = `
<script type="application/ld+json">{"@context":"https://schema.org","@type":"BreadcrumbList","itemListElement":[{"@type":"ListItem","position":1,"name":"Home","item":"https://frevector.com/"},{"@type":"ListItem","position":2,"name":"${escapeHtml(category)}","item":"https://frevector.com/?category=${encodeURIComponent(category)}"},{"@type":"ListItem","position":3,"name":"${escapeHtml(title)}","item":"${canonical}"}]}</script>
<script type="application/ld+json">{"@context":"https://schema.org","@type":"Product","name":"${escapeHtml(title)}","description":"${escapeHtml(desc)}","image":"${escapeHtml(thumbUrl)}","category":"${escapeHtml(category)}","offers":{"@type":"Offer","price":"0","priceCurrency":"USD","availability":"https://schema.org/InStock"}}</script>`;

  html = html.replace("<body", `${schemas}\n<body`);

  const headers = new Headers(rootResponse.headers);
  headers.set("Content-Type", "text/html; charset=utf-8");
  headers.set("x-frevector-ssr", "1");

  return new Response(html, { status: 200, headers });
}

function escapeHtml(str) {
  return String(str).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}
