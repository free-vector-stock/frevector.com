/**
 * Auto Pin script for Frevector.com
 * Parses sitemap.xml and pins new items to Pinterest
 *
 * FIX A: Pin description now uses metadata.description (full text from JSON),
 *         not just keywords. Alt text uses keywords joined.
 * FIX B: Category-balanced (round-robin) selection so pins are spread across
 *         all categories instead of flooding one category at a time.
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
    const sentSet = new Set(sentUrls); // O(1) lookup for duplicate prevention

    // 2. Parse Sitemap
    const sitemapContent = fs.readFileSync(SITEMAP_PATH, 'utf8');
    const parser = new xml2js.Parser();
    const sitemap = await parser.parseStringPromise(sitemapContent);
    
    const allUrls = sitemap.urlset.url.map(u => u.loc[0]).filter(url => url.includes('/details/') && !url.toLowerCase().includes('jpeg'));

    // FIX B: Build per-category buckets, then interleave (round-robin)
    // FILTER: Skip URLs containing "jpeg" (JPEG files are no longer pinned)
    const categoryBuckets = {};
    for (const url of allUrls) {
        if (sentSet.has(url)) continue; // skip already-pinned
        if (url.toLowerCase().includes('jpeg')) continue; // skip JPEG files
        const slug = url.split('/').pop();
        const categoryKey = slug.split('-')[0].toLowerCase();
        if (!categoryBuckets[categoryKey]) categoryBuckets[categoryKey] = [];
        categoryBuckets[categoryKey].push(url);
    }

    // Round-robin interleave across categories
    const newUrls = [];
    const bucketKeys = Object.keys(categoryBuckets);
    let anyLeft = true;
    while (anyLeft && newUrls.length < QUOTA_LIMIT) {
        anyLeft = false;
        for (const key of bucketKeys) {
            if (categoryBuckets[key].length > 0) {
                newUrls.push(categoryBuckets[key].shift());
                anyLeft = true;
                if (newUrls.length >= QUOTA_LIMIT) break;
            }
        }
    }

    if (newUrls.length === 0) {
        console.log('No new URLs to pin.');
        return;
    }

    console.log(`Found ${newUrls.length} new URLs to pin (balanced across ${bucketKeys.length} categories).`);

    // 3. Get Pinterest Boards
    const boards = await pinterest.getBoards();
    const boardMap = {};
    boards.forEach(b => boardMap[b.name.toLowerCase()] = b.id);

    // 4. Process in batches
    for (let i = 0; i < newUrls.length; i += BATCH_SIZE) {
        const batch = newUrls.slice(i, i + BATCH_SIZE);
        console.log(`Processing batch ${Math.floor(i / BATCH_SIZE) + 1}...`);

        for (const url of batch) {
            // Extra guard: never re-pin
            if (sentSet.has(url)) {
                console.log(`Skipping already-pinned URL: ${url}`);
                continue;
            }

            try {
                // Extract slug and category
                // Example URL: https://frevector.com/details/abstract-00000002
                const slug = url.split('/').pop();
                const categoryPart = slug.split('-')[0];
                const category = categoryPart.charAt(0).toUpperCase() + categoryPart.slice(1).toLowerCase();

                let boardId = boardMap[category.toLowerCase()];
                
                // If board doesn't exist, create it automatically
                if (!boardId) {
                    console.log(`Board not found for category "${category}". Creating automatically...`);
                    try {
                        const newBoard = await pinterest.createBoard(category, `Free ${category} vectors and images from frevector.com`);
                        boardId = newBoard.id;
                        boardMap[category.toLowerCase()] = boardId;
                        console.log(`Successfully created new board: ${category} (${boardId})`);
                    } catch (createErr) {
                        console.warn(`Could not create board for ${category}, falling back to miscellaneous.`);
                        boardId = boardMap['miscellaneous'];
                    }
                }
                
                if (!boardId) {
                    console.warn(`No board found or could be created for category: ${category}, skipping ${url}`);
                    continue;
                }

                // Fetch metadata from R2 (via Cloudflare API)
                const metadata = await fetchMetadata(category, slug);
                
                // FIX A: Use the real title and description from JSON.
                // Pinterest title max = 100 chars, description max = 500 chars.
                const title = (metadata.title || slug).substring(0, 100);

                // Use metadata.description if available; otherwise fall back to keywords joined.
                // Do NOT rewrite the text — only truncate if over Pinterest's 500-char limit.
                let description = '';
                if (metadata.description && metadata.description.trim().length > 0) {
                    description = metadata.description.trim().substring(0, 500);
                } else if (metadata.keywords && metadata.keywords.length > 0) {
                    description = metadata.keywords.join(', ').substring(0, 500);
                } else {
                    description = category;
                }

                // Alt text: keywords joined (Pinterest alt_text max = 500 chars)
                const altText = (metadata.keywords || []).join(', ').substring(0, 500) || category;

                // R2 uses Title Case for category folders
                const categoryTitle = category.charAt(0).toUpperCase() + category.slice(1).toLowerCase();
                const imageUrl = `https://frevector.com/api/asset?key=${encodeURIComponent(categoryTitle + '/' + slug + '/' + slug + '.jpg')}`;

                await pinterest.createPin(boardId, title, description, imageUrl, url, altText);
                sentSet.add(url);
                sentUrls.push(url);
                console.log(`Pinned: ${slug} | title: "${title.substring(0, 40)}..." | desc: "${description.substring(0, 40)}..."`);

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
    // R2 uses Title Case for category folders (e.g., Abstract, Food, Nature)
    const categoryTitle = category.charAt(0).toUpperCase() + category.slice(1).toLowerCase();
    const key = `${categoryTitle}/${slug}/${slug}.json`;

    try {
        const url = `https://api.cloudflare.com/client/v4/accounts/${accountId}/r2/buckets/${bucket}/objects/${encodeURIComponent(key)}`;
        const response = await axios.get(url, {
            headers: { 'Authorization': `Bearer ${cfToken}` },
            responseType: 'json'
        });
        return response.data;
    } catch (err) {
        console.warn(`Could not fetch metadata for ${slug} (key: ${key}), using defaults.`);
        // Generate a human-readable title from slug
        const readableTitle = slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()).replace(/\d+$/, '').trim();
        return { title: readableTitle || slug, description: '', keywords: [category.toLowerCase()] };
    }
}

autopin();
