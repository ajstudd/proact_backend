import mongoose from "mongoose";
import { gridBucket } from "../configs/gridFsConfig";
import { Request, Response } from 'express';

export const getFile = async (req: Request, res: Response) => {
  try {
    const fileId = new mongoose.Types.ObjectId(req.params.id);
    const file = await gridBucket.find({ _id: fileId }).toArray();

    if (!file.length) {
      return res.status(404).json({ message: "File not found" });
    }

    gridBucket.openDownloadStream(fileId).pipe(res);
  } catch (err) {
    console.log("❌ File Retrieval Error:", err);
    res.status(500).json({ message: "Failed to retrieve file" });
  }
};
