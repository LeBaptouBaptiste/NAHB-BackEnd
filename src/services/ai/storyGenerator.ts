import { OllamaClient, ollamaClient } from "./ollamaClient";
import { KnowledgeBase, knowledgeBase } from "./knowledgeBase";
import { PromptTemplates } from "./promptTemplates";
import {
	StoryGenerationRequest,
	PageGenerationRequest,
	ChoiceSuggestionRequest,
	GeneratedStory,
	GeneratedPage,
	GeneratedChoice,
} from "./types";
import { Story, IStory } from "../../models/mongoose/Story";
import { Page, IPage } from "../../models/mongoose/Page";

/**
 * Service for generating interactive stories using AI
 */
export class StoryGenerator {
	constructor(
		private ollama: OllamaClient = ollamaClient,
		private knowledge: KnowledgeBase = knowledgeBase
	) {}

	/**
	 * Generate a complete story from a user prompt using iterative page generation
	 */
	async generateFullStory(
		request: StoryGenerationRequest,
		authorId: string = "ai-system"
	): Promise<IStory> {
		const { userPrompt, theme, numPages = 6, language = "fr" } = request;

		console.log(`🎯 Generating story iteratively: "${userPrompt}"`);
		console.log(`📄 Target pages: ${numPages}`);

		try {
			// Step 1: Generate story metadata
			console.log("📝 Step 1: Generating metadata...");
			const metadata = await this.generateStoryMetadata(userPrompt, language);

			// Step 2: Create story document
			console.log("💾 Step 2: Creating story document...");
			const story = new Story({
				title: metadata.title,
				description: metadata.description,
				tags: metadata.tags || ["ai-generated", "interactive"],
				status: "draft",
				authorId: authorId,
				theme: metadata.theme || theme || "adventure",
				stats: {
					views: 0,
					completions: 0,
					endings: {},
				},
			});
			await story.save();
			console.log(`✅ Story created: ${story._id}`);

			// Step 3: Generate first page (class selection)
			console.log("📄 Step 3: Generating first page...");
			const firstPage = await this.generateFirstPage(
				story._id.toString(),
				metadata.title,
				metadata.description,
				metadata.theme || "adventure",
				language
			);

			// Update story with start page
			story.startPageId = firstPage._id.toString();
			await story.save();

            // Step 4: Iterative page generation
            console.log(`🔄 Step 4: Generating remaining pages (target: ${numPages})...`);
            // Do not await this, let it run in background
            this.generateRemainingPages(
                story._id.toString(),
                metadata.title,
                metadata.theme || 'adventure',
                firstPage,
                numPages,
                language
            ).catch(err => console.error('Background generation error:', err));

			console.log(`🎉 Story generation complete! ID: ${story._id}`);
			return story;
		} catch (error: any) {
			console.error("❌ Story generation error:", error);
			throw new Error(`Failed to generate story: ${error.message}`);
		}
	}

	/**
	 * Generate a single page based on story context
	 */
	async generatePage(request: PageGenerationRequest): Promise<IPage> {
		const { storyContext, previousPageId, theme } = request;

		try {
			// Get knowledge context
			const knowledgeContext = this.knowledge.getGenerationContext(theme);

			// Get previous page content if provided
			let previousContent = "";
			if (previousPageId) {
				const previousPage = await Page.findById(previousPageId);
				if (previousPage) {
					previousContent = previousPage.content;
				}
			}

			// Build prompt
			const prompt = PromptTemplates.generatePagePrompt(
				storyContext,
				previousContent,
				knowledgeContext
			);

			// Generate
			const rawOutput = await this.ollama.generate(prompt, {
				temperature: 0.7,
				num_predict: 1000,
			});

			// Parse and create page
			const parsedPage = this.parseGeneratedPage(rawOutput);

			return parsedPage as any; // Return parsed structure
		} catch (error: any) {
			console.error("Page generation error:", error);
			throw new Error(`Failed to generate page: ${error.message}`);
		}
	}

