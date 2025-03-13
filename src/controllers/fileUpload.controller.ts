import { Request, Response } from 'express';
import mongoose from 'mongoose';
import conn from '../configs/db';

export const uploadFile = async (req: Request, res: Response) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }
        res.status(200).json({ url: `/file/${req.file.filename}` });
    } catch (error) {
        res.status(500).json({ message: 'File upload failed', error });
    }
};

export const getFile = async (req: Request, res: Response) => {
    try {
        const { filename } = req.params;

        const bucket = new mongoose.mongo.GridFSBucket(conn.db, {
            bucketName: 'uploads',
        });

        const fileStream = bucket.openDownloadStreamByName(filename);

        fileStream.on('error', (err) => {
            return res.status(404).json({ message: 'File not found!' });
        });

        res.set('Content-Type', 'application/octet-stream');
        fileStream.pipe(res);
    } catch (err) {
        return res.status(500).json({ message: 'Internal Server Error!' });
    }
};

export const deleteFile = async (req: Request, res: Response) => {
    try {
        const { filename } = req.params;

        const bucket = new mongoose.mongo.GridFSBucket(conn.db, {
            bucketName: 'uploads',
        });

        // Find File in Bucket
        const files = await conn.db
            .collection('uploads.files')
            .findOne({ filename: filename });

        if (!files) {
            return res.status(404).json({ message: 'File not found!' });
        }

        // Delete File
        await bucket.delete(files._id);
        return res.status(200).json({ message: 'File deleted successfully!' });
    } catch (err) {
        return res.status(500).json({ message: 'Internal Server Error!' });
    }
};

export const listFiles = async (req: Request, res: Response) => {
    try {
        const bucket = new mongoose.mongo.GridFSBucket(conn.db, {
            bucketName: 'uploads',
        });

        const files = await bucket.find().toArray(); // Saare files ko fetch karta hai

        if (!files || files.length === 0) {
            return res.status(404).json({ message: 'No files found!' });
        }

        const fileList = files.map((file) => ({
            filename: file.filename,
            size: file.length,
            uploadedAt: file.uploadDate,
        }));

        return res.status(200).json(fileList);
    } catch (err) {
        return res.status(500).json({ message: 'Internal Server Error!' });
    }
};
