/* eslint-disable prettier/prettier */
import { Request, Response } from 'express';
import otpService from '@/services/otp.service';

/** 📩 Request OTP */
export const requestOtp = async (req: Request, res: Response) => {
    try {
        const { email,method, phone} = req.body;

        if (!email && !phone) {
            return res.status(400).json({ message: 'Email or phone is required' });
        }

        if (!['email', 'sms'].includes(method)) {
            return res.status(400).json({ message: "Invalid method. Use 'email' or 'sms'." });
        }

        const response = await otpService.sendOtp(method, email, phone);
        return res.status(200).json(response);
    } catch (error) {
        console.log('error at controller', error)
        return res.status(500).json({ message: 'Internal server error' });
    }
};

/** ✅ Verify OTP */
export const verifyOtp = async (req: Request, res: Response) => {
    try {
        const { email,otp,phone } = req.body;
        if (!otp) {
            return res.status(400).json({ message: 'OTP is required' });
        }
        const response = await otpService.verifyOtp(email, phone, otp);
        return res.status(200).json(response);
    } catch (error) {
        const err = error as { code?: number; message: string };
        return res.status(err.code || 500).json({ message: err.message });}
};

export default { requestOtp, verifyOtp };
