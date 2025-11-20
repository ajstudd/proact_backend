import mongoose from 'mongoose';
import ProjectAnalysis from '../models/projectAnalysis.model';
import AggregateAnalysis from '../models/aggregateAnalysis.model';
import Project from '../models/project.model';
import Comment from '../models/comment.model';
import Report from '../models/report.model';
import User from '../models/user.model';
import { HttpError } from '../helpers/HttpError';
import { analyzeCommentSentiment } from './ai-analysis.service';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const API_KEY = process.env.GEMINI_API_KEY;
const ai = API_KEY ? new GoogleGenAI({ apiKey: API_KEY }) : null;

export const generateProjectAnalysis = async (projectId: string) => {
    try {
        const project = await Project.findById(projectId)
            .populate('likes', '_id')
            .populate('dislikes', '_id')
            .populate('comments')
            .populate('updates');

        if (!project) {
            throw new HttpError({ message: 'Project not found', code: 404 });
        }

        // Calculate metrics
        const likeCount = project.likes?.length || 0;
        const dislikeCount = project.dislikes?.length || 0;
        const supportRatio =
            likeCount + dislikeCount > 0
                ? (likeCount / (likeCount + dislikeCount)) * 100
                : 0;

        // Progress metrics
        const updates = project.updates || [];
        const totalUpdates = updates.length;
        const lastUpdate =
            updates.length > 0
                ? updates.sort((a, b) => b.date.getTime() - a.date.getTime())[0]
                : null;
        const lastUpdateDate = lastUpdate ? lastUpdate.date : null;

        let daysSinceLastUpdate = 0;
        if (lastUpdateDate) {
            const timeDiff = Date.now() - lastUpdateDate.getTime();
            daysSinceLastUpdate = Math.floor(timeDiff / (1000 * 3600 * 24));
        }

        // Calculate update frequency (updates per week)
        let updateFrequency = 0;
        if (totalUpdates > 0 && project.createdAt) {
            const projectAgeInWeeks =
                (Date.now() - project.createdAt.getTime()) /
                (1000 * 3600 * 24 * 7);
            updateFrequency =
                projectAgeInWeeks > 0 ? totalUpdates / projectAgeInWeeks : 0;
        }

        // Financial metrics
        const budgetTotal = project.budget || 0;
        const expenditureTotal = project.expenditure || 0;
        const expenditureRatio =
            budgetTotal > 0 ? (expenditureTotal / budgetTotal) * 100 : 0;

        // Calculate burn rate (amount spent per day)
        let burnRate = 0;
        if (project.createdAt && expenditureTotal > 0) {
            const projectAgeInDays =
                (Date.now() - project.createdAt.getTime()) / (1000 * 3600 * 24);
            burnRate =
                projectAgeInDays > 0 ? expenditureTotal / projectAgeInDays : 0;
        }

        // Project projected completion date based on burn rate and remaining budget
        let projectedCompletion = null;
        if (burnRate > 0 && expenditureTotal < budgetTotal) {
            const remainingBudget = budgetTotal - expenditureTotal;
            const daysRemaining = remainingBudget / burnRate;
            projectedCompletion = new Date(
                Date.now() + daysRemaining * 24 * 3600 * 1000
            );
        }

        // Get corruption reports for this project
        const reports = await Report.find({ project: projectId });
        const reportCount = reports.length;
        const resolvedCount = reports.filter(
            (r) => r.status === 'resolved'
        ).length;
        const investigatingCount = reports.filter(
            (r) => r.status === 'investigating'
        ).length;
        const rejectedCount = reports.filter(
            (r) => r.status === 'rejected'
        ).length;
        const pendingCount = reports.filter(
            (r) => r.status === 'pending'
        ).length;

        // Calculate average severity from AI analysis
        const severities = reports
            .map((r) => r.aiAnalysis?.severity || 0)
            .filter((s) => s > 0);

        const averageSeverity =
            severities.length > 0
                ? severities.reduce((sum, val) => sum + val, 0) /
                  severities.length
                : 0;

        const comments = await Comment.find({ project: projectId })
            .populate('user', 'name _id')
            .lean();

        const contractorId = project.contractor?.toString();
        const contractorResponses = comments.filter(
            (c) => c.user && c.user._id.toString() === contractorId
        );

        // Calculate contractor metrics
        const activityLevel =
            updates.length > 0 ? Math.min(10, updates.length) : 0;
        const userComments = comments.filter(
            (c) => c.user && c.user._id.toString() !== contractorId
        );
        const responseRate =
            userComments.length > 0
                ? (contractorResponses.length / userComments.length) * 100
                : 0;

        // Perform comment sentiment analysis
        const commentsText = comments.map((c) => c.content);
        const commentSentiment =
            commentsText.length > 0
                ? await analyzeCommentBatch(commentsText)
                : { positive: 0, neutral: 0, negative: 0 };

        // Extract comment tags and categorize by sentiment
        const commentTags = await extractCommentTags(comments);

        // Use await for topConcerns and topPraises
        const topConcerns = await extractTopConcerns(comments);
        const topPraises = await extractTopPraises(comments);

        const analysis = await ProjectAnalysis.findOneAndUpdate(
            { project: projectId },
            {
                lastUpdated: new Date(),
                supportMetrics: {
                    likeCount,
                    dislikeCount,
                    supportRatio,
                    commentSentiment,
                },
                progressMetrics: {
                    updateFrequency,
                    lastUpdateDate,
                    daysSinceLastUpdate,
                    totalUpdates,
                },
                financialMetrics: {
                    expenditureRatio,
                    budgetTotal,
                    expenditureTotal,
                    projectedCompletion,
                    burnRate,
                },
                contractorMetrics: {
                    activityLevel,
                    responseRate,
                    averageResponseTime: calculateAverageResponseTime(
                        comments,
                        contractorId
                    ),
                },
                commentAnalysis: {
                    tags: commentTags,
                    topConcerns, // updated
                    topPraises, // updated
                },
                corruptionReportMetrics: {
                    reportCount,
                    resolvedCount,
                    investigatingCount,
                    rejectedCount,
                    pendingCount,
                    averageSeverity,
                },
            },
            { new: true, upsert: true }
        );

        return analysis;
    } catch (error) {
        console.error('Error generating project analysis:', error);
        if (error instanceof HttpError) throw error;
        throw new HttpError({
            message: 'Failed to generate project analysis',
            code: 500,
        });
    }
};

