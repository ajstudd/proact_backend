import { Router } from 'express';
import {
    createCommentController,
    getCommentsController,
} from '../controllers/comment.controller';
import { authMiddleware, UserRole } from '../middlewares/auth.middleware';

const router = Router();

router.post(
    '/',
    authMiddleware([UserRole.PUBLIC, UserRole.CONTRACTOR]),
    createCommentController
);
router.get('/:projectId', getCommentsController);

export default router;
