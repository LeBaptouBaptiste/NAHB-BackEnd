import { Request, Response } from "express";
import { Report } from "../models/sequelize/Report";
import { Story } from "../models/mongoose/Story";
import { Op } from "sequelize";

// Report a story
export const reportStory = async (req: Request, res: Response) => {
	// @ts-ignore
	const userId = (req as any).userId;
	const { storyId } = req.params;
	const { type, description } = req.body;

	const validTypes = [
		"inappropriate_content",
		"spam",
		"copyright",
		"harassment",
		"other",
	];
	if (!type || !validTypes.includes(type)) {
		return res.status(400).json({
			message: "Invalid report type. Must be one of: " + validTypes.join(", "),
		});
	}

	try {
		// Check if story exists
		const story = await Story.findById(storyId);
		if (!story) {
			return res.status(404).json({ message: "Story not found" });
		}

		// Check if user already reported this story
		const existingReport = await Report.findOne({
			where: {
				storyId,
				userId,
				status: { [Op.in]: ["pending", "reviewed"] },
			},
		});

		if (existingReport) {
			return res
				.status(400)
				.json({ message: "You have already reported this story" });
		}

		const report = await Report.create({
			storyId,
			userId,
			type,
			description,
			status: "pending",
		});

		res.status(201).json({ message: "Report submitted successfully", report });
	} catch (err) {
		console.error(err);
		res.status(500).json({ message: "Server error" });
	}
};

// Get user's reports
export const getMyReports = async (req: Request, res: Response) => {
	// @ts-ignore
	const userId = (req as any).userId;

	try {
		const reports = await Report.findAll({
			where: { userId },
			order: [["createdAt", "DESC"]],
		});
		res.json(reports);
	} catch (err) {
		console.error(err);
		res.status(500).json({ message: "Server error" });
	}
};
