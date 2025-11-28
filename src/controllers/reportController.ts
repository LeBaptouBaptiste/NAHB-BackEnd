import { Request, Response } from 'express';
import * as reportService from '../services/reportService';

// Report a story
export const reportStory = async (req: Request, res: Response) => {
    // @ts-ignore
    const userId = (req as any).userId;
    const { storyId } = req.params;
    const { type, description } = req.body;

    try {
        const report = await reportService.reportStory(userId, storyId, type, description);
        res.status(201).json({ message: 'Report submitted successfully', report });
    } catch (err: any) {
        if (err.message.startsWith('Invalid report type')) {
            return res.status(400).json({ message: err.message });
        }
        if (err.message === 'Story not found') {
            return res.status(404).json({ message: err.message });
        }
        if (err.message === 'You have already reported this story') {
            return res.status(400).json({ message: err.message });
        }
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get user's reports
export const getMyReports = async (req: Request, res: Response) => {
    // @ts-ignore
    const userId = (req as any).userId;

    try {
        const reports = await reportService.getMyReports(userId);
        res.json(reports);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

