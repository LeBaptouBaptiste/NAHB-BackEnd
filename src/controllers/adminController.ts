import { Request, Response } from 'express';
import { Story } from '../models/mongoose/Story';
import { Report } from '../models/mongoose/Report';
import { Rating } from '../models/mongoose/Rating';
import { GameSession } from '../models/mongoose/GameSession';
import User from '../models/sequelize/User';

// Middleware to check if user is admin
export const requireAdmin = async (req: Request, res: Response, next: any) => {
    // @ts-ignore
    const userId = (req as any).userId;

    try {
        const user = await User.findByPk(userId);
        if (!user || user.role !== 'admin') {
            return res.status(403).json({ message: 'Admin access required' });
        }
        next();
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get all users (admin only)
export const getAllUsers = async (req: Request, res: Response) => {
    const { page = 1, limit = 20, search } = req.query;

    try {
        const offset = (Number(page) - 1) * Number(limit);
        const where: any = {};

        if (search) {
            where.username = { $like: `%${search}%` };
        }

        const { count, rows: users } = await User.findAndCountAll({
            attributes: ['id', 'username', 'email', 'role', 'createdAt', 'updatedAt'],
            limit: Number(limit),
            offset,
            order: [['createdAt', 'DESC']],
        });

        res.json({
            users,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total: count,
                pages: Math.ceil(count / Number(limit)),
            },
        });
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
        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Prevent banning other admins
        if (user.role === 'admin') {
            return res.status(403).json({ message: 'Cannot ban an admin' });
        }

        // Update role to 'banned' or restore to 'author'
        user.role = banned ? 'banned' : 'author';
        await user.save();

        // If banning, also suspend all their stories
        if (banned) {
            await Story.updateMany(
                { authorId: userId.toString() },
                { status: 'suspended' }
            );
        }

        res.json({ message: banned ? 'User banned' : 'User unbanned', user });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

// Suspend/Unsuspend a story
export const toggleStorySuspension = async (req: Request, res: Response) => {
    const { storyId } = req.params;
    const { suspended } = req.body;

    try {
        const story = await Story.findById(storyId);
        if (!story) {
            return res.status(404).json({ message: 'Story not found' });
        }

        story.status = suspended ? 'suspended' : 'draft';
        await story.save();

        res.json({ message: suspended ? 'Story suspended' : 'Story unsuspended', story });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get all reports (admin only)
export const getAllReports = async (req: Request, res: Response) => {
    const { status, page = 1, limit = 20 } = req.query;

    try {
        const filter: any = {};
        if (status) {
            filter.status = status;
        }

        const skip = (Number(page) - 1) * Number(limit);

        const reports = await Report.find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(Number(limit));

        const total = await Report.countDocuments(filter);

        res.json({
            reports,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total,
                pages: Math.ceil(total / Number(limit)),
            },
        });
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

    const validStatuses = ['pending', 'reviewed', 'resolved', 'dismissed'];
    if (!validStatuses.includes(status)) {
        return res.status(400).json({ message: 'Invalid status' });
    }

    try {
        const report = await Report.findByIdAndUpdate(
            reportId,
            {
                status,
                adminNotes,
                resolvedBy: adminId.toString(),
            },
            { new: true }
        );

        if (!report) {
            return res.status(404).json({ message: 'Report not found' });
        }

        res.json(report);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get platform statistics (admin only)
export const getPlatformStats = async (req: Request, res: Response) => {
    try {
        // User stats
        const totalUsers = await User.count();
        const usersByRole = await User.findAll({
            attributes: ['role'],
            group: ['role'],
        });

        // Story stats
        const totalStories = await Story.countDocuments();
        const storiesByStatus = await Story.aggregate([
            { $group: { _id: '$status', count: { $sum: 1 } } },
        ]);

        // Game session stats
        const totalSessions = await GameSession.countDocuments();
        const sessionsByStatus = await GameSession.aggregate([
            { $group: { _id: '$status', count: { $sum: 1 } } },
        ]);

        // Calculate total views and completions
        const storyStats = await Story.aggregate([
            {
                $group: {
                    _id: null,
                    totalViews: { $sum: '$stats.views' },
                    totalCompletions: { $sum: '$stats.completions' },
                },
            },
        ]);

        // Report stats
        const pendingReports = await Report.countDocuments({ status: 'pending' });
        const totalReports = await Report.countDocuments();

        // Rating stats
        const ratingStats = await Rating.aggregate([
            {
                $group: {
                    _id: null,
                    averageRating: { $avg: '$score' },
                    totalRatings: { $sum: 1 },
                },
            },
        ]);

        res.json({
            users: {
                total: totalUsers,
                byRole: usersByRole,
            },
            stories: {
                total: totalStories,
                byStatus: storiesByStatus,
                totalViews: storyStats[0]?.totalViews || 0,
                totalCompletions: storyStats[0]?.totalCompletions || 0,
            },
            sessions: {
                total: totalSessions,
                byStatus: sessionsByStatus,
            },
            reports: {
                total: totalReports,
                pending: pendingReports,
            },
            ratings: {
                average: Math.round((ratingStats[0]?.averageRating || 0) * 10) / 10,
                total: ratingStats[0]?.totalRatings || 0,
            },
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get all stories (admin only, includes suspended)
export const getAllStories = async (req: Request, res: Response) => {
    const { status, page = 1, limit = 20, search } = req.query;

    try {
        const filter: any = {};
        if (status) {
            filter.status = status;
        }
        if (search) {
            filter.title = { $regex: search, $options: 'i' };
        }

        const skip = (Number(page) - 1) * Number(limit);

        const stories = await Story.find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(Number(limit));

        const total = await Story.countDocuments(filter);

        res.json({
            stories,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total,
                pages: Math.ceil(total / Number(limit)),
            },
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

