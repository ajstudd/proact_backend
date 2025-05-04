/* eslint-disable prettier/prettier */
import { RequestHandler } from 'express';
import jwt from 'jsonwebtoken';
import { HttpError } from '../helpers/HttpError';
import { AuthToken, IRequestUser, IUser } from '../types';
import userService from '../services/user.service';
import User from '../models/user.model';

interface TokenVerificationOptions {
    strict: boolean;
    resetToken?: boolean;
}

declare global {
    // eslint-disable-next-line @typescript-eslint/no-namespace
    namespace Express {
        interface Request {
            user?: IRequestUser;
            strictTokenCheck?: boolean;
        }
    }
}

export const verifyToken = (
    options: TokenVerificationOptions = { strict: true }
): RequestHandler => {
    return async (req, res, next) => {
        try {
            const authHeader = req.headers.authorization;
            if (!authHeader || !authHeader.startsWith('Bearer ')) {
                console.warn(
                    '⚠️ [verifyToken] No valid Authorization header found.'
                );

                if (options.strict) {
                    return res
                        .status(401)
                        .json({ message: 'Unauthorized: Token required' });
                } else {
                    return next();
                }
            }

            const token = authHeader.split(' ')[1].trim();

            let decoded: AuthToken;
            try {
                const secret = process.env.JWT_TOKEN_SECRET;
                if (!secret) {
                    throw new Error('JWT_TOKEN_SECRET is not defined');
                }
                decoded = jwt.verify(token, secret) as unknown as AuthToken;
            } catch (err) {
                console.error('❌ [verifyToken] JWT verification failed:', err);
                return res
                    .status(401)
                    .json({ message: 'Unauthorized: Invalid token' });
            }
            const user = await User.findById(decoded.id).lean<IUser>();
            if (!user) {
                console.error('❌ [verifyToken] User not found in database.');
                return res
                    .status(401)
                    .json({ message: 'Unauthorized: User does not exist' });
            }

            req.user = {
                id: user._id.toString(),
                _id: user._id.toString(),
                email: user.email,
                name: user.name,
                password: user.password ?? '',
                phone: user.phone,
                role: user.role,
            };

            next();
        } catch (error) {
            console.error('❌ [verifyToken] Unexpected error:', error);
            return res.status(500).json({ message: 'Internal server error' });
        }
    };
};
