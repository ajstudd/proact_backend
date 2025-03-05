import { Request, Response } from 'express';
import {
    createComment,
    getCommentsByProject,
} from '../services/comment.service';

export const createCommentController = async (req: Request, res: Response) => {
    try {
        const comment = await createComment(req);
        res.status(201).json({
            message: 'Comment Added Successfully!',
            comment,
        });
    } catch (err: any) {
        console.log(err);
        res.status(500).json({
            message: err.message || 'Internal Server Error!',
        });
    }
};

export const getCommentsController = async (req: Request, res: Response) => {
    try {
        const { projectId } = req.params;
        const comments = await getCommentsByProject(projectId);
        res.status(200).json({ comments });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Internal Server Error!' });
    }
};
