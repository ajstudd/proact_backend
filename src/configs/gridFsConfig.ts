import mongoose from "mongoose";
import { GridFSBucket } from "mongodb";

let gridBucket: GridFSBucket;

export const connectGridFS = async () => {
  const connection = mongoose.connection;

  gridBucket = new mongoose.mongo.GridFSBucket(connection.db, {
    bucketName: "uploads", // This will create two collections: uploads.files and uploads.chunks
  });

  console.log("✅ GridFS Connected");
};

export { gridBucket };
