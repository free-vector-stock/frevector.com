export default {
  async scheduled(event, env, ctx) {
    await syncSitemap(env);
  },
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    if (url.pathname === "/sync") {
      try {
        const result = await syncSitemap(env);
        return new Response(result || "Sync completed", { status: 200 });
      } catch (e) {
        return new Response("Error: " + e.message, { status: 500 });
      }
    }
    return new Response("Sitemap Sync Worker Running", { status: 200 });
  }
};

async function syncSitemap(env) {
  const bucket = env.VECTOR_ASSETS;
  const GH_TOKEN = env.GH_TOKEN;
  const REPO = "free-vector-stock/frevector.com";

  const allVectorsObj = await bucket.get("all_vectors.json");
  if (!allVectorsObj) return "Error: all_vectors.json not found in R2";
  const allVectors = await allVectorsObj.json();
  
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n';
  xml += '  <url><loc>https://frevector.com/</loc><lastmod>' + new Date().toISOString().split('T')[0] + '</lastmod><priority>1.0</priority></url>\n';

  let addedCount = 0;
  for (const v of allVectors) {
    const name = v.name;
    
    // "jpeg" kelimesini kesin olarak engelle (hem küçük hem büyük harf)
    if (name.toLowerCase().includes("jpeg")) {
      continue;
    }

    const thumbKey = encodeURIComponent(name + '/thumb.jpg');
    xml += '  <url>\n    <loc>https://frevector.com/details/' + name + '</loc>\n    <lastmod>' + new Date().toISOString().split('T')[0] + '</lastmod>\n    <image:image>\n      <image:loc>https://frevector.com/api/asset?key=' + thumbKey + '</image:loc>\n    </image:image>\n  </url>\n';
    addedCount++;
  }
  xml += '</urlset>';

  const getFileRes = await fetch(`https://api.github.com/repos/${REPO}/contents/sitemap.xml`, {
    headers: { "Authorization": `token ${GH_TOKEN}`, "User-Agent": "Cloudflare-Worker" }
  });

  let sha = "";
  if (getFileRes.ok) {
    const fileData = await getFileRes.json();
    sha = fileData.sha;
  }

  const contentBase64 = btoa(unescape(encodeURIComponent(xml)));
  const putRes = await fetch(`https://api.github.com/repos/${REPO}/contents/sitemap.xml`, {
    method: "PUT",
    headers: {
      "Authorization": `token ${GH_TOKEN}`,
      "User-Agent": "Cloudflare-Worker",
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      message: `Final Sync: Filtered jpeg names (${addedCount} items)`,
      content: contentBase64,
      sha: sha || undefined
    })
  });

  if (!putRes.ok) {
    const errText = await putRes.text();
    throw new Error(`GitHub API Error: ${putRes.status} ${errText}`);
  }

  return `Success: Updated sitemap with ${addedCount} vectors (Strict JPEG filter applied)`;
}
