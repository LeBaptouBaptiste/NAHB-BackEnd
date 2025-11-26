"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setStartPage = exports.deletePage = exports.updatePage = exports.getPage = exports.getPagesByStory = exports.createPage = void 0;
const Page_1 = require("../models/mongoose/Page");
const Story_1 = require("../models/mongoose/Story");
const User_1 = __importDefault(require("../models/sequelize/User"));
// Helper to verify author ownership
const isAuthor = async (userId, authorId) => {
    const user = await User_1.default.findByPk(userId);
    return user && user.id.toString() === authorId;
};
const createPage = async (req, res) => {
    // @ts-ignore
    const userId = req.userId;
    const { storyId, content, image, isEnding, endingType, choices } = req.body;
    try {
        const story = await Story_1.Story.findById(storyId);
        if (!story)
            return res.status(404).json({ message: 'Story not found' });
        if (!(await isAuthor(userId, story.authorId))) {
            return res.status(403).json({ message: 'Not authorized' });
        }
        const page = await Page_1.Page.create({
            storyId,
            content,
            image,
            isEnding: !!isEnding,
            endingType,
            choices,
        });
        // If this is the first page and story doesn't have a startPageId, set it automatically
        if (!story.startPageId) {
            const pageCount = await Page_1.Page.countDocuments({ storyId });
            if (pageCount === 1) {
                story.startPageId = page._id.toString();
                await story.save();
            }
        }
        res.status(201).json(page);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};
exports.createPage = createPage;
const getPagesByStory = async (req, res) => {
    const { storyId } = req.params;
    try {
        const pages = await Page_1.Page.find({ storyId });
        res.json(pages);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};
exports.getPagesByStory = getPagesByStory;
const getPage = async (req, res) => {
    const { id } = req.params;
    try {
        const page = await Page_1.Page.findById(id);
        if (!page)
            return res.status(404).json({ message: 'Page not found' });
        res.json(page);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};
exports.getPage = getPage;
const updatePage = async (req, res) => {
    // @ts-ignore
    const userId = req.userId;
    const { id } = req.params;
    const { content, image, isEnding, endingType, choices } = req.body;
    try {
        const page = await Page_1.Page.findById(id);
        if (!page)
            return res.status(404).json({ message: 'Page not found' });
        const story = await Story_1.Story.findById(page.storyId);
        if (!story)
            return res.status(404).json({ message: 'Parent story not found' });
        if (!(await isAuthor(userId, story.authorId))) {
            return res.status(403).json({ message: 'Not authorized' });
        }
        if (content !== undefined)
            page.content = content;
        if (image !== undefined)
            page.image = image;
        if (isEnding !== undefined)
            page.isEnding = !!isEnding;
        if (endingType !== undefined)
            page.endingType = endingType;
        if (choices !== undefined)
            page.choices = choices;
        await page.save();
        res.json(page);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};
exports.updatePage = updatePage;
const deletePage = async (req, res) => {
    // @ts-ignore
    const userId = req.userId;
    const { id } = req.params;
    try {
        const page = await Page_1.Page.findById(id);
        if (!page)
            return res.status(404).json({ message: 'Page not found' });
        const story = await Story_1.Story.findById(page.storyId);
        if (!story)
            return res.status(404).json({ message: 'Parent story not found' });
        if (!(await isAuthor(userId, story.authorId))) {
            return res.status(403).json({ message: 'Not authorized' });
        }
        await page.deleteOne();
        res.json({ message: 'Page deleted' });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};
exports.deletePage = deletePage;
const setStartPage = async (req, res) => {
    // @ts-ignore
    const userId = req.userId;
    const { storyId, startPageId } = req.body;
    try {
        const story = await Story_1.Story.findById(storyId);
        if (!story)
            return res.status(404).json({ message: 'Story not found' });
        if (!(await isAuthor(userId, story.authorId))) {
            return res.status(403).json({ message: 'Not authorized' });
        }
        story.startPageId = startPageId;
        await story.save();
        res.json(story);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};
exports.setStartPage = setStartPage;
//# sourceMappingURL=pageController.js.map