import { Request, Response } from 'express';
import { Page, IPage } from '../models/Page';
import { Story } from '../models/Story';
import User from '../models/User';

// Helper to verify author ownership
const isAuthor = async (userId: number, authorId: string) => {
    const user = await User.findByPk(userId);
    return user && user.id.toString() === authorId;
};

export const createPage = async (req: Request, res: Response) => {
    // @ts-ignore
    const userId = (req as any).userId;
    const { storyId, content, image, isEnding, endingType, choices } = req.body;
    try {
        const story = await Story.findById(storyId);
        if (!story) return res.status(404).json({ message: 'Story not found' });
        if (!(await isAuthor(userId, story.authorId))) {
            return res.status(403).json({ message: 'Not authorized' });
        }
        const page = await Page.create({
            storyId,
            content,
            image,
            isEnding: !!isEnding,
            endingType,
            choices,
        } as IPage);
        res.status(201).json(page);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

export const getPagesByStory = async (req: Request, res: Response) => {
    const { storyId } = req.params;
    try {
        const pages = await Page.find({ storyId });
        res.json(pages);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

export const getPage = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const page = await Page.findById(id);
        if (!page) return res.status(404).json({ message: 'Page not found' });
        res.json(page);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

export const updatePage = async (req: Request, res: Response) => {
    // @ts-ignore
    const userId = (req as any).userId;
    const { id } = req.params;
    const { content, image, isEnding, endingType, choices } = req.body;
    try {
        const page = await Page.findById(id);
        if (!page) return res.status(404).json({ message: 'Page not found' });
        const story = await Story.findById(page.storyId);
        if (!story) return res.status(404).json({ message: 'Parent story not found' });
        if (!(await isAuthor(userId, story.authorId))) {
            return res.status(403).json({ message: 'Not authorized' });
        }
        if (content !== undefined) page.content = content;
        if (image !== undefined) page.image = image;
        if (isEnding !== undefined) page.isEnding = !!isEnding;
        if (endingType !== undefined) page.endingType = endingType;
        if (choices !== undefined) page.choices = choices;
        await page.save();
        res.json(page);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

export const deletePage = async (req: Request, res: Response) => {
    // @ts-ignore
    const userId = (req as any).userId;
    const { id } = req.params;
    try {
        const page = await Page.findById(id);
        if (!page) return res.status(404).json({ message: 'Page not found' });
        const story = await Story.findById(page.storyId);
        if (!story) return res.status(404).json({ message: 'Parent story not found' });
        if (!(await isAuthor(userId, story.authorId))) {
            return res.status(403).json({ message: 'Not authorized' });
        }
        await page.deleteOne();
        res.json({ message: 'Page deleted' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

export const setStartPage = async (req: Request, res: Response) => {
    // @ts-ignore
    const userId = (req as any).userId;
    const { storyId, startPageId } = req.body;
    try {
        const story = await Story.findById(storyId);
        if (!story) return res.status(404).json({ message: 'Story not found' });
        if (!(await isAuthor(userId, story.authorId))) {
            return res.status(403).json({ message: 'Not authorized' });
        }
        story.startPageId = startPageId;
        await story.save();
        res.json(story);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};
