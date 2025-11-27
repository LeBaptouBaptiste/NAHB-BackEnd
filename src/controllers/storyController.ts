import { Request, Response } from "express";
import { Story } from "../models/mongoose/Story";
import User from "../models/sequelize/User";

// Helper to ensure the requesting user is the author
const isAuthor = async (userId: number, authorId: string) => {
	const user = await User.findByPk(userId);
	return user && user.id.toString() === authorId;
};

export const createStory = async (req: Request, res: Response) => {
	// @ts-ignore - userId injected by auth middleware
	const userId = (req as any).userId;
	const { title, description, tags, theme, imageUrl } = req.body;
	try {
		const story = await Story.create({
			title,
			description,
			imageUrl,
			tags,
			theme,
			authorId: userId.toString(),
			status: "draft",
			stats: { views: 0, completions: 0, endings: {} },
		});
		res.status(201).json(story);
	} catch (err) {
		console.error(err);
		res.status(500).json({ message: "Server error" });
	}
};

export const getMyStories = async (req: Request, res: Response) => {
	// @ts-ignore
	const userId = (req as any).userId;
	try {
		const stories = await Story.find({ authorId: userId.toString() });
		res.json(stories);
	} catch (err) {
		console.error(err);
		res.status(500).json({ message: "Server error" });
	}
};

export const getStory = async (req: Request, res: Response) => {
	const { id } = req.params;
	try {
		const story = await Story.findById(id);
		if (!story) return res.status(404).json({ message: "Story not found" });
		res.json(story);
	} catch (err) {
		console.error(err);
		res.status(500).json({ message: "Server error" });
	}
};

export const updateStory = async (req: Request, res: Response) => {
	// @ts-ignore
	const userId = (req as any).userId;
	const { id } = req.params;
	const { title, description, tags, status, theme, imageUrl } = req.body;
	try {
		const story = await Story.findById(id);
		if (!story) return res.status(404).json({ message: "Story not found" });
		if (!(await isAuthor(userId, story.authorId))) {
			return res.status(403).json({ message: "Not authorized" });
		}
		if (title) story.title = title;
		if (description) story.description = description;
		if (imageUrl) story.imageUrl = imageUrl;
		if (tags) story.tags = tags;
		if (status) story.status = status;
		if (theme) story.theme = theme;
		await story.save();
		res.json(story);
	} catch (err) {
		console.error(err);
		res.status(500).json({ message: "Server error" });
	}
};

export const deleteStory = async (req: Request, res: Response) => {
	// @ts-ignore
	const userId = (req as any).userId;
	const { id } = req.params;
	try {
		const story = await Story.findById(id);
		if (!story) return res.status(404).json({ message: "Story not found" });
		if (!(await isAuthor(userId, story.authorId))) {
			return res.status(403).json({ message: "Not authorized" });
		}
		await story.deleteOne();
		res.json({ message: "Story deleted" });
	} catch (err) {
		console.error(err);
		res.status(500).json({ message: "Server error" });
	}
};

export const getPublishedStories = async (req: Request, res: Response) => {
	const { search } = req.query as { search?: string };
	try {
		const filter = { status: "published" } as any;
		if (search) {
			filter.title = { $regex: search, $options: "i" };
		}
		const stories = await Story.find(filter);
		res.json(stories);
	} catch (err) {
		console.error(err);
		res.status(500).json({ message: "Server error" });
	}
};

export const getTags = async (req: Request, res: Response) => {
	try {
		// Use aggregation to unwind the tags array and get unique values
		const result = await Story.aggregate([
			{ $match: { status: "published" } },
			{ $unwind: "$tags" },
			{ $group: { _id: "$tags" } },
			{ $sort: { _id: 1 } },
		]);

		// Extract just the tag values
		const tags = result
			.map((item) => item._id)
			.filter((tag) => tag && tag.trim() !== "");

		res.json(tags);
	} catch (err) {
		console.error("Error fetching tags:", err);
		res.status(500).json({ message: "Server error" });
	}
};
