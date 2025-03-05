import multer from 'multer';
import { GridFsStorage } from 'multer-gridfs-storage';
import crypto from 'crypto';
import path from 'path';
import dotenv from 'dotenv';
import sharp from 'sharp';
import { Readable } from 'stream';
import mongoose from 'mongoose';
import streamToBuffer from '@/utils/streamToBuffer';

dotenv.config();

const storage = new GridFsStorage({
    url: process.env.MONGO_URL as string,
    file: async (req, file) => {
        const filename = `${Date.now()}-${crypto.randomBytes(10).toString('hex')}${path.extname(file.originalname)}`;
        const bucketName = 'uploads';

        let stream = file.stream;
        const buffer = await streamToBuffer(stream); // Only this line needed

        if (file.mimetype.startsWith('image')) {
            const compressedBuffer = await sharp(buffer)
                .resize({ width: 800 })
                .jpeg({ quality: 70 })
                .toBuffer();

            stream = Readable.from(compressedBuffer);
        }

        if (file.mimetype === 'application/pdf') {
            const pages = await sharp(buffer, { density: 300 })
                .jpeg({ quality: 70 })
                .toBuffer();

            stream = Readable.from(pages);
        }

        return {
            filename,
            bucketName,
            metadata: { originalName: file.originalname },
            stream,
        };
    },
});

const upload = multer({
    storage,
    fileFilter: (req, file, cb) => {
        if (
            file.mimetype.startsWith('image/') ||
            file.mimetype === 'application/pdf'
        ) {
            cb(null, true);
        } else {
            cb(null, false);
        }
    },
});

// export const uploadFile = async (
//     file: Express.Multer.File
// ): Promise<string> => {
//     try {
//         if (!file || !file.stream) {
//             throw new Error('File stream is undefined!');
//         }

//         const bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
//             bucketName: 'uploads',
//         });

//         console.log('Uploading File:', file.filename);

//         return new Promise((resolve, reject) => {
//             const uploadStream = bucket.openUploadStream(file.filename);

//             uploadStream.on('finish', () => {
//                 resolve(file.filename);
//             });

//             uploadStream.on('error', (err) => {
//                 reject(err);
//             });

//             // Pipe file stream to GridFS
//             file.stream.pipe(uploadStream);
//         });
//     } catch (err) {
//         console.error(err);
//         throw new Error('File Upload Failed!');
//     }
// };
export const uploadFile = async (
    file: Express.Multer.File
): Promise<{ filename: string; url: string }> => {
    try {
        if (!file || !file.stream) {
            throw new Error('File stream is undefined!');
        }

        const bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
            bucketName: 'uploads',
        });

        console.log('Uploading File:', file.filename);

        return new Promise((resolve, reject) => {
            const uploadStream = bucket.openUploadStream(file.filename);

            uploadStream.on('finish', () => {
                resolve({
                    filename: file.filename,
                    url: `/file/${file.filename}`, // ✅ Return Download URL
                });
            });

            uploadStream.on('error', (err) => {
                reject(err);
            });

            file.stream.pipe(uploadStream);
        });
    } catch (err) {
        console.error(err);
        throw new Error('File Upload Failed!');
    }
};

export { upload };
