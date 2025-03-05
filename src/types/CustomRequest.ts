import { Request } from 'express';

export interface CustomRequest extends Request {
    files?: {
        banner?: Express.Multer.File[];
        pdf?: Express.Multer.File[];
    } & { [key: string]: Express.Multer.File[] };
}
