// Fetch and display the generated story details
const axios = require('axios');

const STORY_ID = '692587cba9b72e74eeb112bc';
const BASE_URL = 'http://localhost:5000/api';

async function inspectStory() {
    console.log(`📖 Inspecting Story: ${STORY_ID}\n`);
    console.log('='.repeat(60));

    try {
        // Get story metadata
        const storyResponse = await axios.get(`${BASE_URL}/stories/${STORY_ID}`);
        const story = storyResponse.data;

        console.log('\n📚 STORY METADATA:');
        console.log(`Title: ${story.title}`);
        console.log(`Description: ${story.description}`);
        console.log(`Status: ${story.status}`);
        console.log(`Start Page ID: ${story.startPageId || 'Not set'}`);
        console.log(`Tags: ${story.tags?.join(', ') || 'None'}`);

        // Get pages
        if (story.startPageId) {
            console.log(`\n📄 PAGES:`);
            console.log('Fetching pages...');

            const pagesResponse = await axios.get(`${BASE_URL}/pages/story/${STORY_ID}`);
            const pages = pagesResponse.data;

            console.log(`\nTotal Pages: ${pages.length}`);

            pages.forEach((page, index) => {
                console.log(`\n--- Page ${index + 1} (ID: ${page._id}) ---`);
                console.log(`Content: ${page.content?.substring(0, 150)}...`);
                console.log(`Is Ending: ${page.isEnding}`);
                console.log(`Choices: ${page.choices?.length || 0}`);
                page.choices?.forEach((choice, i) => {
                    console.log(`  ${i + 1}. ${choice.text} → ${choice.targetPageId || 'TBD'}`);
                });
            });
        }

        console.log('\n' + '='.repeat(60));

    } catch (error) {
        console.error('\n❌ Error:', error.response?.data || error.message);
    }
}

inspectStory();
