import postController from '@/controllers/post.controller';
import { verifyToken } from '@/middlewares/verifyToken.middleware';
import { catchAsync } from 'catch-async-express';
import { Router } from 'express';

const router = Router();

router.post(
    '/create',
    verifyToken({ strict: true }),
    catchAsync(postController.createPost)
);

router.get(
    '/all',
    verifyToken({ strict: true }),
    catchAsync(postController.getAllPosts)
);

router.post(
    '/image',
    // verifyToken({ strict: true }),
    catchAsync(postController.getPostImageWithPassword)
);

router.get(
    '/:postId',
    // verifyToken({ strict: true }),
    catchAsync(postController.getPostById)
);

router.post(
    '/comment',
    // verifyToken({ strict: true }),
    catchAsync(postController.addComment)
);

export default router;
