"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMyReports = exports.reportStory = void 0;
const Report_1 = require("../models/sequelize/Report");
const Story_1 = require("../models/mongoose/Story");
const sequelize_1 = require("sequelize");
// Report a story
const reportStory = async (req, res) => {
    // @ts-ignore
    const userId = req.userId;
    const { storyId } = req.params;
    const { type, description } = req.body;
    const validTypes = ['inappropriate_content', 'spam', 'copyright', 'harassment', 'other'];
    if (!type || !validTypes.includes(type)) {
        return res.status(400).json({
            message: 'Invalid report type. Must be one of: ' + validTypes.join(', ')
        });
    }
    try {
        // Check if story exists
        const story = await Story_1.Story.findById(storyId);
        if (!story) {
            return res.status(404).json({ message: 'Story not found' });
        }
        // Check if user already reported this story
        const existingReport = await Report_1.Report.findOne({
            where: {
                storyId,
                userId,
                status: { [sequelize_1.Op.in]: ['pending', 'reviewed'] },
            }
        });
        if (existingReport) {
            return res.status(400).json({ message: 'You have already reported this story' });
        }
        const report = await Report_1.Report.create({
            storyId,
            userId,
            type,
            description,
            status: 'pending',
        });
        res.status(201).json({ message: 'Report submitted successfully', report });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};
exports.reportStory = reportStory;
// Get user's reports
const getMyReports = async (req, res) => {
    // @ts-ignore
    const userId = req.userId;
    try {
        const reports = await Report_1.Report.findAll({
            where: { userId },
            order: [['createdAt', 'DESC']]
        });
        res.json(reports);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};
exports.getMyReports = getMyReports;
//# sourceMappingURL=reportController.js.map