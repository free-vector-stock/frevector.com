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
      const allVectors = JSON.parse(allVectorsRaw);
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
      /(<meta\s+name=["']description["']\s+content=["'])[^"']*["']/i,
      `$1${escapeHtml(desc)}`
    );
  } else {
    html = html.replace("</head>", `<meta name="description" content="${escapeHtml(desc)}">\n</head>`);
  }

  // Replace or insert <meta name="keywords">
  if (/<meta\s+name=["']keywords["']/i.test(html)) {
    html = html.replace(
      /(<meta\s+name=["']keywords["']\s+content=["'])[^"']*["']/i,
      `$1${escapeHtml(keywords)}`
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
<meta property="og:image" content="${thumbUrl}">
<meta property="og:url" content="${canonical}">
<meta property="og:type" content="website">`;
  html = html.replace("</head>", `${ogBlock}\n</head>`);

  // Insert SEO skeleton into <body> — visible to crawlers, hidden visually
  const keywordChips = Array.isArray(vector.keywords)
    ? vector.keywords.map(k => `<span style="display:inline-block;margin:2px 4px;padding:2px 8px;border:1px solid #ccc;border-radius:12px;font-size:12px;">${escapeHtml(k)}</span>`).join("")
    : "";

  const seoBlock = `
<div id="frevector-seo-skeleton" style="position:absolute;left:-9999px;top:-9999px;width:1px;height:1px;overflow:hidden;" aria-hidden="true">
  <h1>${escapeHtml(title)}</h1>
  <p>${escapeHtml(desc)}</p>
  ${keywordChips ? `<div>${keywordChips}</div>` : ""}
  <img src="${thumbUrl}" alt="${escapeHtml(title)}" width="1" height="1">
</div>`;

  html = html.replace("<body", `${seoBlock}\n<body`);

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
