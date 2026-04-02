export default {
  async scheduled(event, env, ctx) {
    await syncSitemap(env);
  },
  async fetch(request, env, ctx) {
    // Allow manual trigger via HTTP for testing
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
  
  // 1. List objects from R2
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

  console.log(`Found ${objects.length} objects in R2`);

  // 2. Generate Sitemap XML
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
  
  // Add homepage
  xml += '  <url>\n';
  xml += '    <loc>https://frevector.com/</loc>\n';
  xml += `    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>\n`;
  xml += '    <priority>1.0</priority>\n';
  xml += '  </url>\n';

  // Extract unique IDs from R2 objects
  const vectorIds = new Set();
  const idToDate = new Map();

  for (const obj of objects) {
    // Skip internal files
    if (obj.key === "all_vectors.json" || obj.key.includes("thumb")) continue;
    
    // Path format: Category/ID/Filename (e.g., Animals/A123/A123.json)
    const parts = obj.key.split('/');
    let id = "";
    
    if (parts.length >= 2) {
      id = parts[1];
    } else {
      id = parts[0].replace(/\.[^/.]+$/, "");
    }

    if (id && !vectorIds.has(id)) {
      vectorIds.add(id);
      idToDate.set(id, obj.uploaded.toISOString().split('T')[0]);
    }
  }

  console.log(`Extracted ${vectorIds.size} unique vector IDs`);

  for (const id of vectorIds) {
    const uploadDate = idToDate.get(id);
    xml += '  <url>\n';
    xml += `    <loc>https://frevector.com/details/${id}</loc>\n`;
    xml += `    <lastmod>${uploadDate}</lastmod>\n`;
    xml += '  </url>\n';
  }

  xml += '</urlset>';

  // 3. Update GitHub
  const GITHUB_TOKEN = env.GITHUB_TOKEN;
  const REPO = "free-vector-stock/frevector.com";
  const FILE_PATH = "sitemap.xml";

  if (!GITHUB_TOKEN) {
    console.error("GITHUB_TOKEN not found in environment");
    return;
  }

  // Get current file SHA to update existing file
  const getFileRes = await fetch(`https://api.github.com/repos/${REPO}/contents/${FILE_PATH}`, {
    headers: {
      "Authorization": `token ${GITHUB_TOKEN}`,
      "User-Agent": "Cloudflare-Worker-Sitemap-Sync"
    }
  });

  let sha = "";
  if (getFileRes.ok) {
    const fileData = await getFileRes.json();
    sha = fileData.sha;
  } else {
    console.log("sitemap.xml not found on GitHub, will create new one.");
  }

  // Commit to GitHub
  // Using btoa(unescape(encodeURIComponent(xml))) for safe base64 encoding of UTF-8
  const contentBase64 = btoa(unescape(encodeURIComponent(xml)));
  
  const commitRes = await fetch(`https://api.github.com/repos/${REPO}/contents/${FILE_PATH}`, {
    method: "PUT",
    headers: {
      "Authorization": `token ${GITHUB_TOKEN}`,
      "User-Agent": "Cloudflare-Worker-Sitemap-Sync",
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      message: "Auto-sync sitemap with R2",
      content: contentBase64,
      sha: sha || undefined
    })
  });

  if (commitRes.ok) {
    console.log("Sitemap successfully updated on GitHub");
  } else {
    const errorText = await commitRes.text();
    console.error("Failed to update sitemap on GitHub:", errorText);
  }
}
