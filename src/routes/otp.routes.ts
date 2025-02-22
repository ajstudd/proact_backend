/* eslint-disable prettier/prettier */
import { Router } from 'express';
import otpController from '@/controllers/otp.controller';

const router = Router();

router.post('/request', otpController.requestOtp);
router.post('/verify', otpController.verifyOtp);

export default router;
