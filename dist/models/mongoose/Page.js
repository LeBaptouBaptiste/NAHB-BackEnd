"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Page = void 0;
const mongoose_1 = require("mongoose");
const ChoiceSchema = new mongoose_1.Schema({
    text: { type: String, required: true },
    targetPageId: { type: String, required: false },
    condition: { type: mongoose_1.Schema.Types.Mixed },
});
const PageSchema = new mongoose_1.Schema({
    storyId: { type: String, required: true, ref: 'Story' },
    content: { type: String, required: true },
    image: { type: String },
    isEnding: { type: Boolean, default: false },
    endingType: { type: String },
    choices: [ChoiceSchema],
});
exports.Page = (0, mongoose_1.model)('Page', PageSchema);
//# sourceMappingURL=Page.js.map