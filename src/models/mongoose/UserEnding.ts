// src/models/mongoose/UserEnding.ts
import { Schema, model, Document } from 'mongoose';

export interface IUserEnding extends Document {
  userId: number;     // id MySQL de l'utilisateur
  storyId: number;    // id MySQL de l'histoire
  endingId: number;   // id MySQL de l'ending
  unlockedAt: Date;
}

const UserEndingSchema = new Schema<IUserEnding>(
  {
    userId: { type: Number, required: true },
    storyId: { type: Number, required: true },
    endingId: { type: Number, required: true },
    unlockedAt: { type: Date, default: Date.now },
  },
  {
    timestamps: false,
  }
);

// Un user ne débloque une fin donnée qu'une fois pour une histoire donnée
UserEndingSchema.index(
  { userId: 1, storyId: 1, endingId: 1 },
  { unique: true }
);

export const UserEnding = model<IUserEnding>('UserEnding', UserEndingSchema);
