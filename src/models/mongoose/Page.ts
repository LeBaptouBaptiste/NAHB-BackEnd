import { Schema, model, Document } from "mongoose";
import { IStory } from "./Story";

export interface IChoice {
	text: string;
	targetPageId?: string;
	condition?: {
		type: "has_item";
		value: string;
	};
	rewards?: {
		type: "add_item";
		value: string;
	}[];
	diceRoll?: {
		enabled: boolean;
		difficulty: number;
		type: "combat" | "stealth" | "persuasion" | "custom";
		failurePageId?: string;
		successPageId?: string;
	};
	audio?: {
		src: string;
		type: "music" | "sfx";
		duration?: number; // in seconds
		loop?: boolean;
	}[];
}

// ... (IHotspot remains unchanged)
export interface IHotspot {
	x: number;
	y: number;
	width: number;
	height: number;
	targetPageId?: string;
	label?: string;
	diceRoll?: {
		enabled: boolean;
		difficulty: number;
		type: "combat" | "stealth" | "persuasion" | "custom";
		failurePageId?: string;
		successPageId?: string;
	};
}

export interface IPage extends Document {
	storyId: string; // reference to Story
	content: string;
	image?: string;
	isEnding: boolean;
	endingType?: string;
	choices: IChoice[];
	hotspots?: IHotspot[];
}

const ChoiceSchema = new Schema<IChoice>({
	text: { type: String, required: true },
	targetPageId: { type: String, required: false },
	condition: {
		type: { type: String, enum: ["has_item"], required: false },
		value: { type: String, required: false },
	},
	rewards: [
		{
			type: { type: String, enum: ["add_item"], required: true },
			value: { type: String, required: true },
		},
	],
	diceRoll: {
		enabled: { type: Boolean, default: false },
		difficulty: { type: Number },
		type: { type: String, enum: ["combat", "stealth", "persuasion", "custom"] },
		failurePageId: { type: String },
		successPageId: { type: String },
	},
	audio: [
		{
			src: { type: String, required: true },
			type: { type: String, enum: ["music", "sfx"], required: true },
			duration: { type: Number },
			loop: { type: Boolean, default: false },
		},
	],
});

const HotspotSchema = new Schema<IHotspot>({
	x: { type: Number, required: true },
	y: { type: Number, required: true },
	width: { type: Number, required: true },
	height: { type: Number, required: true },
	targetPageId: { type: String },
	label: { type: String },
	diceRoll: {
		enabled: { type: Boolean, default: false },
		difficulty: { type: Number },
		type: { type: String, enum: ["combat", "stealth", "persuasion", "custom"] },
		failurePageId: { type: String },
		successPageId: { type: String },
	},
});

const PageSchema = new Schema<IPage>({
	storyId: { type: String, required: true, ref: "Story" },
	content: { type: String, required: true },
	image: { type: String },
	isEnding: { type: Boolean, default: false },
	endingType: { type: String },
	choices: [ChoiceSchema],
	hotspots: [HotspotSchema],
});

export const Page = model<IPage>("Page", PageSchema);