	/**
	 * Generate story metadata (title, description, tags)
	 */
	private async generateStoryMetadata(
		userPrompt: string,
		language: string
	): Promise<{
		title: string;
		description: string;
		tags: string[];
		theme: string;
	}> {
		const prompt = PromptTemplates.generateMetadataPrompt(userPrompt, language);
		const rawOutput = await this.ollama.generate(prompt, {
			temperature: 0.7,
			num_predict: 300,
		});

		try {
			// Extract JSON from response
			const jsonMatch = rawOutput.match(/\{[\s\S]*?\}/);
			if (jsonMatch) {
				return JSON.parse(jsonMatch[0]);
			}
		} catch (error) {
			console.warn("Failed to parse metadata JSON, using defaults");
		}

		// Fallback
		return {
			title: "Histoire Interactive",
			description: userPrompt.substring(0, 150),
			tags: ["interactive", "rpg"],
			theme: "adventure",
		};
	}

	/**
	 * Generate the first page with class selection
	 */
	private async generateFirstPage(
		storyId: string,
		title: string,
		description: string,
		theme: string,
		language: string
	): Promise<IPage> {
		const prompt = PromptTemplates.generateFirstPagePrompt(
			title,
			description,
			theme,
			language
		);

		const rawOutput = await this.ollama.generate(prompt, {
			temperature: 0.8,
			num_predict: 800,
		});

		// Parse the generated page
		const choices = this.extractChoicesFromPage(rawOutput);

		const page = new Page({
			storyId,
			content: rawOutput.trim(),
			isEnding: false,
			choices: choices.map((c) => ({ text: c.text, targetPageId: undefined })),
		});

		await page.save();
		console.log(
			`   ✅ First page created: ${page._id} (${choices.length} choices)`
		);

		return page;
	}

	/**
	 * Generate remaining pages iteratively using a queue-based approach
	 */
	private async generateRemainingPages(
		storyId: string,
		title: string,
		theme: string,
		firstPage: IPage,
		targetPages: number,
		language: string
	): Promise<void> {
		// Queue of pending choices to generate pages for
		interface PendingChoice {
			parentPageId: string;
			parentContent: string;
			choiceText: string;
			choiceIndex: number;
			depth: number;
		}

		const queue: PendingChoice[] = [];
		let pageCount = 1; // We already have the first page
		const maxPages = Math.min(targetPages, 12); // Cap at 12 pages to avoid infinite generation

		// Add first page choices to queue
		firstPage.choices?.forEach((choice, index) => {
			queue.push({
				parentPageId: firstPage._id.toString(),
				parentContent: firstPage.content,
				choiceText: choice.text,
				choiceIndex: index,
				depth: 1,
			});
		});

		console.log(`   📋 Queue initialized with ${queue.length} choices`);

		while (queue.length > 0 && pageCount < maxPages) {
			const pending = queue.shift()!;
			pageCount++;

			const shouldBeEnding =
				pageCount >= maxPages - 1 || // Last pages should be endings
				pending.depth >= 3 || // Deep paths become endings
				Math.random() > 0.7; // 30% chance of ending

			console.log(
				`   ⏳ Generating page ${pageCount}/${maxPages} (depth: ${pending.depth}, ending: ${shouldBeEnding})...`
			);

			try {
				const prompt = PromptTemplates.generateContinuationPagePrompt(
					{
						title,
						theme,
						previousContent: pending.parentContent.substring(0, 400), // Limit context
						choiceTaken: pending.choiceText,
						pageNumber: pageCount,
						shouldBeEnding,
					},
					language
				);

				const rawOutput = await this.ollama.generate(prompt, {
					temperature: 0.8,
					num_predict: 800,
				});

				// Create the new page
				const choices = shouldBeEnding
					? []
					: this.extractChoicesFromPage(rawOutput);
				const isEnding =
					shouldBeEnding ||
					rawOutput.toLowerCase().includes("fin") ||
					rawOutput.toLowerCase().includes("game over");

				const newPage = new Page({
					storyId,
					content: rawOutput.trim(),
					isEnding,
					endingType: rawOutput.toLowerCase().includes("game over")
						? "death"
						: undefined,
					choices: choices.map((c) => ({
						text: c.text,
						targetPageId: undefined,
					})),
				});

				await newPage.save();

				// Link parent choice to this new page
				await Page.updateOne(
					{ _id: pending.parentPageId },
					{
						$set: {
							[`choices.${pending.choiceIndex}.targetPageId`]:
								newPage._id.toString(),
						},
					}
				);

				console.log(
					`   ✅ Page ${pageCount} created and linked (${choices.length} choices)`
				);

				// Add new choices to queue if not an ending
				if (!isEnding && pageCount < maxPages) {
					choices.forEach((choice, index) => {
						queue.push({
							parentPageId: newPage._id.toString(),
							parentContent: newPage.content,
							choiceText: choice.text,
							choiceIndex: index,
							depth: pending.depth + 1,
						});
					});
				}
			} catch (error) {
				console.error(`   ❌ Failed to generate page ${pageCount}:`, error);
				// Continue with next in queue
			}
		}

		console.log(`   🏁 Generation complete: ${pageCount} pages created`);
	}

