"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const aiStoryController_1 = require("../controllers/aiStoryController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
/**
 * POST /api/ai/generate-story
 * Generate a complete interactive story from a user prompt
 *
 * Body:
 * {
 *   "userPrompt": "Create a story about a wizard in a haunted castle",
 *   "theme": "fantasy",
 *   "numPages": 15,
 *   "language": "fr"
 * }
 */
router.post('/generate-story', auth_1.authenticate, (req, res) => aiStoryController_1.aiStoryController.generateStory(req, res));
/**
 * POST /api/ai/generate-page
 * Generate a single page based on story context
 *
 * Body:
 * {
 *   "storyContext": "The hero is exploring a dark dungeon...",
 *   "previousPageId": "507f1f77bcf86cd799439011",
 *   "theme": "fantasy"
 * }
 */
router.post('/generate-page', (req, res) => aiStoryController_1.aiStoryController.generatePage(req, res));
/**
 * POST /api/ai/suggest-choices
 * Suggest choices for a given page
 *
 * Body:
 * {
 *   "pageContent": "You stand before a locked door...",
 *   "storyContext": "Fantasy dungeon adventure",
 *   "numChoices": 3
 * }
 */
router.post('/suggest-choices', (req, res) => aiStoryController_1.aiStoryController.suggestChoices(req, res));
/**
 * GET /api/ai/health
 * Check AI service health
 */
router.get('/health', (req, res) => aiStoryController_1.aiStoryController.healthCheck(req, res));
/**
 * GET /api/ai/status
 * Get generation status (for future async implementation)
 */
router.get('/status', (req, res) => aiStoryController_1.aiStoryController.getStatus(req, res));
exports.default = router;
//# sourceMappingURL=aiStoryRoutes.js.map