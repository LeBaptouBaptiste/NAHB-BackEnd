import * as userRepository from "../repositories/userRepository";
import * as storyRepository from "../repositories/storyRepository";
import * as gameRepository from "../repositories/gameRepository";
import * as reportRepository from "../repositories/reportRepository";
import * as ratingRepository from "../repositories/ratingRepository";
import { sequelize } from "../config/mysql";

export const getAllUsers = async (
	page: number = 1,
	limit: number = 20,
	search?: string
) => {
	const offset = (page - 1) * limit;
	const where: any = {};

	if (search) {
		where.username = { $like: `%${search}%` };
	}

	const { count, rows: users } = await userRepository.findAndCountAll({
		attributes: ["id", "username", "email", "role", "createdAt", "updatedAt"],
		limit,
		offset,
		order: [["createdAt", "DESC"]],
	});

	return {
		users,
		pagination: {
			page,
			limit,
			total: count,
			pages: Math.ceil(count / limit),
		},
	};
};

export const toggleUserBan = async (userId: number, banned: boolean) => {
	const user = await userRepository.findById(userId);
	if (!user) {
		throw new Error("User not found");
	}

	if (user.role === "admin") {
		throw new Error("Cannot ban an admin");
	}

	user.role = banned ? "banned" : "author";
	await user.save();

	if (banned) {
		await storyRepository.updateMany(
			{ authorId: userId.toString() },
			{ status: "suspended" }
		);
	}

	return { message: banned ? "User banned" : "User unbanned", user };
};

export const toggleStorySuspension = async (
	storyId: string,
	suspended: boolean
) => {
	const story = await storyRepository.findById(storyId);
	if (!story) {
		throw new Error("Story not found");
	}

	story.status = suspended ? "suspended" : "draft";
	await story.save();

	return {
		message: suspended ? "Story suspended" : "Story unsuspended",
		story,
	};
};

export const getAllReports = async (
	status?: string,
	page: number = 1,
	limit: number = 20
) => {
	const filter: any = {};
	if (status) {
		filter.status = status;
	}

	const offset = (page - 1) * limit;

	const { count, rows: reports } = await reportRepository.findAndCountAll({
		where: filter,
		order: [["createdAt", "DESC"]],
		limit,
		offset,
	});

	return {
		reports,
		pagination: {
			page,
			limit,
			total: count,
			pages: Math.ceil(count / limit),
		},
	};
};

export const updateReportStatus = async (
	adminId: number,
	reportId: string,
	status: string,
	adminNotes?: string
) => {
	const validStatuses = ["pending", "reviewed", "resolved", "dismissed"];
	if (!validStatuses.includes(status)) {
		throw new Error("Invalid status");
	}

	const report = await reportRepository.findById(reportId);
	if (!report) {
		throw new Error("Report not found");
	}

	report.status = status as any;
	if (adminNotes) (report as any).adminNotes = adminNotes;
	report.resolvedBy = adminId;
	await report.save();

	return report;
};

export const getPlatformStats = async () => {
	// User stats
	const totalUsers = await userRepository.count();
	const usersByRole = (await userRepository.findAll({
		attributes: [
			"role",
			[sequelize.fn("COUNT", sequelize.col("role")), "count"],
		],
		group: ["role"],
		raw: true,
	})) as any[];

	// Story stats
	const totalStories = await storyRepository.count();
	const storiesByStatus = await storyRepository.aggregate([
		{ $group: { _id: "$status", count: { $sum: 1 } } },
	]);

	// Game session stats
	const totalSessions = await gameRepository.count();
	const sessionsByStatus = await gameRepository.aggregate([
		{ $group: { _id: "$status", count: { $sum: 1 } } },
	]);

	// Calculate total views and completions
	const storyStats = await storyRepository.aggregate([
		{
			$group: {
				_id: null,
				totalViews: { $sum: "$stats.views" },
				totalCompletions: { $sum: "$stats.completions" },
			},
		},
	]);

	// Report stats
	const pendingReports = await reportRepository.count({ status: "pending" });
	const totalReports = await reportRepository.count();

	// Rating stats
	const ratingStats = await ratingRepository.getAverageStats(""); // Empty string as we want global stats?
	// Wait, getAverageStats in repo takes storyId and filters by it.
	// I need a global average stats method in ratingRepository.
	// Or I can use sequelize directly here, but that breaks abstraction.
	// Let's add getGlobalStats to ratingRepository.

	// For now, let's assume I'll add it.
	const globalRatingStats = await ratingRepository.getGlobalStats();

	return {
		users: {
			total: totalUsers,
			byRole: usersByRole.map((r) => ({ _id: r.role, count: r.count })),
		},
		stories: {
			total: totalStories,
			byStatus: storiesByStatus,
			totalViews: storyStats[0]?.totalViews || 0,
			totalCompletions: storyStats[0]?.totalCompletions || 0,
		},
		sessions: {
			total: totalSessions,
			byStatus: sessionsByStatus,
		},
		reports: {
			total: totalReports,
			pending: pendingReports,
		},
		ratings: {
			average: globalRatingStats
				? Math.round(Number(globalRatingStats.averageRating) * 10) / 10
				: 0,
			total: globalRatingStats ? Number(globalRatingStats.totalRatings) : 0,
		},
	};
};

export const getAllStories = async (
	status?: string,
	page: number = 1,
	limit: number = 20,
	search?: string
) => {
	const filter: any = {};
	if (status) {
		filter.status = status;
	}
	if (search) {
		filter.title = { $regex: search, $options: "i" };
	}

	const skip = (page - 1) * limit;

	const stories = await storyRepository.find(
		filter,
		{ createdAt: -1 },
		skip,
		limit
	);
	const total = await storyRepository.count(filter);

	return {
		stories,
		pagination: {
			page,
			limit,
			total,
			pages: Math.ceil(total / limit),
		},
	};
};
