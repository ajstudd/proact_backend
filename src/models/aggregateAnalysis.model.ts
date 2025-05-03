import { Schema, model } from 'mongoose';

const AggregateAnalysisSchema = new Schema(
    {
        governmentId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        lastUpdated: {
            type: Date,
            default: Date.now,
        },
        projectCount: {
            total: { type: Number, default: 0 },
            active: { type: Number, default: 0 },
            completed: { type: Number, default: 0 },
            stalled: { type: Number, default: 0 }, // No updates in last 30 days
        },
        overallSatisfaction: {
            likesTotal: { type: Number, default: 0 },
            dislikesTotal: { type: Number, default: 0 },
            supportRatio: { type: Number, default: 0 }, // 0-100%
            commentSentimentDistribution: {
                positive: { type: Number, default: 0 }, // Percentage
                neutral: { type: Number, default: 0 }, // Percentage
                negative: { type: Number, default: 0 }, // Percentage
            },
        },
        financialSummary: {
            totalBudget: { type: Number, default: 0 },
            totalExpenditure: { type: Number, default: 0 },
            averageExpenditureRatio: { type: Number, default: 0 }, // Avg % of budget spent
            projectsOverBudget: { type: Number, default: 0 },
        },
        contractorPerformance: {
            mostActive: [
                {
                    contractor: { type: Schema.Types.ObjectId, ref: 'User' },
                    activityScore: { type: Number, default: 0 },
                    projectCount: { type: Number, default: 0 },
                },
            ],
            leastActive: [
                {
                    contractor: { type: Schema.Types.ObjectId, ref: 'User' },
                    activityScore: { type: Number, default: 0 },
                    projectCount: { type: Number, default: 0 },
                },
            ],
        },
        publicSentiment: {
            topPositiveTags: [
                {
                    tag: { type: String },
                    count: { type: Number, default: 0 },
                },
            ],
            topNegativeTags: [
                {
                    tag: { type: String },
                    count: { type: Number, default: 0 },
                },
            ],
            topConcerns: [String],
            topPraises: [String], // <-- Add this line
        },
        corruptionReports: {
            totalReports: { type: Number, default: 0 },
            resolvedReports: { type: Number, default: 0 },
            investigatingReports: { type: Number, default: 0 },
            averageSeverity: { type: Number, default: 0 },
            projectsWithMostReports: [
                {
                    project: { type: Schema.Types.ObjectId, ref: 'Project' },
                    reportCount: { type: Number, default: 0 },
                },
            ],
        },
    },
    { timestamps: true }
);

// Ensure each government has only one aggregate analysis
AggregateAnalysisSchema.index({ governmentId: 1 }, { unique: true });

export default model('AggregateAnalysis', AggregateAnalysisSchema);
