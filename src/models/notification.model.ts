import { Schema, model } from 'mongoose';

export interface INotification {
    _id: string;
    recipient: Schema.Types.ObjectId;
    sender?: Schema.Types.ObjectId;
    type: string;
    message: string;
    read: boolean;
    entityId?: Schema.Types.ObjectId;
    entityType?: string;
    metadata?: Record<string, any>;
    createdAt: Date;
    updatedAt: Date;
}

const NotificationSchema = new Schema<INotification>(
    {
        recipient: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },
        sender: {
            type: Schema.Types.ObjectId,
            ref: 'User',
        },
        type: {
            type: String,
            required: true,
            enum: [
                'PROJECT_UPDATE',
                'COMMENT',
                'MENTION',
                'BOOKMARK',
                'SYSTEM',
                'ADMIN_MESSAGE',
                'PROJECT_INVITE',
                'FEEDBACK_RESPONSE',
                'REPORT_STATUS',
                'LIKE',
                'DISLIKE',
            ],
        },
        message: {
            type: String,
            required: true,
        },
        read: {
            type: Boolean,
            default: false,
            index: true,
        },
        entityId: {
            type: Schema.Types.ObjectId,
            refPath: 'entityType',
        },
        entityType: {
            type: String,
            enum: ['Project', 'User', 'Comment', 'Feedback', 'Report'],
        },
        metadata: {
            type: Schema.Types.Mixed,
        },
    },
    {
        timestamps: true,
        toJSON: { virtuals: true, getters: true },
        toObject: { virtuals: true, getters: true },
    }
);

export default model<INotification>(
    'Notification',
    NotificationSchema,
    'notifications'
);
