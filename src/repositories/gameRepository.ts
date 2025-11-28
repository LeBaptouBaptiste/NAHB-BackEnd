import { GameSession } from '../models/mongoose/GameSession';

export const create = async (sessionData: any) => {
    return await GameSession.create(sessionData);
};

export const findById = async (id: string) => {
    return await GameSession.findById(id);
};

export const findByUser = async (userId: string) => {
    return await GameSession.find({ userId });
};

export const findCompletedByStory = async (storyId: string) => {
    return await GameSession.find({
        storyId,
        status: 'completed',
        isPreview: { $ne: true },
    });
};

export const findAllByStory = async (storyId: string) => {
    return await GameSession.find({
        storyId,
        isPreview: { $ne: true },
    });
};

export const countByUser = async (userId: string) => {
    return await GameSession.countDocuments({
        userId,
        isPreview: { $ne: true },
    });
};

export const findCompletedByUser = async (userId: string) => {
    return await GameSession.find({
        userId,
        status: 'completed',
        isPreview: { $ne: true },
    });
};

export const count = async (filter: any = {}) => {
    return await GameSession.countDocuments(filter);
};

export const aggregate = async (pipeline: any[]) => {
    return await GameSession.aggregate(pipeline);
};
