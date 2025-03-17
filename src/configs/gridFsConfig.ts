import mongoose from 'mongoose';
import { GridFSBucket } from 'mongodb';

let gridBucket: GridFSBucket;

export const connectGridFS = async () => {
    const connection = mongoose.connection;

    if (!connection.db) {
        throw new Error('Database connection is not established');
    }
    gridBucket = new GridFSBucket(connection.db, {
        bucketName: 'uploads',
    });

    console.log('✅ GridFS Connected');
};

export { gridBucket };
