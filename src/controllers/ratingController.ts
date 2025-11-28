import { Request, Response } from 'express';
import * as ratingService from '../services/ratingService';

// Add or update a rating for a story
export const rateStory = async (req: Request, res: Response) => {
	// @ts-ignore
	const userId = (req as any).userId;
	const { storyId } = req.params;
	const { score, comment } = req.body;

    try {
        const rating = await ratingService.rateStory(userId, storyId, score, comment);
        res.json(rating);
    } catch (err: any) {
        if (err.message === 'Score must be between 1 and 5' || err.message === 'Cannot rate unpublished stories') {
            return res.status(400).json({ message: err.message });
        }
        if (err.message === 'Story not found') {
            return res.status(404).json({ message: err.message });
        }
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get ratings for a story
export const getStoryRatings = async (req: Request, res: Response) => {
	const { storyId } = req.params;
	const { page = 1, limit = 10 } = req.query;

    try {
        const result = await ratingService.getStoryRatings(storyId, Number(page), Number(limit));
        res.json(result);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get user's rating for a story
export const getUserRating = async (req: Request, res: Response) => {
	// @ts-ignore
	const userId = (req as any).userId;
	const { storyId } = req.params;

    try {
        const rating = await ratingService.getUserRating(userId, storyId);
        res.json(rating || null);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

// Delete user's rating
export const deleteRating = async (req: Request, res: Response) => {
	// @ts-ignore
	const userId = (req as any).userId;
	const { storyId } = req.params;

    try {
        const result = await ratingService.deleteRating(userId, storyId);
        res.json(result);
    } catch (err: any) {
        if (err.message === 'Rating not found') {
            return res.status(404).json({ message: err.message });
        }
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};
