import Joi from '@/helpers/Joi';
import {
    LoginPayload,
    RegisterUserPayload,
    UpdateUserPayload,
    VerifyOtpPayload,
} from '../types';

const register = Joi.object<RegisterUserPayload>({
    phone: Joi.string()
        .pattern(/^[0-9]{10}$/)
        .optional()
        .messages({
            'string.pattern.base': 'Phone number must be a 10 digit number',
        }),
    email: Joi.string().email().optional(),
    name: Joi.string().required(),
    password: Joi.string().required(),
    role: Joi.string()
        .valid('ADMIN', 'USER', 'CONTRACTOR', 'GOVERNMENT')
        .default('USER'),
    contractorLicense: Joi.string().when('role', {
        is: 'CONTRACTOR',
        then: Joi.string().required().messages({
            'any.required':
                'Contractor license is required when role is CONTRACTOR',
        }),
        otherwise: Joi.forbidden().messages({
            'any.unknown':
                'Contractor license can only be provided when role is CONTRACTOR',
        }),
    }),
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

const editProfile = Joi.object<UpdateUserPayload>({
    name: Joi.string().optional(),
    email: Joi.string().email().optional(),
    phone: Joi.string().phoneNumber({ format: 'e164' }).optional(),
    password: Joi.string().min(6).optional(),
    photo: Joi.string().optional(), // ID of uploaded image
});

const verifyEmailChange = Joi.object({
    token: Joi.string().required(),
    email: Joi.string().email().required(),
});

const resetPassword = Joi.object({
    oldPassword: Joi.string().required(),
    newPassword: Joi.string().min(6).required(),
});

const searchQuery = Joi.object({
    query: Joi.string().min(1).required(),
    limit: Joi.number().integer().min(1).max(100).optional(),
    page: Joi.number().integer().min(1).optional(),
}).unknown(true); // Allow unknown query parameters

export default {
    register,
    login,
    update,
    verifyOtp,
    editProfile,
    verifyEmailChange,
    resetPassword,
    searchQuery,
};
