"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFavorites = exports.checkFavorite = exports.toggleFavorite = void 0;
const Favorite_1 = require("../models/mongoose/Favorite");
const Story_1 = require("../models/mongoose/Story");
// Toggle favorite status
const toggleFavorite = async (req, res) => {
    // @ts-ignore
    const userId = req.userId;
    const { storyId } = req.params;
    try {
        const story = await Story_1.Story.findById(storyId);
        if (!story) {
            return res.status(404).json({ message: 'Story not found' });
        }
        const existing = await Favorite_1.Favorite.findOne({ userId: userId.toString(), storyId });
        if (existing) {
            await Favorite_1.Favorite.deleteOne({ _id: existing._id });
            res.json({ favorited: false });
        }
        else {
            await Favorite_1.Favorite.create({
                userId: userId.toString(),
                storyId,
            });
            res.json({ favorited: true });
        }
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};
exports.toggleFavorite = toggleFavorite;
// Check if story is favorited by user
const checkFavorite = async (req, res) => {
    // @ts-ignore
    const userId = req.userId;
    const { storyId } = req.params;
    try {
        const favorite = await Favorite_1.Favorite.findOne({ userId: userId.toString(), storyId });
        res.json({ favorited: !!favorite });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};
exports.checkFavorite = checkFavorite;
// Get user's favorite stories
const getFavorites = async (req, res) => {
    // @ts-ignore
    const userId = req.userId;
    try {
        const favorites = await Favorite_1.Favorite.find({ userId: userId.toString() });
        const storyIds = favorites.map(f => f.storyId);
        const stories = await Story_1.Story.find({ _id: { $in: storyIds } });
        res.json(stories);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};
exports.getFavorites = getFavorites;
//# sourceMappingURL=favoriteController.js.map