import { Request, Response } from 'express';
import * as adminService from '../services/adminService';
import User from '../models/sequelize/User';

// Middleware to check if user is admin
export const requireAdmin = async (req: Request, res: Response, next: any) => {
	// @ts-ignore
	const userId = (req as any).userId;

	try {
		const user = await User.findByPk(userId);
		if (!user || user.role !== "admin") {
			return res.status(403).json({ message: "Admin access required" });
		}
		next();
	} catch (err) {
		console.error(err);
		res.status(500).json({ message: "Server error" });
	}
};

// Get all users (admin only)
export const getAllUsers = async (req: Request, res: Response) => {
	const { page = 1, limit = 20, search } = req.query;

    try {
        const result = await adminService.getAllUsers(Number(page), Number(limit), search as string);
        res.json(result);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

// Ban/Unban a user
export const toggleUserBan = async (req: Request, res: Response) => {
	const { userId } = req.params;
	const { banned } = req.body;

    try {
        const result = await adminService.toggleUserBan(Number(userId), banned);
        res.json(result);
    } catch (err: any) {
        if (err.message === 'User not found') return res.status(404).json({ message: err.message });
        if (err.message === 'Cannot ban an admin') return res.status(403).json({ message: err.message });

        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

// Suspend/Unsuspend a story
export const toggleStorySuspension = async (req: Request, res: Response) => {
	const { storyId } = req.params;
	const { suspended } = req.body;

    try {
        const result = await adminService.toggleStorySuspension(storyId, suspended);
        res.json(result);
    } catch (err: any) {
        if (err.message === 'Story not found') return res.status(404).json({ message: err.message });

        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get all reports (admin only)
export const getAllReports = async (req: Request, res: Response) => {
	const { status, page = 1, limit = 20 } = req.query;

    try {
        const result = await adminService.getAllReports(status as string, Number(page), Number(limit));
        res.json(result);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

// Update report status
export const updateReportStatus = async (req: Request, res: Response) => {
	// @ts-ignore
	const adminId = (req as any).userId;
	const { reportId } = req.params;
	const { status, adminNotes } = req.body;

    try {
        const report = await adminService.updateReportStatus(adminId, reportId, status, adminNotes);
        res.json(report);
    } catch (err: any) {
        if (err.message === 'Invalid status') return res.status(400).json({ message: err.message });
        if (err.message === 'Report not found') return res.status(404).json({ message: err.message });

        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get platform statistics (admin only)
export const getPlatformStats = async (req: Request, res: Response) => {
    try {
        const stats = await adminService.getPlatformStats();
        res.json(stats);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get all stories (admin only, includes suspended)
export const getAllStories = async (req: Request, res: Response) => {
	const { status, page = 1, limit = 20, search } = req.query;

    try {
        const result = await adminService.getAllStories(status as string, Number(page), Number(limit), search as string);
        res.json(result);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};
