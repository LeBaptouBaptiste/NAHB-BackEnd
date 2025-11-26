"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Story_1 = require("../../models/mongoose/Story");
describe('Story Model', () => {
    it('should create a story with required fields', async () => {
        const storyData = {
            title: 'Test Story',
            description: 'A test story description',
            authorId: '1',
            tags: ['fantasy', 'adventure'],
            status: 'draft',
            stats: { views: 0, completions: 0, endings: {} },
        };
        const story = await Story_1.Story.create(storyData);
        expect(story.title).toBe('Test Story');
        expect(story.description).toBe('A test story description');
        expect(story.authorId).toBe('1');
        expect(story.status).toBe('draft');
        expect(story.tags).toEqual(['fantasy', 'adventure']);
        expect(story.stats.views).toBe(0);
    });
    it('should require title and authorId', async () => {
        const invalidStory = {
            description: 'No title or author',
        };
        await expect(Story_1.Story.create(invalidStory)).rejects.toThrow();
    });
    it('should default status to draft', async () => {
        const storyData = {
            title: 'Draft Story',
            authorId: '1',
        };
        const story = await Story_1.Story.create(storyData);
        expect(story.status).toBe('draft');
    });
    it('should only allow valid status values', async () => {
        const storyData = {
            title: 'Invalid Status Story',
            authorId: '1',
            status: 'invalid_status',
        };
        await expect(Story_1.Story.create(storyData)).rejects.toThrow();
    });
    it('should update story stats correctly', async () => {
        const story = await Story_1.Story.create({
            title: 'Stats Story',
            authorId: '1',
            stats: { views: 0, completions: 0, endings: {} },
        });
        story.stats.views = 10;
        story.stats.completions = 5;
        story.stats.endings['good_ending'] = 3;
        story.stats.endings['bad_ending'] = 2;
        await story.save();
        const updatedStory = await Story_1.Story.findById(story._id);
        expect(updatedStory?.stats.views).toBe(10);
        expect(updatedStory?.stats.completions).toBe(5);
        expect(updatedStory?.stats.endings['good_ending']).toBe(3);
    });
});
//# sourceMappingURL=story.test.js.map