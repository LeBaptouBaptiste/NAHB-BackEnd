import { GameSession, IGameSession } from '../../models/GameSession';
import { Story } from '../../models/Story';
import { Page } from '../../models/Page';

describe('GameSession Model', () => {
    let testStory: any;
    let startPage: any;
    let endPage: any;

    beforeEach(async () => {
        testStory = await Story.create({
            title: 'Test Story',
            authorId: '1',
            status: 'published',
            stats: { views: 0, completions: 0, endings: {} },
        });

        startPage = await Page.create({
            storyId: testStory._id.toString(),
            content: 'Start page',
            isEnding: false,
            choices: [],
        });

        endPage = await Page.create({
            storyId: testStory._id.toString(),
            content: 'End page',
            isEnding: true,
            endingType: 'good_ending',
            choices: [],
        });

        // Link pages
        startPage.choices = [{ text: 'Continue', targetPageId: endPage._id.toString() }];
        await startPage.save();

        testStory.startPageId = startPage._id.toString();
        await testStory.save();
    });

    it('should create a game session', async () => {
        const session = await GameSession.create({
            userId: '1',
            storyId: testStory._id.toString(),
            currentPageId: startPage._id.toString(),
            history: [],
            status: 'in_progress',
        });

        expect(session.userId).toBe('1');
        expect(session.storyId).toBe(testStory._id.toString());
        expect(session.currentPageId).toBe(startPage._id.toString());
        expect(session.status).toBe('in_progress');
        expect(session.history).toEqual([]);
    });

    it('should track page history', async () => {
        const session = await GameSession.create({
            userId: '1',
            storyId: testStory._id.toString(),
            currentPageId: startPage._id.toString(),
            history: [],
            status: 'in_progress',
        });

        // Simulate making a choice
        session.history.push(session.currentPageId);
        session.currentPageId = endPage._id.toString();
        session.status = 'completed';
        await session.save();

        const updatedSession = await GameSession.findById(session._id);
        expect(updatedSession?.history.length).toBe(1);
        expect(updatedSession?.history[0]).toBe(startPage._id.toString());
        expect(updatedSession?.currentPageId).toBe(endPage._id.toString());
        expect(updatedSession?.status).toBe('completed');
    });

    it('should support preview mode', async () => {
        const previewSession = await GameSession.create({
            userId: '1',
            storyId: testStory._id.toString(),
            currentPageId: startPage._id.toString(),
            history: [],
            status: 'in_progress',
            isPreview: true,
        });

        expect(previewSession.isPreview).toBe(true);
    });

    it('should default isPreview to false', async () => {
        const session = await GameSession.create({
            userId: '1',
            storyId: testStory._id.toString(),
            currentPageId: startPage._id.toString(),
            history: [],
            status: 'in_progress',
        });

        expect(session.isPreview).toBe(false);
    });

    it('should only allow valid status values', async () => {
        const sessionData = {
            userId: '1',
            storyId: testStory._id.toString(),
            currentPageId: startPage._id.toString(),
            history: [],
            status: 'invalid_status',
        };

        await expect(GameSession.create(sessionData)).rejects.toThrow();
    });

    it('should store dice rolls', async () => {
        const session = await GameSession.create({
            userId: '1',
            storyId: testStory._id.toString(),
            currentPageId: startPage._id.toString(),
            history: [],
            status: 'in_progress',
            diceRolls: [15, 8, 20],
        });

        expect(session.diceRolls).toEqual([15, 8, 20]);
    });
});

