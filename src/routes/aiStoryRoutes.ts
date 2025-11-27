import { Router } from "express";
import { aiStoryController } from "../controllers/aiStoryController";
import { authenticate } from "../middleware/auth";

const router = Router();

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
router.post("/generate-story", authenticate, (req, res) =>
	aiStoryController.generateStory(req, res)
);

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
router.post("/generate-page", (req, res) =>
	aiStoryController.generatePage(req, res)
);

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
router.post("/suggest-choices", (req, res) =>
	aiStoryController.suggestChoices(req, res)
);

/**
 * GET /api/ai/health
 * Check AI service health
 */
router.get("/health", (req, res) => aiStoryController.healthCheck(req, res));

/**
 * GET /api/ai/status
 * Get generation status (for future async implementation)
 */
router.get("/status", (req, res) => aiStoryController.getStatus(req, res));

export default router;
