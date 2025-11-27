import { Schema, model, Document } from "mongoose";

export interface IGameSession extends Document {
	userId: string; // reference to User (MySQL)
	storyId: string; // reference to Story
	currentPageId: string;
	history: string[]; // array of page IDs visited
	status: "in_progress" | "completed" | "abandoned";
	diceRolls?: number[]; // optional dice roll history for future features
	inventory: string[]; // collected items
	isPreview?: boolean; // true if this is an author preview session (doesn't affect stats)
	endingPageId?: string; // the ending page reached (if completed)
	createdAt?: Date;
	updatedAt?: Date;
}

const GameSessionSchema = new Schema<IGameSession>(
	{
		userId: { type: String, required: true },
		storyId: { type: String, required: true },
		currentPageId: { type: String, required: true },
		history: [{ type: String }],
		status: {
			type: String,
			enum: ["in_progress", "completed", "abandoned"],
			default: "in_progress",
		},
		diceRolls: [{ type: Number }],
		inventory: [{ type: String }],
		isPreview: { type: Boolean, default: false },
		endingPageId: { type: String },
	},
	{
		timestamps: true,
	}
);

// Index for efficient queries
GameSessionSchema.index({ storyId: 1 });
GameSessionSchema.index({ userId: 1 });
GameSessionSchema.index({ storyId: 1, status: 1 });

export const GameSession = model<IGameSession>(
	"GameSession",
	GameSessionSchema
);
