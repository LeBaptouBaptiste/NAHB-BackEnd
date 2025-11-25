import { Rating } from '../../models/mongoose/Rating';
import { Story } from '../../models/mongoose/Story';

describe('Rating Model', () => {
    let testStory: any;

    beforeEach(async () => {
        testStory = await Story.create({
            title: 'Test Story',
            authorId: '1',
            status: 'published',
            stats: { views: 0, completions: 0, endings: {} },
        });
    });

    it('should create a rating', async () => {
        const rating = await Rating.create({
            storyId: testStory._id.toString(),
            userId: '1',
            score: 5,
            comment: 'Great story!',
        });

        expect(rating.storyId).toBe(testStory._id.toString());
        expect(rating.userId).toBe('1');
        expect(rating.score).toBe(5);
        expect(rating.comment).toBe('Great story!');
    });

    it('should enforce score range (1-5)', async () => {
        const invalidRatingLow = {
            storyId: testStory._id.toString(),
            userId: '1',
            score: 0,
        };

        const invalidRatingHigh = {
            storyId: testStory._id.toString(),
            userId: '1',
            score: 6,
        };

        await expect(Rating.create(invalidRatingLow)).rejects.toThrow();
        await expect(Rating.create(invalidRatingHigh)).rejects.toThrow();
    });

    it('should enforce unique rating per user per story', async () => {
        await Rating.create({
            storyId: testStory._id.toString(),
            userId: '1',
            score: 4,
        });

        // Try to create another rating for the same user and story
        await expect(Rating.create({
            storyId: testStory._id.toString(),
            userId: '1',
            score: 5,
        })).rejects.toThrow();
    });

    it('should allow different users to rate the same story', async () => {
        await Rating.create({
            storyId: testStory._id.toString(),
            userId: '1',
            score: 4,
        });

        const rating2 = await Rating.create({
            storyId: testStory._id.toString(),
            userId: '2',
            score: 5,
        });

        expect(rating2.userId).toBe('2');
    });

    it('should calculate average rating', async () => {
        await Rating.create({
            storyId: testStory._id.toString(),
            userId: '1',
            score: 4,
        });

        await Rating.create({
            storyId: testStory._id.toString(),
            userId: '2',
            score: 5,
        });

        await Rating.create({
            storyId: testStory._id.toString(),
            userId: '3',
            score: 3,
        });

        const aggregation = await Rating.aggregate([
            { $match: { storyId: testStory._id.toString() } },
            {
                $group: {
                    _id: null,
                    averageScore: { $avg: '$score' },
                    totalRatings: { $sum: 1 },
                },
            },
        ]);

        expect(aggregation[0].averageScore).toBe(4);
        expect(aggregation[0].totalRatings).toBe(3);
    });
});

