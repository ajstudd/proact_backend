import { Schema, model } from 'mongoose';
import { IComment, IImage, IPostComment, IUser } from '@/types';

const CommentSchema = new Schema<IPostComment>(
    {
        ownerId: {
            type: String,
            required: false,
            unique: false,
        },
        content: {
            type: String,
            required: false,
            unique: false,
        },
    },
    {
        timestamps: true,
        id: true,
        toJSON: {
            virtuals: true,
            getters: true,
        },
        toObject: {
            virtuals: true,
            getters: true,
        },
    }
);

export default model<IUser>('Comment', CommentSchema, 'comments');
