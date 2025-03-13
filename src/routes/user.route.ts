import userController from '@/controllers/user.controller';
import { verifyToken } from '@/middlewares/verifyToken.middleware';
import { catchAsync } from 'catch-async-express';
import { Router } from 'express';

const router = Router();

router.patch(
    '/update',
    verifyToken({ strict: true }),
    catchAsync(userController.updateUser)
);

// Bookmark routes
router.post(
    '/bookmarks',
    verifyToken({ strict: true }),
    catchAsync(userController.bookmarkProject)
);

router.get(
    '/bookmarks',
    verifyToken({ strict: true }),
    catchAsync(userController.getBookmarkedProjects)
);

router.delete(
    '/bookmarks/:projectId',
    verifyToken({ strict: true }),
    catchAsync(userController.removeBookmark)
);

export default router;
