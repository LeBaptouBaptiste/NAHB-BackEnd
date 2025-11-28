import { OllamaClient, ollamaClient } from './ai/ollamaClient';
import { KnowledgeBase, knowledgeBase } from './ai/knowledgeBase';
import { PromptTemplates } from './ai/promptTemplates';
import {
    StoryGenerationRequest,
    PageGenerationRequest,
    ChoiceSuggestionRequest,
    GeneratedStory,
    GeneratedPage,
    GeneratedChoice,
} from './ai/types';
import * as storyRepository from '../repositories/storyRepository';
import * as pageRepository from '../repositories/pageRepository';

export class AIService {
    constructor(
        private ollama: OllamaClient = ollamaClient,
        private knowledge: KnowledgeBase = knowledgeBase
    ) { }

    async generateFullStory(request: StoryGenerationRequest, authorId: string = 'ai-system') {
        const { userPrompt, theme, numPages = 6, language = 'fr' } = request;

        console.log(`🎯 Generating story iteratively: "${userPrompt}"`);
        console.log(`📄 Target pages: ${numPages}`);

        try {
            console.log('📝 Step 1: Generating metadata...');
            const metadata = await this.generateStoryMetadata(userPrompt, language);

            console.log('💾 Step 2: Creating story document...');
            const story = await storyRepository.create({
                title: metadata.title,
                description: metadata.description,
                tags: metadata.tags || ['ai-generated', 'interactive'],
                status: 'draft',
                authorId: authorId,
                theme: metadata.theme || theme || 'adventure',
                stats: {
                    views: 0,
                    completions: 0,
                    endings: {},
                },
            });
            console.log(`✅ Story created: ${story._id}`);

            console.log('📄 Step 3: Generating first page...');
            const firstPage = await this.generateFirstPage(
                story._id.toString(),
                metadata.title,
                metadata.description,
                metadata.theme || 'adventure',
                language
            );

            story.startPageId = firstPage._id.toString();
            await story.save();

            console.log(`🔄 Step 4: Generating remaining pages (target: ${numPages})...`);
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
            console.error('❌ Story generation error:', error);
            throw new Error(`Failed to generate story: ${error.message}`);
        }
    }

    async generatePage(request: PageGenerationRequest) {
        const { storyContext, previousPageId, theme } = request;

        try {
            const knowledgeContext = this.knowledge.getGenerationContext(theme);

            let previousContent = '';
            if (previousPageId) {
                const previousPage = await pageRepository.findById(previousPageId);
                if (previousPage) {
                    previousContent = previousPage.content;
                }
            }

            const prompt = PromptTemplates.generatePagePrompt(
                storyContext,
                previousContent,
                knowledgeContext
            );

            const rawOutput = await this.ollama.generate(prompt, {
                temperature: 0.7,
                num_predict: 1000,
            });

            const parsedPage = this.parseGeneratedPage(rawOutput);

            return parsedPage as any;
        } catch (error: any) {
            console.error('Page generation error:', error);
            throw new Error(`Failed to generate page: ${error.message}`);
        }
    }

    private async generateStoryMetadata(userPrompt: string, language: string) {
        const prompt = PromptTemplates.generateMetadataPrompt(userPrompt, language);
        const rawOutput = await this.ollama.generate(prompt, {
            temperature: 0.7,
            num_predict: 300,
        });

        try {
            const jsonMatch = rawOutput.match(/\{[\s\S]*?\}/);
            if (jsonMatch) {
                return JSON.parse(jsonMatch[0]);
            }
        } catch (error) {
            console.warn('Failed to parse metadata JSON, using defaults');
        }

        return {
            title: 'Histoire Interactive',
            description: userPrompt.substring(0, 150),
            tags: ['interactive', 'rpg'],
            theme: 'adventure',
        };
    }

    private async generateFirstPage(
        storyId: string,
        title: string,
        description: string,
        theme: string,
        language: string
    ) {
        const prompt = PromptTemplates.generateFirstPagePrompt(title, description, theme, language);

        const rawOutput = await this.ollama.generate(prompt, {
            temperature: 0.8,
            num_predict: 800,
        });

        const choices = this.extractChoicesFromPage(rawOutput);

        const page = await pageRepository.create({
            storyId,
            content: rawOutput.trim(),
            isEnding: false,
            choices: choices.map(c => ({ text: c.text, targetPageId: undefined })),
        });

        console.log(`   ✅ First page created: ${page._id} (${choices.length} choices)`);

        return page;
    }

