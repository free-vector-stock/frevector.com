/**
 * Auto Pin script for Frevector.com
 * Parses sitemap.xml and pins new items to Pinterest
 */

const fs = require('fs');
const path = require('path');
const axios = require('axios');
const xml2js = require('xml2js');
const PinterestAPI = require('../src/pinterest');

const SENT_JSON_PATH = path.join(__dirname, '../pinterest/sent.json');
const SITEMAP_PATH = path.join(__dirname, '../sitemap.xml');
const QUOTA_LIMIT = 400;
const BATCH_SIZE = 50;

async function autopin() {
    const accessToken = process.env.PINTEREST_ACCESS_TOKEN;
    if (!accessToken) {
        console.error('PINTEREST_ACCESS_TOKEN is required');
        process.exit(1);
    }

    const pinterest = new PinterestAPI(accessToken);
    
    // 1. Load sent URLs
    let sentUrls = [];
    if (fs.existsSync(SENT_JSON_PATH)) {
        sentUrls = JSON.parse(fs.readFileSync(SENT_JSON_PATH, 'utf8'));
    }

    // 2. Parse Sitemap
    const sitemapContent = fs.readFileSync(SITEMAP_PATH, 'utf8');
    const parser = new xml2js.Parser();
    const sitemap = await parser.parseStringPromise(sitemapContent);
    
    const allUrls = sitemap.urlset.url.map(u => u.loc[0]).filter(url => url.includes('/details/'));
    const newUrls = allUrls.filter(url => !sentUrls.includes(url)).slice(0, QUOTA_LIMIT);

    if (newUrls.length === 0) {
        console.log('No new URLs to pin.');
        return;
    }

    console.log(`Found ${newUrls.length} new URLs to pin.`);

    // 3. Get Pinterest Boards
    const boards = await pinterest.getBoards();
    const boardMap = {};
    boards.forEach(b => boardMap[b.name.toLowerCase()] = b.id);

    // 4. Process in batches
    for (let i = 0; i < newUrls.length; i += BATCH_SIZE) {
        const batch = newUrls.slice(i, i + BATCH_SIZE);
        console.log(`Processing batch ${i / BATCH_SIZE + 1}...`);

        for (const url of batch) {
            try {
                // Extract slug and category
                // Example URL: https://frevector.com/details/abstract-00000002
                const slug = url.split('/').pop();
                const categoryPart = slug.split('-')[0];
                const category = categoryPart.charAt(0).toUpperCase() + categoryPart.slice(1);

                const boardId = boardMap[category.toLowerCase()] || boardMap['miscellaneous'];
                
                if (!boardId) {
                    console.warn(`No board found for category: ${category}, skipping ${url}`);
                    continue;
                }

                // Fetch metadata from R2 (via Cloudflare API)
                const metadata = await fetchMetadata(category, slug);
                
                const title = metadata.title || slug;
                const description = (metadata.keywords || []).join(', ') || category;
                const imageUrl = `https://frevector.com/api/asset?key=${encodeURIComponent(category + '/' + slug + '/' + slug + '.jpg')}`;

                await pinterest.createPin(boardId, title, description, imageUrl, url);
                sentUrls.push(url);
                console.log(`Pinned: ${slug}`);

                // Small delay to avoid rate limits
                await new Promise(resolve => setTimeout(resolve, 1000));
            } catch (err) {
                console.error(`Failed to pin ${url}:`, err.message);
            }
        }

        // Save progress after each batch
        fs.writeFileSync(SENT_JSON_PATH, JSON.stringify(sentUrls, null, 2));
    }

    console.log('Autopin completed.');
}

async function fetchMetadata(category, slug) {
    const cfToken = process.env.CLOUDFLARE_API_TOKEN;
    const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
    const bucket = 'vector-assets';
    const key = `${category}/${slug}/${slug}.json`;

    try {
        // Since we can't easily use S3 SDK here without adding many deps, 
        // we'll try to use the public API if available or fallback to defaults
        // For now, return a placeholder or attempt a simple fetch if the API supports it
        // Actually, the user provided CF Token, so we can use CF API to get object
        const url = `https://api.cloudflare.com/client/v4/accounts/${accountId}/r2/buckets/${bucket}/objects/${encodeURIComponent(key)}`;
        const response = await axios.get(url, {
            headers: { 'Authorization': `Bearer ${cfToken}` },
            responseType: 'json'
        });
        return response.data;
    } catch (err) {
        console.warn(`Could not fetch metadata for ${slug}, using defaults.`);
        return { title: slug, keywords: [category] };
    }
}

autopin();
