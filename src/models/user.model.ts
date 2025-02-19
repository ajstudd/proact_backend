import { Schema, model } from 'mongoose';
import { IImage, IUser } from '@/types';

const UserSchema = new Schema<IUser>(
    {
        email: {
            type: String,
            required: false,
            unique: false,
        },
        phone: {
            type: String,
            required: false,
            unique: false,
        },
        score: {
            type: Number,
            required: false,
            default: 0,
        },
        name: {
            type: String,
            required: true,
            trim: true,
        },
        password: {
            type: String,
            required: false,
            trim: true,
            select: false,
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

export default model<IUser>('User', UserSchema, 'users');
