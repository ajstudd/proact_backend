import { Request, Response } from 'express';
import {
    likeProject,
    dislikeProject,
    unlikeProject,
    undislikeProject,
} from '@/services/like.service';

export const likeProjectController = async (req: Request, res: Response) => {
    try {
        const { projectId } = req.params;
        const userId = req.user?.id || req.body.userId;

        if (!userId) {
            return res.status(400).json({ message: 'User ID is required' });
        }

        const project = await likeProject(projectId, userId);

        res.status(200).json({
            message: 'Project liked successfully',
            project,
        });
    } catch (err: any) {
        console.log('Error in likeProjectController:', err);
        res.status(500).json({
            message: err.message || 'Internal Server Error!',
        });
    }
};

export const dislikeProjectController = async (req: Request, res: Response) => {
    try {
        const { projectId } = req.params;
        const userId = req.user?.id || req.body.userId;

        if (!userId) {
            return res.status(400).json({ message: 'User ID is required' });
        }

        const project = await dislikeProject(projectId, userId);

        res.status(200).json({
            message: 'Project disliked successfully',
            project,
        });
    } catch (err: any) {
        console.log('Error in dislikeProjectController:', err);
        res.status(500).json({
            message: err.message || 'Internal Server Error!',
        });
    }
};

export const unlikeProjectController = async (req: Request, res: Response) => {
    try {
        const { projectId } = req.params;
        const userId = req.user?.id || req.body.userId;

        if (!userId) {
            return res.status(400).json({ message: 'User ID is required' });
        }

        const project = await unlikeProject(projectId, userId);

        res.status(200).json({
            message: 'Project unliked successfully',
            project,
        });
    } catch (err: any) {
        console.log('Error in unlikeProjectController:', err);
        res.status(500).json({
            message: err.message || 'Internal Server Error!',
        });
    }
};

export const undislikeProjectController = async (
    req: Request,
    res: Response
) => {
    try {
        const { projectId } = req.params;
        const userId = req.user?.id || req.body.userId;

        if (!userId) {
            return res.status(400).json({ message: 'User ID is required' });
        }

        const project = await undislikeProject(projectId, userId);

        res.status(200).json({
            message: 'Project undisliked successfully',
            project,
        });
    } catch (err: any) {
        console.log('Error in undislikeProjectController:', err);
        res.status(500).json({
            message: err.message || 'Internal Server Error!',
        });
    }
};
