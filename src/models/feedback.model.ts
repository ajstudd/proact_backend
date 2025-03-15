import { Schema, model } from 'mongoose';

export interface IFeedback {
    _id: string;
    userId: Schema.Types.ObjectId;
    description: string;
    acknowledged: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const FeedbackSchema = new Schema<IFeedback>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        description: {
            type: String,
            required: true,
        },
        acknowledged: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
        toJSON: { virtuals: true, getters: true },
        toObject: { virtuals: true, getters: true },
    }
);

export default model<IFeedback>('Feedback', FeedbackSchema, 'feedbacks');
