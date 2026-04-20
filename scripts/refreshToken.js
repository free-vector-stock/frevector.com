/**
 * Refresh Pinterest Access Token
 */

const axios = require('axios');
const fs = require('fs');

async function refreshToken() {
    const refresh_token = process.env.PINTEREST_REFRESH_TOKEN;
    const client_id = process.env.PINTEREST_APP_ID;
    const client_secret = process.env.PINTEREST_CLIENT_SECRET;

    if (!refresh_token || !client_id || !client_secret) {
        console.error('Missing Pinterest environment variables');
        process.exit(1);
    }

    try {
        const auth = Buffer.from(`${client_id}:${client_secret}`).toString('base64');
        const response = await axios.post('https://api.pinterest.com/v5/oauth/token', 
            'grant_type=refresh_token&refresh_token=' + refresh_token,
            {
                headers: {
                    'Authorization': `Basic ${auth}`,
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            }
        );

        const newToken = response.data.access_token;
        console.log('Successfully refreshed Pinterest token');
        
        // Output for GitHub Actions
        console.log(`::set-output name=access_token::${newToken}`);
        return newToken;
    } catch (error) {
        console.error('Error refreshing token:', error.response?.data || error.message);
        process.exit(1);
    }
}

if (require.main === module) {
    refreshToken();
}

module.exports = refreshToken;