export const generateAggregateAnalysis = async (governmentId: string) => {
    try {
        const government = await User.findById(governmentId);
        if (!government || government.role !== 'GOVERNMENT') {
            throw new HttpError({
                message: 'Government user not found',
                code: 404,
            });
        }

        const projects = await Project.find({ government: governmentId })
            .populate('likes', '_id')
            .populate('dislikes', '_id')
            .populate('contractor', 'name _id')
            .lean();

        if (!projects.length) {
            throw new HttpError({
                message: 'No projects found for this government',
                code: 404,
            });
        }

        const projectIds = projects.map((p) => p._id);
        console.log('projectIds', projectIds);

        // Calculate project status counts
        const today = new Date();
        const thirtyDaysAgo = new Date(
            today.getTime() - 30 * 24 * 60 * 60 * 1000
        );

        const active = projects.filter((p) => {
            const updates = p.updates || [];
            return updates.some((u) => u.date > thirtyDaysAgo);
        }).length;

        const stalled = projects.length - active;
        const completed = 0; // Need a way to determine completed projects

        // Calculate overall satisfaction
        const likesTotal = projects.reduce(
            (sum, p) => sum + (p.likes?.length || 0),
            0
        );
        const dislikesTotal = projects.reduce(
            (sum, p) => sum + (p.dislikes?.length || 0),
            0
        );
        const supportRatio =
            likesTotal + dislikesTotal > 0
                ? (likesTotal / (likesTotal + dislikesTotal)) * 100
                : 0;

        // Get all comments across projects
        const allComments = await Comment.find({
            project: { $in: projectIds },
        }).lean();
        console.log('allComments', allComments);

        // Analyze comment sentiment
        const commentTexts = allComments.map((c) => c.content);
        const sentimentCounts =
            commentTexts.length > 0
                ? await analyzeCommentBatch(commentTexts)
                : { positive: 0, neutral: 0, negative: 0 };

        const totalComments =
            sentimentCounts.positive +
            sentimentCounts.neutral +
            sentimentCounts.negative;
        const sentimentDistribution = {
            positive:
                totalComments > 0
                    ? (sentimentCounts.positive / totalComments) * 100
                    : 0,
            neutral:
                totalComments > 0
                    ? (sentimentCounts.neutral / totalComments) * 100
                    : 0,
            negative:
                totalComments > 0
                    ? (sentimentCounts.negative / totalComments) * 100
                    : 0,
        };

        // Calculate financial summary
        const totalBudget = projects.reduce(
            (sum, p) => sum + (p.budget || 0),
            0
        );
        const totalExpenditure = projects.reduce(
            (sum, p) => sum + (p.expenditure || 0),
            0
        );
        const averageExpenditureRatio =
            projects.length > 0 ? (totalExpenditure / totalBudget) * 100 : 0;
        const projectsOverBudget = projects.filter(
            (p) => (p.expenditure || 0) > (p.budget || 0)
        ).length;

        // Get all corruption reports across projects
        const allReports = await Report.find({
            project: { $in: projectIds },
        }).lean();

        const totalReports = allReports.length;
        const resolvedReports = allReports.filter(
            (r) => r.status === 'resolved'
        ).length;
        const investigatingReports = allReports.filter(
            (r) => r.status === 'investigating'
        ).length;

        // Calculate average severity
        const severities = allReports
            .map((r) => r.aiAnalysis?.severity || 0)
            .filter((s) => s > 0);

        const averageSeverity =
            severities.length > 0
                ? severities.reduce((sum, val) => sum + val, 0) /
                  severities.length
                : 0;

        // Group reports by project to find projects with most reports
        const reportsByProject: { [key: string]: number } = {};
        allReports.forEach((report) => {
            const projId = report.project.toString();
            reportsByProject[projId] = (reportsByProject[projId] || 0) + 1;
        });

        const projectsWithMostReports = Object.entries(reportsByProject)
            .map(([project, reportCount]) => ({ project, reportCount }))
            .sort((a, b) => b.reportCount - a.reportCount)
            .slice(0, 5)
            .map((entry) => ({
                project: new mongoose.Types.ObjectId(entry.project),
                reportCount: entry.reportCount,
            }));

        // Calculate contractor performance
        const contractorPerformance: {
            [contractorId: string]: {
                contractor: mongoose.Types.ObjectId;
                activityScore: number;
                projectCount: number;
            };
        } = {};

        // Group projects by contractor and calculate their activity level
        projects.forEach((project) => {
            if (!project.contractor) return;

            const contractorId = project.contractor._id.toString();
            const updates = project.updates?.length || 0;
            const updatedRecently =
                project.updates &&
                project.updates.some(
                    (u) => new Date(u.date).getTime() > thirtyDaysAgo.getTime()
                )
                    ? 1
                    : 0;

            // Calculate activity score based on updates and recency
            const activityScore = updates + updatedRecently * 5;

            if (!contractorPerformance[contractorId]) {
                contractorPerformance[contractorId] = {
                    contractor: project.contractor._id,
                    activityScore: 0,
                    projectCount: 0,
                };
            }

            contractorPerformance[contractorId].activityScore += activityScore;
            contractorPerformance[contractorId].projectCount += 1;
        });

        // Convert to array and sort by activity score
        const contractorArray = Object.values(contractorPerformance);
        const sortedContractors = contractorArray.sort(
            (a, b) => b.activityScore - a.activityScore
        );

        // Extract top and bottom contractors
        const mostActive = sortedContractors.slice(0, 5);
        const leastActive =
            sortedContractors.length > 5
                ? sortedContractors.slice(-5).reverse()
                : [];

        // Extract comment tags for public sentiment
        const commentTags = await extractCommentTags(allComments);
        const positiveTags = commentTags
            .filter((tag) => tag.sentiment === 'positive')
            .sort((a, b) => b.count - a.count)
            .slice(0, 5)
            .map((tag) => ({ tag: tag.tag, count: tag.count }));

        const negativeTags = commentTags
            .filter((tag) => tag.sentiment === 'negative')
            .sort((a, b) => b.count - a.count)
            .slice(0, 5)
            .map((tag) => ({ tag: tag.tag, count: tag.count }));

        // Use await for topConcerns and topPraises
        const topConcerns = await extractTopConcerns(allComments);
        const topPraises = await extractTopPraises(allComments);

        // Update or create aggregate analysis
        const aggregateAnalysis = await AggregateAnalysis.findOneAndUpdate(
            { governmentId },
            {
                lastUpdated: new Date(),
                projectCount: {
                    total: projects.length,
                    active,
                    completed,
                    stalled,
                },
                overallSatisfaction: {
                    likesTotal,
                    dislikesTotal,
                    supportRatio,
                    commentSentimentDistribution: sentimentDistribution,
                },
                financialSummary: {
                    totalBudget,
                    totalExpenditure,
                    averageExpenditureRatio,
                    projectsOverBudget,
                },
                contractorPerformance: {
                    mostActive,
                    leastActive,
                },
                publicSentiment: {
                    topPositiveTags: positiveTags,
                    topNegativeTags: negativeTags,
                    topConcerns, // updated
                    topPraises, // updated
                },
                corruptionReports: {
                    totalReports,
                    resolvedReports,
                    investigatingReports,
                    averageSeverity,
                    projectsWithMostReports,
                },
            },
            { new: true, upsert: true }
        );

        return aggregateAnalysis;
    } catch (error) {
        console.error('Error generating aggregate analysis:', error);
        if (error instanceof HttpError) throw error;
        throw new HttpError({
            message: 'Failed to generate aggregate analysis',
            code: 500,
        });
    }
};

