import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

mongoose.connect(process.env.MONGO_URL as string);

const conn = mongoose.connection;

conn.on('connected', () => {
    console.log('Connected to MongoDB');
});

conn.on('error', (err) => {
    console.log('MongoDB Connection Error:', err);
});

export default conn;
