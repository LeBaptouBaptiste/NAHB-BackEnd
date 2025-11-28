import * as ratingRepository from '../repositories/ratingRepository';
import * as storyRepository from '../repositories/storyRepository';

export const rateStory = async (userId: number, storyId: string, score: number, comment: string) => {
    if (!score || score < 1 || score > 5) {
        throw new Error('Score must be between 1 and 5');
    }

    const story = await storyRepository.findById(storyId);
    if (!story) {
        throw new Error('Story not found');
    }
    if (story.status !== 'published') {
        throw new Error('Cannot rate unpublished stories');
    }

    const existingRating = await ratingRepository.findOne({ storyId, userId });

    if (existingRating) {
        return await ratingRepository.update(existingRating, { value: score, comment });
    } else {
        return await ratingRepository.create({
            storyId,
            userId,
            value: score,
            comment
        });
    }
};

export const getStoryRatings = async (storyId: string, page: number = 1, limit: number = 10) => {
    const offset = (page - 1) * limit;

    const { count, rows: ratings } = await ratingRepository.findAndCountAll({
        where: { storyId },
        order: [['createdAt', 'DESC']],
        limit,
        offset
    });

    const stats = await ratingRepository.getAverageStats(storyId);

    return {
        ratings,
        pagination: {
            page,
            limit,
            total: count,
            pages: Math.ceil(count / limit),
        },
        stats: {
            averageScore: stats ? Math.round(Number(stats.averageScore) * 10) / 10 : 0,
            totalRatings: stats ? Number(stats.totalRatings) : 0,
        },
    };
};

export const getUserRating = async (userId: number, storyId: string) => {
    return await ratingRepository.findOne({ storyId, userId });
};

export const deleteRating = async (userId: number, storyId: string) => {
    const result = await ratingRepository.destroy({ storyId, userId });
    if (!result) {
        throw new Error('Rating not found');
    }
    return { message: 'Rating deleted' };
};
