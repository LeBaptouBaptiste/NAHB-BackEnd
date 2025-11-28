import { Page } from '../models/mongoose/Page';

export const create = async (pageData: any) => {
    return await Page.create(pageData);
};

export const findById = async (id: string) => {
    return await Page.findById(id);
};

export const update = async (id: string, updates: any) => {
    return await Page.updateOne({ _id: id }, updates);
};

export const count = async (filter: any) => {
    return await Page.countDocuments(filter);
};

export const deletePage = async (id: string) => {
    return await Page.deleteOne({ _id: id });
};

export const findByStory = async (storyId: string) => {
    return await Page.find({ storyId });
};
