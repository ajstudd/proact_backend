import multer from 'multer';
import path from 'path';
import { GridFSBucket } from 'mongodb';
import mongoose from 'mongoose';
import { Request } from 'express';

const API_URL = process.env.API_URL || 'http://localhost:5000/api/v1';
// Configure multer storage
const storage = multer.memoryStorage();

// Create the multer instance
export const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB file size limit
});

// Get or create a GridFS bucket
const getBucket = (): GridFSBucket => {
    return new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
        bucketName: 'uploads',
    });
};

export const uploadFile = async (file: Express.Multer.File) => {
    try {
        // Create a unique filename using our custom function instead of uuid
        const filename = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}${path.extname(file.originalname)}`;

        // Get the GridFS bucket
        const bucket = getBucket();

        // Upload the file to GridFS
        const uploadStream = bucket.openUploadStream(filename, {
            contentType: file.mimetype,
        });

        // Write the file buffer to the stream
        uploadStream.write(file.buffer);
        uploadStream.end();

        // Return a promise that resolves when the file is uploaded
        return new Promise<{ filename: string; url: string }>(
            (resolve, reject) => {
                uploadStream.on('finish', () => {
                    console.log(
                        `File uploaded: ${filename} with ID ${uploadStream.id}`
                    );
                    // Return both the filename and a URL that can be used to retrieve the file
                    const url = `${API_URL}/project/file/${filename}`;
                    resolve({ filename, url });
                });

                uploadStream.on('error', (error) => {
                    console.error('Error uploading file:', error);
                    reject(error);
                });
            }
        );
    } catch (error) {
        console.error('Error in uploadFile:', error);
        throw new Error('File upload failed');
    }
};
