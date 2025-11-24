import { Schema, model, Document } from 'mongoose';
import { IStory } from './Story';

export interface IChoice {
    text: string;
    targetPageId: string;
    condition?: any; // placeholder for future conditional logic
}

export interface IPage extends Document {
    storyId: string; // reference to Story
    content: string;
    image?: string;
    isEnding: boolean;
    endingType?: string;
    choices: IChoice[];
}

const ChoiceSchema = new Schema<IChoice>({
    text: { type: String, required: true },
    targetPageId: { type: String, required: true },
    condition: { type: Schema.Types.Mixed },
});

const PageSchema = new Schema<IPage>({
    storyId: { type: String, required: true, ref: 'Story' },
    content: { type: String, required: true },
    image: { type: String },
    isEnding: { type: Boolean, default: false },
    endingType: { type: String },
    choices: [ChoiceSchema],
});

export const Page = model<IPage>('Page', PageSchema);
