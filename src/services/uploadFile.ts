import { Request } from "express";
import { gridBucket } from "../configs/gridFsConfig";

export const uploadFile = async (req: Request, fileName: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const uploadStream = gridBucket.openUploadStream(fileName, {
      contentType: req.file?.mimetype,
    });

    if (req.file?.buffer) {
      uploadStream.write(req.file.buffer);
    } else {
      return reject(new Error("File buffer is undefined"));
    }
    uploadStream.end();

    uploadStream.on("finish", () => {
      console.log(`✅ ${fileName} uploaded with ID: ${uploadStream.id}`);
      resolve(uploadStream.id.toString());
    });

    uploadStream.on("error", (err) => {
      console.log("❌ File Upload Error:", err);
      reject(err);
    });
  });
};
