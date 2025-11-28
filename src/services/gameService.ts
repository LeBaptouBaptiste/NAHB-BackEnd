import * as gameRepository from "../repositories/gameRepository";
import * as storyRepository from "../repositories/storyRepository";
import * as pageRepository from "../repositories/pageRepository";

export const startGame = async (
	userId: number,
	storyId: string,
	preview: boolean
) => {
	const story = await storyRepository.findById(storyId);
	if (!story) throw new Error("Story not found");
	if (!story.startPageId) throw new Error("Story has no start page");

	const isPreview = preview === true;
	if (isPreview) {
		if (story.authorId !== userId.toString()) {
			throw new Error("Only the author can preview this story");
		}
	} else {
		if (story.status !== "published") {
			throw new Error("Story is not published");
		}
	}

	const session = await gameRepository.create({
		userId: userId.toString(),
		storyId,
		currentPageId: story.startPageId,
		history: [],
		inventory: [],
		status: "in_progress",
		isPreview: isPreview,
	});

	if (!isPreview) {
		story.stats.views += 1;
		await story.save();
	}

	return session;
};

export const makeChoice = async (
	userId: number,
	sessionId: string,
	choiceIndex: number,
	hotspotIndex: number,
	diceRollSuccess?: boolean
) => {
	const session = await gameRepository.findById(sessionId);
	if (!session) throw new Error("Session not found");
	if (session.userId !== userId.toString()) throw new Error("Not your session");

	const page = await pageRepository.findById(session.currentPageId);
	if (!page) throw new Error("Current page not found");

	let nextPageId: string | undefined;

	if (hotspotIndex !== undefined) {
		if (
			!page.hotspots ||
			hotspotIndex < 0 ||
			hotspotIndex >= page.hotspots.length
		) {
			throw new Error("Invalid hotspot index");
		}
		nextPageId = page.hotspots[hotspotIndex].targetPageId;
	} else {
		if (
			choiceIndex === undefined ||
			choiceIndex < 0 ||
			choiceIndex >= page.choices.length
		) {
			throw new Error("Invalid choice index");
		}
		const choice = page.choices[choiceIndex];

		if (
			diceRollSuccess === false &&
			choice.diceRoll &&
			choice.diceRoll.failurePageId
		) {
			nextPageId = choice.diceRoll.failurePageId;
		} else if (
			diceRollSuccess === true &&
			choice.diceRoll &&
			choice.diceRoll.successPageId
		) {
			nextPageId = choice.diceRoll.successPageId;
		} else {
			nextPageId = choice.targetPageId;
		}

		if (choice.rewards && choice.rewards.length > 0) {
			if (!session.inventory) session.inventory = [];
			choice.rewards.forEach((reward) => {
				if (reward.type === "add_item" && reward.value) {
					session.inventory.push(reward.value);
				}
			});
			session.markModified("inventory");
		}
	}

	if (!nextPageId) throw new Error("Target page not available");

	session.history.push(session.currentPageId);
	session.currentPageId = nextPageId;

	const nextPage = await pageRepository.findById(nextPageId);
	if (nextPage && nextPage.isEnding) {
		session.status = "completed";
		if (!session.isPreview) {
			const story = await storyRepository.findById(session.storyId);
			if (story) {
				story.stats.completions += 1;
				const endingKey = nextPage.endingType || "default";
				story.stats.endings[endingKey] =
					(story.stats.endings[endingKey] || 0) + 1;
				await story.save();
			}
		}
	}
	await session.save();
	return session;
};

export const getSessions = async (userId: number) => {
	return await gameRepository.findByUser(userId.toString());
};

export const getSession = async (userId: number, id: string) => {
	const session = await gameRepository.findById(id);
	if (!session) throw new Error("Session not found");
	if (session.userId !== userId.toString()) throw new Error("Not your session");
	return session;
};

export const getPathStats = async (userId: number, sessionId: string) => {
	const session = await gameRepository.findById(sessionId);
	if (!session) throw new Error("Session not found");
	if (session.userId !== userId.toString()) throw new Error("Not your session");

	const fullPath = [...session.history, session.currentPageId];
	const pathString = fullPath.join("->");

	const allSessions = await gameRepository.findCompletedByStory(
		session.storyId
	);
	const totalCompletedSessions = allSessions.length;

	let samePathCount = 0;
	for (const s of allSessions) {
		const sPath = [...s.history, s.currentPageId].join("->");
		if (sPath === pathString) samePathCount++;
	}

	const samePathPercentage =
		totalCompletedSessions > 0
			? Math.round((samePathCount / totalCompletedSessions) * 100)
			: 0;

	const endingCounts: Record<string, number> = {};
	for (const s of allSessions) {
		const endingPage = await pageRepository.findById(s.currentPageId);
		if (endingPage && endingPage.isEnding) {
			const endingType = endingPage.endingType || "default";
			endingCounts[endingType] = (endingCounts[endingType] || 0) + 1;
		}
	}

	const endingDistribution: Record<
		string,
		{ count: number; percentage: number }
	> = {};
	for (const [ending, count] of Object.entries(endingCounts)) {
		endingDistribution[ending] = {
			count,
			percentage: Math.round((count / totalCompletedSessions) * 100),
		};
	}

	const currentEndingPage = await pageRepository.findById(
		session.currentPageId
	);
	const currentEnding = currentEndingPage?.isEnding
		? {
				type: currentEndingPage.endingType || "default",
				reachedByPercentage:
					endingDistribution[currentEndingPage.endingType || "default"]
						?.percentage || 0,
		  }
		: null;

	return {
		sessionId: session._id,
		storyId: session.storyId,
		pathLength: fullPath.length,
		samePathStats: {
			count: samePathCount,
			percentage: samePathPercentage,
			message: `${samePathPercentage}% of players took the same path as you`,
		},
		totalCompletedSessions,
		endingDistribution,
		currentEnding,
	};
};

export const getStoryStats = async (userId: number, storyId: string) => {
	const story = await storyRepository.findById(storyId);
	if (!story) throw new Error("Story not found");
	if (story.authorId !== userId.toString()) throw new Error("Not authorized");

	const allSessions = await gameRepository.findAllByStory(storyId);
	const completedSessions = allSessions.filter((s) => s.status === "completed");
	const abandonedSessions = allSessions.filter((s) => s.status === "abandoned");
	const inProgressSessions = allSessions.filter(
		(s) => s.status === "in_progress"
	);

	const avgPathLength =
		completedSessions.length > 0
			? completedSessions.reduce((sum, s) => sum + s.history.length + 1, 0) /
			  completedSessions.length
			: 0;

	const endingDistribution: Record<string, number> = {};
	for (const s of completedSessions) {
		const endingPage = await pageRepository.findById(s.currentPageId);
		if (endingPage && endingPage.isEnding) {
			const endingType = endingPage.endingType || "default";
			endingDistribution[endingType] =
				(endingDistribution[endingType] || 0) + 1;
		}
	}

	const completionRate =
		allSessions.length > 0
			? Math.round((completedSessions.length / allSessions.length) * 100)
			: 0;

	return {
		storyId,
		views: story.stats.views,
		totalSessions: allSessions.length,
		completedSessions: completedSessions.length,
		abandonedSessions: abandonedSessions.length,
		inProgressSessions: inProgressSessions.length,
		completionRate,
		averagePathLength: Math.round(avgPathLength * 10) / 10,
		endingDistribution,
	};
};

export const getSessionByStory = async (userId: string, storyId: string) => {
	return await gameRepository.findLatestSession({
		userId,
		storyId,
		status: "in_progress",
		isPreview: { $ne: true },
	});
};
