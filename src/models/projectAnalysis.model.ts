import { Schema, model } from 'mongoose';

const ProjectAnalysisSchema = new Schema(
    {
        project: {
            type: Schema.Types.ObjectId,
            ref: 'Project',
            required: true,
        },
        lastUpdated: {
            type: Date,
            default: Date.now,
        },
        supportMetrics: {
            likeCount: { type: Number, default: 0 },
            dislikeCount: { type: Number, default: 0 },
            supportRatio: { type: Number, default: 0 }, // 0-100%
            commentSentiment: {
                positive: { type: Number, default: 0 }, // Count of positive comments
                neutral: { type: Number, default: 0 }, // Count of neutral comments
                negative: { type: Number, default: 0 }, // Count of negative comments
            },
        },
        progressMetrics: {
            updateFrequency: { type: Number, default: 0 }, // Updates per week
            lastUpdateDate: { type: Date },
            daysSinceLastUpdate: { type: Number, default: 0 },
            totalUpdates: { type: Number, default: 0 },
        },
        financialMetrics: {
            expenditureRatio: { type: Number, default: 0 }, // % of budget spent
            budgetTotal: { type: Number, default: 0 },
            expenditureTotal: { type: Number, default: 0 },
            projectedCompletion: { type: Date },
            burnRate: { type: Number, default: 0 }, // Amount spent per day
        },
        contractorMetrics: {
            activityLevel: { type: Number, default: 0 }, // 0-10 score
            responseRate: { type: Number, default: 0 }, // % of comments responded to
            averageResponseTime: { type: Number }, // In hours
        },
        commentAnalysis: {
            tags: [
                {
                    tag: { type: String },
                    count: { type: Number, default: 0 },
                    sentiment: {
                        type: String,
                        enum: ['positive', 'neutral', 'negative'],
                    },
                },
            ],
            topConcerns: [String],
            topPraises: [String],
        },
        corruptionReportMetrics: {
            reportCount: { type: Number, default: 0 },
            resolvedCount: { type: Number, default: 0 },
            investigatingCount: { type: Number, default: 0 },
            rejectedCount: { type: Number, default: 0 },
            pendingCount: { type: Number, default: 0 },
            averageSeverity: { type: Number, default: 0 },
        },
    },
    { timestamps: true }
);

// Ensure each project has only one analysis document
ProjectAnalysisSchema.index({ project: 1 }, { unique: true });

export default model('ProjectAnalysis', ProjectAnalysisSchema);
