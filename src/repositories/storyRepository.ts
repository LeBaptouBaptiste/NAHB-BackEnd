import { Story } from '../models/mongoose/Story';

export const create = async (storyData: any) => {
    return await Story.create(storyData);
};

export const findByAuthor = async (authorId: string) => {
    return await Story.find({ authorId });
};

export const findById = async (id: string) => {
    return await Story.findById(id);
};

export const findPublished = async (filter: any) => {
    return await Story.find(filter);
};

export const getTags = async () => {
    const result = await Story.aggregate([
        { $match: { status: 'published' } },
        { $unwind: '$tags' },
        { $group: { _id: '$tags' } },
        { $sort: { _id: 1 } }
    ]);
    return result.map(item => item._id).filter(tag => tag && tag.trim() !== '');
};

export const countByAuthor = async (authorId: string) => {
    return await Story.countDocuments({ authorId });
};

export const findByIds = async (ids: string[]) => {
    return await Story.find({ _id: { $in: ids } });
};

export const updateMany = async (filter: any, update: any) => {
    return await Story.updateMany(filter, update);
};

export const count = async (filter: any = {}) => {
    return await Story.countDocuments(filter);
};

export const aggregate = async (pipeline: any[]) => {
    return await Story.aggregate(pipeline);
};

export const find = async (filter: any, sort: any = { createdAt: -1 }, skip: number = 0, limit: number = 20) => {
    return await Story.find(filter).sort(sort).skip(skip).limit(limit);
};
