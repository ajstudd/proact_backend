/* eslint-disable prettier/prettier */
import { Request, Response } from 'express';
import Otp from '../models/otp.model';
import User from '../models/user.model';
import { HttpError } from '../helpers/HttpError';
import mailService from './mail.service';
import smsService from './sms.service'; // Implement an SMS sending service

mailService.init(); // Call this when starting your app


const OTP_EXPIRY_MINUTES = 10;

// Generate 6-digit OTP
const generateOtpCode = () =>
    Math.floor(100000 + Math.random() * 900000).toString();

/** 📩 Generate & Send OTP */
export const sendOtp = async (method: 'email' | 'sms',email?: string, phone?: string) => {
    console.log('phone', phone)
    console.log('email', email)
    console.log('method', method)
    try {
        const user = await User.findOne({ 
            $or: [{ email: email?.toLowerCase() }, { phone }]
        });
        console.log('user', user);

        if (!user) {
            throw new HttpError({ message: 'User not found!', code: 404 });
        }

        const otpCode = generateOtpCode();
        const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

        await Otp.create({ userId: user._id, otp: otpCode, method, expiresAt });

        console.log(`🛠️ Sending OTP via ${method}`);
        if (method === 'email' && user.email) {
            console.log('📧 Sending email...');
            await mailService.sendOtpMail({
                to: user.email,
                subject: 'Your OTP Code',
                text: `Your OTP is: ${otpCode}. It expires in ${OTP_EXPIRY_MINUTES} minutes.`,
            });
        } else if (method === 'sms' && user.phone) {
            console.log('📲 Sending SMS...');
            console.log(`Your OTP is: ${otpCode}`);
        } else {
            console.log('❌ Invalid method:', method);
        }        

        return { message: `OTP sent via ${method}` };
    } catch (error) {
        console.log('error at service', error)
        throw new HttpError({ message: 'Failed to send OTP', code: 500 });
    }
};


/** ✅ Verify OTP */

export const verifyOtp = async (email?: string, phone?: string, otp?: string) => {
    try {
        const user = await User.findOne({ 
            $or: [{ email }, { phone }] 
        });

        if (!user) {
            throw new HttpError({ message: 'User not found', code: 404 });
        }

        const otpRecord = await Otp.findOne({
            userId: user._id,
            otp,
            isUsed: false,
            expiresAt: { $gt: new Date() },
        });

        if (!otpRecord) {
            throw new HttpError({ message: 'Invalid or expired OTP', code: 400 });
        }

        otpRecord.isUsed = true;
        await otpRecord.save();

        user.isVerified = true;
        await user.save();

        return { message: 'OTP verified successfully' };
    } catch (error) {
        console.error('Error at service:', error);
        throw error; // Let the controller handle the response
    }
};

export default { sendOtp, verifyOtp };
