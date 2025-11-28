import { Request, Response } from 'express';
import * as pageService from '../services/pageService';

export const createPage = async (req: Request, res: Response) => {
    // @ts-ignore
    const userId = (req as any).userId;
    try {
        const page = await pageService.createPage(userId, req.body);
        res.status(201).json(page);
    } catch (err: any) {
        if (err.message === 'Story not found') return res.status(404).json({ message: err.message });
        if (err.message === 'Not authorized') return res.status(403).json({ message: err.message });

        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

export const getPagesByStory = async (req: Request, res: Response) => {
    const { storyId } = req.params;
    try {
        const pages = await pageService.getPagesByStory(storyId);
        res.json(pages);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

export const getPage = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const page = await pageService.getPage(id);
        res.json(page);
    } catch (err: any) {
        if (err.message === 'Page not found') return res.status(404).json({ message: err.message });

        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

export const updatePage = async (req: Request, res: Response) => {
    // @ts-ignore
    const userId = (req as any).userId;
    const { id } = req.params;
    try {
        const page = await pageService.updatePage(userId, id, req.body);
        res.json(page);
    } catch (err: any) {
        if (err.message === 'Page not found') return res.status(404).json({ message: err.message });
        if (err.message === 'Parent story not found') return res.status(404).json({ message: err.message });
        if (err.message === 'Not authorized') return res.status(403).json({ message: err.message });

        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

export const deletePage = async (req: Request, res: Response) => {
    // @ts-ignore
    const userId = (req as any).userId;
    const { id } = req.params;
    try {
        const result = await pageService.deletePage(userId, id);
        res.json(result);
    } catch (err: any) {
        if (err.message === 'Page not found') return res.status(404).json({ message: err.message });
        if (err.message === 'Parent story not found') return res.status(404).json({ message: err.message });
        if (err.message === 'Not authorized') return res.status(403).json({ message: err.message });

        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

export const setStartPage = async (req: Request, res: Response) => {
    // @ts-ignore
    const userId = (req as any).userId;
    const { storyId, startPageId } = req.body;
    try {
        const story = await pageService.setStartPage(userId, storyId, startPageId);
        res.json(story);
    } catch (err: any) {
        if (err.message === 'Story not found') return res.status(404).json({ message: err.message });
        if (err.message === 'Not authorized') return res.status(403).json({ message: err.message });

        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};
