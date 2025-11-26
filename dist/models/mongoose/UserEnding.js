"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserEnding = void 0;
// src/models/mongoose/UserEnding.ts
const mongoose_1 = require("mongoose");
const UserEndingSchema = new mongoose_1.Schema({
    userId: { type: Number, required: true },
    storyId: { type: Number, required: true },
    endingId: { type: Number, required: true },
    unlockedAt: { type: Date, default: Date.now },
}, {
    timestamps: false,
});
// Un user ne débloque une fin donnée qu'une fois pour une histoire donnée
UserEndingSchema.index({ userId: 1, storyId: 1, endingId: 1 }, { unique: true });
exports.UserEnding = (0, mongoose_1.model)('UserEnding', UserEndingSchema);
//# sourceMappingURL=UserEnding.js.map