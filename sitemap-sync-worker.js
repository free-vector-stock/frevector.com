export default {
  async scheduled(event, env, ctx) {
    await syncSitemap(env);
    await checkRobotsTxt(env);
  },
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    if (url.pathname === "/sync") {
      await syncSitemap(env);
      await checkRobotsTxt(env);
      return new Response("Sitemap and Robots.txt sync triggered", { status: 200 });
    }
    return new Response("Sitemap Sync Worker Running", { status: 200 });
  }
};

async function syncSitemap(env) {
  console.log("Starting sitemap sync...");
  const bucket = env.VECTOR_ASSETS;
  if (!bucket) {
    console.error("R2 bucket binding VECTOR_ASSETS not found");
    return;
  }
  let objects = [];
  let truncated = true;
  let cursor = undefined;
  while (truncated) {
    const list = await bucket.list({ cursor });
    objects.push(...list.objects);
    truncated = list.truncated;
    cursor = list.cursor;
  }
  
  let xml = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n";
  xml += "<urlset xmlns=\"http://www.sitemaps.org/schemas/sitemap/0.9\">\n";
  xml += "  <url>\n    <loc>https://frevector.com/</loc>\n    <lastmod>" + new Date().toISOString().split("T")[0] + "</lastmod>\n    <priority>1.0</priority>\n  </url>\n";
  
  const vectorIds = new Set();
  const idToDate = new Map();
  for (const obj of objects) {
    if (obj.key === "all_vectors.json" || obj.key.includes("thumb")) continue;
    const parts = obj.key.split("/");
    let id = parts.length >= 2 ? parts[1] : parts[0].replace(/\.[^/.]+$/, "");
    if (id && !vectorIds.has(id)) {
      vectorIds.add(id);
      idToDate.set(id, obj.uploaded.toISOString().split("T")[0]);
    }
  }
  
  for (const id of vectorIds) {
    xml += "  <url>\n    <loc>https://frevector.com/details/" + id + "</loc>\n    <lastmod>" + idToDate.get(id) + "</lastmod>\n  </url>\n";
  }
  xml += "</urlset>";
  
  await updateGitHub(env, "sitemap.xml", xml, "Auto-sync sitemap with R2");
}

async function checkRobotsTxt(env) {
  const robotsContent = "User-agent: *\nAllow: /\nSitemap: https://frevector.com/sitemap.xml";
  await updateGitHub(env, "robots.txt", robotsContent, "Auto-check/create robots.txt", true);
}

async function updateGitHub(env, filePath, content, message, onlyIfMissing = false) {
  const GITHUB_TOKEN = env.GITHUB_TOKEN;
  const REPO = "free-vector-stock/frevector.com";
  if (!GITHUB_TOKEN) return;

  const getFileRes = await fetch(`https://api.github.com/repos/${REPO}/contents/${filePath}`, {
    headers: { "Authorization": `token ${GITHUB_TOKEN}`, "User-Agent": "Cloudflare-Worker" }
  });

  let sha = "";
  if (getFileRes.ok) {
    if (onlyIfMissing) return;
    const fileData = await getFileRes.json();
    sha = fileData.sha;
  }

  const contentBase64 = btoa(unescape(encodeURIComponent(content)));
  await fetch(`https://api.github.com/repos/${REPO}/contents/${filePath}`, {
    method: "PUT",
    headers: { "Authorization": `token ${GITHUB_TOKEN}`, "User-Agent": "Cloudflare-Worker", "Content-Type": "application/json" },
    body: JSON.stringify({ message, content: contentBase64, sha: sha || undefined })
  });
}