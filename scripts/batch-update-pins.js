/**
 * Batch Update Pins Script for Frevector.com
 * Updates title and description of already-pinned items from sent.json
 * with metadata from R2 Object Storage (JSON files)
 *
 * This script:
 * 1. Reads sent.json (list of already-pinned URLs)
 * 2. For each URL, extracts slug and category
 * 3. Fetches metadata (title, description, keywords) from R2
 * 4. Updates the pin on Pinterest with new title/description/alt_text
 * 5. Logs results and generates a summary report
 */

const fs = require('fs');
const path = require('path');
const axios = require('axios');
const PinterestAPI = require('../src/pinterest');

const SENT_JSON_PATH = path.join(__dirname, '../pinterest/sent.json');
const UPDATE_REPORT_PATH = path.join(__dirname, '../pinterest/update-report.json');
const BATCH_SIZE = 50;
const DELAY_MS = 1500; // Delay between API calls to avoid rate limits

async function batchUpdatePins() {
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
    } else {
        console.error('sent.json not found');
        process.exit(1);
    }

    console.log(`Found ${sentUrls.length} pinned URLs to update.`);

    // 2. Get all pins from Pinterest account
    console.log('Fetching all pins from Pinterest account...');
    let allPins = [];
    try {
        allPins = await pinterest.getAllPins();
    } catch (err) {
        console.error('Error fetching pins:', err.message);
        process.exit(1);
    }

    console.log(`Found ${allPins.length} total pins on Pinterest.`);

    // Build a map: URL -> Pin ID for quick lookup
    const urlToPinId = {};
    for (const pin of allPins) {
        if (pin.link) {
            urlToPinId[pin.link] = pin.id;
        }
    }

    // 3. Filter sent URLs to only those that exist on Pinterest AND are not JPEG files
    const urlsToUpdate = sentUrls.filter(url => urlToPinId[url] && !url.toLowerCase().includes('jpeg'));
    const jpegUrlsSkipped = sentUrls.filter(url => url.toLowerCase().includes('jpeg')).length;
    console.log(`${urlsToUpdate.length} of ${sentUrls.length} sent URLs found on Pinterest (skipped ${jpegUrlsSkipped} JPEG URLs).`);

    if (urlsToUpdate.length === 0) {
        console.log('No pins to update.');
        return;
    }

    // 4. Process in batches
    const updateReport = {
        generated_at: new Date().toISOString(),
        total_urls: urlsToUpdate.length,
        successful_updates: 0,
        failed_updates: 0,
        skipped_updates: 0,
        details: []
    };

    for (let i = 0; i < urlsToUpdate.length; i += BATCH_SIZE) {
        const batch = urlsToUpdate.slice(i, i + BATCH_SIZE);
        console.log(`\nProcessing batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(urlsToUpdate.length / BATCH_SIZE)}...`);

        for (const url of batch) {
            try {
                const slug = url.split('/').pop();
                const categoryPart = slug.split('-')[0];
                const category = categoryPart.charAt(0).toUpperCase() + categoryPart.slice(1).toLowerCase();
                const pinId = urlToPinId[url];

                // Fetch metadata from R2
                const metadata = await fetchMetadata(category, slug);

                // Prepare update data
                const title = (metadata.title || slug).substring(0, 100);
                let description = '';
                if (metadata.description && metadata.description.trim().length > 0) {
                    description = metadata.description.trim().substring(0, 500);
                } else if (metadata.keywords && metadata.keywords.length > 0) {
                    description = metadata.keywords.join(', ').substring(0, 500);
                } else {
                    description = category;
                }
                const altText = (metadata.keywords || []).join(', ').substring(0, 500) || category;

                // Update pin
                await pinterest.updatePin(pinId, title, description, altText);
                
                updateReport.successful_updates++;
                updateReport.details.push({
                    url: url,
                    slug: slug,
                    status: 'success',
                    title: title.substring(0, 50),
                    description: description.substring(0, 50)
                });
                console.log(`✓ Updated: ${slug}`);

                // Delay to avoid rate limits
                await new Promise(resolve => setTimeout(resolve, DELAY_MS));
            } catch (err) {
                updateReport.failed_updates++;
                updateReport.details.push({
                    url: url,
                    status: 'failed',
                    error: err.message
                });
                console.error(`✗ Failed to update ${url}:`, err.message);
            }
        }
    }

    // 5. Save report
    fs.writeFileSync(UPDATE_REPORT_PATH, JSON.stringify(updateReport, null, 2));
    console.log(`\n--- Update Summary ---`);
    console.log(`Successful: ${updateReport.successful_updates}`);
    console.log(`Failed: ${updateReport.failed_updates}`);
    console.log(`Skipped: ${updateReport.skipped_updates}`);
    console.log(`Report saved to ${UPDATE_REPORT_PATH}`);
}

async function fetchMetadata(category, slug) {
    const cfToken = process.env.CLOUDFLARE_API_TOKEN;
    const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
    const bucket = 'vector-assets';
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
        const readableTitle = slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()).replace(/\d+$/, '').trim();
        return { title: readableTitle || slug, description: '', keywords: [category.toLowerCase()] };
    }
}

batchUpdatePins();
