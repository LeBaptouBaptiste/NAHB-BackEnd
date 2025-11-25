import { Schema, model, Document } from 'mongoose';

export interface IChoiceCondition {
    flag?: string;              // example: "has_key"
    equals?: any;               // expected value
    minDice?: number;           // dice-based conditions
    maxDice?: number;
    requiredClass?: string;     // mage / warrior / assassin
}

export interface IChoice {
    text: string;
    targetPageId?: string;      // null/undefined if ending
    conditions?: IChoiceCondition[];
}

export interface IPage extends Document {
    storyId: string;
    content: string;
    image?: string;

    isEnding: boolean;          // is this page an ending ?
    endingId?: number;          // MySQL Ending FK

    choices: IChoice[];

    x?: number;                 // React Flow placement
    y?: number;

    nodeType?: string;          // "page", "ending", "start"

    createdAt?: Date;
    updatedAt?: Date;
}

const ChoiceConditionSchema = new Schema<IChoiceCondition>({
    flag: { type: String },
    equals: { type: Schema.Types.Mixed },
    minDice: { type: Number },
    maxDice: { type: Number },
    requiredClass: { type: String }, // mage / warrior / assassin
});

const ChoiceSchema = new Schema<IChoice>({
    text: { type: String, required: true },
    targetPageId: { type: String },
    conditions: [ChoiceConditionSchema],
});

const PageSchema = new Schema<IPage>(
    {
        storyId: { type: String, required: true },
        content: { type: String, required: true },
        image: { type: String },

        isEnding: { type: Boolean, default: false },
        endingId: { type: Number }, // FK vers MySQL Ending table

        choices: [ChoiceSchema],

        x: { type: Number },
        y: { type: Number },
        nodeType: { type: String, default: "page" }, // "page" | "start" | "ending"
    },
    { timestamps: true }
);

// Indexes importants
PageSchema.index({ storyId: 1 });
PageSchema.index({ storyId: 1, isEnding: 1 });

export const Page = model<IPage>('Page', PageSchema);
