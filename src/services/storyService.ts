import * as storyRepository from '../repositories/storyRepository';
import * as userRepository from '../repositories/userRepository';

const isAuthor = async (userId: number, authorId: string) => {
    const user = await userRepository.findById(userId);
    return user && user.id.toString() === authorId;
};

export const createStory = async (userId: number, storyData: any) => {
    const { title, description, tags, theme, imageUrl } = storyData;
    return await storyRepository.create({
        title,
        description,
        imageUrl,
        tags,
        theme,
        authorId: userId.toString(),
        status: 'draft',
        stats: { views: 0, completions: 0, endings: {} },
    });
};

export const getMyStories = async (userId: number) => {
    return await storyRepository.findByAuthor(userId.toString());
};

export const getStory = async (id: string) => {
    const story = await storyRepository.findById(id);
    if (!story) {
        throw new Error('Story not found');
    }
    return story;
};

export const updateStory = async (userId: number, id: string, updates: any) => {
    const story = await storyRepository.findById(id);
    if (!story) {
        throw new Error('Story not found');
    }
    if (!(await isAuthor(userId, story.authorId))) {
        throw new Error('Not authorized');
    }

    const { title, description, tags, status, theme, imageUrl } = updates;
    if (title) story.title = title;
    if (description) story.description = description;
    if (imageUrl) story.imageUrl = imageUrl;
    if (tags) story.tags = tags;
    if (status) story.status = status;
    if (theme) story.theme = theme;

    return await story.save();
};

export const deleteStory = async (userId: number, id: string) => {
    const story = await storyRepository.findById(id);
    if (!story) {
        throw new Error('Story not found');
    }
    if (!(await isAuthor(userId, story.authorId))) {
        throw new Error('Not authorized');
    }
    await story.deleteOne();
    return { message: 'Story deleted' };
};

export const getPublishedStories = async (search?: string) => {
    const filter: any = { status: 'published' };
    if (search) {
        filter.title = { $regex: search, $options: 'i' };
    }
    return await storyRepository.findPublished(filter);
};

export const getTags = async () => {
    return await storyRepository.getTags();
};
