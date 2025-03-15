import { Request, Response } from 'express';
import notificationService from '@/services/notification.service';
import { HttpError } from '@/helpers/HttpError';

/**
 * Get user notifications with pagination
 */
export const getUserNotifications = async (req: Request, res: Response) => {
    try {
        const userId = req.user!.id;
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const filter = req.query.filter as 'read' | 'unread' | undefined;

        const result = await notificationService.getUserNotifications(
            userId,
            page,
            limit,
            filter
        );

        return res.status(200).json(result);
    } catch (error) {
        const err = error as { code?: number; message: string };
        return res.status(err.code || 500).json({ message: err.message });
    }
};

/**
 * Mark notifications as read
 */
export const markNotificationsAsRead = async (req: Request, res: Response) => {
    try {
        const userId = req.user!.id;
        const { notificationIds } = req.body;

        if (
            !notificationIds ||
            !Array.isArray(notificationIds) ||
            notificationIds.length === 0
        ) {
            throw new HttpError({
                message: 'Valid notification IDs are required',
                code: 400,
            });
        }

        const result = await notificationService.markAsRead(
            userId,
            notificationIds
        );

        return res.status(200).json({
            message: 'Notifications marked as read',
            ...result,
        });
    } catch (error) {
        const err = error as { code?: number; message: string };
        return res.status(err.code || 500).json({ message: err.message });
    }
};

/**
 * Mark all notifications as read
 */
export const markAllNotificationsAsRead = async (
    req: Request,
    res: Response
) => {
    try {
        const userId = req.user!.id;

        const result = await notificationService.markAllAsRead(userId);

        return res.status(200).json({
            message: 'All notifications marked as read',
            ...result,
        });
    } catch (error) {
        const err = error as { code?: number; message: string };
        return res.status(err.code || 500).json({ message: err.message });
    }
};

/**
 * Get unread notification count
 */
export const getUnreadCount = async (req: Request, res: Response) => {
    try {
        const userId = req.user!.id;

        const result = await notificationService.getUnreadCount(userId);

        return res.status(200).json(result);
    } catch (error) {
        const err = error as { code?: number; message: string };
        return res.status(err.code || 500).json({ message: err.message });
    }
};

export default {
    getUserNotifications,
    markNotificationsAsRead,
    markAllNotificationsAsRead,
    getUnreadCount,
};
