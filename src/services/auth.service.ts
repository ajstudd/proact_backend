import jwt, { Secret } from 'jsonwebtoken';
import User from '../models/user.model';
import bcryptjs from 'bcryptjs';
import { HttpError } from '../helpers/HttpError';
import { AuthToken } from '../types';

const generateAuthToken = (
    userId: string,
    role: string,
    isVerified: boolean
) => {
    const authTokenPayload: AuthToken = {
        id: userId,
        role,
        isVerified,
    };

    const token = jwt.sign(
        authTokenPayload,
        process.env.JWT_TOKEN_SECRET as Secret,
        {
            expiresIn: process.env.JWT_TOKEN_EXPIRES_IN || '7d',
        }
    );

    return token;
};

const loginWithPassword = async (email: string, password: string) => {
    console.log('email:', email);

    const user = await User.findOne({ email }).select(
        '+password +isVerified +role'
    );

    if (!user) {
        throw new HttpError({ code: 401, message: 'Invalid credentials!' });
    }

    const isMatch = await bcryptjs.compare(password, user.password ?? '');
    if (!isMatch) {
        throw new HttpError({ code: 401, message: 'Invalid credentials!' });
    }

    if (!user.isVerified) {
        throw new HttpError({
            code: 403,
            message: 'Account not verified. Please verify your email or phone.',
        });
    }

    user.lastLogin = new Date();
    await user.save();

    const token = generateAuthToken(user.id, user.role, user.isVerified);

    return {
        token,
        user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            isVerified: user.isVerified,
        },
    };
};

export default {
    generateAuthToken,
    loginWithPassword,
};
