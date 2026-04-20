/**
 * Pinterest Analytics Reporting for Frevector.com
 */

const fs = require('fs');
const path = require('path');
const axios = require('axios');

async function generateReport() {
    const accessToken = process.env.PINTEREST_ACCESS_TOKEN;
    if (!accessToken) {
        console.error('PINTEREST_ACCESS_TOKEN is required');
        process.exit(1);
    }

    try {
        const response = await axios.get('https://api.pinterest.com/v5/analytics/user_account', {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            },
            params: {
                start_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                end_date: new Date().toISOString().split('T')[0],
                metrics: 'IMPRESSION,PIN_CLICK,SAVE,ENGAGEMENT'
            }
        });

        const reportData = response.data;
        console.log('--- Pinterest Analytics Report (Last 30 Days) ---');
        console.log(`Impressions: ${reportData.summary_metrics?.IMPRESSION || 0}`);
        console.log(`Pin Clicks: ${reportData.summary_metrics?.PIN_CLICK || 0}`);
        console.log(`Saves: ${reportData.summary_metrics?.SAVE || 0}`);
        console.log(`Engagement: ${reportData.summary_metrics?.ENGAGEMENT || 0}`);
        console.log('------------------------------------------------');

        const reportPath = path.join(__dirname, '../pinterest/report.json');
        fs.writeFileSync(reportPath, JSON.stringify(reportData, null, 2));
        console.log(`Report saved to ${reportPath}`);
    } catch (error) {
        console.error('Error generating report:', error.response?.data || error.message);
    }
}

generateReport();
