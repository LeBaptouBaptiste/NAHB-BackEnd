import { Request, Response } from 'express';
import * as storyService from '../services/storyService';

export const createStory = async (req: Request, res: Response) => {
    // @ts-ignore - userId injected by auth middleware
    const userId = (req as any).userId;
    try {
        const story = await storyService.createStory(userId, req.body);
        res.status(201).json(story);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

export const getMyStories = async (req: Request, res: Response) => {
    // @ts-ignore
    const userId = (req as any).userId;
    try {
        const stories = await storyService.getMyStories(userId);
        res.json(stories);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

export const getStory = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const story = await storyService.getStory(id);
        res.json(story);
    } catch (err: any) {
        if (err.message === 'Story not found') {
            return res.status(404).json({ message: err.message });
        }
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

export const updateStory = async (req: Request, res: Response) => {
    // @ts-ignore
    const userId = (req as any).userId;
    const { id } = req.params;
    try {
        const story = await storyService.updateStory(userId, id, req.body);
        res.json(story);
    } catch (err: any) {
        if (err.message === 'Story not found') {
            return res.status(404).json({ message: err.message });
        }
        if (err.message === 'Not authorized') {
            return res.status(403).json({ message: err.message });
        }
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

export const deleteStory = async (req: Request, res: Response) => {
    // @ts-ignore
    const userId = (req as any).userId;
    const { id } = req.params;
    try {
        const result = await storyService.deleteStory(userId, id);
        res.json(result);
    } catch (err: any) {
        if (err.message === 'Story not found') {
            return res.status(404).json({ message: err.message });
        }
        if (err.message === 'Not authorized') {
            return res.status(403).json({ message: err.message });
        }
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

export const getPublishedStories = async (req: Request, res: Response) => {
    const { search } = req.query as { search?: string };
    try {
        const stories = await storyService.getPublishedStories(search);
        res.json(stories);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

export const getTags = async (req: Request, res: Response) => {
    try {
        const tags = await storyService.getTags();
        res.json(tags);
    } catch (err) {
        console.error('Error fetching tags:', err);
        res.status(500).json({ message: 'Server error' });
    }
};
