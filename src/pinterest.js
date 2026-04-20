/**
 * Pinterest API Integration for Frevector.com
 */

const axios = require('axios');

class PinterestAPI {
    constructor(accessToken) {
        this.accessToken = accessToken;
        this.baseUrl = 'https://api.pinterest.com/v5';
    }

    async getBoards() {
        try {
            const response = await axios.get(`${this.baseUrl}/boards`, {
                headers: {
                    'Authorization': `Bearer ${this.accessToken}`,
                    'Content-Type': 'application/json'
                }
            });
            return response.data.items;
        } catch (error) {
            console.error('Error fetching boards:', error.response?.data || error.message);
            throw error;
        }
    }

    async createPin(boardId, title, description, imageUrl, link) {
        try {
            const response = await axios.post(`${this.baseUrl}/pins`, {
                board_id: boardId,
                title: title,
                description: description,
                link: link,
                media_source: {
                    source_type: 'image_url',
                    url: imageUrl
                }
            }, {
                headers: {
                    'Authorization': `Bearer ${this.accessToken}`,
                    'Content-Type': 'application/json'
                }
            });
            return response.data;
        } catch (error) {
            console.error('Error creating pin:', error.response?.data || error.message);
            throw error;
        }
    }
}

module.exports = PinterestAPI;
