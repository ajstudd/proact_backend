import { Router } from 'express';
import { catchAsync } from 'catch-async-express';
import { verifyToken } from '@/middlewares/verifyToken.middleware';
import feedbackController from '@/controllers/feedback.controller';
import { authMiddleware, UserRole } from '@/middlewares/auth.middleware';

const router = Router();

// Create new feedback
router.post(
    '/',
    verifyToken({ strict: true }),
    catchAsync(feedbackController.createFeedback)
);

// Get all feedbacks (admin only)
router.get(
    '/',
    verifyToken({ strict: true }),
    authMiddleware([UserRole.GOVERNMENT]),
    catchAsync(feedbackController.getAllFeedbacks)
);

// Update feedback (mark as acknowledged)
router.patch(
    '/:id',
    verifyToken({ strict: true }),
    authMiddleware([UserRole.GOVERNMENT]),
    catchAsync(feedbackController.acknowledgeFeedback)
);

export default router;
