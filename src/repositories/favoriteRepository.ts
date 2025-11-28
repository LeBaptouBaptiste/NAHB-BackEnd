import { Favorite } from "../models/mongoose/Favorite";

export const findOne = async (filter: any) => {
	return await Favorite.findOne(filter);
};

export const create = async (favoriteData: any) => {
	return await Favorite.create(favoriteData);
};

export const deleteOne = async (filter: any) => {
	return await Favorite.deleteOne(filter);
};

export const find = async (filter: any) => {
	return await Favorite.find(filter);
};
