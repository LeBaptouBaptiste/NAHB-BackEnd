// Inspect specific story
const axios = require('axios');
const STORY_ID = '692579ba762bdc8c36f2892d';

async function inspect() {
    const pages = (await axios.get(`http://localhost:5000/api/pages/story/${STORY_ID}`)).data;

    console.log(`\n📖 Story ${STORY_ID}:`);
    console.log(`Total Pages: ${pages.length}\n`);

    pages.forEach((p, i) => {
        console.log(`\n📄 Page ${i + 1}:`);
        console.log(`Content (first 100 chars): ${p.content.substring(0, 100)}...`);
        console.log(`Choices: ${p.choices.length}`);
        p.choices.forEach((c, j) => console.log(`  ${j + 1}. ${c.text}`));
        console.log(`Is Ending: ${p.isEnding}`);
    });
}

inspect();
