import { Schema, model } from 'mongoose';

const ReportSchema = new Schema(
    {
        project: {
            type: Schema.Types.ObjectId,
            ref: 'Project',
            required: true,
        },
        description: {
            type: String,
            required: true,
        },
        fileUrl: {
            type: String,
        },
        fileType: {
            type: String,
            enum: ['image', 'pdf', 'none'],
            default: 'none',
        },
        reportedBy: {
            userId: {
                type: Schema.Types.ObjectId,
                ref: 'User',
            },
            isAnonymous: {
                type: Boolean,
                default: true,
            },
        },
        status: {
            type: String,
            enum: ['pending', 'investigating', 'resolved', 'rejected'],
            default: 'pending',
        },
        aiAnalysis: {
            severity: {
                type: Number, // 1-10 scale
                default: 0,
            },
            summary: String,
            isValidReport: {
                type: Boolean,
                default: true,
            },
            tags: [String],
        },
        rejectionReason: String,
    },
    { timestamps: true }
);

export default model('Report', ReportSchema);
