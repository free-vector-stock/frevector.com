// Automated Sitemap Sync Worker
export default {
  async scheduled(event, env, ctx) {
    await syncSitemap(env);
  },
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    if (url.pathname === "/sync") {
      await syncSitemap(env);
      return new Response("Sitemap sync triggered", { status: 200 });
    }
    return new Response("Sitemap Sync Worker Running", { status: 200 });
  }
};

async function syncSitemap(env) {
  console.log("Starting sitemap sync...");
  const bucket = env.VECTOR_ASSETS;
  if (!bucket) return;
  
  let objects = [];
  let truncated = true;
  let cursor = undefined;
  while (truncated) {
    const list = await bucket.list({ cursor });
    objects.push(...list.objects);
    truncated = list.truncated;
    cursor = list.cursor;
  }
  
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
  xml += '  <url>\n    <loc>https://frevector.com/</loc>\n    <lastmod>' + new Date().toISOString().split('T')[0] + '</lastmod>\n    <priority>1.0</priority>\n  </url>\n';
  
  const vectorIds = new Set();
  for (const obj of objects) {
    if (obj.key === "all_vectors.json" || obj.key.includes("thumb")) continue;
    const parts = obj.key.split('/');
    let id = parts.length >= 2 ? parts[1] : parts[0].replace(/\\.[^/.]+$/, "");
    if (id && !vectorIds.has(id)) {
      vectorIds.add(id);
      xml += '  <url>\n    <loc>https://frevector.com/details/' + id + '</loc>\n    <lastmod>' + obj.uploaded.toISOString().split('T')[0] + '</lastmod>\n  </url>\n';
    }
  }
  xml += '</urlset>';
  
  const GITHUB_TOKEN = env.GITHUB_TOKEN;
  if (!GITHUB_TOKEN) return;

  const getFileRes = await fetch(`https://api.github.com/repos/free-vector-stock/frevector.com/contents/sitemap.xml`, {
    headers: { "Authorization": `token ${GITHUB_TOKEN}`, "User-Agent": "Cloudflare-Worker" }
  });

  let sha = "";
  if (getFileRes.ok) {
    const fileData = await getFileRes.json();
    sha = fileData.sha;
  }

  const contentBase64 = btoa(unescape(encodeURIComponent(xml)));
  await fetch(`https://api.github.com/repos/free-vector-stock/frevector.com/contents/sitemap.xml`, {
    method: "PUT",
    headers: { "Authorization": `token ${GITHUB_TOKEN}`, "User-Agent": "Cloudflare-Worker", "Content-Type": "application/json" },
    body: JSON.stringify({ message: "Auto-sync sitemap", content: contentBase64, sha: sha || undefined })
  });
}