	/**
	 * Suggest choices for a given page
	 */
	async suggestChoices(
		request: ChoiceSuggestionRequest
	): Promise<GeneratedChoice[]> {
		const { pageContent, storyContext, numChoices = 3 } = request;

		try {
			const knowledgeContext = this.knowledge.getGenerationContext();

			const prompt = PromptTemplates.suggestChoicesPrompt(
				pageContent,
				storyContext,
				knowledgeContext,
				numChoices
			);

			const rawOutput = await this.ollama.generate(prompt, {
				temperature: 0.7,
				num_predict: 800,
			});

			return this.parseGeneratedChoices(rawOutput);
		} catch (error: any) {
			console.error("Choice suggestion error:", error);
			throw new Error(`Failed to suggest choices: ${error.message}`);
		}
	}

	/**
	 * Parse generated story markdown into structured format
	 * Use direct parsing instead of AI to avoid timeouts
	 */
	private async parseGeneratedStory(markdown: string): Promise<GeneratedStory> {
		try {
			// Parse directly from markdown
			const lines = markdown.split("\n");

			// Extract title (look for # or ## at start)
			const titleLine = lines.find((l) => l.match(/^#\s+[^#]/));
			const title = titleLine
				? titleLine.replace(/^#+\s+/, "").trim()
				: "Untitled Story";

			// Extract description (usually after title)
			const descLine = lines.find(
				(l) => l.match(/^##\s+[^#]/) && !l.includes("Page")
			);
			const description = descLine
				? descLine.replace(/^#+\s+/, "").trim()
				: "An interactive adventure";

			// Split into pages by looking for "## Page" markers
			const pageMarkers: number[] = [];
			lines.forEach((line, index) => {
				if (line.match(/##\s*(🗡️\s*)?Page\s+\d+/i) || line.match(/^\*\*L'/)) {
					pageMarkers.push(index);
				}
			});

			// If no page markers, treat entire content as one page
			if (pageMarkers.length === 0) {
				return this.basicParseStory(markdown);
			}

			// Extract each page
			const pages: GeneratedPage[] = [];
			for (let i = 0; i < pageMarkers.length; i++) {
				const startIdx = pageMarkers[i];
				const endIdx = pageMarkers[i + 1] || lines.length;
				const pageLines = lines.slice(startIdx, endIdx);
				const pageContent = pageLines.join("\n");

				// Extract choices from this page
				const choices = this.extractChoicesFromPage(pageContent);

				// Check if it's an ending
				const isEnding =
					pageContent.toLowerCase().includes("fin") ||
					pageContent.toLowerCase().includes("game over") ||
					choices.length === 0;

				pages.push({
					content: pageContent.trim(),
					isEnding,
					endingType: pageContent.toLowerCase().includes("game over")
						? "death"
						: undefined,
					choices,
				});
			}

			return {
				title,
				description,
				theme: "adventure",
				tags: ["ai-generated", "interactive"],
				pages,
			};
		} catch (error) {
			console.error("Failed to parse story structure:", error);
			return this.basicParseStory(markdown);
		}
	}

	/**
	 * Basic markdown parsing as fallback
	 */
	private basicParseStory(markdown: string): GeneratedStory {
		const lines = markdown.split("\n");
		const title =
			lines
				.find((l) => l.startsWith("# "))
				?.replace("# ", "")
				.trim() || "Untitled Story";
		const description =
			lines
				.find((l) => l.startsWith("## ") && !l.includes("Page"))
				?.replace("## ", "")
				.trim() || "An interactive adventure";

		return {
			title,
			description,
			theme: "adventure",
			tags: ["interactive", "rpg"],
			pages: [
				{
					content: markdown,
					isEnding: false,
					choices: [],
				},
			],
		};
	}

	/**
	 * Parse a single generated page
	 */
	private parseGeneratedPage(markdown: string): GeneratedPage {
		// Extract title, content, and choices from markdown
		const imageMatch = markdown.match(/\*\(Asset:\s*(.+?)\)\*/);
		const image = imageMatch ? imageMatch[1] : undefined;

		return {
			content: markdown,
			image,
			isEnding:
				markdown.toLowerCase().includes("fin victorieuse") ||
				markdown.toLowerCase().includes("game over"),
			endingType: markdown.toLowerCase().includes("game over")
				? "death"
				: undefined,
			choices: [],
		};
	}

	/**
	 * Parse generated choices
	 */
	private parseGeneratedChoices(text: string): GeneratedChoice[] {
		const choices: GeneratedChoice[] = [];
		const lines = text.split("\n");

		for (const line of lines) {
			// Match format: **[Texte]** → Page X
			const match = line.match(/\*\*\[(.+?)\]\*\*\s*→\s*(.+)/);
			if (match) {
				choices.push({
					text: match[1].trim(),
					targetPageId: undefined, // Will be set later
				});
			}
		}

		return choices;
	}

	/**
	 * Extract choices from a single page content
	 */
	private extractChoicesFromPage(pageContent: string): GeneratedChoice[] {
		const choices: GeneratedChoice[] = [];
		const lines = pageContent.split("\n");

		for (let i = 0; i < lines.length; i++) {
			let line = lines[i].trim();

			// Check if arrow is on the next line (common AI formatting issue)
			if (
				i + 1 < lines.length &&
				lines[i + 1].trim().match(/^→\s*Page\s*(\d+|X)/i)
			) {
				line += " " + lines[i + 1].trim();
				// Don't skip next line index here, let the loop handle it (or we might miss something? no, we consumed it)
				// Actually, if we consumed it, we should skip it.
				i++;
			}

			// Match several choice formats:
			// - **[Texte]** → Page X
			// - **Texte** → Page X
			// - **Texte :** Description → Page X
			// Regex explanation:
			// ^-?\s*       : Optional bullet point
			// \*\*\[?      : Start bold, optional bracket
			// (.+?)        : Capture choice text (Group 1)
			// \]?\*\*      : End bold, optional bracket
			// .*?          : Optional description text
			// →\s*Page     : Arrow and Page keyword
			// \s*(\d+|X)   : Page number (Group 2)
			const match = line.match(
				/^-?\s*\*\*\[?(.+?)\]?\*\*\s*.*?→\s*Page\s*(\d+|X)/i
			);

			if (match) {
				choices.push({
					text: match[1].trim(),
					targetPageId: undefined, // Will be connected later
				});
			}
		}

		return choices;
	}

	/**
	 * Save generated story to database
	 */
	private async saveStoryToDatabase(
		generated: GeneratedStory,
		request: StoryGenerationRequest
	): Promise<IStory> {
		// Create story document
		const story = new Story({
			title: generated.title,
			description: generated.description,
			tags: generated.tags || ["ai-generated", "interactive"],
			status: "draft",
			authorId: "ai-system", // TODO: Use actual user ID
			theme: generated.theme || request.theme,
			stats: {
				views: 0,
				completions: 0,
				endings: {},
			},
		});

		await story.save();

		// Create pages
		const pageMap = new Map<number, string>(); // pageNumber -> mongoId

		for (const generatedPage of generated.pages) {
			const page = new Page({
				storyId: story._id.toString(),
				content: generatedPage.content,
				image: generatedPage.image,
				isEnding: generatedPage.isEnding,
				endingType: generatedPage.endingType,
				choices: [], // Will be populated in second pass
			});

			await page.save();
			// Store mapping if we have page numbers
			// For now, just save pages
		}

		// Update story with first page as start
		const firstPage = await Page.findOne({ storyId: story._id.toString() });
		if (firstPage) {
			story.startPageId = firstPage._id.toString();
			await story.save();
		}

		return story;
	}

	/**
	 * Health check for AI service
	 */
	async healthCheck(): Promise<{ status: string; model: string }> {
		const isHealthy = await this.ollama.healthCheck();
		return {
			status: isHealthy ? "operational" : "offline",
			model: process.env.OLLAMA_MODEL || "llama3.2:3b",
		};
	}
}

export const storyGenerator = new StoryGenerator();
