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
            const response = await axios.get(`${this.baseUrl}/boards?page_size=100`, {
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

    async createBoard(name, description = '') {
        try {
            const response = await axios.post(`${this.baseUrl}/boards`, {
                name: name,
                description: description,
                privacy: 'PUBLIC'
            }, {
                headers: {
                    'Authorization': `Bearer ${this.accessToken}`,
                    'Content-Type': 'application/json'
                }
            });
            return response.data;
        } catch (error) {
            console.error(`Error creating board ${name}:`, error.response?.data || error.message);
            throw error;
        }
    }

    async createPin(boardId, title, description, imageUrl, link, altText = '') {
        try {
            const pinData = {
                board_id: boardId,
                title: title,
                description: description,
                link: link,
                media_source: {
                    source_type: 'image_url',
                    url: imageUrl
                }
            };
            if (altText) pinData.alt_text = altText;
            const response = await axios.post(`${this.baseUrl}/pins`, pinData, {
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

    async getAllPins() {
        try {
            let allPins = [];
            let bookmark = null;
            let pageCount = 0;
            const pageSize = 100;

            while (true) {
                pageCount++;
                const params = { page_size: pageSize };
                if (bookmark) params.bookmark = bookmark;

                const response = await axios.get(`${this.baseUrl}/me/pins`, {
                    headers: {
                        'Authorization': `Bearer ${this.accessToken}`,
                        'Content-Type': 'application/json'
                    },
                    params: params
                });

                if (response.data.items) {
                    allPins = allPins.concat(response.data.items);
                }

                // Check if there are more pages
                if (!response.data.bookmark) break;
                bookmark = response.data.bookmark;
            }

            console.log(`Fetched ${allPins.length} pins in ${pageCount} page(s)`);
            return allPins;
        } catch (error) {
            console.error('Error fetching all pins:', error.response?.data || error.message);
            throw error;
        }
    }

    async updatePin(pinId, title, description, altText = '') {
        try {
            const updateData = {
                title: title,
                description: description
            };
            if (altText) updateData.alt_text = altText;

            const response = await axios.patch(`${this.baseUrl}/pins/${pinId}`, updateData, {
                headers: {
                    'Authorization': `Bearer ${this.accessToken}`,
                    'Content-Type': 'application/json'
                }
            });
            return response.data;
        } catch (error) {
            console.error(`Error updating pin ${pinId}:`, error.response?.data || error.message);
            throw error;
        }
    }

    async deletePin(pinId) {
        try {
            const response = await axios.delete(`${this.baseUrl}/pins/${pinId}`, {
                headers: {
                    'Authorization': `Bearer ${this.accessToken}`,
                    'Content-Type': 'application/json'
                }
            });
            return response.data;
        } catch (error) {
            console.error(`Error deleting pin ${pinId}:`, error.response?.data || error.message);
            throw error;
        }
    }
}

module.exports = PinterestAPI;
