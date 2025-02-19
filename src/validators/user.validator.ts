import Joi from '@/helpers/Joi';
import {
    LoginPayload,
    RegisterUserPayload,
    UpdateUserPayload,
    VerifyOtpPayload,
} from '../types';

const register = Joi.object<RegisterUserPayload>({
    phone: Joi.string().phoneNumber({ format: 'e164' }).optional(),
    email: Joi.string().email().optional(),
    name: Joi.string().required(),
    password: Joi.string().required(),
});

const update = Joi.object<UpdateUserPayload>({
    email: Joi.string().email().optional(),
    name: Joi.string().optional(),
});

const userPhoneLoginPayload = Joi.object<LoginPayload>({
    email: Joi.string().email().required(),
});

const userEmailLoginPayload = Joi.object<LoginPayload>({
    phone: Joi.string().phoneNumber({ format: 'e164' }).required(),
});

const userEmailAndPasswordPayload = Joi.object<LoginPayload>({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
});

const login = Joi.alternatives()
    .try(
        userPhoneLoginPayload,
        userEmailLoginPayload,
        userEmailAndPasswordPayload
    )
    .required();

const userPhoneVerifyPayload = Joi.object<VerifyOtpPayload>({
    phone: Joi.string().phoneNumber({ format: 'e164' }).required(),
    otp: Joi.string().required(),
});

const userEmailVerifyPayload = Joi.object<VerifyOtpPayload>({
    email: Joi.string().email().required(),
    otp: Joi.string().required(),
});

const verifyOtp = Joi.alternatives()
    .try(userPhoneVerifyPayload, userEmailVerifyPayload)
    .required();

export default {
    register,
    login,
    update,
    verifyOtp,
    // refreshToken,
    // forgotPassword,
    // resetPassword,
};
