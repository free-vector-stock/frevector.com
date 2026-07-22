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

    const r2 = context.env.VECTOR_ASSETS;
    if (r2) {
      const r2Object = await r2.get("all_vectors.json");
      if (r2Object) {
        allVectorsRaw = await r2Object.text();
      }
    }

    if (!allVectorsRaw) {
      const kv = context.env.VECTOR_DB;
      if (kv) {
        allVectorsRaw = await kv.get("all_vectors");
      }
    }

    if (allVectorsRaw) {
      allVectors = JSON.parse(allVectorsRaw);
      vector = allVectors.find(v => v.name === slug) || null;
    }
  } catch (e) {
    // Data load failed — fall back gracefully
    vector = null;
  }

  // If slug not found return 404
  if (!vector) {
    return new Response("404 — Vector not found", { status: 404 });
  }

  // --- Build SSR-enriched HTML ---
  const title    = vector.title       || slug;
  const desc     = vector.description || `Download ${title} free vector illustration from frevector.com`;
  const keywords = Array.isArray(vector.keywords) ? vector.keywords.join(", ") : (vector.keywords || "");
  const category = vector.category    || "";
  const fileSize = vector.fileSize    || "N/A";
  const thumbKey = `${category}/${slug}/${slug}.jpg`;
  const thumbUrl = `https://assets.frevector.com/${thumbKey}`;
  const canonical = `https://frevector.com/details/${slug}`;
  const pageTitle = `${title} — Free Vector Download | frevector.com`;

  // Read HTML shell as text
  let html = await rootResponse.text();

  // Replace <title>
  html = html.replace(/<title>[^<]*<\/title>/, `<title>${escapeHtml(pageTitle)}</title>`);

  // Replace or insert <meta name="description">
  if (/<meta\s+name=["']description["']/i.test(html)) {
    html = html.replace(
      /(<meta\s+name=["']description["']\s+content=["'])(?:[^"']*)(["'])/i,
      `$1${escapeHtml(desc)}$2`
    );
  } else {
    html = html.replace("</head>", `<meta name="description" content="${escapeHtml(desc)}">\n</head>`);
  }

  // Replace or insert <meta name="keywords">
  if (/<meta\s+name=["']keywords["']/i.test(html)) {
    html = html.replace(
      /(<meta\s+name=["']keywords["']\s+content=["'])(?:[^"']*)(["'])/i,
      `$1${escapeHtml(keywords)}$2`
    );
  } else if (keywords) {
    html = html.replace("</head>", `<meta name="keywords" content="${escapeHtml(keywords)}">\n</head>`);
  }

  // Insert canonical if not present
  if (!/<link\s+rel=["']canonical["']/i.test(html)) {
    html = html.replace("</head>", `<link rel="canonical" href="${canonical}">\n</head>`);
  }

  // Open Graph tags
  const ogBlock = `
<meta property="og:title" content="${escapeHtml(pageTitle)}">
<meta property="og:description" content="${escapeHtml(desc)}">
<meta property="og:image" content="${escapeHtml(thumbUrl)}">
<meta property="og:url" content="${escapeHtml(canonical)}">
<meta property="og:type" content="website">`;
  html = html.replace("</head>", `${ogBlock}\n</head>`);

  // GÖREV 1 SSR FIX: Inject category and fileSize into the HTML data attributes
  // so client-side JS can read them even when /api/vectors fails
  html = html.replace(
    /<div id="totalVectorCount"[^>]*>/,
    `<div id="totalVectorCount" data-ssr-category="${escapeHtml(category)}" data-ssr-filesize="${escapeHtml(fileSize)}" data-ssr-total="${allVectors ? allVectors.length : 0}">`
  );

  // GÖREV 1 SSR FIX: Replace the static "Our selections for you" list with dynamic SSR-generated content
  if (allVectors && allVectors.length > 0) {
    // Get 6 random vectors from the same category (exclude current vector)
    const sameCategory = allVectors.filter(v => 
      v.category === category && v.name !== slug
    );
    
    // If not enough in same category, fill from all vectors
    let picks = [];
    if (sameCategory.length >= 6) {
      // Shuffle and pick 6
      picks = sameCategory.sort(() => Math.random() - 0.5).slice(0, 6);
    } else {
      picks = [...sameCategory];
      const others = allVectors.filter(v => v.category !== category && v.name !== slug);
      others.sort(() => Math.random() - 0.5);
      picks = [...picks, ...others].slice(0, 6);
    }

    // Hide JPEG only vectors from picks
    picks = picks.filter(v => !v.isJpegOnly);
    if (picks.length < 6) {
      const allOthers = allVectors.filter(v => !v.isJpegOnly && v.name !== slug);
      const extra = allOthers.sort(() => Math.random() - 0.5);
      picks = [...picks, ...extra].slice(0, 6);
    }

    const picksHTML = picks.map(v => {
      const pickCategory = v.category || "";
      const pickThumbKey = `${pickCategory}/${v.name}/${v.name}.jpg`;
      const pickThumbUrl = `https://assets.frevector.com/${pickThumbKey}`;
      return `
    <div class="vector-card">
      <div class="vc-img-wrap">
        <img class="vc-img" src="${escapeHtml(pickThumbUrl)}" alt="${escapeHtml(v.title || '')}" loading="eager" decoding="async" fetchpriority="high" width="300" height="300">
        <span class="vc-type-badge vector">VECTOR</span>
      </div>
    </div>`;
    }).join("\n");

    // Replace the static hidden list with SSR-generated dynamic content
    html = html.replace(
      /<ul style="display:none;">[\s\S]*?<\/ul>/,
      `${picksHTML}\n    <!-- SSR-generated our-picks -->`
    );

    // Also inject a data attribute with the picks info for JS to use
    const picksData = picks.map(v => JSON.stringify({name: v.name, title: v.title, category: v.category, fileSize: v.fileSize, isJpegOnly: v.isJpegOnly})).join(",");
    html = html.replace(
      /(<div class="our-picks-track" id="ourPicksTrack">)/,
      `$1\n    <div id="our-picks-ssr-data" style="display:none;" data-picks='[${picksData}]'></div>`
    );
  }

  // GÖREV 1 SSR FIX: Replace the total vector count text with SSR-rendered value
  if (allVectors && allVectors.length > 0) {
    html = html.replace(
      /\(free vectors available\)/,
      `(${allVectors.length.toLocaleString()} free vectors available)`
    );
  }

  // GÖREV 1 SSR FIX: Inject category and file size into the detail page placeholders
  // The detail page has dpCategory and dpFileSize placeholders with "-" value
  // We add data attributes so JS can pre-fill them
  html = html.replace(
    /<td id="dpCategory" class="dt-value">-/g,
    `<td id="dpCategory" class="dt-value" data-ssr-category="${escapeHtml(category)}">${escapeHtml(category)}`
  );
  html = html.replace(
    /<td id="dpFileSize" class="dt-value">-/g,
    `<td id="dpFileSize" class="dt-value" data-ssr-filesize="${escapeHtml(fileSize)}">${escapeHtml(fileSize)}`
  );

  // GÖREV 10: Breadcrumb JSON-LD
  const breadcrumbSchema = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {"@type": "ListItem", "position": 1, "name": "Home", "item": "https://frevector.com/"},
      {"@type": "ListItem", "position": 2, "name": escapeHtml(category), "item": `https://frevector.com/?category=${encodeURIComponent(category)}`},
      {"@type": "ListItem", "position": 3, "name": escapeHtml(title), "item": canonical}
    ]
  });

  // GÖREV 9: Product schema.org JSON-LD
  const productSchema = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "Product",
    "name": escapeHtml(title),
    "description": escapeHtml(desc),
    "image": escapeHtml(thumbUrl),
    "category": escapeHtml(category),
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD",
      "availability": "https://schema.org/InStock"
    }
  });

  // Inject JSON-LD schemas into <body>
  const jsonLdBlock = `
<script type="application/ld+json">${breadcrumbSchema}</script>
<script type="application/ld+json">${productSchema}</script>`;

  html = html.replace("<body", `${jsonLdBlock}\n<body`);

  const headers = new Headers(rootResponse.headers);
  headers.set("Content-Type", "text/html; charset=utf-8");
  headers.set("x-frevector-ssr", "1");

  return new Response(html, {
    status: 200,
    statusText: "OK",
    headers
  });
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
