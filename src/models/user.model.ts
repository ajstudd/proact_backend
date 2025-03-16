import { Schema, model } from 'mongoose';
import { IUser } from '@/types';

const UserSchema = new Schema<IUser>(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        username: {
            type: String,
            trim: true,
            unique: true,
            sparse: true,
        },
        email: {
            type: String,
            required() {
                return !this.phone;
            },
            unique: true,
            lowercase: true,
            trim: true,
        },
        phone: {
            type: String,
            required() {
                return !this.email;
            },
            unique: true,
            trim: true,
        },
        password: {
            type: String,
            required: true,
            trim: true,
            select: false,
        },
        role: {
            type: String,
            enum: ['ADMIN', 'USER', 'CONTRACTOR', 'GOVERNMENT'],
            default: 'USER',
        },
        photo: {
            type: String, // Changed from ObjectId to String to store the filename directly
        },
        isVerified: {
            type: Boolean,
            default: false,
        },
        lastLogin: {
            type: Date,
        },
        resetPasswordToken: {
            type: String,
            select: false,
        },
        resetPasswordExpires: {
            type: Date,
            select: false,
        },
        newEmailPending: {
            type: String,
            select: false,
        },
        newPhonePending: {
            type: String,
            select: false,
        },
        governmentId: {
            type: String,
            required() {
                return this.role === 'GOVERNMENT';
            },
            unique: true,
            sparse: true,
        },
        designation: {
            type: String,
        },
        department: {
            type: String,
        },
        contractorLicense: {
            type: String,
            required() {
                return this.role === 'CONTRACTOR';
            },
            unique: true,
            sparse: true,
        },
        contributions: {
            type: Number,
            default: 0,
        },
        experience: {
            type: Number,
            default: 0,
        },
        reputationScore: {
            type: Number,
            default: 0,
        },
        bookmarks: [
            {
                type: Schema.Types.ObjectId,
                ref: 'Project',
            },
        ],
        unreadNotificationsCount: {
            type: Number,
            default: 0,
        },
        totalNotificationsCount: {
            type: Number,
            default: 0,
        },
    },
    {
        timestamps: true,
        toJSON: { virtuals: true, getters: true },
        toObject: { virtuals: true, getters: true },
    }
);

UserSchema.index({ email: 1 });
UserSchema.index({ phone: 1 });
UserSchema.index({ name: 'text', username: 'text' });

export default model<IUser>('User', UserSchema, 'users');
