/**
 * Delete JPEG Pins Script for Frevector.com
 * Removes all pins with "jpeg" in the URL from Pinterest
 * 
 * This script:
 * 1. Reads sent.json (list of all pinned URLs)
 * 2. Filters URLs containing "jpeg" in the slug
 * 3. Fetches all pins from Pinterest account
 * 4. Matches URLs to pin IDs
 * 5. Deletes each matched pin via Pinterest API
 * 6. Generates deletion report
 * 7. Updates sent.json to remove deleted URLs
 */

const fs = require('fs');
const path = require('path');
const axios = require('axios');
const PinterestAPI = require('../src/pinterest');

const SENT_JSON_PATH = path.join(__dirname, '../pinterest/sent.json');
const DELETION_REPORT_PATH = path.join(__dirname, '../pinterest/deletion-report.json');
const DELAY_MS = 1500; // Delay between API calls

async function deleteJpegPins() {
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

    console.log(`Total pinned URLs: ${sentUrls.length}`);

    // 2. Filter URLs containing "jpeg"
    const jpegUrls = sentUrls.filter(url => url.toLowerCase().includes('jpeg'));
    console.log(`Found ${jpegUrls.length} URLs containing "jpeg"`);

    if (jpegUrls.length === 0) {
        console.log('No JPEG pins to delete.');
        return;
    }

    // 3. Get all pins from Pinterest account
    console.log('Fetching all pins from Pinterest account...');
    let allPins = [];
    try {
        allPins = await pinterest.getAllPins();
    } catch (err) {
        console.error('Error fetching pins:', err.message);
        process.exit(1);
    }

    console.log(`Found ${allPins.length} total pins on Pinterest.`);

    // Build a map: URL -> Pin ID
    const urlToPinId = {};
    for (const pin of allPins) {
        if (pin.link) {
            urlToPinId[pin.link] = pin.id;
        }
    }

    // 4. Filter JPEG URLs to only those that exist on Pinterest
    const jpegUrlsToDelete = jpegUrls.filter(url => urlToPinId[url]);
    console.log(`${jpegUrlsToDelete.length} JPEG pins found on Pinterest to delete.`);

    if (jpegUrlsToDelete.length === 0) {
        console.log('No JPEG pins found on Pinterest to delete.');
        return;
    }

    // 5. Delete pins
    const deletionReport = {
        generated_at: new Date().toISOString(),
        total_jpeg_urls: jpegUrls.length,
        found_on_pinterest: jpegUrlsToDelete.length,
        successful_deletions: 0,
        failed_deletions: 0,
        details: []
    };

    for (const url of jpegUrlsToDelete) {
        try {
            const pinId = urlToPinId[url];
            const slug = url.split('/').pop();

            await pinterest.deletePin(pinId);
            
            deletionReport.successful_deletions++;
            deletionReport.details.push({
                url: url,
                slug: slug,
                pin_id: pinId,
                status: 'deleted'
            });
            console.log(`✓ Deleted: ${slug} (${pinId})`);

            // Delay to avoid rate limits
            await new Promise(resolve => setTimeout(resolve, DELAY_MS));
        } catch (err) {
            deletionReport.failed_deletions++;
            deletionReport.details.push({
                url: url,
                status: 'failed',
                error: err.message
            });
            console.error(`✗ Failed to delete ${url}:`, err.message);
        }
    }

    // 6. Save deletion report
    fs.writeFileSync(DELETION_REPORT_PATH, JSON.stringify(deletionReport, null, 2));
    console.log(`\n--- Deletion Summary ---`);
    console.log(`Successful deletions: ${deletionReport.successful_deletions}`);
    console.log(`Failed deletions: ${deletionReport.failed_deletions}`);
    console.log(`Report saved to ${DELETION_REPORT_PATH}`);

    // 7. Update sent.json: remove deleted JPEG URLs
    const updatedSentUrls = sentUrls.filter(url => !url.toLowerCase().includes('jpeg'));
    fs.writeFileSync(SENT_JSON_PATH, JSON.stringify(updatedSentUrls, null, 2));
    console.log(`\nUpdated sent.json: removed ${jpegUrls.length} JPEG URLs`);
    console.log(`Remaining URLs in sent.json: ${updatedSentUrls.length}`);
}

deleteJpegPins();
