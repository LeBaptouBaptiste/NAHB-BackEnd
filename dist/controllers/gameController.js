"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getStoryStats = exports.getPathStats = exports.getSession = exports.getSessions = exports.makeChoice = exports.startGame = void 0;
const GameSession_1 = require("../models/mongoose/GameSession");
const Story_1 = require("../models/mongoose/Story");
const Page_1 = require("../models/mongoose/Page");
// Start a new game session
const startGame = async (req, res) => {
    // @ts-ignore
    const userId = req.userId;
    const { storyId, preview } = req.body;
    try {
        const story = await Story_1.Story.findById(storyId);
        if (!story)
            return res.status(404).json({ message: 'Story not found' });
        if (!story.startPageId)
            return res.status(400).json({ message: 'Story has no start page' });
        // Preview mode: only the author can preview their own story
        const isPreview = preview === true;
        if (isPreview) {
            if (story.authorId !== userId.toString()) {
                return res.status(403).json({ message: 'Only the author can preview this story' });
            }
        }
        else {
            // Normal mode: story must be published
            if (story.status !== 'published') {
                return res.status(400).json({ message: 'Story is not published' });
            }
        }
        const session = await GameSession_1.GameSession.create({
            userId: userId.toString(),
            storyId,
            currentPageId: story.startPageId,
            history: [],
            status: 'in_progress',
            isPreview: isPreview, // Mark as preview session
        });
        // Only increment view count if not in preview mode
        if (!isPreview) {
            story.stats.views += 1;
            await story.save();
        }
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
        if (!nextPageId) {
            return res.status(400).json({ message: 'Choice target not available' });
        }
        // Update session history
        session.history.push(session.currentPageId);
        session.currentPageId = nextPageId;
        // Check if next page is an ending
        const nextPage = await Page_1.Page.findById(nextPageId);
        if (nextPage && nextPage.isEnding) {
            session.status = 'completed';
            // Update story completion stats (only if not preview mode)
            // @ts-ignore
            if (!session.isPreview) {
                const story = await Story_1.Story.findById(session.storyId);
                if (story) {
                    story.stats.completions += 1;
                    const endingKey = nextPage.endingType || 'default';
                    story.stats.endings[endingKey] = (story.stats.endings[endingKey] || 0) + 1;
                    await story.save();
                }
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
// Get path statistics for a completed session
const getPathStats = async (req, res) => {
    const { sessionId } = req.params;
    // @ts-ignore
    const userId = req.userId;
    try {
        const session = await GameSession_1.GameSession.findById(sessionId);
        if (!session)
            return res.status(404).json({ message: 'Session not found' });
        if (session.userId !== userId.toString()) {
            return res.status(403).json({ message: 'Not your session' });
        }
        // Get the full path including current page
        const fullPath = [...session.history, session.currentPageId];
        const pathString = fullPath.join('->');
        // Get all completed sessions for this story (excluding previews)
        const allSessions = await GameSession_1.GameSession.find({
            storyId: session.storyId,
            status: 'completed',
            isPreview: { $ne: true },
        });
        const totalCompletedSessions = allSessions.length;
        // Count sessions with the exact same path
        let samePathCount = 0;
        for (const s of allSessions) {
            const sPath = [...s.history, s.currentPageId].join('->');
            if (sPath === pathString) {
                samePathCount++;
            }
        }
        // Calculate percentage
        const samePathPercentage = totalCompletedSessions > 0
            ? Math.round((samePathCount / totalCompletedSessions) * 100)
            : 0;
        // Get ending distribution
        const endingDistribution = {};
        const endingCounts = {};
        for (const s of allSessions) {
            const endingPage = await Page_1.Page.findById(s.currentPageId);
            if (endingPage && endingPage.isEnding) {
                const endingType = endingPage.endingType || 'default';
                endingCounts[endingType] = (endingCounts[endingType] || 0) + 1;
            }
        }
        for (const [ending, count] of Object.entries(endingCounts)) {
            endingDistribution[ending] = {
                count,
                percentage: Math.round((count / totalCompletedSessions) * 100),
            };
        }
        // Get current ending info
        const currentEndingPage = await Page_1.Page.findById(session.currentPageId);
        const currentEnding = currentEndingPage?.isEnding
            ? {
                type: currentEndingPage.endingType || 'default',
                reachedByPercentage: endingDistribution[currentEndingPage.endingType || 'default']?.percentage || 0,
            }
            : null;
        res.json({
            sessionId: session._id,
            storyId: session.storyId,
            pathLength: fullPath.length,
            samePathStats: {
                count: samePathCount,
                percentage: samePathPercentage,
                message: `${samePathPercentage}% of players took the same path as you`,
            },
            totalCompletedSessions,
            endingDistribution,
            currentEnding,
        });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};
exports.getPathStats = getPathStats;
// Get story statistics (for author dashboard)
const getStoryStats = async (req, res) => {
    const { storyId } = req.params;
    // @ts-ignore
    const userId = req.userId;
    try {
        const story = await Story_1.Story.findById(storyId);
        if (!story)
            return res.status(404).json({ message: 'Story not found' });
        // Only author can see detailed stats
        if (story.authorId !== userId.toString()) {
            return res.status(403).json({ message: 'Not authorized' });
        }
        // Get all sessions for this story (excluding previews)
        const allSessions = await GameSession_1.GameSession.find({
            storyId,
            isPreview: { $ne: true },
        });
        const completedSessions = allSessions.filter(s => s.status === 'completed');
        const abandonedSessions = allSessions.filter(s => s.status === 'abandoned');
        const inProgressSessions = allSessions.filter(s => s.status === 'in_progress');
        // Calculate average path length
        const avgPathLength = completedSessions.length > 0
            ? completedSessions.reduce((sum, s) => sum + s.history.length + 1, 0) / completedSessions.length
            : 0;
        // Get ending distribution
        const endingDistribution = {};
        for (const s of completedSessions) {
            const endingPage = await Page_1.Page.findById(s.currentPageId);
            if (endingPage && endingPage.isEnding) {
                const endingType = endingPage.endingType || 'default';
                endingDistribution[endingType] = (endingDistribution[endingType] || 0) + 1;
            }
        }
        // Calculate completion rate
        const completionRate = allSessions.length > 0
            ? Math.round((completedSessions.length / allSessions.length) * 100)
            : 0;
        res.json({
            storyId,
            views: story.stats.views,
            totalSessions: allSessions.length,
            completedSessions: completedSessions.length,
            abandonedSessions: abandonedSessions.length,
            inProgressSessions: inProgressSessions.length,
            completionRate,
            averagePathLength: Math.round(avgPathLength * 10) / 10,
            endingDistribution,
        });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};
exports.getStoryStats = getStoryStats;
//# sourceMappingURL=gameController.js.map