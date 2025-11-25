import { Schema, model, Document } from 'mongoose';

export interface IFavorite extends Document {
    userId: string; // reference to User (MySQL)
    storyId: string; // reference to Story
    createdAt?: Date;
}

const FavoriteSchema = new Schema<IFavorite>(
    {
        userId: { type: String, required: true },
        storyId: { type: String, required: true, ref: 'Story' },
    },
    {
        timestamps: true,
    }
);

// Compound index to ensure one favorite per user per story
FavoriteSchema.index({ userId: 1, storyId: 1 }, { unique: true });

export const Favorite = model<IFavorite>('Favorite', FavoriteSchema);