    private async generateRemainingPages(
        storyId: string,
        title: string,
        theme: string,
        firstPage: any,
        targetPages: number,
        language: string
    ) {
        interface PendingChoice {
            parentPageId: string;
            parentContent: string;
            choiceText: string;
            choiceIndex: number;
            depth: number;
        }

        const queue: PendingChoice[] = [];
        let pageCount = 1;
        const maxPages = Math.min(targetPages, 12);

        firstPage.choices?.forEach((choice: any, index: number) => {
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

            const shouldBeEnding = (
                pageCount >= maxPages - 1 ||
                pending.depth >= 3 ||
                Math.random() > 0.7
            );

            console.log(`   ⏳ Generating page ${pageCount}/${maxPages} (depth: ${pending.depth}, ending: ${shouldBeEnding})...`);

            try {
                const prompt = PromptTemplates.generateContinuationPagePrompt(
                    {
                        title,
                        theme,
                        previousContent: pending.parentContent.substring(0, 400),
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

                const choices = shouldBeEnding ? [] : this.extractChoicesFromPage(rawOutput);
                const isEnding = shouldBeEnding || rawOutput.toLowerCase().includes('fin') || rawOutput.toLowerCase().includes('game over');

                const newPage = await pageRepository.create({
                    storyId,
                    content: rawOutput.trim(),
                    isEnding,
                    endingType: rawOutput.toLowerCase().includes('game over') ? 'death' : undefined,
                    choices: choices.map(c => ({ text: c.text, targetPageId: undefined })),
                });

                await pageRepository.update(
                    pending.parentPageId,
                    { $set: { [`choices.${pending.choiceIndex}.targetPageId`]: newPage._id.toString() } }
                );

                console.log(`   ✅ Page ${pageCount} created and linked (${choices.length} choices)`);

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
            }
        }

        console.log(`   🏁 Generation complete: ${pageCount} pages created`);
    }

    async suggestChoices(request: ChoiceSuggestionRequest) {
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
            console.error('Choice suggestion error:', error);
            throw new Error(`Failed to suggest choices: ${error.message}`);
        }
    }

    private parseGeneratedPage(markdown: string): GeneratedPage {
        const imageMatch = markdown.match(/\*\(Asset:\s*(.+?)\)\*/);
        const image = imageMatch ? imageMatch[1] : undefined;

        return {
            content: markdown,
            image,
            isEnding: markdown.toLowerCase().includes('fin victorieuse') || markdown.toLowerCase().includes('game over'),
            endingType: markdown.toLowerCase().includes('game over') ? 'death' : undefined,
            choices: [],
        };
    }

    private parseGeneratedChoices(text: string): GeneratedChoice[] {
        const choices: GeneratedChoice[] = [];
        const lines = text.split('\n');

        for (const line of lines) {
            const match = line.match(/\*\*\[(.+?)\]\*\*\s*→\s*(.+)/);
            if (match) {
                choices.push({
                    text: match[1].trim(),
                    targetPageId: undefined,
                });
            }
        }

        return choices;
    }

    private extractChoicesFromPage(pageContent: string): GeneratedChoice[] {
        const choices: GeneratedChoice[] = [];
        const lines = pageContent.split('\n');

        for (let i = 0; i < lines.length; i++) {
            let line = lines[i].trim();

            if (i + 1 < lines.length && lines[i + 1].trim().match(/^→\s*Page\s*(\d+|X)/i)) {
                line += ' ' + lines[i + 1].trim();
                i++;
            }

            const match = line.match(/^-?\s*\*\*\[?(.+?)\]?\*\*\s*.*?→\s*Page\s*(\d+|X)/i);

            if (match) {
                choices.push({
                    text: match[1].trim(),
                    targetPageId: undefined,
                });
            }
        }

        return choices;
    }

    async healthCheck() {
        const isHealthy = await this.ollama.healthCheck();
        return {
            status: isHealthy ? 'operational' : 'offline',
            model: process.env.OLLAMA_MODEL || 'llama3.2:3b',
        };
    }
}

export const aiService = new AIService();
