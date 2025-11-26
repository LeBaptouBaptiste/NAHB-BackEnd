"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Favorite = void 0;
const mongoose_1 = require("mongoose");
const FavoriteSchema = new mongoose_1.Schema({
    userId: { type: String, required: true },
    storyId: { type: String, required: true, ref: 'Story' },
}, {
    timestamps: true,
});
// Compound index to ensure one favorite per user per story
FavoriteSchema.index({ userId: 1, storyId: 1 }, { unique: true });
exports.Favorite = (0, mongoose_1.model)('Favorite', FavoriteSchema);
//# sourceMappingURL=Favorite.js.map