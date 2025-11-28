import { Request, Response } from "express";
import * as favoriteService from "../services/favoriteService";

// Toggle favorite status
export const toggleFavorite = async (req: Request, res: Response) => {
	// @ts-ignore
	const userId = (req as any).userId;
	const { storyId } = req.params;

	try {
		const result = await favoriteService.toggleFavorite(userId, storyId);
		res.json(result);
	} catch (err: any) {
		if (err.message === "Story not found") {
			return res.status(404).json({ message: err.message });
		}
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
		const result = await favoriteService.checkFavorite(userId, storyId);
		res.json(result);
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
		const stories = await favoriteService.getFavorites(userId);
		res.json(stories);
	} catch (err) {
		console.error(err);
		res.status(500).json({ message: "Server error" });
	}
};
