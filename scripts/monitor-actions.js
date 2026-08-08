/**
 * GitHub Actions Error Monitor & Auto-Heal System
 * Checks recent GitHub Actions runs for the repository, identifies failures,
 * and logs/reports them.
 */

const { execSync } = require('child_process');

async function checkActions() {
    console.log('🔍 Checking GitHub Actions workflow runs...');
    try {
        // Use GitHub CLI (gh) to check recent workflow runs
        const result = execSync('gh run list --limit 10 --json databaseId,name,status,conclusion,workflowName,createdAt', { encoding: 'utf8' });
        const runs = JSON.parse(result);
        
        console.log(`Found ${runs.length} recent workflow runs.`);
        const failedRuns = runs.filter(r => r.conclusion === 'failure');
        
        if (failedRuns.length > 0) {
            console.warn(`⚠️ Warning: Found ${failedRuns.length} failed workflow run(s)!`);
            for (const run of failedRuns) {
                console.warn(` - [${run.workflowName}] ID: ${run.databaseId}, Status: ${run.status}, Conclusion: ${run.conclusion}, Created: ${run.createdAt}`);
            }
        } else {
            console.log('✅ All recent workflow runs passed successfully.');
        }
    } catch (e) {
        console.error('Error checking GitHub runs via gh CLI:', e.message);
    }
}

if (require.main === module) {
    checkActions();
}

module.exports = checkActions;
