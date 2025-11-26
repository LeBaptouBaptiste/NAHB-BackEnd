import { Request, Response } from 'express';
import { Story } from '../models/mongoose/Story';
import { GameSession } from '../models/mongoose/GameSession';
import { Rating } from '../models/sequelize/Rating';
import { Page } from '../models/mongoose/Page';

// Get user statistics
export const getUserStats = async (req: Request, res: Response) => {
    // @ts-ignore
    const userId = (req as any).userId;

    try {
        // Stories Written
        const storiesWritten = await Story.countDocuments({ authorId: userId.toString() });

        // Endings Unlocked (unique endings from completed sessions)
        const completedSessions = await GameSession.find({
            userId: userId.toString(),
            status: 'completed',
            isPreview: { $ne: true },
        });

        const endingPageIds = new Set<string>();
        for (const session of completedSessions) {
            const page = await Page.findById(session.currentPageId);
            if (page && page.isEnding) {
                endingPageIds.add(session.currentPageId);
            }
        }
        const endingsUnlocked = endingPageIds.size;

        // Total Reads (game sessions started, excluding previews)
        const totalReads = await GameSession.countDocuments({
            userId: userId.toString(),
            isPreview: { $ne: true },
        });

        // Average Rating (average of ratings given by user)
        const userRatings = await Rating.findAll({ where: { userId } });
        const averageRating = userRatings.length > 0
            ? userRatings.reduce((sum, r) => sum + r.value, 0) / userRatings.length
            : 0;

        res.json({
            storiesWritten,
            endingsUnlocked,
            totalReads,
            averageRating: Math.round(averageRating * 10) / 10,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

