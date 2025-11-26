"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllStories = exports.getPlatformStats = exports.updateReportStatus = exports.getAllReports = exports.toggleStorySuspension = exports.toggleUserBan = exports.getAllUsers = exports.requireAdmin = void 0;
const Story_1 = require("../models/mongoose/Story");
const Report_1 = require("../models/sequelize/Report");
const Rating_1 = require("../models/sequelize/Rating");
const GameSession_1 = require("../models/mongoose/GameSession");
const User_1 = __importDefault(require("../models/sequelize/User"));
const mysql_1 = require("../config/mysql");
// Middleware to check if user is admin
const requireAdmin = async (req, res, next) => {
    // @ts-ignore
    const userId = req.userId;
    try {
        const user = await User_1.default.findByPk(userId);
        if (!user || user.role !== 'admin') {
            return res.status(403).json({ message: 'Admin access required' });
        }
        next();
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};
exports.requireAdmin = requireAdmin;
// Get all users (admin only)
const getAllUsers = async (req, res) => {
    const { page = 1, limit = 20, search } = req.query;
    try {
        const offset = (Number(page) - 1) * Number(limit);
        const where = {};
        if (search) {
            where.username = { $like: `%${search}%` };
        }
        const { count, rows: users } = await User_1.default.findAndCountAll({
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
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};
exports.getAllUsers = getAllUsers;
// Ban/Unban a user
const toggleUserBan = async (req, res) => {
    const { userId } = req.params;
    const { banned } = req.body;
    try {
        const user = await User_1.default.findByPk(userId);
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
            await Story_1.Story.updateMany({ authorId: userId.toString() }, { status: 'suspended' });
        }
        res.json({ message: banned ? 'User banned' : 'User unbanned', user });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};
exports.toggleUserBan = toggleUserBan;
// Suspend/Unsuspend a story
const toggleStorySuspension = async (req, res) => {
    const { storyId } = req.params;
    const { suspended } = req.body;
    try {
        const story = await Story_1.Story.findById(storyId);
        if (!story) {
            return res.status(404).json({ message: 'Story not found' });
        }
        story.status = suspended ? 'suspended' : 'draft';
        await story.save();
        res.json({ message: suspended ? 'Story suspended' : 'Story unsuspended', story });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};
exports.toggleStorySuspension = toggleStorySuspension;
// Get all reports (admin only)
const getAllReports = async (req, res) => {
    const { status, page = 1, limit = 20 } = req.query;
    try {
        const filter = {};
        if (status) {
            filter.status = status;
        }
        const offset = (Number(page) - 1) * Number(limit);
        const { count, rows: reports } = await Report_1.Report.findAndCountAll({
            where: filter,
            order: [['createdAt', 'DESC']],
            limit: Number(limit),
            offset
        });
        res.json({
            reports,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total: count,
                pages: Math.ceil(count / Number(limit)),
            },
        });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};
exports.getAllReports = getAllReports;
// Update report status
const updateReportStatus = async (req, res) => {
    // @ts-ignore
    const adminId = req.userId;
    const { reportId } = req.params;
    const { status, adminNotes } = req.body;
    const validStatuses = ['pending', 'reviewed', 'resolved', 'dismissed'];
    if (!validStatuses.includes(status)) {
        return res.status(400).json({ message: 'Invalid status' });
    }
    try {
        const report = await Report_1.Report.findByPk(reportId);
        if (!report) {
            return res.status(404).json({ message: 'Report not found' });
        }
        report.status = status;
        // @ts-ignore
        if (adminNotes)
            report.adminNotes = adminNotes; // adminNotes not in interface? Check model.
        report.resolvedBy = adminId;
        await report.save();
        res.json(report);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};
exports.updateReportStatus = updateReportStatus;
// Get platform statistics (admin only)
const getPlatformStats = async (req, res) => {
    try {
        // User stats
        const totalUsers = await User_1.default.count();
        const usersByRole = await User_1.default.findAll({
            attributes: ['role', [mysql_1.sequelize.fn('COUNT', mysql_1.sequelize.col('role')), 'count']],
            group: ['role'],
            raw: true
        });
        // Story stats
        const totalStories = await Story_1.Story.countDocuments();
        const storiesByStatus = await Story_1.Story.aggregate([
            { $group: { _id: '$status', count: { $sum: 1 } } },
        ]);
        // Game session stats
        const totalSessions = await GameSession_1.GameSession.countDocuments();
        const sessionsByStatus = await GameSession_1.GameSession.aggregate([
            { $group: { _id: '$status', count: { $sum: 1 } } },
        ]);
        // Calculate total views and completions
        const storyStats = await Story_1.Story.aggregate([
            {
                $group: {
                    _id: null,
                    totalViews: { $sum: '$stats.views' },
                    totalCompletions: { $sum: '$stats.completions' },
                },
            },
        ]);
        // Report stats
        const pendingReports = await Report_1.Report.count({ where: { status: 'pending' } });
        const totalReports = await Report_1.Report.count();
        // Rating stats
        const ratingStats = await Rating_1.Rating.findOne({
            attributes: [
                [mysql_1.sequelize.fn('AVG', mysql_1.sequelize.col('value')), 'averageRating'],
                [mysql_1.sequelize.fn('COUNT', mysql_1.sequelize.col('id')), 'totalRatings']
            ],
            raw: true
        });
        res.json({
            users: {
                total: totalUsers,
                byRole: usersByRole.map(r => ({ _id: r.role, count: r.count })),
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
                average: ratingStats ? Math.round(Number(ratingStats.averageRating) * 10) / 10 : 0,
                total: ratingStats ? Number(ratingStats.totalRatings) : 0,
            },
        });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};
exports.getPlatformStats = getPlatformStats;
// Get all stories (admin only, includes suspended)
const getAllStories = async (req, res) => {
    const { status, page = 1, limit = 20, search } = req.query;
    try {
        const filter = {};
        if (status) {
            filter.status = status;
        }
        if (search) {
            filter.title = { $regex: search, $options: 'i' };
        }
        const skip = (Number(page) - 1) * Number(limit);
        const stories = await Story_1.Story.find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(Number(limit));
        const total = await Story_1.Story.countDocuments(filter);
        res.json({
            stories,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total,
                pages: Math.ceil(total / Number(limit)),
            },
        });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};
exports.getAllStories = getAllStories;
//# sourceMappingURL=adminController.js.map