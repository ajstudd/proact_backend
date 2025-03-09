import { Router } from 'express';
import {
    createCommentController,
    getCommentsByProjectController,
    updateCommentController,
    deleteCommentController,
} from '@/controllers/comment.controller';
import { authMiddleware, UserRole } from '../middlewares/auth.middleware';

const router = Router();

// Comment routes
router.post(
    '/',
    authMiddleware([UserRole.PUBLIC, UserRole.CONTRACTOR]),
    createCommentController
);
router.get('/project/:projectId', getCommentsByProjectController);
router.put('/:commentId', updateCommentController);
router.delete('/:commentId', deleteCommentController);

export default router;
