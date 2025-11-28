import * as storyRepository from "../repositories/storyRepository";
import * as gameRepository from "../repositories/gameRepository";
import * as ratingRepository from "../repositories/ratingRepository";
import * as pageRepository from "../repositories/pageRepository";

export const getUserStats = async (userId: number) => {
	const storiesWritten = await storyRepository.countByAuthor(userId.toString());

	const completedSessions = await gameRepository.findCompletedByUser(
		userId.toString()
	);
	const endingPageIds = new Set<string>();
	for (const session of completedSessions) {
		const page = await pageRepository.findById(session.currentPageId);
		if (page && page.isEnding) {
			endingPageIds.add(session.currentPageId);
		}
	}
	const endingsUnlocked = endingPageIds.size;

	const totalReads = await gameRepository.countByUser(userId.toString());

	const userRatings = await ratingRepository.findAllByUser(userId);
	const averageRating =
		userRatings.length > 0
			? userRatings.reduce((sum: number, r: any) => sum + r.value, 0) /
			  userRatings.length
			: 0;

	return {
		storiesWritten,
		endingsUnlocked,
		totalReads,
		averageRating: Math.round(averageRating * 10) / 10,
	};
};
