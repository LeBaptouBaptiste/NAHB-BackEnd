import User from '../models/sequelize/User';

export const findByEmail = async (email: string) => {
    return await User.findOne({ where: { email } });
};

export const create = async (userData: any) => {
    return await User.create(userData);
};

export const findById = async (id: number) => {
    return await User.findByPk(id);
};

export const findAndCountAll = async (options: any) => {
    return await User.findAndCountAll(options);
};

export const count = async () => {
    return await User.count();
};

export const findAll = async (options: any) => {
    return await User.findAll(options);
};
