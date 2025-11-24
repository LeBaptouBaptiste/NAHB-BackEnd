"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPublishedStories = exports.deleteStory = exports.updateStory = exports.getStory = exports.getMyStories = exports.createStory = void 0;
const Story_1 = require("../models/Story");
const User_1 = __importDefault(require("../models/User"));
// Helper to ensure the requesting user is the author
const isAuthor = async (userId, authorId) => {
    const user = await User_1.default.findByPk(userId);
    return user && user.id.toString() === authorId;
};
const createStory = async (req, res) => {
    // @ts-ignore - userId injected by auth middleware
    const userId = req.userId;
    const { title, description, tags, theme } = req.body;
    try {
        const story = await Story_1.Story.create({
            title,
            description,
            tags,
            theme,
            authorId: userId.toString(),
            status: 'draft',
            stats: { views: 0, completions: 0, endings: {} },
        });
        res.status(201).json(story);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};
exports.createStory = createStory;
const getMyStories = async (req, res) => {
    // @ts-ignore
    const userId = req.userId;
    try {
        const stories = await Story_1.Story.find({ authorId: userId.toString() });
        res.json(stories);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};
exports.getMyStories = getMyStories;
const getStory = async (req, res) => {
    const { id } = req.params;
    try {
        const story = await Story_1.Story.findById(id);
        if (!story)
            return res.status(404).json({ message: 'Story not found' });
        res.json(story);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};
exports.getStory = getStory;
const updateStory = async (req, res) => {
    // @ts-ignore
    const userId = req.userId;
    const { id } = req.params;
    const { title, description, tags, status, theme } = req.body;
    try {
        const story = await Story_1.Story.findById(id);
        if (!story)
            return res.status(404).json({ message: 'Story not found' });
        if (!(await isAuthor(userId, story.authorId))) {
            return res.status(403).json({ message: 'Not authorized' });
        }
        if (title)
            story.title = title;
        if (description)
            story.description = description;
        if (tags)
            story.tags = tags;
        if (status)
            story.status = status;
        if (theme)
            story.theme = theme;
        await story.save();
        res.json(story);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};
exports.updateStory = updateStory;
const deleteStory = async (req, res) => {
    // @ts-ignore
    const userId = req.userId;
    const { id } = req.params;
    try {
        const story = await Story_1.Story.findById(id);
        if (!story)
            return res.status(404).json({ message: 'Story not found' });
        if (!(await isAuthor(userId, story.authorId))) {
            return res.status(403).json({ message: 'Not authorized' });
        }
        await story.deleteOne();
        res.json({ message: 'Story deleted' });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};
exports.deleteStory = deleteStory;
const getPublishedStories = async (req, res) => {
    const { search } = req.query;
    try {
        const filter = { status: 'published' };
        if (search) {
            filter.title = { $regex: search, $options: 'i' };
        }
        const stories = await Story_1.Story.find(filter);
        res.json(stories);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};
exports.getPublishedStories = getPublishedStories;
//# sourceMappingURL=storyController.js.map