import { Router } from 'express';
import { catchAsync } from 'catch-async-express';
import { verifyToken } from '@/middlewares/verifyToken.middleware';
import notificationController from '@/controllers/notification.controller';

const router = Router();

// Get user notifications
router.get(
    '/',
    verifyToken({ strict: true }),
    catchAsync(notificationController.getUserNotifications)
);

// Get unread notification count
router.get(
    '/unread-count',
    verifyToken({ strict: true }),
    catchAsync(notificationController.getUnreadCount)
);

// Mark notifications as read
router.post(
    '/mark-as-read',
    verifyToken({ strict: true }),
    catchAsync(notificationController.markNotificationsAsRead)
);

// Mark all notifications as read
router.post(
    '/mark-all-as-read',
    verifyToken({ strict: true }),
    catchAsync(notificationController.markAllNotificationsAsRead)
);

export default router;
