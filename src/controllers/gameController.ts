import { Request, Response } from 'express';
import * as gameService from '../services/gameService';

// Start a new game session
export const startGame = async (req: Request, res: Response) => {
    // @ts-ignore
    const userId = (req as any).userId;
    const { storyId, preview } = req.body;
    try {
        const session = await gameService.startGame(userId, storyId, preview);
        res.status(201).json(session);
    } catch (err: any) {
        if (err.message === 'Story not found') return res.status(404).json({ message: err.message });
        if (err.message === 'Story has no start page') return res.status(400).json({ message: err.message });
        if (err.message === 'Only the author can preview this story') return res.status(403).json({ message: err.message });
        if (err.message === 'Story is not published') return res.status(400).json({ message: err.message });

        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

// Make a choice and advance the game
export const makeChoice = async (req: Request, res: Response) => {
    // @ts-ignore
    const userId = (req as any).userId;
    const { sessionId, choiceIndex, hotspotIndex, diceRollSuccess } = req.body;
    try {
        const session = await gameService.makeChoice(userId, sessionId, choiceIndex, hotspotIndex, diceRollSuccess);
        res.json(session);
    } catch (err: any) {
        if (err.message === 'Session not found') return res.status(404).json({ message: err.message });
        if (err.message === 'Not your session') return res.status(403).json({ message: err.message });
        if (err.message === 'Current page not found') return res.status(404).json({ message: err.message });
        if (err.message === 'Invalid hotspot index' || err.message === 'Invalid choice index' || err.message === 'Target page not available') {
            return res.status(400).json({ message: err.message });
        }

        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

export const getSessions = async (req: Request, res: Response) => {
    // @ts-ignore
    const userId = (req as any).userId;
    try {
        const sessions = await gameService.getSessions(userId);
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
        const session = await gameService.getSession(userId, id);
        res.json(session);
    } catch (err: any) {
        if (err.message === 'Session not found') return res.status(404).json({ message: err.message });
        if (err.message === 'Not your session') return res.status(403).json({ message: err.message });

        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get path statistics for a completed session
export const getPathStats = async (req: Request, res: Response) => {
	const { sessionId } = req.params;
	// @ts-ignore
	const userId = (req as any).userId;

    try {
        const stats = await gameService.getPathStats(userId, sessionId);
        res.json(stats);
    } catch (err: any) {
        if (err.message === 'Session not found') return res.status(404).json({ message: err.message });
        if (err.message === 'Not your session') return res.status(403).json({ message: err.message });

        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get story statistics (for author dashboard)
export const getStoryStats = async (req: Request, res: Response) => {
	const { storyId } = req.params;
	// @ts-ignore
	const userId = (req as any).userId;

    try {
        const stats = await gameService.getStoryStats(userId, storyId);
        res.json(stats);
    } catch (err: any) {
        if (err.message === 'Story not found') return res.status(404).json({ message: err.message });
        if (err.message === 'Not authorized') return res.status(403).json({ message: err.message });

        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};
