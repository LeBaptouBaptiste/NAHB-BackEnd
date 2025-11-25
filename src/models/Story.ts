import { Schema, model, Document } from 'mongoose';

export interface IStory extends Document {
    title: string;
    description: string;
    tags: string[];
    status: 'draft' | 'published' | 'suspended';
    authorId: string;          // MySQL FK
    startPageId?: string;
    theme?: string;
    imageUrl?: string;
    createdAt: Date;
    updatedAt: Date;
}

const StorySchema = new Schema<IStory>(
    {
        title: { type: String, required: true },
        description: { type: String },
        tags: [{ type: String }],
        status: {
            type: String,
            enum: ['draft', 'published', 'suspended'],
            default: 'draft'
        },
        authorId: { type: String, required: true },
        startPageId: { type: String },
        theme: { type: String },
        imageUrl: { type: String },
    },
    { timestamps: true }
);

// INDEXES
StorySchema.index({ authorId: 1 });
StorySchema.index({ status: 1 });
StorySchema.index({ title: 'text', description: 'text' }); // full-text search
StorySchema.index({ tags: 1 });

export const Story = model<IStory>('Story', StorySchema);
