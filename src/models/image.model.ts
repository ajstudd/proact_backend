import { IImage } from '@/types';
import { Schema, model } from 'mongoose';
const ImageSchema = new Schema<IImage>(
    {
        image: {
            type: String,
            required: true,
        },
        localPath: {
            type: String,
            required: true,
            select: false,
        },
    },
    {
        timestamps: true,
        _id: true,
        id: true,
    }
);

export default model<IImage>('IImage', ImageSchema, 'images');
