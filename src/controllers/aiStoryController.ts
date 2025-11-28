import { Request, Response } from 'express';
import { aiService } from '../services/aiService';
import {
	StoryGenerationRequest,
	PageGenerationRequest,
	ChoiceSuggestionRequest,
} from "../services/ai/types";

/**
 * Controller for AI story generation endpoints
 */
export class AIStoryController {
	/**
	 * POST /api/ai/generate-story
	 * Generate a complete interactive story from a prompt
	 */
	async generateStory(req: Request, res: Response): Promise<void> {
		try {
			// @ts-ignore
			const userId = (req as any).userId;
			const { userPrompt, theme, numPages, language } =
				req.body as StoryGenerationRequest;

			if (!userPrompt || userPrompt.trim().length === 0) {
				res.status(400).json({ error: "User prompt is required" });
				return;
			}

			console.log(`Received story generation request: "${userPrompt}"`);

            const story = await aiService.generateFullStory({
                userPrompt,
                theme,
                numPages,
                language: language || 'fr',
            }, userId ? userId.toString() : 'ai-system');

			res.status(201).json({
				success: true,
				message: "Story generated successfully",
				data: {
					storyId: story._id,
					title: story.title,
					description: story.description,
					status: story.status,
				},
			});
		} catch (error: any) {
			console.error("Story generation error:", error);
			res.status(500).json({
				success: false,
				error: "Failed to generate story",
				details: error.message,
			});
		}
	}

	/**
	 * POST /api/ai/generate-page
	 * Generate a single page based on story context
	 */
	async generatePage(req: Request, res: Response): Promise<void> {
		try {
			const { storyContext, previousPageId, theme } =
				req.body as PageGenerationRequest;

			if (!storyContext) {
				res.status(400).json({ error: "Story context is required" });
				return;
			}

            const page = await aiService.generatePage({
                storyContext,
                previousPageId,
                theme,
            });

			res.status(201).json({
				success: true,
				message: "Page generated successfully",
				data: page,
			});
		} catch (error: any) {
			console.error("Page generation error:", error);
			res.status(500).json({
				success: false,
				error: "Failed to generate page",
				details: error.message,
			});
		}
	}

	/**
	 * POST /api/ai/suggest-choices
	 * Suggest choices for a given page
	 */
	async suggestChoices(req: Request, res: Response): Promise<void> {
		try {
			const { pageContent, storyContext, numChoices } =
				req.body as ChoiceSuggestionRequest;

			if (!pageContent || !storyContext) {
				res
					.status(400)
					.json({ error: "Page content and story context are required" });
				return;
			}

            const choices = await aiService.suggestChoices({
                pageContent,
                storyContext,
                numChoices: numChoices || 3,
            });

			res.status(200).json({
				success: true,
				message: "Choices suggested successfully",
				data: { choices },
			});
		} catch (error: any) {
			console.error("Choice suggestion error:", error);
			res.status(500).json({
				success: false,
				error: "Failed to suggest choices",
				details: error.message,
			});
		}
	}

    /**
     * GET /api/ai/health
     * Check AI service health
     */
    async healthCheck(req: Request, res: Response): Promise<void> {
        try {
            const health = await aiService.healthCheck();

			res.status(200).json({
				success: true,
				data: {
					service: "AI Story Generator",
					...health,
					timestamp: new Date().toISOString(),
				},
			});
		} catch (error: any) {
			console.error("Health check error:", error);
			res.status(503).json({
				success: false,
				error: "Service unavailable",
				details: error.message,
			});
		}
	}

	/**
	 * GET /api/ai/status
	 * Get generation status (for future async implementation)
	 */
	async getStatus(req: Request, res: Response): Promise<void> {
		// TODO: Implement job queue status checking
		res.status(200).json({
			success: true,
			message: "Status endpoint - coming soon",
			data: {
				note: "Currently all generations are synchronous. Async support coming soon.",
			},
		});
	}
}

export const aiStoryController = new AIStoryController();
