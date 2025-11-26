"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteRating = exports.getUserRating = exports.getStoryRatings = exports.rateStory = void 0;
const Rating_1 = require("../models/sequelize/Rating");
const Story_1 = require("../models/mongoose/Story");
const mysql_1 = require("../config/mysql");
// Add or update a rating for a story
const rateStory = async (req, res) => {
    // @ts-ignore
    const userId = req.userId;
    const { storyId } = req.params;
    const { score, comment } = req.body;
    if (!score || score < 1 || score > 5) {
        return res.status(400).json({ message: 'Score must be between 1 and 5' });
    }
    try {
        // Check if story exists and is published
        const story = await Story_1.Story.findById(storyId);
        if (!story) {
            return res.status(404).json({ message: 'Story not found' });
        }
        if (story.status !== 'published') {
            return res.status(400).json({ message: 'Cannot rate unpublished stories' });
        }
        // Upsert rating (create or update)
        const existingRating = await Rating_1.Rating.findOne({
            where: { storyId, userId }
        });
        if (existingRating) {
            existingRating.value = score;
            existingRating.comment = comment;
            await existingRating.save();
            return res.json(existingRating);
        }
        else {
            const newRating = await Rating_1.Rating.create({
                storyId,
                userId,
                value: score,
                comment
            });
            return res.json(newRating);
        }
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};
exports.rateStory = rateStory;
// Get ratings for a story
const getStoryRatings = async (req, res) => {
    const { storyId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    try {
        const offset = (Number(page) - 1) * Number(limit);
        const { count, rows: ratings } = await Rating_1.Rating.findAndCountAll({
            where: { storyId },
            order: [['createdAt', 'DESC']],
            limit: Number(limit),
            offset
        });
        // Calculate average
        const stats = await Rating_1.Rating.findOne({
            where: { storyId },
            attributes: [
                [mysql_1.sequelize.fn('AVG', mysql_1.sequelize.col('value')), 'averageScore'],
                [mysql_1.sequelize.fn('COUNT', mysql_1.sequelize.col('id')), 'totalRatings']
            ],
            raw: true
        });
        res.json({
            ratings,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total: count,
                pages: Math.ceil(count / Number(limit)),
            },
            stats: {
                averageScore: stats ? Math.round(Number(stats.averageScore) * 10) / 10 : 0,
                totalRatings: stats ? Number(stats.totalRatings) : 0,
            },
        });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};
exports.getStoryRatings = getStoryRatings;
// Get user's rating for a story
const getUserRating = async (req, res) => {
    // @ts-ignore
    const userId = req.userId;
    const { storyId } = req.params;
    try {
        const rating = await Rating_1.Rating.findOne({ where: { storyId, userId } });
        res.json(rating || null);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};
exports.getUserRating = getUserRating;
// Delete user's rating
const deleteRating = async (req, res) => {
    // @ts-ignore
    const userId = req.userId;
    const { storyId } = req.params;
    try {
        const result = await Rating_1.Rating.destroy({ where: { storyId, userId } });
        if (!result) {
            return res.status(404).json({ message: 'Rating not found' });
        }
        res.json({ message: 'Rating deleted' });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};
exports.deleteRating = deleteRating;
//# sourceMappingURL=ratingController.js.map