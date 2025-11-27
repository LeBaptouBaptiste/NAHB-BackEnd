import { Schema, model, Document } from "mongoose";

export type ReportType =
	| "inappropriate_content"
	| "spam"
	| "copyright"
	| "harassment"
	| "other";
export type ReportStatus = "pending" | "reviewed" | "resolved" | "dismissed";

export interface IReport extends Document {
	storyId: string;
	reporterId: string;
	type: ReportType;
	description?: string;
	status: ReportStatus;
	adminNotes?: string;
	resolvedBy?: string;
	createdAt: Date;
	updatedAt: Date;
}

const ReportSchema = new Schema<IReport>(
	{
		storyId: { type: String, required: true, ref: "Story" },
		reporterId: { type: String, required: true },
		type: {
			type: String,
			required: true,
			enum: [
				"inappropriate_content",
				"spam",
				"copyright",
				"harassment",
				"other",
			],
		},
		description: { type: String, maxlength: 500 },
		status: {
			type: String,
			enum: ["pending", "reviewed", "resolved", "dismissed"],
			default: "pending",
		},
		adminNotes: { type: String },
		resolvedBy: { type: String },
	},
	{
		timestamps: true,
	}
);

// Index for efficient queries
ReportSchema.index({ storyId: 1 });
ReportSchema.index({ status: 1 });
ReportSchema.index({ reporterId: 1 });

export const Report = model<IReport>("Report", ReportSchema);
