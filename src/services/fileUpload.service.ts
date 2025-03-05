import multer from 'multer';
import { GridFsStorage } from 'multer-gridfs-storage';
import crypto from 'crypto';
import path from 'path';
import dotenv from 'dotenv';
import sharp from 'sharp';
import { Readable } from 'stream';
import mongoose from 'mongoose';
import fs from 'fs';

dotenv.config();

// Define uploads directory path
const uploadsDir = path.join(__dirname, '../../uploads');

// Ensure uploads directory exists
const ensureUploadsDirectory = () => {
    if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
        console.log(`Created uploads directory at ${uploadsDir}`);
    }
};

// Create uploads directory on module load
ensureUploadsDirectory();

// Create disk storage for temporary file uploads
const diskStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        // Make sure directory exists before attempting to write
        ensureUploadsDirectory();
        cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
        const uniqueName = `${Date.now()}-${crypto.randomBytes(10).toString('hex')}${path.extname(file.originalname)}`;
        cb(null, uniqueName);
    },
});

// Configure multer to use disk storage instead of memory storage
const upload = multer({
    storage: diskStorage,
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
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
});

// Function to upload file to GridFS
export const uploadFile = async (
    file: Express.Multer.File
): Promise<{ filename: string; url: string }> => {
    try {
        if (!file) {
            throw new Error('No file provided');
        }

        const bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
            bucketName: 'uploads',
        });

        // Generate a unique filename
        const filename = `${Date.now()}-${crypto.randomBytes(10).toString('hex')}${path.extname(file.originalname)}`;

        // Verify file exists before creating read stream
        if (!fs.existsSync(file.path)) {
            throw new Error(`File does not exist at path: ${file.path}`);
        }

        // Create read stream from file on disk
        const readStream = fs.createReadStream(file.path);

        // Create write stream to GridFS
        const uploadStream = bucket.openUploadStream(filename, {
            contentType: file.mimetype,
            metadata: { originalName: file.originalname },
        });

        // Return promise that resolves when upload is complete
        return new Promise((resolve, reject) => {
            readStream
                .pipe(uploadStream)
                .on('finish', () => {
                    // Clean up temporary file
                    fs.unlink(file.path, (err: any) => {
                        if (err)
                            console.error('Error deleting temp file:', err);
                    });
                    resolve({
                        filename,
                        url: `http://localhost:5000/api/v1/project/file/${filename}`,
                    });
                })
                .on('error', (err: any) => {
                    reject(err);
                });
        });
    } catch (err) {
        console.error('File upload failed:', err);
        throw new Error(
            `File upload failed: ${err instanceof Error ? err.message : String(err)}`
        );
    }
};

export { upload };
