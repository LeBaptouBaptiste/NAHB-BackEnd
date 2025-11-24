import { Schema, model, Document } from 'mongoose';

export interface IGameSession extends Document {
    userId: string; // reference to User (MySQL)
    storyId: string; // reference to Story
    currentPageId: string;
    history: string[]; // array of page IDs visited
    status: 'in_progress' | 'completed' | 'abandoned';
    diceRolls?: number[]; // optional dice roll history for future features
}

const GameSessionSchema = new Schema<IGameSession>({
    userId: { type: String, required: true },
    storyId: { type: String, required: true },
    currentPageId: { type: String, required: true },
    history: [{ type: String }],
    status: { type: String, enum: ['in_progress', 'completed', 'abandoned'], default: 'in_progress' },
    diceRolls: [{ type: Number }],
});

export const GameSession = model<IGameSession>('GameSession', GameSessionSchema);
