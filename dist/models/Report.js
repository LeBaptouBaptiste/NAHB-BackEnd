"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Report = void 0;
const mongoose_1 = require("mongoose");
const ReportSchema = new mongoose_1.Schema({
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
    adminNotes: { type: String },
    resolvedBy: { type: String },
}, {
    timestamps: true,
});
// Index for efficient queries
ReportSchema.index({ storyId: 1 });
ReportSchema.index({ status: 1 });
ReportSchema.index({ reporterId: 1 });
exports.Report = (0, mongoose_1.model)('Report', ReportSchema);
//# sourceMappingURL=Report.js.map