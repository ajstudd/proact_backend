/* eslint-disable prettier/prettier */
import { RequestHandler } from 'express';
import jwt from 'jsonwebtoken';
import { HttpError } from '../helpers/HttpError';
import { AuthToken, IRequestUser } from '../types';
import userService from '../services/user.service';

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
        console.log('🔍 [verifyToken] Middleware triggered.');

        try {
            // Step 1: Extract token from headers
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
                    return next(); // Allow request to proceed if strict mode is disabled
                }
            }

            const token = authHeader.split(' ')[1].trim();
            console.log('🔍 [verifyToken] Extracted Token:', token);

            // Step 2: Verify and decode token
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

            console.log('✅ [verifyToken] Token decoded. User ID:', decoded.id);

            // Step 3: Fetch user from database
            const user = await userService.getUserById(decoded.id);
            if (!user) {
                console.error('❌ [verifyToken] User not found in database.');
                return res
                    .status(401)
                    .json({ message: 'Unauthorized: User does not exist' });
            }

            console.log('✅ [verifyToken] User found:', user.email);

            // Step 4: Attach user data to request object
            req.user = {
                id: user._id.toString(),
                email: user.email,
                name: user.name,
                password: user.password ?? '',
                phone: user.phone,
                role: user.role,
            };

            next(); // Proceed to the next middleware or route
        } catch (error) {
            console.error('❌ [verifyToken] Unexpected error:', error);
            return res.status(500).json({ message: 'Internal server error' });
        }
    };
};
