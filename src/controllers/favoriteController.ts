import { Request, Response } from "express";
import { Favorite } from "../models/mongoose/Favorite";
import { Story } from "../models/mongoose/Story";

// Toggle favorite status
export const toggleFavorite = async (req: Request, res: Response) => {
	// @ts-ignore
	const userId = (req as any).userId;
	const { storyId } = req.params;

	try {
		const story = await Story.findById(storyId);
		if (!story) {
			return res.status(404).json({ message: "Story not found" });
		}

		const existing = await Favorite.findOne({
			userId: userId.toString(),
			storyId,
		});

		if (existing) {
			await Favorite.deleteOne({ _id: existing._id });
			res.json({ favorited: false });
		} else {
			await Favorite.create({
				userId: userId.toString(),
				storyId,
			});
			res.json({ favorited: true });
		}
	} catch (err) {
		console.error(err);
		res.status(500).json({ message: "Server error" });
	}
};

// Check if story is favorited by user
export const checkFavorite = async (req: Request, res: Response) => {
	// @ts-ignore
	const userId = (req as any).userId;
	const { storyId } = req.params;

	try {
		const favorite = await Favorite.findOne({
			userId: userId.toString(),
			storyId,
		});
		res.json({ favorited: !!favorite });
	} catch (err) {
		console.error(err);
		res.status(500).json({ message: "Server error" });
	}
};

// Get user's favorite stories
export const getFavorites = async (req: Request, res: Response) => {
	// @ts-ignore
	const userId = (req as any).userId;

	try {
		const favorites = await Favorite.find({ userId: userId.toString() });
		const storyIds = favorites.map((f) => f.storyId);
		const stories = await Story.find({ _id: { $in: storyIds } });
		res.json(stories);
	} catch (err) {
		console.error(err);
		res.status(500).json({ message: "Server error" });
	}
};
