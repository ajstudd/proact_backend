import { Router } from 'express';
import {
    createCommentController,
    getCommentsByProjectController,
    updateCommentController,
    deleteCommentController,
    likeCommentController,
    dislikeCommentController,
} from '@/controllers/comment.controller';
import { authMiddleware, UserRole } from '../middlewares/auth.middleware';
import { isCommentOwnerMiddleware } from '../middlewares/comment.middleware';

const router = Router();

// Comment routes
router.post(
    '/',
    authMiddleware([UserRole.USER, UserRole.CONTRACTOR, UserRole.GOVERNMENT]),
    createCommentController
);
router.get('/project/:projectId', getCommentsByProjectController);
router.put(
    '/:commentId',
    authMiddleware([UserRole.USER, UserRole.CONTRACTOR, UserRole.GOVERNMENT]),
    isCommentOwnerMiddleware,
    updateCommentController
);
router.delete(
    '/:commentId',
    authMiddleware([UserRole.USER, UserRole.CONTRACTOR, UserRole.GOVERNMENT]),
    isCommentOwnerMiddleware,
    deleteCommentController
);
router.post(
    '/:commentId/like',
    authMiddleware([UserRole.USER, UserRole.CONTRACTOR, UserRole.GOVERNMENT]),
    likeCommentController
);
router.post(
    '/:commentId/dislike',
    authMiddleware([UserRole.USER, UserRole.CONTRACTOR, UserRole.GOVERNMENT]),
    dislikeCommentController
);

export default router;
