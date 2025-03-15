import { Request, Response } from 'express';
import feedbackService from '@/services/feedback.service';
import { HttpError } from '@/helpers/HttpError';

/**
 * Create new feedback
 */
export const createFeedback = async (req: Request, res: Response) => {
    try {
        const { description } = req.body;
        const userId = req.user!.id;

        if (!description) {
            throw new HttpError({
                message: 'Description is required',
                code: 400,
            });
        }

        const feedback = await feedbackService.createFeedback(
            userId,
            description
        );

        return res.status(201).json({
            message: 'Feedback submitted successfully',
            feedback,
        });
    } catch (error) {
        const err = error as { code?: number; message: string };
        return res.status(err.code || 500).json({ message: err.message });
    }
};

/**
 * Get all feedbacks with pagination and filters
 */
export const getAllFeedbacks = async (req: Request, res: Response) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const acknowledged =
            req.query.acknowledged !== undefined
                ? req.query.acknowledged === 'true'
                : undefined;

        const result = await feedbackService.getAllFeedbacks(
            page,
            limit,
            acknowledged
        );

        return res.status(200).json(result);
    } catch (error) {
        const err = error as { code?: number; message: string };
        return res.status(err.code || 500).json({ message: err.message });
    }
};

/**
 * Update feedback acknowledgement status
 */
export const acknowledgeFeedback = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { acknowledged } = req.body;

        if (acknowledged === undefined) {
            throw new HttpError({
                message: 'Acknowledged status is required',
                code: 400,
            });
        }

        const feedback = await feedbackService.acknowledgeFeedback(
            id,
            acknowledged
        );

        return res.status(200).json({
            message: 'Feedback updated successfully',
            feedback,
        });
    } catch (error) {
        const err = error as { code?: number; message: string };
        return res.status(err.code || 500).json({ message: err.message });
    }
};

export default {
    createFeedback,
    getAllFeedbacks,
    acknowledgeFeedback,
};
