import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';

/**
 * Middleware for validating request data against Joi schemas
 * @param schema - Joi schema to validate against
 * @returns Express middleware function
 */
const validate = (schema: Joi.ObjectSchema | Joi.AlternativesSchema) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const { error, value } = schema.validate(req.body, {
            abortEarly: false,
            stripUnknown: true,
        });

        if (error) {
            const errorMessage = error.details
                .map((detail) => detail.message)
                .join(', ');

            return res.status(400).json({
                message: 'Validation error',
                errors: errorMessage,
            });
        }

        // Replace request body with validated value
        req.body = value;
        next();
    };
};

export default validate;
