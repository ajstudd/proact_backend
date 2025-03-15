import Feedback from '../models/feedback.model';
import { HttpError } from '../helpers/HttpError';
import emailService from './email.service';
import mongoose from 'mongoose';

/**
 * Create a new feedback and send an email notification
 */
const createFeedback = async (userId: string, description: string) => {
    try {
        // Validate user ID
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            throw new HttpError({ message: 'Invalid user ID', code: 400 });
        }

        // Create feedback entry
        const feedback = await Feedback.create({
            userId,
            description,
        });

        // Send email notification to admin
        await emailService.sendMail({
            to: 'feedback.proact@gmail.com',
            subject: 'New Feedback Received',
            text: `New feedback received from user ${userId}:\n\n${description}`,
            html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>New Feedback Received</h2>
          <p><strong>User ID:</strong> ${userId}</p>
          <p><strong>Feedback:</strong></p>
          <div style="padding: 10px; border-left: 4px solid #ccc; background-color: #f9f9f9;">
            ${description}
          </div>
          <p>Please review this feedback in the admin dashboard.</p>
          <p>Time received: ${new Date().toLocaleString()}</p>
        </div>
      `,
        });

        return feedback;
    } catch (error) {
        if (error instanceof HttpError) {
            throw error;
        }
        console.error('Error creating feedback:', error);
        throw new HttpError({
            message: 'Failed to create feedback',
            code: 500,
        });
    }
};

/**
 * Get all feedbacks with pagination
 */
const getAllFeedbacks = async (
    page = 1,
    limit = 10,
    acknowledged?: boolean
) => {
    try {
        const query: any = {};

        // Add acknowledged filter if provided
        if (acknowledged !== undefined) {
            query.acknowledged = acknowledged;
        }

        const options = {
            page,
            limit,
            sort: { createdAt: -1 },
            populate: {
                path: 'userId',
                select: 'name email',
            },
        };

        const feedbacks = await Feedback.find(query)
            .populate('userId', 'name email')
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit);

        const total = await Feedback.countDocuments(query);

        return {
            feedbacks,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            totalItems: total,
        };
    } catch (error) {
        console.error('Error getting feedbacks:', error);
        throw new HttpError({
            message: 'Failed to retrieve feedbacks',
            code: 500,
        });
    }
};

/**
 * Update feedback acknowledgement status
 */
const acknowledgeFeedback = async (
    feedbackId: string,
    acknowledged: boolean
) => {
    try {
        const feedback = await Feedback.findByIdAndUpdate(
            feedbackId,
            { acknowledged },
            { new: true }
        );

        if (!feedback) {
            throw new HttpError({ message: 'Feedback not found', code: 404 });
        }

        return feedback;
    } catch (error) {
        if (error instanceof HttpError) {
            throw error;
        }
        console.error('Error acknowledging feedback:', error);
        throw new HttpError({
            message: 'Failed to update feedback',
            code: 500,
        });
    }
};

export default {
    createFeedback,
    getAllFeedbacks,
    acknowledgeFeedback,
};
