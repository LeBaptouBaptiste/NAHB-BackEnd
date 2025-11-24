"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSession = exports.getSessions = exports.makeChoice = exports.startGame = void 0;
const GameSession_1 = require("../models/GameSession");
const Story_1 = require("../models/Story");
const Page_1 = require("../models/Page");
// Start a new game session
const startGame = async (req, res) => {
    // @ts-ignore
    const userId = req.userId;
    const { storyId } = req.body;
    try {
        const story = await Story_1.Story.findById(storyId);
        if (!story)
            return res.status(404).json({ message: 'Story not found' });
        if (!story.startPageId)
            return res.status(400).json({ message: 'Story has no start page' });
        const session = await GameSession_1.GameSession.create({
            userId: userId.toString(),
            storyId,
            currentPageId: story.startPageId,
            history: [],
            status: 'in_progress',
        });
        // Increment view count
        story.stats.views += 1;
        await story.save();
        res.status(201).json(session);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};
exports.startGame = startGame;
// Make a choice and advance the game
const makeChoice = async (req, res) => {
    // @ts-ignore
    const userId = req.userId;
    const { sessionId, choiceIndex } = req.body;
    try {
        const session = await GameSession_1.GameSession.findById(sessionId);
        if (!session)
            return res.status(404).json({ message: 'Session not found' });
        if (session.userId !== userId.toString()) {
            return res.status(403).json({ message: 'Not your session' });
        }
        const page = await Page_1.Page.findById(session.currentPageId);
        if (!page)
            return res.status(404).json({ message: 'Current page not found' });
        if (choiceIndex < 0 || choiceIndex >= page.choices.length) {
            return res.status(400).json({ message: 'Invalid choice index' });
        }
        const nextPageId = page.choices[choiceIndex].targetPageId;
        // Update session history
        session.history.push(session.currentPageId);
        session.currentPageId = nextPageId;
        // Check if next page is an ending
        const nextPage = await Page_1.Page.findById(nextPageId);
        if (nextPage && nextPage.isEnding) {
            session.status = 'completed';
            // Update story completion stats
            const story = await Story_1.Story.findById(session.storyId);
            if (story) {
                story.stats.completions += 1;
                const endingKey = nextPage.endingType || 'default';
                story.stats.endings[endingKey] = (story.stats.endings[endingKey] || 0) + 1;
                await story.save();
            }
        }
        await session.save();
        res.json(session);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};
exports.makeChoice = makeChoice;
const getSessions = async (req, res) => {
    // @ts-ignore
    const userId = req.userId;
    try {
        const sessions = await GameSession_1.GameSession.find({ userId: userId.toString() });
        res.json(sessions);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};
exports.getSessions = getSessions;
const getSession = async (req, res) => {
    const { id } = req.params;
    // @ts-ignore
    const userId = req.userId;
    try {
        const session = await GameSession_1.GameSession.findById(id);
        if (!session)
            return res.status(404).json({ message: 'Session not found' });
        if (session.userId !== userId.toString()) {
            return res.status(403).json({ message: 'Not your session' });
        }
        res.json(session);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};
exports.getSession = getSession;
//# sourceMappingURL=gameController.js.map