export const getProjectAnalysis = async (projectId: string, userId: string) => {
    try {
        const project = await Project.findById(projectId);
        if (!project) {
            throw new HttpError({ message: 'Project not found', code: 404 });
        }

        const isAuthorized =
            project.government.toString() === userId ||
            project.contractor.toString() === userId;

        if (!isAuthorized) {
            throw new HttpError({ message: 'Unauthorized access', code: 403 });
        }

        let analysis = await ProjectAnalysis.findOne({ project: projectId });

        if (!analysis || isAnalysisOutdated(analysis.lastUpdated)) {
            analysis = await generateProjectAnalysis(projectId);
        }

        return analysis;
    } catch (error) {
        console.error('Error getting project analysis:', error);
        if (error instanceof HttpError) throw error;
        throw new HttpError({
            message: 'Failed to get project analysis',
            code: 500,
        });
    }
};

export const getAggregateAnalysis = async (governmentId: string) => {
    try {
        // Find existing aggregate analysis or generate a new one
        let aggregateAnalysis = await AggregateAnalysis.findOne({
            governmentId,
        })
            .populate(
                'contractorPerformance.mostActive.contractor',
                'name _id photo'
            )
            .populate(
                'contractorPerformance.leastActive.contractor',
                'name _id photo'
            )
            .populate(
                'corruptionReports.projectsWithMostReports.project',
                'title _id'
            );

        if (
            !aggregateAnalysis ||
            isAnalysisOutdated(aggregateAnalysis.lastUpdated)
        ) {
            aggregateAnalysis = await generateAggregateAnalysis(governmentId);

            // Populate the references after generation
            aggregateAnalysis = await AggregateAnalysis.findById(
                aggregateAnalysis._id
            )
                .populate(
                    'contractorPerformance.mostActive.contractor',
                    'name _id photo'
                )
                .populate(
                    'contractorPerformance.leastActive.contractor',
                    'name _id photo'
                )
                .populate(
                    'corruptionReports.projectsWithMostReports.project',
                    'title _id'
                );
        }

        const projects = await Project.find(
            { government: governmentId },
            {
                _id: 1,
                title: 1,
                bannerUrl: 1,
                contractor: 1,
                budget: 1,
                expenditure: 1,
                createdAt: 1,
                updatedAt: 1,
            }
        )
            .populate('contractor', 'name _id')
            .lean();

        return {
            aggregateAnalysis,
            projects,
        };
    } catch (error) {
        console.error('Error getting aggregate analysis:', error);
        if (error instanceof HttpError) throw error;
        throw new HttpError({
            message: 'Failed to get aggregate analysis',
            code: 500,
        });
    }
};

