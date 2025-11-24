import { Request, Response } from 'express';
import { GameSession } from '../models/GameSession';
import { Story } from '../models/Story';
import { Page } from '../models/Page';
import User from '../models/User';
import { authenticate } from '../middleware/auth';

// Start a new game session
export const startGame = async (req: Request, res: Response) => {
    // @ts-ignore
    const userId = (req as any).userId;
    const { storyId } = req.body;
    try {
        const story = await Story.findById(storyId);
        if (!story) return res.status(404).json({ message: 'Story not found' });
        if (!story.startPageId) return res.status(400).json({ message: 'Story has no start page' });
        const session = await GameSession.create({
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
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

// Make a choice and advance the game
export const makeChoice = async (req: Request, res: Response) => {
    // @ts-ignore
    const userId = (req as any).userId;
    const { sessionId, choiceIndex } = req.body;
    try {
        const session = await GameSession.findById(sessionId);
        if (!session) return res.status(404).json({ message: 'Session not found' });
        if (session.userId !== userId.toString()) {
            return res.status(403).json({ message: 'Not your session' });
        }
        const page = await Page.findById(session.currentPageId);
        if (!page) return res.status(404).json({ message: 'Current page not found' });
        if (choiceIndex < 0 || choiceIndex >= page.choices.length) {
            return res.status(400).json({ message: 'Invalid choice index' });
        }
        const nextPageId = page.choices[choiceIndex].targetPageId;
        // Update session history
        session.history.push(session.currentPageId);
        session.currentPageId = nextPageId;
        // Check if next page is an ending
        const nextPage = await Page.findById(nextPageId);
        if (nextPage && nextPage.isEnding) {
            session.status = 'completed';
            // Update story completion stats
            const story = await Story.findById(session.storyId);
            if (story) {
                story.stats.completions += 1;
                const endingKey = nextPage.endingType || 'default';
                story.stats.endings[endingKey] = (story.stats.endings[endingKey] || 0) + 1;
                await story.save();
            }
        }
        await session.save();
        res.json(session);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

export const getSessions = async (req: Request, res: Response) => {
    // @ts-ignore
    const userId = (req as any).userId;
    try {
        const sessions = await GameSession.find({ userId: userId.toString() });
        res.json(sessions);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

export const getSession = async (req: Request, res: Response) => {
    const { id } = req.params;
    // @ts-ignore
    const userId = (req as any).userId;
    try {
        const session = await GameSession.findById(id);
        if (!session) return res.status(404).json({ message: 'Session not found' });
        if (session.userId !== userId.toString()) {
            return res.status(403).json({ message: 'Not your session' });
        }
        res.json(session);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};
