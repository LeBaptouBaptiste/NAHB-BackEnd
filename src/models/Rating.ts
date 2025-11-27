import { Schema, model, Document } from "mongoose";

export interface IRating extends Document {
	storyId: string;
	userId: string;
	score: number; // 1-5
	comment?: string;
	createdAt: Date;
	updatedAt: Date;
}

const RatingSchema = new Schema<IRating>(
	{
		storyId: { type: String, required: true, ref: "Story" },
		userId: { type: String, required: true },
		score: { type: Number, required: true, min: 1, max: 5 },
		comment: { type: String, maxlength: 1000 },
	},
	{
		timestamps: true,
	}
);

// Compound index to ensure one rating per user per story
RatingSchema.index({ storyId: 1, userId: 1 }, { unique: true });

export const Rating = model<IRating>("Rating", RatingSchema);
