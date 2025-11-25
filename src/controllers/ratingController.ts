import { Request, Response } from 'express';
import { Rating } from '../models/mongoose/Rating';
import { Story } from '../models/mongoose/Story';

// Add or update a rating for a story
export const rateStory = async (req: Request, res: Response) => {
    // @ts-ignore
    const userId = (req as any).userId;
    const { storyId } = req.params;
    const { score, comment } = req.body;

    if (!score || score < 1 || score > 5) {
        return res.status(400).json({ message: 'Score must be between 1 and 5' });
    }

    try {
        // Check if story exists and is published
        const story = await Story.findById(storyId);
        if (!story) {
            return res.status(404).json({ message: 'Story not found' });
        }
        if (story.status !== 'published') {
            return res.status(400).json({ message: 'Cannot rate unpublished stories' });
        }

        // Upsert rating (create or update)
        const rating = await Rating.findOneAndUpdate(
            { storyId, userId: userId.toString() },
            { score, comment },
            { upsert: true, new: true, runValidators: true }
        );

        res.json(rating);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get ratings for a story
export const getStoryRatings = async (req: Request, res: Response) => {
    const { storyId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    try {
        const skip = (Number(page) - 1) * Number(limit);

        const ratings = await Rating.find({ storyId })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(Number(limit));

        const total = await Rating.countDocuments({ storyId });

        // Calculate average
        const aggregation = await Rating.aggregate([
            { $match: { storyId } },
            {
                $group: {
                    _id: null,
                    averageScore: { $avg: '$score' },
                    totalRatings: { $sum: 1 },
                },
            },
        ]);

        const stats = aggregation[0] || { averageScore: 0, totalRatings: 0 };

        res.json({
            ratings,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total,
                pages: Math.ceil(total / Number(limit)),
            },
            stats: {
                averageScore: Math.round(stats.averageScore * 10) / 10,
                totalRatings: stats.totalRatings,
            },
        });
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
        const rating = await Rating.findOne({ storyId, userId: userId.toString() });
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
        const result = await Rating.findOneAndDelete({ storyId, userId: userId.toString() });
        if (!result) {
            return res.status(404).json({ message: 'Rating not found' });
        }
        res.json({ message: 'Rating deleted' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

