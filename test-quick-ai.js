// Quick test with optimized prompts
const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api/ai';

async function quickTest() {
    console.log('🧪 Quick AI Test with Optimized Prompts\n');

    const testRequest = {
        userPrompt: "Un guerrier explore un château hanté",
        theme: "fantasy",
        numPages: 5,
        language: "fr"
    };

    try {
        console.log('🎲 Generating story (this should take 20-40 seconds)...\n');
        const startTime = Date.now();

        const response = await axios.post(`${BASE_URL}/generate-story`, testRequest, {
            timeout: 180000 // 3 minutes
        });

        const duration = ((Date.now() - startTime) / 1000).toFixed(1);

        console.log(`✅ Success in ${duration}s!`);
        console.log('\n📊 Response:');
        console.log(JSON.stringify(response.data, null, 2));

    } catch (error) {
        console.error('\n❌ Error:', error.response?.data || error.message);
        process.exit(1);
    }
}

quickTest();
