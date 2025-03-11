import { Request, Response, NextFunction } from 'express';
import Comment from '../models/comment.model';
import { CustomRequest } from '../types/CustomRequest';

export const isCommentOwnerMiddleware = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { commentId } = req.params;
        const userId = (req as CustomRequest).user?._id;

        if (!userId) {
            return res
                .status(401)
                .json({ message: 'Unauthorized: User not found' });
        }

        const comment = await Comment.findById(commentId);

        if (!comment) {
            return res.status(404).json({ message: 'Comment not found' });
        }

        if (comment.user.toString() !== userId.toString()) {
            return res.status(403).json({
                message: 'You are not authorized to perform this action',
            });
        }

        next();
    } catch (err) {
        console.log('Error in isCommentOwnerMiddleware:', err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};
