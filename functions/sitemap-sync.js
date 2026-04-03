export async function onRequestGet(context) {
  const { env } = context;
  const url = new URL(context.request.url);
  const key = url.searchParams.get("key");
  
  if (key !== "vector2026") {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    await syncSitemap(env);
    return new Response("Sitemap sync triggered successfully", { status: 200 });
  } catch (error) {
    return new Response("Error: " + error.message, { status: 500 });
  }
}

async function syncSitemap(env) {
  console.log("Starting sitemap sync...");
  
  const bucket = env.VECTOR_ASSETS;
  if (!bucket) {
    throw new Error("R2 bucket binding VECTOR_ASSETS not found");
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

  console.log(\`Found \${objects.length} objects in R2\`);

  let xml = '<?xml version="1.0" encoding="UTF-8"?>\\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\\n';
  
  xml += '  <url>\\n';
  xml += '    <loc>https://frevector.com/</loc>\\n';
  xml += \`    <lastmod>\${new Date().toISOString().split('T')[0]}</lastmod>\\n\`;
  xml += '    <priority>1.0</priority>\\n';
  xml += '  </url>\\n';

  const vectorIds = new Set();
  const idToDate = new Map();

  for (const obj of objects) {
    if (obj.key === "all_vectors.json" || obj.key.includes("thumb")) continue;
    
    const parts = obj.key.split('/');
    let id = "";
    
    if (parts.length >= 2) {
      id = parts[1];
    } else {
      id = parts[0].replace(/\\.[^/.]+$/, "");
    }

    if (id && !vectorIds.has(id)) {
      vectorIds.add(id);
      idToDate.set(id, obj.uploaded.toISOString().split('T')[0]);
    }
  }

  console.log(\`Extracted \${vectorIds.size} unique vector IDs\`);

  for (const id of vectorIds) {
    const uploadDate = idToDate.get(id);
    xml += '  <url>\\n';
    xml += \`    <loc>https://frevector.com/details/\${id}</loc>\\n\`;
    xml += \`    <lastmod>\${uploadDate}</lastmod>\\n\`;
    xml += '  </url>\\n';
  }

  xml += '</urlset>';

  const GITHUB_TOKEN = env.GITHUB_TOKEN;
  const REPO = "free-vector-stock/frevector.com";
  const FILE_PATH = "sitemap.xml";

  if (!GITHUB_TOKEN) {
    throw new Error("GITHUB_TOKEN not found in environment");
  }

  const getFileRes = await fetch(\`https://api.github.com/repos/\${REPO}/contents/\${FILE_PATH}\`, {
    headers: {
      "Authorization": \`token \${GITHUB_TOKEN}\`,
      "User-Agent": "Cloudflare-Worker-Sitemap-Sync"
    }
  });

  let sha = "";
  if (getFileRes.ok) {
    const fileData = await getFileRes.json();
    sha = fileData.sha;
  }

  const contentBase64 = btoa(unescape(encodeURIComponent(xml)));
  
  const commitRes = await fetch(\`https://api.github.com/repos/\${REPO}/contents/\${FILE_PATH}\`, {
    method: "PUT",
    headers: {
      "Authorization": \`token \${GITHUB_TOKEN}\`,
      "User-Agent": "Cloudflare-Worker-Sitemap-Sync",
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      message: "Auto-sync sitemap with R2",
      content: contentBase64,
      sha: sha || undefined
    })
  });

  if (!commitRes.ok) {
    const errorText = await commitRes.text();
    throw new Error("Failed to update sitemap on GitHub: " + errorText);
  }
}
