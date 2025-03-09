import { Router } from 'express';
import {
    likeProjectController,
    dislikeProjectController,
    unlikeProjectController,
    undislikeProjectController,
} from '@/controllers/like.controller';

const router = Router();

// Like/dislike routes
router.post('/:projectId/like', likeProjectController);
router.post('/:projectId/dislike', dislikeProjectController);
router.post('/:projectId/unlike', unlikeProjectController);
router.post('/:projectId/undislike', undislikeProjectController);

export default router;
