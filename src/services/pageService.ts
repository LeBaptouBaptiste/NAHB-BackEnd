import * as pageRepository from '../repositories/pageRepository';
import * as storyRepository from '../repositories/storyRepository';
import * as userRepository from '../repositories/userRepository';

const isAuthor = async (userId: number, authorId: string) => {
    const user = await userRepository.findById(userId);
    return user && user.id.toString() === authorId;
};

export const createPage = async (userId: number, pageData: any) => {
    const { storyId, content, image, isEnding, endingType, choices, hotspots } = pageData;
    const story = await storyRepository.findById(storyId);
    if (!story) throw new Error('Story not found');
    if (!(await isAuthor(userId, story.authorId))) {
        throw new Error('Not authorized');
    }

    const page = await pageRepository.create({
        storyId,
        content,
        image,
        isEnding: !!isEnding,
        endingType,
        choices,
        hotspots,
    });

    if (!story.startPageId) {
        const pageCount = await pageRepository.count({ storyId });
        if (pageCount === 1) {
            story.startPageId = page._id.toString();
            await story.save();
        }
    }

    return page;
};

export const getPagesByStory = async (storyId: string) => {
    return await pageRepository.findByStory(storyId);
};

export const getPage = async (id: string) => {
    const page = await pageRepository.findById(id);
    if (!page) throw new Error('Page not found');
    return page;
};

export const updatePage = async (userId: number, id: string, updates: any) => {
    const page = await pageRepository.findById(id);
    if (!page) throw new Error('Page not found');

    const story = await storyRepository.findById(page.storyId);
    if (!story) throw new Error('Parent story not found');

    if (!(await isAuthor(userId, story.authorId))) {
        throw new Error('Not authorized');
    }

    const { content, image, isEnding, endingType, choices, hotspots } = updates;
    const updateData: any = {};
    if (content !== undefined) updateData.content = content;
    if (image !== undefined) updateData.image = image;
    if (isEnding !== undefined) updateData.isEnding = !!isEnding;
    if (endingType !== undefined) updateData.endingType = endingType;
    if (choices !== undefined) updateData.choices = choices;
    if (hotspots !== undefined) updateData.hotspots = hotspots;

    // We need to use save() on the document to trigger middleware if any, 
    // but repository uses updateOne. 
    // Ideally we should move logic to service.
    // Let's use Object.assign and save if we can, or just updateOne.
    // The controller used page.save().
    // Let's stick to repository update if possible, or fetch and save.
    // Since I added update to repository using updateOne, I'll use that.
    // But wait, updateOne doesn't return the updated document by default unless configured.
    // And controller returns the updated page.
    // I should probably fetch, merge, and save in service, or use findOneAndUpdate.
    // Let's use the pattern from controller: modify properties and save.
    // But repository pattern usually hides the save.
    // I'll update repository to support save or use updateOne and then fetch.
    // Or better, add `save` method to repository that takes a document.
    // But `page` here is a Mongoose document because `findById` returns it.
    // So I can just call `page.save()`.
    // But that leaks Mongoose details to Service (which is fine, Service knows about domain objects).
    // However, strict repository pattern would hide `save()`.
    // For now, I will use `Object.assign` and `page.save()` since `page` is a Mongoose doc.

    if (content !== undefined) page.content = content;
    if (image !== undefined) page.image = image;
    if (isEnding !== undefined) page.isEnding = !!isEnding;
    if (endingType !== undefined) page.endingType = endingType;
    if (choices !== undefined) page.choices = choices;
    if (hotspots !== undefined) page.hotspots = hotspots;

    await page.save();
    return page;
};

export const deletePage = async (userId: number, id: string) => {
    const page = await pageRepository.findById(id);
    if (!page) throw new Error('Page not found');

    const story = await storyRepository.findById(page.storyId);
    if (!story) throw new Error('Parent story not found');

    if (!(await isAuthor(userId, story.authorId))) {
        throw new Error('Not authorized');
    }

    await page.deleteOne();
    return { message: 'Page deleted' };
};

export const setStartPage = async (userId: number, storyId: string, startPageId: string) => {
    const story = await storyRepository.findById(storyId);
    if (!story) throw new Error('Story not found');

    if (!(await isAuthor(userId, story.authorId))) {
        throw new Error('Not authorized');
    }

    story.startPageId = startPageId;
    await story.save();
    return story;
};
