import { Report } from "../../models/sequelize/Report";
import { Story } from "../../models/mongoose/Story";
import { sequelize } from "../../config/mysql";

describe("Report Model", () => {
	let testStory: any;

	beforeAll(async () => {
		await sequelize.sync({ force: true });
	});

	beforeEach(async () => {
		await Report.destroy({ where: {}, truncate: true });
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

	it("should create a report", async () => {
		const report = await Report.create({
			storyId: testStory._id.toString(),
			userId: 2,
			type: "inappropriate_content",
			description: "This story contains inappropriate content.",
		});

		expect(report.storyId).toBe(testStory._id.toString());
		expect(report.userId).toBe(2);
		expect(report.type).toBe("inappropriate_content");
		expect(report.status).toBe("pending");
	});

	it("should default status to pending", async () => {
		const report = await Report.create({
			storyId: testStory._id.toString(),
			userId: 2,
			type: "spam",
		});

		expect(report.status).toBe("pending");
	});

	it("should only allow valid status values", async () => {
		const report = await Report.create({
			storyId: testStory._id.toString(),
			userId: 2,
			type: "spam",
		});

		report.status = "invalid_status" as any;
		await expect(report.save()).rejects.toThrow();
	});

	it("should update report status", async () => {
		const report = await Report.create({
			storyId: testStory._id.toString(),
			userId: 2,
			type: "copyright",
		});

		report.status = "resolved";
		report.adminNotes = "Reviewed and resolved";
		report.resolvedBy = 1; // adminId
		await report.save();

		const updatedReport = await Report.findByPk(report.id);
		expect(updatedReport?.status).toBe("resolved");
		expect(updatedReport?.adminNotes).toBe("Reviewed and resolved");
		expect(updatedReport?.resolvedBy).toBe(1);
	});
});
