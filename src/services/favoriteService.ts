import * as favoriteRepository from "../repositories/favoriteRepository";
import * as storyRepository from "../repositories/storyRepository";

export const toggleFavorite = async (userId: string, storyId: string) => {
	const story = await storyRepository.findById(storyId);
	if (!story) {
		throw new Error("Story not found");
	}

	const existing = await favoriteRepository.findOne({ userId, storyId });

	if (existing) {
		await favoriteRepository.deleteOne({ _id: existing._id });
		return { favorited: false };
	} else {
		await favoriteRepository.create({
			userId,
			storyId,
		});
		return { favorited: true };
	}
};

export const checkFavorite = async (userId: string, storyId: string) => {
	const favorite = await favoriteRepository.findOne({ userId, storyId });
	return { favorited: !!favorite };
};

export const getFavorites = async (userId: string) => {
	const favorites = await favoriteRepository.find({ userId });
	const storyIds = favorites.map((f: any) => f.storyId);
	// We need findByIds in storyRepository
	// But we can iterate or use find with $in.
	// Let's add findByIds to storyRepository or use existing find with filter.
	// storyRepository.findPublished uses filter.
	// I should add a generic find or findByIds to storyRepository.
	// For now, I'll use storyRepository.find({ _id: { $in: storyIds } }) if available,
	// but storyRepository only exposes specific methods.
	// I'll add findByIds to storyRepository.
	return await storyRepository.findByIds(storyIds);
};
