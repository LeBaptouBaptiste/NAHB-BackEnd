import * as reportRepository from "../repositories/reportRepository";
import * as storyRepository from "../repositories/storyRepository";
import { Op } from "sequelize";

export const reportStory = async (
	userId: number,
	storyId: string,
	type: string,
	description: string
) => {
	const validTypes = [
		"inappropriate_content",
		"spam",
		"copyright",
		"harassment",
		"other",
	];
	if (!type || !validTypes.includes(type)) {
		throw new Error(
			"Invalid report type. Must be one of: " + validTypes.join(", ")
		);
	}

	const story = await storyRepository.findById(storyId);
	if (!story) {
		throw new Error("Story not found");
	}

	const existingReport = await reportRepository.findOne({
		storyId,
		userId,
		status: { [Op.in]: ["pending", "reviewed"] },
	});

	if (existingReport) {
		throw new Error("You have already reported this story");
	}

	return await reportRepository.create({
		storyId,
		userId,
		type,
		description,
		status: "pending",
	});
};

export const getMyReports = async (userId: number) => {
	return await reportRepository.findAll({ userId });
};
