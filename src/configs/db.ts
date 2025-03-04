import mongoose from 'mongoose';
import Grid from 'gridfs-stream';

let gfs: Grid.Grid | null = null;

export const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URL as string);
        console.log(`MongoDB Connected: ${conn.connection.host}`);

        // Init GridFS
        gfs = Grid(conn.connection.db, mongoose.mongo);
        gfs.collection('uploads'); // Set bucket name
    } catch (err) {
        console.error('MongoDB Connection Failed:', err);
        process.exit(1);
    }
};

export const getGFS = () => gfs;
