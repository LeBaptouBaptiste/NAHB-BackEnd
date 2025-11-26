"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Rating = void 0;
const mongoose_1 = require("mongoose");
const RatingSchema = new mongoose_1.Schema({
    storyId: { type: String, required: true, ref: 'Story' },
    userId: { type: String, required: true },
    score: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, maxlength: 1000 },
}, {
    timestamps: true,
});
// Compound index to ensure one rating per user per story
RatingSchema.index({ storyId: 1, userId: 1 }, { unique: true });
exports.Rating = (0, mongoose_1.model)('Rating', RatingSchema);
//# sourceMappingURL=Rating.js.map