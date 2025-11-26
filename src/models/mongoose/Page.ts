import { Schema, model, Document } from 'mongoose';
import { IStory } from './Story';

export interface IChoice {
    text: string;
    targetPageId?: string;
    condition?: any; // placeholder for future conditional logic
}

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
        type: 'combat' | 'stealth' | 'persuasion' | 'custom';
        failurePageId?: string;
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
    condition: { type: Schema.Types.Mixed },
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
        type: { type: String, enum: ['combat', 'stealth', 'persuasion', 'custom'] },
        failurePageId: { type: String },
    },
});

const PageSchema = new Schema<IPage>({
    storyId: { type: String, required: true, ref: 'Story' },
    content: { type: String, required: true },
    image: { type: String },
    isEnding: { type: Boolean, default: false },
    endingType: { type: String },
    choices: [ChoiceSchema],
    hotspots: [HotspotSchema],
});

export const Page = model<IPage>('Page', PageSchema);
