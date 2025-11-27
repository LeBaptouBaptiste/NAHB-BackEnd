import { Request, Response } from "express";
import { Rating } from "../models/sequelize/Rating";
import { Story } from "../models/mongoose/Story";
import { sequelize } from "../config/mysql";

// Add or update a rating for a story
export const rateStory = async (req: Request, res: Response) => {
	// @ts-ignore
	const userId = (req as any).userId;
	const { storyId } = req.params;
	const { score, comment } = req.body;

	if (!score || score < 1 || score > 5) {
		return res.status(400).json({ message: "Score must be between 1 and 5" });
	}

	try {
		// Check if story exists and is published
		const story = await Story.findById(storyId);
		if (!story) {
			return res.status(404).json({ message: "Story not found" });
		}
		if (story.status !== "published") {
			return res
				.status(400)
				.json({ message: "Cannot rate unpublished stories" });
		}

		// Upsert rating (create or update)
		const existingRating = await Rating.findOne({
			where: { storyId, userId },
		});

		if (existingRating) {
			existingRating.value = score;
			existingRating.comment = comment;
			await existingRating.save();
			return res.json(existingRating);
		} else {
			const newRating = await Rating.create({
				storyId,
				userId,
				value: score,
				comment,
			});
			return res.json(newRating);
		}
	} catch (err) {
		console.error(err);
		res.status(500).json({ message: "Server error" });
	}
};

// Get ratings for a story
export const getStoryRatings = async (req: Request, res: Response) => {
	const { storyId } = req.params;
	const { page = 1, limit = 10 } = req.query;

	try {
		const offset = (Number(page) - 1) * Number(limit);

		const { count, rows: ratings } = await Rating.findAndCountAll({
			where: { storyId },
			order: [["createdAt", "DESC"]],
			limit: Number(limit),
			offset,
		});

		// Calculate average
		const stats = (await Rating.findOne({
			where: { storyId },
			attributes: [
				[sequelize.fn("AVG", sequelize.col("value")), "averageScore"],
				[sequelize.fn("COUNT", sequelize.col("id")), "totalRatings"],
			],
			raw: true,
		})) as any;

		res.json({
			ratings,
			pagination: {
				page: Number(page),
				limit: Number(limit),
				total: count,
				pages: Math.ceil(count / Number(limit)),
			},
			stats: {
				averageScore: stats
					? Math.round(Number(stats.averageScore) * 10) / 10
					: 0,
				totalRatings: stats ? Number(stats.totalRatings) : 0,
			},
		});
	} catch (err) {
		console.error(err);
		res.status(500).json({ message: "Server error" });
	}
};

// Get user's rating for a story
export const getUserRating = async (req: Request, res: Response) => {
	// @ts-ignore
	const userId = (req as any).userId;
	const { storyId } = req.params;

	try {
		const rating = await Rating.findOne({ where: { storyId, userId } });
		res.json(rating || null);
	} catch (err) {
		console.error(err);
		res.status(500).json({ message: "Server error" });
	}
};

// Delete user's rating
export const deleteRating = async (req: Request, res: Response) => {
	// @ts-ignore
	const userId = (req as any).userId;
	const { storyId } = req.params;

	try {
		const result = await Rating.destroy({ where: { storyId, userId } });
		if (!result) {
			return res.status(404).json({ message: "Rating not found" });
		}
		res.json({ message: "Rating deleted" });
	} catch (err) {
		console.error(err);
		res.status(500).json({ message: "Server error" });
	}
};
