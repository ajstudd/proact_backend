import multer from 'multer';
import { GridFsStorage } from 'multer-gridfs-storage';
import crypto from 'crypto';
import path from 'path';
import dotenv from 'dotenv';
import sharp from 'sharp';
import { Readable } from 'stream';

dotenv.config();

const storage = new GridFsStorage({
    url: process.env.MONGO_URL as string,
    file: async (req, file) => {
        const filename = `${crypto.randomBytes(10).toString('hex')}${path.extname(file.originalname)}`;
        const bucketName = 'uploads';

        if (file.mimetype.startsWith('image')) {
            const chunks: Buffer[] = [];

            // Convert Stream to Buffer
            file.stream.on('data', (chunk: Buffer) => chunks.push(chunk));

            await new Promise((resolve) => file.stream.on('end', resolve));

            const buffer = Buffer.concat(chunks);

            // Compress Image
            const compressedBuffer = await sharp(buffer)
                .resize({ width: 800 })
                .jpeg({ quality: 70 })
                .toBuffer();

            // Convert Buffer to Stream
            const compressedStream = Readable.from(compressedBuffer);

            return {
                filename,
                bucketName,
                metadata: { originalName: file.originalname },
                stream: compressedStream, // Send the compressed stream directly to GridFS
            };
        }

        return {
            filename,
            bucketName,
            metadata: { originalName: file.originalname },
        };
    },
});

const upload = multer({ storage });

export { upload };
