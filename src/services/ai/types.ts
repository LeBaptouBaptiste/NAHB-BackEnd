// Type definitions for AI services

export interface OllamaGenerateRequest {
	model: string;
	prompt: string;
	stream?: boolean;
	options?: {
		temperature?: number;
		top_p?: number;
		top_k?: number;
		num_predict?: number;
	};
}

export interface OllamaGenerateResponse {
	model: string;
	created_at: string;
	response: string;
	done: boolean;
	context?: number[];
	total_duration?: number;
	load_duration?: number;
	prompt_eval_count?: number;
	eval_count?: number;
}

export interface StoryGenerationRequest {
	userPrompt: string;
	theme?: string;
	numPages?: number;
	language?: "fr" | "en";
}

export interface PageGenerationRequest {
	storyContext: string;
	previousPageId?: string;
	theme?: string;
}

export interface ChoiceSuggestionRequest {
	pageContent: string;
	storyContext: string;
	numChoices?: number;
}

export interface GeneratedStory {
	title: string;
	description: string;
	theme?: string;
	tags: string[];
	pages: GeneratedPage[];
}

export interface GeneratedPage {
	content: string;
	image?: string;
	isEnding: boolean;
	endingType?: string;
	choices: GeneratedChoice[];
}

export interface GeneratedChoice {
	text: string;
	targetPageId?: string;
	condition?: any;
}

export interface GameMechanics {
	classes: ClassDefinition[];
	diceSystem: DiceSystem;
	combatRules: CombatRules;
}

export interface ClassDefinition {
	name: string;
	weapon: string;
	combatBonus: number;
	fleeBonus: number;
	specialAbility: string;
}

export interface DiceSystem {
	type: string; // e.g., "d20"
	difficultyLevels: Record<string, number>;
}

export interface CombatRules {
	baseAttackBonus: number;
	criticalHitThreshold: number;
}
