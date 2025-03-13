import { Request, Response } from 'express';
import { CustomRequest } from '../types/CustomRequest';
import {
    createComment,
    getCommentsByProject,
    updateComment,
    deleteComment,
    likeComment,
    dislikeComment,
    getCommentsByUser,
} from '@/services/comment.service';

export const createCommentController = async (req: Request, res: Response) => {
    try {
        const { content, projectId, userId, parentComment } = req.body;

        if (!content || !projectId || !userId) {
            return res.status(400).json({
                message: 'Content, project ID and user ID are required',
            });
        }

        const commentData = {
            content,
            project: projectId,
            user: userId,
            ...(parentComment && { parentComment }),
        };

        const comment = await createComment(commentData);

        res.status(201).json({
            message: 'Comment created successfully',
            comment,
        });
    } catch (err: any) {
        console.log('Error in createCommentController:', err);
        res.status(500).json({
            message: err.message || 'Internal Server Error!',
        });
    }
};

export const getCommentsByProjectController = async (
    req: Request,
    res: Response
) => {
    try {
        const { projectId } = req.params;
        const comments = await getCommentsByProject(projectId);

        res.status(200).json({
            comments,
        });
    } catch (err: any) {
        console.log('Error in getCommentsByProjectController:', err);
        res.status(500).json({
            message: err.message || 'Internal Server Error!',
        });
    }
};

export const updateCommentController = async (req: Request, res: Response) => {
    try {
        const { commentId } = req.params;
        const { content } = req.body;

        if (!content) {
            return res.status(400).json({ message: 'Content is required' });
        }

        const comment = await updateComment(commentId, content);

        res.status(200).json({
            message: 'Comment updated successfully',
            comment,
        });
    } catch (err: any) {
        console.log('Error in updateCommentController:', err);
        res.status(500).json({
            message: err.message || 'Internal Server Error!',
        });
    }
};

export const deleteCommentController = async (req: Request, res: Response) => {
    try {
        const { commentId } = req.params;
        await deleteComment(commentId);

        res.status(200).json({
            message: 'Comment deleted successfully',
        });
    } catch (err: any) {
        console.log('Error in deleteCommentController:', err);
        res.status(500).json({
            message: err.message || 'Internal Server Error!',
        });
    }
};

export const likeCommentController = async (req: Request, res: Response) => {
    try {
        const { commentId } = req.params;
        const userId = (req as CustomRequest).user?.id;

        if (!userId) {
            return res.status(400).json({ message: 'User ID is required' });
        }

        const comment = await likeComment(commentId, userId);

        res.status(200).json({
            message: 'Comment liked successfully',
            comment,
        });
    } catch (err: any) {
        console.log('Error in likeCommentController:', err);
        res.status(500).json({
            message: err.message || 'Internal Server Error!',
        });
    }
};

export const dislikeCommentController = async (req: Request, res: Response) => {
    try {
        const { commentId } = req.params;
        const userId = (req as CustomRequest).user?.id;

        if (!userId) {
            return res.status(400).json({ message: 'User ID is required' });
        }

        const comment = await dislikeComment(commentId, userId);

        res.status(200).json({
            message: 'Comment disliked successfully',
            comment,
        });
    } catch (err: any) {
        console.log('Error in dislikeCommentController:', err);
        res.status(500).json({
            message: err.message || 'Internal Server Error!',
        });
    }
};

export const getCommentsByUserController = async (
    req: Request,
    res: Response
) => {
    try {
        const { userId } = req.params;

        if (!userId) {
            return res.status(400).json({ message: 'User ID is required' });
        }

        const comments = await getCommentsByUser(userId);

        res.status(200).json({
            comments,
        });
    } catch (err: any) {
        console.log('Error in getCommentsByUserController:', err);
        res.status(500).json({
            message: err.message || 'Internal Server Error!',
        });
    }
};
