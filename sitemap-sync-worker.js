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

  // 1. all_vectors.json dosyasını R2'den çek (Yayında olanları belirlemek için)
  const allVectorsObj = await bucket.get("all_vectors.json");
  if (!allVectorsObj) {
    console.error("all_vectors.json not found in R2");
    return;
  }
  const allVectors = await allVectorsObj.json();
  const liveVectorNames = new Set(allVectors.map(v => v.name));
  console.log(`Found ${liveVectorNames.size} live vectors in all_vectors.json`);

  // 2. R2'deki tüm objeleri listele (Tarih bilgisi için)
  let objects = [];
  let truncated = true;
  let cursor = undefined;
  while (truncated) {
    const list = await bucket.list({ cursor });
    objects.push(...list.objects);
    truncated = list.truncated;
    cursor = list.cursor;
  }

  // 3. Tarih bilgilerini eşleştir
  const nameToDate = new Map();
  for (const obj of objects) {
    const parts = obj.key.split('/');
    if (parts.length >= 2) {
      const name = parts[1];
      if (liveVectorNames.has(name)) {
        const currentData = nameToDate.get(name);
        const objDate = obj.uploaded.toISOString().split('T')[0];
        if (!currentData || objDate > currentData) {
          nameToDate.set(name, objDate);
        }
      }
    }
  }

  // 4. XML oluştur (Sadece yayında olanlar için)
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n';
  
  xml += '  <url>\n    <loc>https://frevector.com/</loc>\n    <lastmod>' + new Date().toISOString().split('T')[0] + '</lastmod>\n    <priority>1.0</priority>\n  </url>\n';

  for (const name of liveVectorNames) {
    const date = nameToDate.get(name) || new Date().toISOString().split('T')[0];
    const thumbKey = encodeURIComponent(name + '/thumb.jpg');
    xml += '  <url>\n    <loc>https://frevector.com/details/' + name + '</loc>\n    <lastmod>' + date + '</lastmod>\n    <image:image>\n      <image:loc>https://frevector.com/api/asset?key=' + thumbKey + '</image:loc>\n    </image:image>\n  </url>\n';
  }

  xml += '</urlset>';

  await updateGitHub(env, "sitemap.xml", xml, "Auto-sync sitemap with live vectors only");
}

async function checkRobotsTxt(env) {
  const robotsContent = "User-agent: *\nAllow: /\nSitemap: https://frevector.com/sitemap.xml";
  await updateGitHub(env, "robots.txt", robotsContent, "Auto-check/create robots.txt", true);
}

async function updateGitHub(env, filePath, content, message, onlyIfMissing = false) {
  const GH_TOKEN = env.GH_TOKEN;
  const REPO = "free-vector-stock/frevector.com";
  if (!GH_TOKEN) {
    console.error("GH_TOKEN not found in environment");
    return;
  }

  const getFileRes = await fetch(`https://api.github.com/repos/${REPO}/contents/${filePath}`, {
    headers: {
      "Authorization": `token ${GH_TOKEN}`,
      "User-Agent": "Cloudflare-Worker"
    }
  });

  let sha = "";
  if (getFileRes.ok) {
    if (onlyIfMissing) return;
    const fileData = await getFileRes.json();
    sha = fileData.sha;
  }

  const contentBase64 = btoa(unescape(encodeURIComponent(content)));

  const putRes = await fetch(`https://api.github.com/repos/${REPO}/contents/${filePath}`, {
    method: "PUT",
    headers: {
      "Authorization": `token ${GH_TOKEN}`,
      "User-Agent": "Cloudflare-Worker",
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      message,
      content: contentBase64,
      sha: sha || undefined
    })
  });

  if (putRes.ok) {
    console.log(`Successfully updated ${filePath} on GitHub`);
  } else {
    console.error(`Failed to update ${filePath} on GitHub: ${putRes.status}`);
  }
}
