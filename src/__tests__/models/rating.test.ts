import { Rating } from "../../models/sequelize/Rating";
import { Story } from "../../models/mongoose/Story";
import { sequelize } from "../../config/mysql";

describe("Rating Model", () => {
	let testStory: any;

	beforeAll(async () => {
		await sequelize.sync({ force: true }); // Reset database
	});

	beforeEach(async () => {
		await Rating.destroy({ where: {}, truncate: true });
		testStory = await Story.create({
			title: "Test Story",
			authorId: "1",
			status: "published",
			stats: { views: 0, completions: 0, endings: {} },
		});
	});

	afterAll(async () => {
		await sequelize.close();
	});

	it("should create a rating", async () => {
		const rating = await Rating.create({
			storyId: testStory._id.toString(),
			userId: 1,
			value: 5,
			comment: "Great story!",
		});

		expect(rating.storyId).toBe(testStory._id.toString());
		expect(rating.userId).toBe(1);
		expect(rating.value).toBe(5);
		expect(rating.comment).toBe("Great story!");
	});

	it("should enforce unique rating per user per story", async () => {
		await Rating.create({
			storyId: testStory._id.toString(),
			userId: 1,
			value: 4,
		});

		// Try to create another rating for the same user and story
		await expect(
			Rating.create({
				storyId: testStory._id.toString(),
				userId: 1,
				value: 5,
			})
		).rejects.toThrow();
	});

	it("should allow different users to rate the same story", async () => {
		await Rating.create({
			storyId: testStory._id.toString(),
			userId: 1,
			value: 4,
		});

		const rating2 = await Rating.create({
			storyId: testStory._id.toString(),
			userId: 2,
			value: 5,
		});

		expect(rating2.userId).toBe(2);
	});

	it("should calculate average rating", async () => {
		await Rating.create({
			storyId: testStory._id.toString(),
			userId: 1,
			value: 4,
		});

		await Rating.create({
			storyId: testStory._id.toString(),
			userId: 2,
			value: 5,
		});

		await Rating.create({
			storyId: testStory._id.toString(),
			userId: 3,
			value: 3,
		});

		const stats = (await Rating.findOne({
			where: { storyId: testStory._id.toString() },
			attributes: [
				[sequelize.fn("AVG", sequelize.col("value")), "averageScore"],
				[sequelize.fn("COUNT", sequelize.col("id")), "totalRatings"],
			],
			raw: true,
		})) as any;

		expect(Number(stats.averageScore)).toBe(4);
		expect(Number(stats.totalRatings)).toBe(3);
	});
});
