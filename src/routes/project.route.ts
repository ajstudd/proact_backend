import { Router } from 'express';
import express from 'express';
import mongoose from 'mongoose';
import {
    createProjectController,
    getAllProjectsController,
    updateProjectController,
    deleteProjectController,
    getProjectByIdController,
} from '../controllers/project.controller';
import { upload } from '../services/fileUpload.service';

const router = Router();

router.post(
    '/create',
    upload.fields([
        { name: 'banner', maxCount: 1 },
        { name: 'pdf', maxCount: 1 },
    ]),
    (req, res) => createProjectController(req as any, res)
);

router.get('/file/:filename', async (req, res) => {
    const bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
        bucketName: 'uploads',
    });
    const downloadStream = bucket.openDownloadStreamByName(req.params.filename);

    downloadStream.on('error', () => {
        res.status(404).json({ message: 'File Not Found' });
    });

    downloadStream.pipe(res);
});

router.get('/', getAllProjectsController);
router.get('/:id', getProjectByIdController);
router.put('/:id', updateProjectController);
router.delete('/:id', deleteProjectController);

export default router;
