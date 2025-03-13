import userController from '@/controllers/user.controller';
import { verifyToken } from '@/middlewares/verifyToken.middleware';
import { catchAsync } from 'catch-async-express';
import { Router } from 'express';
import validate from '@/middlewares/validate.middleware';
import userValidator from '@/validators/user.validator';
import commentRoutes from './comment.route';
import { upload } from '@/services/fileUpload.service';

const router = Router();

router.patch(
    '/update',
    verifyToken({ strict: true }),
    catchAsync(userController.updateUser)
);

// New routes for user profile management
router.patch(
    '/edit-profile',
    verifyToken({ strict: true }),
    // Add multer middleware to handle single file upload with field name 'photo'
    upload.single('photo'),
    validate(userValidator.editProfile),
    catchAsync(userController.editProfile)
);

router.post(
    '/verify-email',
    validate(userValidator.verifyEmailChange),
    catchAsync(userController.verifyEmailChange)
);

router.use('/comments', commentRoutes);
router.get(
    '/profile',
    verifyToken({ strict: true }),
    catchAsync(userController.getProfile)
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