// Helper functions

/**
 * Check if the analysis is outdated (more than 24 hours old)
 */
const isAnalysisOutdated = (lastUpdated: Date): boolean => {
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    return lastUpdated < twentyFourHoursAgo;
};

/**
 * Calculate average response time for contractor
 */
const calculateAverageResponseTime = (
    comments: any[],
    contractorId: string
): number => {
    // Filter only contractor's replies
    const contractorReplies = comments.filter(
        (c) =>
            c.user && c.user._id.toString() === contractorId && c.parentComment
    );

    // If no replies, return 0
    if (contractorReplies.length === 0) {
        return 0;
    }

    // Calculate average response time
    let totalResponseTime = 0;
    let validResponseCount = 0;

    for (const reply of contractorReplies) {
        if (!reply.parentComment) continue;

        // Find the original comment
        const parentComment = comments.find(
            (c) => c._id.toString() === reply.parentComment.toString()
        );

        if (parentComment && parentComment.createdAt && reply.createdAt) {
            // Calculate response time in hours
            const responseTime =
                (reply.createdAt.getTime() -
                    parentComment.createdAt.getTime()) /
                (1000 * 60 * 60);

            totalResponseTime += responseTime;
            validResponseCount++;
        }
    }

    return validResponseCount > 0 ? totalResponseTime / validResponseCount : 0;
};

