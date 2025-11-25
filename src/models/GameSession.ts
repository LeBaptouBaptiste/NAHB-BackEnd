import { Schema, model, Document } from 'mongoose';

export interface IGameSession extends Document {
    userId: string;           // MySQL reference
    storyId: string;          // Story ID (MySQL PK)
    currentPageId: string;
    history: string[];        // path of visited pages
    status: 'in_progress' | 'completed' | 'abandoned';
    diceRolls?: number[];     // for RNG mechanics
    isPreview: boolean;       // true = does not affect stats
    endingPageId?: string;    // pageId of ending
    flags: Record<string, any>; // NEW for conditional choices
    createdAt?: Date;
    updatedAt?: Date;
}

const GameSessionSchema = new Schema<IGameSession>(
    {
        userId: { type: String, required: true },
        storyId: { type: String, required: true },
        currentPageId: { type: String, required: true },

        history: [{ type: String, default: [] }],

        status: {
            type: String,
            enum: ['in_progress', 'completed', 'abandoned'],
            default: 'in_progress',
        },

        diceRolls: [{ type: Number }],

        isPreview: { type: Boolean, default: false },

        endingPageId: { type: String },

        // NEW
        flags: { type: Schema.Types.Mixed, default: {} },
    },
    {
        timestamps: true,
        minimize: false, // keep empty objects (important for flags)
    }
);

// Index for performance
GameSessionSchema.index({ userId: 1 });
GameSessionSchema.index({ storyId: 1 });
GameSessionSchema.index({ userId: 1, storyId: 1 });
GameSessionSchema.index({ storyId: 1, status: 1 });

export const GameSession = model<IGameSession>('GameSession', GameSessionSchema);
