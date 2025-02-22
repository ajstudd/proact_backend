/* eslint-disable prettier/prettier */
import { Schema, model, Document } from 'mongoose';

export interface IOtp extends Document {
    userId: string;
    otp: string;
    method: 'email' | 'sms';
    createdAt: Date;
    expiresAt: Date;
    isUsed: boolean;
}

const OtpSchema = new Schema<IOtp>(
    {
        userId: { type: String, required: true },
        otp: { type: String, required: true },
        method: { type: String, enum: ['email', 'sms'], required: true },
        isUsed: { type: Boolean, default: false },
        expiresAt: { type: Date, required: true },
    },
    { timestamps: true }
);

// Delete expired OTPs automatically
OtpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default model<IOtp>('Otp', OtpSchema);