/**
 * Analyze a batch of comments for sentiment
 */
const analyzeCommentBatch = async (comments: string[]) => {
    // Initialize counters
    let positive = 0;
    let neutral = 0;
    let negative = 0;

    // Process in batches to avoid overwhelming the API
    const batchSize = 10;
    for (let i = 0; i < comments.length; i += batchSize) {
        const batch = comments.slice(i, i + batchSize);

        // Process each comment in the batch
        const promises = batch.map(async (comment) => {
            try {
                const sentiment = await analyzeCommentSentiment(comment);
                return sentiment;
            } catch (error) {
                console.error('Error analyzing comment sentiment:', error);
                return 'neutral'; // Default to neutral on error
            }
        });

        // Wait for all sentiment analysis in this batch to complete
        const results = await Promise.all(promises);

        // Count the results
        results.forEach((result) => {
            if (result === 'positive') positive++;
            else if (result === 'negative') negative++;
            else neutral++;
        });
    }

    return { positive, neutral, negative };
};

/**
 * Extract tags and sentiment from a single comment using AI
 */
const extractTagsFromComment = async (comment: string) => {
    if (!ai) return [];
    const prompt = `
    Extract up to 3 relevant tags (keywords or topics) from the following comment and classify each as "positive", "neutral", or "negative" based on the sentiment in context.
    Respond with a JSON array of objects in this format:
    [
      { "tag": "string", "sentiment": "positive|neutral|negative" }
    ]
    Only respond with the JSON array, no extra text.
    Comment: """${comment}"""
    `;
    try {
        const result = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        const response = (result.text || '')
            .replace(/```(json)?/g, '')
            .replace(/```/g, '')
            .trim();
        const tags = JSON.parse(response);
        if (Array.isArray(tags)) return tags;
        return [];
    } catch (error) {
        // fallback: no tags
        return [];
    }
};

/**
 * Improved: Extract tags and aggregate counts/sentiment from all comments
 */
