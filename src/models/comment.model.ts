import { IComment } from '@/types';
import { Schema, model } from 'mongoose';
const CommentSchema = new Schema<IComment>(
    {
        content: {
            type: String,
            required: true,
            unique: false,
        },
        images: [
            {
                type: Schema.Types.ObjectId,
                ref: 'IImage',
                required: true,
            },
        ],
        ownerId: {
            type: String,
            required: false,
            unique: false,
        },
        postid: {
            type: String,
            required: true,
            unique: false,
        },
    },
    {
        timestamps: true,
        _id: true,
        id: true,
    }
);

export default model<IComment>('IComment', CommentSchema, 'comments');
