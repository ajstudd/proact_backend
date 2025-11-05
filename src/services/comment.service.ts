import Comment from '../models/comment.model';
import Project from '../models/project.model';
import User from '../models/user.model';
import notificationService from './notification.service';

export const createComment = async (commentData: {
    content: string;
    project: string;
    user: string;
    parentComment?: string;
}) => {
    try {
        // Create the comment
        const comment: any = await Comment.create(commentData);

        // If it's a reply to another comment, add it to the parent comment’s replies
        if (commentData.parentComment) {
            await Comment.findByIdAndUpdate(
                commentData.parentComment,
                { $push: { replies: comment._id } },
                { new: true }
            );

            // Get the parent comment to find its creator
            const parentComment = await Comment.findById(
                commentData.parentComment
            );

            // Send notification to the parent comment creator
            if (
                parentComment &&
                parentComment.user.toString() !== commentData.user
            ) {
                // Get the sender's name
                const sender = await User.findById(commentData.user).select(
                    'name'
                );
                const senderName = sender?.name || 'Someone';

                await notificationService.createNotification({
                    recipientId: parentComment.user.toString(),
                    senderId: commentData.user,
                    type: 'COMMENT',
                    message: `${senderName} replied to your comment`,
                    entityId: commentData.project,
                    entityType: 'Project',
                    metadata: {
                        commentId: commentData.parentComment,
                        replyId: comment._id.toString(),
                        projectId: commentData.project,
                    },
                });
            }
        } else {
            // If it's a top-level comment, add it to the project’s comments
            await Project.findByIdAndUpdate(
                commentData.project,
                { $push: { comments: comment._id } },
                { new: true }
            );
        }

        // Populate user data for the response
        const populatedComment = await Comment.findById(comment._id)
            .populate('user', 'name email avatar')
            .populate('likes', '_id')
            .populate('dislikes', '_id');

        return populatedComment;
    } catch (error) {
        throw error;
    }
};

export const getCommentsByProject = async (projectId: string) => {
    try {
        // Get all top-level comments for a project
        const comments = await Comment.find({
            project: projectId,
            parentComment: { $exists: false },
        })
            .populate('user', 'name email avatar')
            .populate('likes', '_id')
            .populate('dislikes', '_id')
            .populate({
                path: 'replies',
                populate: [
                    {
                        path: 'user',
                        select: 'name email avatar',
                    },
                    {
                        path: 'likes',
                        select: '_id',
                    },
                    {
                        path: 'dislikes',
                        select: '_id',
                    },
                ],
            })
            .sort({ createdAt: -1 });

        return comments;
    } catch (error) {
        throw error;
    }
};

export const getCommentsByUser = async (userId: string) => {
    try {
        // Get all comments made by a user
        const comments = await Comment.find({
            user: userId,
        })
            .populate('user', 'name email photo')
            .populate('likes', '_id')
            .populate('dislikes', '_id')
            .populate({
                path: 'project',
                select: 'title location government contractor bannerUrl',
                populate: {
                    path: 'government',
                    select: 'name email',
                },
            })
            .populate({
                path: 'replies',
                populate: [
                    {
                        path: 'user',
                        select: 'name email photo',
                    },
                    {
                        path: 'likes',
                        select: '_id',
                    },
                    {
                        path: 'dislikes',
                        select: '_id',
                    },
                ],
            })
            .sort({ createdAt: -1 });

        return comments;
    } catch (error) {
        throw error;
    }
};

export const updateComment = async (commentId: string, content: string) => {
    try {
        const comment = await Comment.findByIdAndUpdate(
            commentId,
            { content },
            { new: true }
        ).populate<{
            user: { _id: string; name: string; email: string; avatar: string };
        }>('user', 'name email avatar');

        return comment;
    } catch (error) {
        throw error;
    }
};

export const deleteComment = async (commentId: string) => {
    try {
        // Get the comment to check if it’s a top-level comment or reply
        const comment = await Comment.findById(commentId);
        if (!comment) {
            throw new Error('Comment not found');
        }

        // If it’s a top-level comment, remove it from the project
        if (!comment.parentComment) {
            await Project.findByIdAndUpdate(comment.project, {
                $pull: { comments: commentId },
            });
        } else {
            // If it’s a reply, remove it from the parent comment
            await Comment.findByIdAndUpdate(comment.parentComment, {
                $pull: { replies: commentId },
            });
        }

        // Delete the comment and its replies
        if (comment.replies && comment.replies.length > 0) {
            await Comment.deleteMany({ _id: { $in: comment.replies } });
        }
        await Comment.findByIdAndDelete(commentId);

        return { success: true };
    } catch (error) {
        throw error;
    }
};

export const likeComment = async (commentId: string, userId: string) => {
    try {
        const comment = await Comment.findByIdAndUpdate(
            commentId,
            { $addToSet: { likes: userId }, $pull: { dislikes: userId } },
            { new: true }
        ).populate('user', 'name email avatar');

        // Send notification to comment creator (if it's not the same user)
        if (
            comment &&
            comment.user &&
            (comment.user as any)._id.toString() !== userId
        ) {
            // Get the sender's name
            const sender = await User.findById(userId).select('name');
            const senderName = sender?.name || 'Someone';

            await notificationService.createNotification({
                recipientId: (comment.user as any)._id.toString(),
                senderId: userId,
                type: 'COMMENT',
                message: `${senderName} liked your comment`,
                entityId: comment.project.toString(),
                entityType: 'Project',
                metadata: {
                    commentId: commentId,
                    action: 'like',
                },
            });
        }

        return comment;
    } catch (error) {
        throw error;
    }
};

export const dislikeComment = async (commentId: string, userId: string) => {
    try {
        const comment = await Comment.findByIdAndUpdate(
            commentId,
            { $addToSet: { dislikes: userId }, $pull: { likes: userId } },
            { new: true }
        ).populate('user', 'name email avatar');

        if (
            comment &&
            comment.user &&
            (comment.user as any)._id.toString() !== userId
        ) {
            // Get the sender's name
            const sender = await User.findById(userId).select('name');
            const senderName = sender?.name || 'Someone';

            await notificationService.createNotification({
                recipientId: (comment.user as any)._id.toString(),
                senderId: userId,
                type: 'COMMENT',
                message: `${senderName} disliked your comment`,
                entityId: comment.project.toString(),
                entityType: 'Project',
                metadata: {
                    commentId: commentId,
                    action: 'dislike',
                },
            });
        }

        return comment;
    } catch (error) {
        throw error;
    }
};
