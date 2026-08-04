/**
 * Delete R2 JPEG Files Script for Frevector.com
 * Safely removes all files containing "-jpeg-" in their name from R2 Object Storage
 * 
 * Safety Features:
 * 1. Only deletes files with "-jpeg-" in the filename (any extension)
 * 2. Never touches vector files (no "-jpeg-" in name)
 * 3. Processes in batches to respect quota limits
 * 4. Generates detailed deletion report
 * 5. Automatically stops when no more JPEG files exist
 * 
 * This script:
 * 1. Lists all objects in R2 bucket
 * 2. Filters for files containing "-jpeg-" in the name
 * 3. Deletes them in small batches (respecting free tier quota)
 * 4. Generates deletion report
 * 5. Stores state to prevent re-running on same files
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');

const DELETION_STATE_PATH = path.join(__dirname, '../pinterest/r2-deletion-state.json');
const DELETION_REPORT_PATH = path.join(__dirname, '../pinterest/r2-deletion-report.json');
const BATCH_SIZE = 50; // Delete 50 files per batch
const DELAY_MS = 500; // Delay between deletions to respect rate limits

async function deleteR2JpegFiles() {
    const cfToken = process.env.CLOUDFLARE_API_TOKEN;
    const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
    const bucket = 'vector-assets';

    if (!cfToken || !accountId) {
        console.error('CLOUDFLARE_API_TOKEN and CLOUDFLARE_ACCOUNT_ID are required');
        process.exit(1);
    }

    // Load deletion state to track progress
    let deletionState = { last_run: null, total_deleted: 0, completed: false };
    if (fs.existsSync(DELETION_STATE_PATH)) {
        try {
            deletionState = JSON.parse(fs.readFileSync(DELETION_STATE_PATH, 'utf8'));
        } catch (err) {
            console.warn('Could not load deletion state, starting fresh');
        }
    }

    // If deletion is already completed, don't run again
    if (deletionState.completed) {
        console.log('✓ JPEG deletion already completed. No more files to delete.');
        console.log(`Total files deleted in previous runs: ${deletionState.total_deleted}`);
        return;
    }

    console.log('Starting R2 JPEG file deletion...');
    console.log(`Previously deleted: ${deletionState.total_deleted} files`);

    // 1. List all objects in R2 bucket
    console.log('Fetching list of files from R2...');
    let allObjects = [];
    let cursor = null;
    let pageCount = 0;

    try {
        while (true) {
            pageCount++;
            const url = `https://api.cloudflare.com/client/v4/accounts/${accountId}/r2/buckets/${bucket}/objects`;
            const params = { limit: 1000 };
            if (cursor) params.cursor = cursor;

            const response = await axios.get(url, {
                headers: { 'Authorization': `Bearer ${cfToken}` },
                params: params
            });

            if (response.data.success && response.data.result && response.data.result.objects) {
                allObjects = allObjects.concat(response.data.result.objects);
            }

            // Check for more pages
            if (!response.data.result || !response.data.result.cursor) break;
            cursor = response.data.result.cursor;
        }

        console.log(`✓ Fetched ${allObjects.length} total objects in ${pageCount} page(s)`);
    } catch (err) {
        console.error('Error fetching R2 objects:', err.message);
        process.exit(1);
    }

    // 2. Filter for files containing "-jpeg-" in the name
    const jpegFiles = allObjects.filter(obj => obj.key.toLowerCase().includes('-jpeg-'));
    console.log(`Found ${jpegFiles.length} files containing "-jpeg-" to delete`);

    if (jpegFiles.length === 0) {
        console.log('✓ No JPEG files found. Deletion is complete!');
        deletionState.completed = true;
        deletionState.last_run = new Date().toISOString();
        fs.writeFileSync(DELETION_STATE_PATH, JSON.stringify(deletionState, null, 2));
        return;
    }

    // 3. Delete files in batches
    const deletionReport = {
        generated_at: new Date().toISOString(),
        total_jpeg_files_found: jpegFiles.length,
        successful_deletions: 0,
        failed_deletions: 0,
        details: []
    };

    for (let i = 0; i < jpegFiles.length; i += BATCH_SIZE) {
        const batch = jpegFiles.slice(i, i + BATCH_SIZE);
        console.log(`\nProcessing batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(jpegFiles.length / BATCH_SIZE)}...`);

        for (const file of batch) {
            try {
                const deleteUrl = `https://api.cloudflare.com/client/v4/accounts/${accountId}/r2/buckets/${bucket}/objects/${encodeURIComponent(file.key)}`;
                
                await axios.delete(deleteUrl, {
                    headers: { 'Authorization': `Bearer ${cfToken}` }
                });

                deletionReport.successful_deletions++;
                deletionReport.details.push({
                    key: file.key,
                    size: file.size,
                    status: 'deleted'
                });
                console.log(`  ✓ Deleted: ${file.key} (${(file.size / 1024).toFixed(2)} KB)`);

                // Delay to avoid rate limits
                await new Promise(resolve => setTimeout(resolve, DELAY_MS));
            } catch (err) {
                deletionReport.failed_deletions++;
                deletionReport.details.push({
                    key: file.key,
                    status: 'failed',
                    error: err.message
                });
                console.error(`  ✗ Failed to delete ${file.key}:`, err.message);
            }
        }
    }

    // 4. Save deletion report
    fs.writeFileSync(DELETION_REPORT_PATH, JSON.stringify(deletionReport, null, 2));

    // 5. Update deletion state
    deletionState.last_run = new Date().toISOString();
    deletionState.total_deleted += deletionReport.successful_deletions;
    
    // Check if all files were deleted successfully
    if (deletionReport.failed_deletions === 0 && jpegFiles.length > 0) {
        deletionState.completed = true;
        console.log('\n✓ All JPEG files successfully deleted. Deletion process complete!');
    } else if (deletionReport.failed_deletions > 0) {
        console.log(`\n⚠ Some files failed to delete. Will retry on next run.`);
    }

    fs.writeFileSync(DELETION_STATE_PATH, JSON.stringify(deletionState, null, 2));

    // Print summary
    console.log('\n--- R2 Deletion Summary ---');
    console.log(`Successful deletions: ${deletionReport.successful_deletions}`);
    console.log(`Failed deletions: ${deletionReport.failed_deletions}`);
    console.log(`Total deleted so far: ${deletionState.total_deleted}`);
    console.log(`Status: ${deletionState.completed ? 'COMPLETE' : 'IN PROGRESS'}`);
    console.log(`Report saved to ${DELETION_REPORT_PATH}`);
}

deleteR2JpegFiles();
