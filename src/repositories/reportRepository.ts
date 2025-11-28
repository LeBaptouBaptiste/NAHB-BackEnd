import { Report } from "../models/sequelize/Report";

export const findOne = async (filter: any) => {
	return await Report.findOne({ where: filter });
};

export const create = async (reportData: any) => {
	return await Report.create(reportData);
};

export const findAll = async (filter: any) => {
	return await Report.findAll({
		where: filter,
		order: [["createdAt", "DESC"]],
	});
};

export const count = async (filter: any = {}) => {
	return await Report.count({ where: filter });
};

export const findById = async (id: string) => {
	return await Report.findByPk(id);
};

export const findAndCountAll = async (options: any) => {
	return await Report.findAndCountAll(options);
};