const extractCommentTags = async (comments: any[]) => {
    try {
        if (!comments.length) return [];
        // Extract tags from each comment individually
        const tagResults = await Promise.all(
            comments.map(async (c) => {
                const tags = await extractTagsFromComment(c.content);
                return tags;
            })
        );
        // Aggregate tags and sentiment
        const tagMap: {
            [key: string]: {
                count: number;
                sentimentCounts: { [s: string]: number };
            };
        } = {};
        tagResults.flat().forEach((tagObj) => {
            if (!tagObj || !tagObj.tag || !tagObj.sentiment) return;
            const tag = tagObj.tag.trim().toLowerCase();
            const sentiment = tagObj.sentiment;
            if (!tagMap[tag]) {
                tagMap[tag] = {
                    count: 0,
                    sentimentCounts: { positive: 0, neutral: 0, negative: 0 },
                };
            }
            tagMap[tag].count += 1;
            if (sentiment in tagMap[tag].sentimentCounts) {
                tagMap[tag].sentimentCounts[sentiment]++;
            }
        });
        // For each tag, assign the sentiment with the highest count
        const result = Object.entries(tagMap).map(([tag, data]) => {
            const sentiment = Object.entries(data.sentimentCounts).sort(
                (a, b) => b[1] - a[1]
            )[0][0];
            return { tag, count: data.count, sentiment };
        });
        // Sort by count descending
        return result.sort((a, b) => b.count - a.count);
    } catch (error) {
        console.error('Error extracting comment tags:', error);
        return [];
    }
};

/**
 * Extract top concerns from comments using AI (improved: aggregate per comment)
 */
const extractTopConcerns = async (comments: any[]) => {
    if (!ai) {
        // fallback: return mock concerns if no API key
        return [
            'Delayed timeline',
            'Poor material quality',
            'Lack of safety measures',
            'Environmental impact',
        ];
    }
    const texts = comments.map((c) => c.content).filter(Boolean);
    if (!texts.length) return [];
    try {
        const allConcerns: string[] = [];
        for (const text of texts) {
            const prompt = `
                From the following comment, extract the main concern or complaint (if any) as a short phrase. If none, return an empty array.
                Respond with a JSON array of short phrases, no extra text.
                Comment: """${text}"""
            `;
            const aiResult = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
            });
            const response = (aiResult.text || '')
                .replace(/```(json)?/g, '')
                .replace(/```/g, '')
                .trim();
            const arr = JSON.parse(response);
            if (Array.isArray(arr)) allConcerns.push(...arr);
        }
        // Aggregate and return top 3-5 concerns
        const freq: { [k: string]: number } = {};
        allConcerns.forEach((c) => {
            const key = c.trim().toLowerCase();
            if (!key) return;
            freq[key] = (freq[key] || 0) + 1;
        });
        return Object.entries(freq)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([k]) => k);
    } catch (e) {
        return [];
    }
};

/**
 * Extract top praises from comments using AI (improved: aggregate per comment)
 */
const extractTopPraises = async (comments: any[]) => {
    if (!ai) {
        // fallback: return mock praises if no API key
        return [
            'Efficient work',
            'Good communication',
            'Quality construction',
            'Community involvement',
        ];
    }
    const texts = comments.map((c) => c.content).filter(Boolean);
    if (!texts.length) return [];
    try {
        const allPraises: string[] = [];
        for (const text of texts) {
            const prompt = `
                From the following comment, extract the main praise or compliment (if any) as a short phrase. If none, return an empty array.
                Respond with a JSON array of short phrases, no extra text.
                Comment: """${text}"""
            `;
            const aiResult = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
            });
            const response = (aiResult.text || '')
                .replace(/```(json)?/g, '')
                .replace(/```/g, '')
                .trim();
            const arr = JSON.parse(response);
            if (Array.isArray(arr)) allPraises.push(...arr);
        }
        // Aggregate and return top 3-5 praises
        const freq: { [k: string]: number } = {};
        allPraises.forEach((c) => {
            const key = c.trim().toLowerCase();
            if (!key) return;
            freq[key] = (freq[key] || 0) + 1;
        });
        return Object.entries(freq)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([k]) => k);
    } catch (e) {
        return [];
    }
};

// Export all functions
export default {
    generateProjectAnalysis,
    generateAggregateAnalysis,
    getProjectAnalysis,
    getAggregateAnalysis,
};
