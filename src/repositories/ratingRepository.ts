import { Rating } from "../models/sequelize/Rating";
import { sequelize } from "../config/mysql";

export const findAllByUser = async (userId: number) => {
	return await Rating.findAll({ where: { userId } });
};

export const create = async (ratingData: any) => {
	return await Rating.create(ratingData);
};

export const findByStory = async (storyId: string) => {
	return await Rating.findAll({ where: { storyId } });
};

export const findOne = async (filter: any) => {
	return await Rating.findOne({ where: filter });
};

export const update = async (rating: any, updates: any) => {
	// Assuming rating is a Sequelize instance
	rating.value = updates.value;
	rating.comment = updates.comment;
	return await rating.save();
};

export const findAndCountAll = async (options: any) => {
	return await Rating.findAndCountAll(options);
};

export const destroy = async (filter: any) => {
	return await Rating.destroy({ where: filter });
};

export const getAverageStats = async (storyId: string) => {
	return (await Rating.findOne({
		where: { storyId },
		attributes: [
			[sequelize.fn("AVG", sequelize.col("value")), "averageScore"],
			[sequelize.fn("COUNT", sequelize.col("id")), "totalRatings"],
		],
		raw: true,
	})) as any;
};

export const count = async (filter: any = {}) => {
	return await Rating.count({ where: filter });
};

export const getGlobalStats = async () => {
	return (await Rating.findOne({
		attributes: [
			[sequelize.fn("AVG", sequelize.col("value")), "averageRating"],
			[sequelize.fn("COUNT", sequelize.col("id")), "totalRatings"],
		],
		raw: true,
	})) as any;
};
