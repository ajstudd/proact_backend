import jwt, { Secret } from 'jsonwebtoken';
import User from '../models/user.model';
import bcryptjs from 'bcryptjs';
import { HttpError } from '../helpers/HttpError';
import { AuthToken } from '../types';

const generateAuthToken = (userId: string) => {
    const authTokenPayload: AuthToken = {
        id: userId,
    };

    const token = jwt.sign(
        authTokenPayload,
        process.env.JWT_TOKEN_SECRET as Secret,
        {
            expiresIn: `${process.env.JWT_TOKEN_EXPIRES_IN}`,
        }
    );

    return token;
};

const loginWithPassword = async (email: string, password: string) => {
    console.log('email', email);
    console.log('password ', password);
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
        throw new HttpError({ code: 401, message: 'Invalid credentials!' });
    }

    const isMatch = await bcryptjs.compare(password, user.password ?? '');

    if (!isMatch) {
        throw new HttpError({ code: 401, message: 'Invalid credentials!' });
    }

    const token = generateAuthToken(user.id);
    return token;
};

export default {
    generateAuthToken,
    loginWithPassword,
};
