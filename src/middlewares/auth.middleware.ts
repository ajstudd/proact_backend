import jwt from 'jsonwebtoken';
import { RequestHandler } from 'express';
import { HttpError } from '../helpers/HttpError';

export enum UserRole {
    ADMIN = 'ADMIN',
    CONTRACTOR = 'CONTRACTOR',
    GOVERNMENT = 'GOVERNMENT',
    USER = 'USER',
}

export const authMiddleware = (allowedRoles: UserRole[]): RequestHandler => {
    return (req: any, res, next) => {
        try {
            const token = req.headers.authorization?.split(' ')[1];

            if (!token) {
                throw new HttpError({ code: 401, message: 'Unauthorized' });
            }

            const decoded = jwt.verify(
                token,
                process.env.JWT_TOKEN_SECRET as string
            );
            req.user = decoded;

            if (!allowedRoles.includes(req.user.role)) {
                throw new HttpError({
                    code: 403,
                    message: 'Forbidden: Access denied',
                });
            }

            next();
        } catch (err) {
            console.log('err', err);
            if (err instanceof HttpError) {
                return res
                    .status(err.code || 403)
                    .json({ message: err.message || 'Access Denied' });
            }
            return res.status(403).json({ message: 'Access Denied' });
        }
    };
};
