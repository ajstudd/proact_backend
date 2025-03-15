import { Router } from 'express';
import { verifyToken } from '@/middlewares/verifyToken.middleware';
import {
    likeProjectController,
    dislikeProjectController,
    unlikeProjectController,
    undislikeProjectController,
} from '@/controllers/like.controller';

const router = Router();

// Like/dislike routes
router.post(
    '/:projectId/like',
    verifyToken({ strict: true }),
    likeProjectController
);
router.post(
    '/:projectId/dislike',
    verifyToken({ strict: true }),
    dislikeProjectController
);
router.post(
    '/:projectId/unlike',
    verifyToken({ strict: true }),
    unlikeProjectController
);
router.post(
    '/:projectId/undislike',
    verifyToken({ strict: true }),
    undislikeProjectController
);

export default router;
