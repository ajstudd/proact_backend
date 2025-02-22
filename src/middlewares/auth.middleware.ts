/* eslint-disable prettier/prettier */
import { RequestHandler } from 'express';
import { HttpError } from '../helpers/HttpError';
// import { UserRole } from './auth.middleware';

// Define roles
export enum UserRole {
    ADMIN = 'ADMIN',
    CONTRACTOR = 'CONTRACTOR',
    GOVERNMENT = 'GOVERNMENT',
    PUBLIC = 'PUBLIC',
}

// Middleware for role-based authentication
export const authMiddleware = (allowedRoles: UserRole[]): RequestHandler => {
    return (req, res, next) => {
        try {
            console.log('req.user', req.user)
            if (!req.user) {
                throw new HttpError({ code: 401, message: 'Unauthorized' });
            }

            if (!allowedRoles.includes(req.user.role as unknown as UserRole)) {
                throw new HttpError({
                    code: 403,
                    message: 'Forbidden: Access denied',
                });
            }

            next();
        } catch (err) {
            if (err instanceof HttpError) {
                return res
                    .status(err.code || 403)
                    .json({ message: err.message || 'Access Denied' });
            }
            return res
                .status(403)
                .json({ message: 'Access Denied' });
        }
    };
};
