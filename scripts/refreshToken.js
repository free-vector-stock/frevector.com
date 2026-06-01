/**
 * Refresh Pinterest Access Token
 * Uses GitHub Actions GITHUB_OUTPUT environment file (replaces deprecated ::set-output::)
 */

const axios = require('axios');
const fs = require('fs');

async function refreshToken() {
    const refresh_token = process.env.PINTEREST_REFRESH_TOKEN;
    const client_id = process.env.PINTEREST_APP_ID;
    const client_secret = process.env.PINTEREST_CLIENT_SECRET;

    if (!refresh_token || !client_id || !client_secret) {
        console.error('Missing Pinterest environment variables: PINTEREST_REFRESH_TOKEN, PINTEREST_APP_ID, PINTEREST_CLIENT_SECRET');
        process.exit(1);
    }

    try {
        const auth = Buffer.from(`${client_id}:${client_secret}`).toString('base64');
        const response = await axios.post(
            'https://api.pinterest.com/v5/oauth/token',
            `grant_type=refresh_token&refresh_token=${encodeURIComponent(refresh_token)}`,
            {
                headers: {
                    'Authorization': `Basic ${auth}`,
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            }
        );

        const newAccessToken = response.data.access_token;
        const newRefreshToken = response.data.refresh_token || refresh_token;

        console.log('Successfully refreshed Pinterest token');
        console.log(`Token scope: ${response.data.scope}`);
        console.log(`Expires in: ${response.data.expires_in} seconds`);

        // GitHub Actions output - use GITHUB_OUTPUT env file (replaces deprecated ::set-output::)
        const githubOutput = process.env.GITHUB_OUTPUT;
        if (githubOutput) {
            fs.appendFileSync(githubOutput, `access_token=${newAccessToken}\n`);
            fs.appendFileSync(githubOutput, `refresh_token=${newRefreshToken}\n`);
            console.log('Token written to GITHUB_OUTPUT');
        } else {
            // Fallback for local testing
            console.log(`access_token=${newAccessToken}`);
        }

        return { accessToken: newAccessToken, refreshToken: newRefreshToken };
    } catch (error) {
        console.error('Error refreshing token:', error.response?.data || error.message);
        process.exit(1);
    }
}

if (require.main === module) {
    refreshToken();
}

module.exports = refreshToken;
