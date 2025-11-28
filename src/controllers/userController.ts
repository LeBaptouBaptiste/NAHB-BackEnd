import { Request, Response } from 'express';
import * as userService from '../services/userService';

// Get user statistics
export const getUserStats = async (req: Request, res: Response) => {
	// @ts-ignore
	const userId = (req as any).userId;

    try {
        const stats = await userService.getUserStats(userId);
        res.json(stats);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};
