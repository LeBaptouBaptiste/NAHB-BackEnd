import { Schema, model, Document } from 'mongoose';

export interface IGameSession extends Document {
    userId: string;
    storyId: string;
    currentPageId: string;
    history: string[];
    status: 'in_progress' | 'completed' | 'abandoned';
    diceRolls?: number[];

    isPreview?: boolean;   // <— important pour auteurs
    autosave?: boolean;    // <— utile pour auto-save clean
    updatedAt?: Date;
}

const GameSessionSchema = new Schema<IGameSession>({
    userId: { type: String, required: true },
    storyId: { type: String, required: true },
    currentPageId: { type: String, required: true },
    history: [{ type: String }],
    status: { type: String, enum: ['in_progress', 'completed', 'abandoned'], default: 'in_progress' },
    diceRolls: [{ type: Number }],

    isPreview: { type: Boolean, default: false },
    autosave: { type: Boolean, default: false },
}, { timestamps: true });


export const GameSession = model<IGameSession>('GameSession', GameSessionSchema);
