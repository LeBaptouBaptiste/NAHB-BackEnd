"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Story = void 0;
const mongoose_1 = require("mongoose");
const StorySchema = new mongoose_1.Schema({
    title: { type: String, required: true },
    description: { type: String },
    tags: [{ type: String }],
    status: { type: String, enum: ['draft', 'published', 'suspended'], default: 'draft' },
    authorId: { type: String, required: true },
    startPageId: { type: String },
    stats: {
        views: { type: Number, default: 0 },
        completions: { type: Number, default: 0 },
        endings: { type: Map, of: Number, default: {} },
    },
    theme: { type: String },
});
exports.Story = (0, mongoose_1.model)('Story', StorySchema);
//# sourceMappingURL=Story.js.map