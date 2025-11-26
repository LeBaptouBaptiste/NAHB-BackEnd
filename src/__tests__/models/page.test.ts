import { Page, IPage } from '../../models/mongoose/Page';
import { Story } from '../../models/mongoose/Story';

describe('Page Model', () => {
    let testStory: any;

    beforeEach(async () => {
        testStory = await Story.create({
            title: 'Test Story',
            authorId: '1',
            status: 'draft',
            stats: { views: 0, completions: 0, endings: {} },
        });
    });

    it('should create a page with required fields', async () => {
        const pageData = {
            storyId: testStory._id.toString(),
            content: 'This is the first page of the story.',
            isEnding: false,
            choices: [],
        };

        const page = await Page.create(pageData);

        expect(page.storyId).toBe(testStory._id.toString());
        expect(page.content).toBe('This is the first page of the story.');
        expect(page.isEnding).toBe(false);
        expect(page.choices).toEqual([]);
    });

    it('should create a page with choices', async () => {
        const page1 = await Page.create({
            storyId: testStory._id.toString(),
            content: 'First page',
            isEnding: false,
            choices: [],
        });

        const page2 = await Page.create({
            storyId: testStory._id.toString(),
            content: 'Second page',
            isEnding: true,
            endingType: 'good_ending',
            choices: [],
        });

        // Update page1 with choices pointing to page2
        page1.choices = [
            { text: 'Go to next page', targetPageId: page2._id.toString() },
        ];
        await page1.save();

        const updatedPage1 = await Page.findById(page1._id);
        expect(updatedPage1?.choices.length).toBe(1);
        expect(updatedPage1?.choices[0].text).toBe('Go to next page');
        expect(updatedPage1?.choices[0].targetPageId).toBe(page2._id.toString());
    });

    it('should create an ending page with endingType', async () => {
        const endingPage = await Page.create({
            storyId: testStory._id.toString(),
            content: 'You have reached the end!',
            isEnding: true,
            endingType: 'victory',
            choices: [],
        });

        expect(endingPage.isEnding).toBe(true);
        expect(endingPage.endingType).toBe('victory');
    });

    it('should support image field', async () => {
        const pageWithImage = await Page.create({
            storyId: testStory._id.toString(),
            content: 'A page with an image',
            isEnding: false,
            image: '/images/scene1.png',
            choices: [],
        });

        expect(pageWithImage.image).toBe('/images/scene1.png');
    });

    it('should require storyId and content', async () => {
        const invalidPage = {
            isEnding: false,
        };

        await expect(Page.create(invalidPage)).rejects.toThrow();
    });
});

