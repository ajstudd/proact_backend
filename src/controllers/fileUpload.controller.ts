import { Request, Response } from 'express';
import { getGFS } from '../configs/db';


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
        const gfs = getGFS();
        if (!gfs) return res.status(500).json({ message: 'GridFS not initialized' });

        gfs.files.findOne({ filename: req.params.filename }, (err: any, file: any) => {
            if (!file || file.length === 0) {
                return res.status(404).json({ message: 'File not found' });
            }

            const readstream = gfs.createReadStream(file.filename);
            readstream.pipe(res);
        });
    } catch (error) {
        res.status(500).json({ message: 'File retrieval failed', error });
    }
};
