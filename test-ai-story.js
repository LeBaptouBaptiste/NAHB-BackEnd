// Test script for AI story generation
const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api/ai';

async function testHealthCheck() {
    console.log('\n📊 Testing AI Health Check...');
    try {
        const response = await axios.get(`${BASE_URL}/health`);
        console.log('✅ Health Check Response:', JSON.stringify(response.data, null, 2));
        return true;
    } catch (error) {
        console.error('❌ Health Check Failed:', error.message);
        return false;
    }
}

async function testStoryGeneration() {
    console.log('\n📖 Testing Story Generation...');
    console.log('This may take 30-60 seconds...\n');

    const testRequest = {
        userPrompt: "Crée une courte histoire de fantasy avec un dragon dans un château",
        theme: "fantasy",
        numPages: 5,
        language: "fr"
    };

    try {
        const startTime = Date.now();
        const response = await axios.post(`${BASE_URL}/generate-story`, testRequest, {
            timeout: 120000 // 2 minutes
        });
        const duration = ((Date.now() - startTime) / 1000).toFixed(1);

        console.log(`✅ Story Generated in ${duration}s`);
        console.log('Response:', JSON.stringify(response.data, null, 2));

        if (response.data.data && response.data.data.storyId) {
            console.log(`\n🎉 Story ID: ${response.data.data.storyId}`);
            console.log(`📚 Title: ${response.data.data.title}`);
            console.log(`📝 Description: ${response.data.data.description}`);
        }

        return true;
    } catch (error) {
        console.error('❌ Story Generation Failed:', error.response?.data || error.message);
        return false;
    }
}

async function testSuggestChoices() {
    console.log('\n🎲 Testing Choice Suggestions...');

    const testRequest = {
        pageContent: "Tu te trouves devant une porte mystérieuse dans le château hanté.",
        storyContext: "Histoire de fantasy dans un château hanté",
        numChoices: 3
    };

    try {
        const response = await axios.post(`${BASE_URL}/suggest-choices`, testRequest, {
            timeout: 30000
        });
        console.log('✅ Choices Suggested');
        console.log('Response:', JSON.stringify(response.data, null, 2));
        return true;
    } catch (error) {
        console.error('❌ Choice Suggestion Failed:', error.response?.data || error.message);
        return false;
    }
}

async function runAllTests() {
    console.log('🚀 Starting AI Story Generation Tests\n');
    console.log('='.repeat(50));

    const healthOk = await testHealthCheck();
    if (!healthOk) {
        console.log('\n❌ Backend is not running. Start with: npm run dev');
        return;
    }

    console.log('\n' + '='.repeat(50));
    await testStoryGeneration();

    console.log('\n' + '='.repeat(50));
    await testSuggestChoices();

    console.log('\n' + '='.repeat(50));
    console.log('\n✨ All tests completed!\n');
}

runAllTests().catch(console.error);
