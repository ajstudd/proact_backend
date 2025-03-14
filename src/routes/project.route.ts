import { Router } from 'express';
import express from 'express';
import mongoose from 'mongoose';
import {
    createProjectController,
    getAllProjectsController,
    updateProjectController,
    deleteProjectController,
    getProjectByIdController,
    getAllTrimmedProjectsController,
    addProjectUpdateController,
    removeProjectUpdateController,
    editProjectUpdateController,
    getProjectUpdatesController,
    searchProjectsController,
    fastSearchProjectsController,
    getContractorsForGovernmentController,
} from '@/controllers/project.controller';
import { upload } from '@/services/fileUpload.service';
import likeRoutes from './like.route';
import commentRoutes from './comment.route';
import { authMiddleware, UserRole } from '../middlewares/auth.middleware';

const router = Router();

// Mount like routes
router.use('/interaction', likeRoutes);
// Mount comment routes
router.use('/comments', commentRoutes);

router.post(
    '/create',
    authMiddleware([UserRole.GOVERNMENT]), // Only government users can create projects
    upload.fields([
        { name: 'banner', maxCount: 1 },
        { name: 'pdf', maxCount: 1 },
    ]),
    (req, res) => createProjectController(req as any, res)
);

// Add route to get all contractors for a government's projects
router.get('/contractors', authMiddleware([UserRole.GOVERNMENT]), (req, res) =>
    getContractorsForGovernmentController(req as any, res)
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

router.get('/fast-search', fastSearchProjectsController);

router.get('/search', searchProjectsController);

router.get('/trimmed', getAllTrimmedProjectsController);
router.get('/', getAllProjectsController);
router.get('/:id', getProjectByIdController);
router.put('/:id', updateProjectController);
router.delete('/:id', deleteProjectController);

router.post('/:projectId/updates', addProjectUpdateController);
router.get('/:projectId/updates', getProjectUpdatesController);
router.put('/:projectId/updates/:updateId', editProjectUpdateController);
router.delete('/:projectId/updates/:updateId', removeProjectUpdateController);

export default router;
