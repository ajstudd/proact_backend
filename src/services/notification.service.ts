import Notification from '../models/notification.model';
import User from '../models/user.model';
import { HttpError } from '../helpers/HttpError';
import { Types } from 'mongoose';

interface CreateNotificationParams {
    recipientId: string;
    senderId?: string;
    type: string;
    message: string;
    entityId?: string;
    entityType?: string;
    metadata?: Record<string, any>;
}

/**
 * Create a new notification and update recipient's notification count
 */
const createNotification = async (params: CreateNotificationParams) => {
    try {
        const notification = new Notification({
            recipient: params.recipientId,
            sender: params.senderId,
            type: params.type,
            message: params.message,
            entityId: params.entityId,
            entityType: params.entityType,
            metadata: params.metadata,
            read: false,
        });

        await notification.save();

        // Increment the user's unread notification count
        await User.findByIdAndUpdate(params.recipientId, {
            $inc: { unreadNotificationsCount: 1 },
        });

        return notification;
    } catch (error) {
        console.error('Error creating notification:', error);
        throw new HttpError({
            message: 'Failed to create notification',
            code: 500,
        });
    }
};

/**
 * Create notifications for multiple recipients
 */
const createNotificationForMany = async (
    recipientIds: string[],
    params: Omit<CreateNotificationParams, 'recipientId'>
) => {
    try {
        const notifications = recipientIds.map((recipientId) => ({
            recipient: new Types.ObjectId(recipientId),
            sender: params.senderId
                ? new Types.ObjectId(params.senderId)
                : undefined,
            type: params.type,
            message: params.message,
            entityId: params.entityId
                ? new Types.ObjectId(params.entityId)
                : undefined,
            entityType: params.entityType,
            metadata: params.metadata,
            read: false,
        }));

        if (notifications.length > 0) {
            await Notification.insertMany(notifications);

            // Increment unread counts for all recipients
            await User.updateMany(
                { _id: { $in: recipientIds } },
                { $inc: { unreadNotificationsCount: 1 } }
            );
        }

        return { success: true, count: notifications.length };
    } catch (error) {
        console.error('Error creating multiple notifications:', error);
        throw new HttpError({
            message: 'Failed to create notifications',
            code: 500,
        });
    }
};

/**
 * Get user notifications with pagination
 */
const getUserNotifications = async (
    userId: string,
    page = 1,
    limit = 10,
    filter?: 'read' | 'unread'
) => {
    try {
        const query: any = { recipient: userId };

        if (filter === 'read') {
            query.read = true;
        } else if (filter === 'unread') {
            query.read = false;
        }

        const notifications = await Notification.find(query)
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .populate('sender', 'name photo')
            .populate('entityId');

        const total = await Notification.countDocuments(query);

        return {
            notifications,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            totalItems: total,
        };
    } catch (error) {
        console.error('Error getting user notifications:', error);
        throw new HttpError({
            message: 'Failed to get notifications',
            code: 500,
        });
    }
};

/**
 * Mark notifications as read
 */
const markAsRead = async (userId: string, notificationIds: string[]) => {
    try {
        const result = await Notification.updateMany(
            {
                _id: { $in: notificationIds },
                recipient: userId,
                read: false,
            },
            { read: true }
        );

        // Update user's unread notification count
        if (result.modifiedCount > 0) {
            await User.findByIdAndUpdate(
                userId,
                {
                    $inc: { unreadNotificationsCount: -result.modifiedCount },
                },
                {
                    new: true,
                }
            );
        }

        return {
            success: true,
            markedAsRead: result.modifiedCount,
        };
    } catch (error) {
        console.error('Error marking notifications as read:', error);
        throw new HttpError({
            message: 'Failed to mark notifications as read',
            code: 500,
        });
    }
};

/**
 * Mark all notifications as read for a user
 */
const markAllAsRead = async (userId: string) => {
    try {
        const result = await Notification.updateMany(
            { recipient: userId, read: false },
            { read: true }
        );

        // Update user's unread notification count to 0
        if (result.modifiedCount > 0) {
            await User.findByIdAndUpdate(userId, {
                unreadNotificationsCount: 0,
            });
        }

        return {
            success: true,
            markedAsRead: result.modifiedCount,
        };
    } catch (error) {
        console.error('Error marking all notifications as read:', error);
        throw new HttpError({
            message: 'Failed to mark all notifications as read',
            code: 500,
        });
    }
};

/**
 * Get unread notification count
 */
const getUnreadCount = async (userId: string) => {
    try {
        const user = await User.findById(userId).select(
            'unreadNotificationsCount'
        );
        return {
            unreadCount: user?.unreadNotificationsCount || 0,
        };
    } catch (error) {
        console.error('Error getting unread count:', error);
        throw new HttpError({
            message: 'Failed to get unread count',
            code: 500,
        });
    }
};

export default {
    createNotification,
    createNotificationForMany,
    getUserNotifications,
    markAsRead,
    markAllAsRead,
    getUnreadCount,
};
