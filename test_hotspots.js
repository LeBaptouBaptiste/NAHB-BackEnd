
const axios = require('axios');

async function checkPage() {
    try {
        // User provided page ID in logs: 6926fa61aacd2c800592e67a
        // But wait, that looks like a simplified ID or maybe a Mongo ID? Mongo IDs are usually 24 hex chars.
        // "6926fa61aacd2c800592e67a" is 24 chars.
        const pageId = '6926fa61aacd2c800592e67a';
        const response = await axios.get(`http://localhost:5000/api/pages/${pageId}`);
        console.log('Page Data:', JSON.stringify(response.data, null, 2));

        if (response.data.hotspots) {
            console.log('Hotspots found:', response.data.hotspots.length);
        } else {
            console.log('No hotspots field in response');
        }
    } catch (error) {
        console.error('Error fetching page:', error.message);
        if (error.response) {
            console.error('Response data:', error.response.data);
        }
    }
}

checkPage();
