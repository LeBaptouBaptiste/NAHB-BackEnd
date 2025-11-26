"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Rating_1 = require("../../models/sequelize/Rating");
const Story_1 = require("../../models/mongoose/Story");
const mysql_1 = require("../../config/mysql");
describe('Rating Model', () => {
    let testStory;
    beforeAll(async () => {
        await mysql_1.sequelize.sync({ force: true }); // Reset database
    });
    beforeEach(async () => {
        await Rating_1.Rating.destroy({ where: {}, truncate: true });
        testStory = await Story_1.Story.create({
            title: 'Test Story',
            authorId: '1',
            status: 'published',
            stats: { views: 0, completions: 0, endings: {} },
        });
    });
    afterAll(async () => {
        await mysql_1.sequelize.close();
    });
    it('should create a rating', async () => {
        const rating = await Rating_1.Rating.create({
            storyId: testStory._id.toString(),
            userId: 1,
            value: 5,
            comment: 'Great story!',
        });
        expect(rating.storyId).toBe(testStory._id.toString());
        expect(rating.userId).toBe(1);
        expect(rating.value).toBe(5);
        expect(rating.comment).toBe('Great story!');
    });
    it('should enforce unique rating per user per story', async () => {
        await Rating_1.Rating.create({
            storyId: testStory._id.toString(),
            userId: 1,
            value: 4,
        });
        // Try to create another rating for the same user and story
        await expect(Rating_1.Rating.create({
            storyId: testStory._id.toString(),
            userId: 1,
            value: 5,
        })).rejects.toThrow();
    });
    it('should allow different users to rate the same story', async () => {
        await Rating_1.Rating.create({
            storyId: testStory._id.toString(),
            userId: 1,
            value: 4,
        });
        const rating2 = await Rating_1.Rating.create({
            storyId: testStory._id.toString(),
            userId: 2,
            value: 5,
        });
        expect(rating2.userId).toBe(2);
    });
    it('should calculate average rating', async () => {
        await Rating_1.Rating.create({
            storyId: testStory._id.toString(),
            userId: 1,
            value: 4,
        });
        await Rating_1.Rating.create({
            storyId: testStory._id.toString(),
            userId: 2,
            value: 5,
        });
        await Rating_1.Rating.create({
            storyId: testStory._id.toString(),
            userId: 3,
            value: 3,
        });
        const stats = await Rating_1.Rating.findOne({
            where: { storyId: testStory._id.toString() },
            attributes: [
                [mysql_1.sequelize.fn('AVG', mysql_1.sequelize.col('value')), 'averageScore'],
                [mysql_1.sequelize.fn('COUNT', mysql_1.sequelize.col('id')), 'totalRatings']
            ],
            raw: true
        });
        expect(Number(stats.averageScore)).toBe(4);
        expect(Number(stats.totalRatings)).toBe(3);
    });
});
//# sourceMappingURL=rating.test.js.map