"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.aiStoryController = exports.AIStoryController = void 0;
const storyGenerator_1 = require("../services/ai/storyGenerator");
/**
 * Controller for AI story generation endpoints
 */
class AIStoryController {
    /**
     * POST /api/ai/generate-story
     * Generate a complete interactive story from a prompt
     */
    async generateStory(req, res) {
        try {
            // @ts-ignore
            const userId = req.userId;
            const { userPrompt, theme, numPages, language } = req.body;
            if (!userPrompt || userPrompt.trim().length === 0) {
                res.status(400).json({ error: 'User prompt is required' });
                return;
            }
            console.log(`Received story generation request: "${userPrompt}"`);
            const story = await storyGenerator_1.storyGenerator.generateFullStory({
                userPrompt,
                theme,
                numPages,
                language: language || 'fr',
            }, userId ? userId.toString() : 'ai-system');
            res.status(201).json({
                success: true,
                message: 'Story generated successfully',
                data: {
                    storyId: story._id,
                    title: story.title,
                    description: story.description,
                    status: story.status,
                },
            });
        }
        catch (error) {
            console.error('Story generation error:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to generate story',
                details: error.message,
            });
        }
    }
    /**
     * POST /api/ai/generate-page
     * Generate a single page based on story context
     */
    async generatePage(req, res) {
        try {
            const { storyContext, previousPageId, theme } = req.body;
            if (!storyContext) {
                res.status(400).json({ error: 'Story context is required' });
                return;
            }
            const page = await storyGenerator_1.storyGenerator.generatePage({
                storyContext,
                previousPageId,
                theme,
            });
            res.status(201).json({
                success: true,
                message: 'Page generated successfully',
                data: page,
            });
        }
        catch (error) {
            console.error('Page generation error:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to generate page',
                details: error.message,
            });
        }
    }
    /**
     * POST /api/ai/suggest-choices
     * Suggest choices for a given page
     */
    async suggestChoices(req, res) {
        try {
            const { pageContent, storyContext, numChoices } = req.body;
            if (!pageContent || !storyContext) {
                res.status(400).json({ error: 'Page content and story context are required' });
                return;
            }
            const choices = await storyGenerator_1.storyGenerator.suggestChoices({
                pageContent,
                storyContext,
                numChoices: numChoices || 3,
            });
            res.status(200).json({
                success: true,
                message: 'Choices suggested successfully',
                data: { choices },
            });
        }
        catch (error) {
            console.error('Choice suggestion error:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to suggest choices',
                details: error.message,
            });
        }
    }
    /**
     * GET /api/ai/health
     * Check AI service health
     */
    async healthCheck(req, res) {
        try {
            const health = await storyGenerator_1.storyGenerator.healthCheck();
            res.status(200).json({
                success: true,
                data: {
                    service: 'AI Story Generator',
                    ...health,
                    timestamp: new Date().toISOString(),
                },
            });
        }
        catch (error) {
            console.error('Health check error:', error);
            res.status(503).json({
                success: false,
                error: 'Service unavailable',
                details: error.message,
            });
        }
    }
    /**
     * GET /api/ai/status
     * Get generation status (for future async implementation)
     */
    async getStatus(req, res) {
        // TODO: Implement job queue status checking
        res.status(200).json({
            success: true,
            message: 'Status endpoint - coming soon',
            data: {
                note: 'Currently all generations are synchronous. Async support coming soon.',
            },
        });
    }
}
exports.AIStoryController = AIStoryController;
exports.aiStoryController = new AIStoryController();
//# sourceMappingURL=aiStoryController.js.map