import { Schema, model, Document } from 'mongoose';

export type ReportType =
    'inappropriate_content' |
    'spam' |
    'copyright' |
    'harassment' |
    'other';

export type ReportStatus =
    'pending' |
    'reviewed' |
    'resolved' |
    'dismissed';

export interface IReport extends Document {
    storyId: string;
    reporterId: string;
    type: ReportType;
    description?: string;
    status: ReportStatus;
    adminNotes?: string;
    resolvedBy?: string;  // MySQL user ID
    createdAt: Date;
    updatedAt: Date;
}

const ReportSchema = new Schema<IReport>(
    {
        storyId: { type: String, required: true, ref: 'Story' },
        reporterId: { type: String, required: true },
        type: {
            type: String,
            required: true,
            enum: ['inappropriate_content', 'spam', 'copyright', 'harassment', 'other'],
        },
        description: { type: String, maxlength: 500 },
        status: {
            type: String,
            enum: ['pending', 'reviewed', 'resolved', 'dismissed'],
            default: 'pending',
        },
        adminNotes: { type: String, maxlength: 2000 },
        resolvedBy: { type: String }, // MySQL User ID
    },
    { timestamps: true }
);

// Basic indexes
ReportSchema.index({ storyId: 1 });
ReportSchema.index({ reporterId: 1 });
ReportSchema.index({ status: 1 });

// Optimized for moderation flows
ReportSchema.index({ status: 1, createdAt: -1 });

ReportSchema.index(
    { storyId: 1, reporterId: 1, type: 1 },
    { unique: true }
);

export const Report = model<IReport>('Report', ReportSchema);
