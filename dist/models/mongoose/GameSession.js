"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameSession = void 0;
const mongoose_1 = require("mongoose");
const GameSessionSchema = new mongoose_1.Schema({
    userId: { type: String, required: true },
    storyId: { type: String, required: true },
    currentPageId: { type: String, required: true },
    history: [{ type: String }],
    status: { type: String, enum: ['in_progress', 'completed', 'abandoned'], default: 'in_progress' },
    diceRolls: [{ type: Number }],
    isPreview: { type: Boolean, default: false },
    endingPageId: { type: String },
}, {
    timestamps: true,
});
// Index for efficient queries
GameSessionSchema.index({ storyId: 1 });
GameSessionSchema.index({ userId: 1 });
GameSessionSchema.index({ storyId: 1, status: 1 });
exports.GameSession = (0, mongoose_1.model)('GameSession', GameSessionSchema);
//# sourceMappingURL=GameSession.js.map