"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserStats = void 0;
const Story_1 = require("../models/mongoose/Story");
const GameSession_1 = require("../models/mongoose/GameSession");
const Rating_1 = require("../models/sequelize/Rating");
const Page_1 = require("../models/mongoose/Page");
// Get user statistics
const getUserStats = async (req, res) => {
    // @ts-ignore
    const userId = req.userId;
    try {
        // Stories Written
        const storiesWritten = await Story_1.Story.countDocuments({ authorId: userId.toString() });
        // Endings Unlocked (unique endings from completed sessions)
        const completedSessions = await GameSession_1.GameSession.find({
            userId: userId.toString(),
            status: 'completed',
            isPreview: { $ne: true },
        });
        const endingPageIds = new Set();
        for (const session of completedSessions) {
            const page = await Page_1.Page.findById(session.currentPageId);
            if (page && page.isEnding) {
                endingPageIds.add(session.currentPageId);
            }
        }
        const endingsUnlocked = endingPageIds.size;
        // Total Reads (game sessions started, excluding previews)
        const totalReads = await GameSession_1.GameSession.countDocuments({
            userId: userId.toString(),
            isPreview: { $ne: true },
        });
        // Average Rating (average of ratings given by user)
        const userRatings = await Rating_1.Rating.findAll({ where: { userId } });
        const averageRating = userRatings.length > 0
            ? userRatings.reduce((sum, r) => sum + r.value, 0) / userRatings.length
            : 0;
        res.json({
            storiesWritten,
            endingsUnlocked,
            totalReads,
            averageRating: Math.round(averageRating * 10) / 10,
        });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};
exports.getUserStats = getUserStats;
//# sourceMappingURL=userController.js.map