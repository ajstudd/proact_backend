import { Schema } from 'joi';
import { Request, Response, NextFunction } from 'express';

const validate = (schema: Schema) => {
    return (req: Request, res: Response, next: NextFunction) => {
        let dataToValidate;

        if (req.method === 'GET') {
            dataToValidate = req.query;
        } else {
            dataToValidate = req.body;
        }

        const { error, value } = schema.validate(dataToValidate, {
            abortEarly: false,
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

        // For GET requests, replace validated data back to req.query
        // For other methods, replace validated data back to req.body
        if (req.method === 'GET') {
            req.query = value;
        } else {
            req.body = value;
        }

        return next();
    };
};

export default validate;
