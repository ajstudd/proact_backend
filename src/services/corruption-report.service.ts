import mongoose from 'mongoose';
import Report from '@/models/report.model';
import Project from '@/models/project.model';
import { HttpError } from '@/helpers/HttpError';
import {
    AIAnalysisResult,
    analyzeCorruptionReport,
} from './ai-analysis.service';
import { uploadFile } from './fileUpload.service';
import notificationService from './notification.service';

interface CreateReportParams {
    projectId: string;
    description: string;
    attachmentUrl?: string;
    attachmentType?: 'image' | 'pdf' | 'none';
    userId?: string;
    file?: Express.Multer.File;
}

export const createCorruptionReport = async ({
    projectId,
    description,
    attachmentUrl = '',
    attachmentType = 'none',
    userId,
    file,
}: CreateReportParams) => {
    try {
        // Verify the project exists
        const project = await Project.findById(projectId);
        if (!project) {
            throw new HttpError({ message: 'Project not found', code: 404 });
        }

        // Process file if provided directly (from file upload)
        if (file) {
            const uploadResult = await uploadFile(file);
            attachmentUrl = uploadResult.url;

            // Determine file type
            attachmentType = file.mimetype.includes('image')
                ? 'image'
                : file.mimetype.includes('pdf')
                  ? 'pdf'
                  : 'none';
        }

        // Analyze the report content with AI
        const aiAnalysis: AIAnalysisResult = await analyzeCorruptionReport(
            description,
            attachmentType !== 'none'
        );

        if (!aiAnalysis.isValidReport) {
            // If AI analysis is invalid, reject the report
            if (aiAnalysis.containsInappropriateContent) {
                throw new HttpError({
                    message:
                        'Invalid report. We detected this report as containing inappropriate content',
                    code: 400,
                });
            }
            throw new HttpError({
                message:
                    'Invalid report. We detected this report as potentially invalid or irrelevant',
                code: 400,
            });
        }

        // Create the report
        const report = await Report.create({
            project: projectId,
            description,
            fileUrl: attachmentUrl,
            fileType: attachmentType,
            reportedBy: {
                userId: userId || null,
                isAnonymous: !userId,
            },
            aiAnalysis,
            // Set initial status based on AI analysis as done in report.service
            status: aiAnalysis.isValidReport ? 'pending' : 'rejected',
            rejectionReason: !aiAnalysis.isValidReport
                ? 'AI detected this report as potentially invalid or irrelevant'
                : undefined,
        });

        return report;
    } catch (error) {
        console.error('Error creating corruption report:', error);
        if (error instanceof HttpError) {
            throw error;
        }
        throw new HttpError({
            message: 'Failed to create corruption report',
            code: 500,
        });
    }
};

export const getProjectReports = async (
    projectId: string,
    creatorId: string
) => {
    try {
        // Verify the user is the project creator
        const project = await Project.findById(projectId);
        if (!project) {
            throw new HttpError({ message: 'Project not found', code: 404 });
        }

        // Check if the requester is the project creator (either contractor or government)
        const isProjectCreator =
            project.contractor.toString() === creatorId ||
            project.government.toString() === creatorId;

        if (!isProjectCreator) {
            throw new HttpError({
                message: 'Unauthorized to view these reports',
                code: 403,
            });
        }

        // Get all reports for this project
        const reports = await Report.find({ project: projectId })
            .sort({ createdAt: -1 })
            .populate('reportedBy.userId', 'name _id')
            .lean();

        return reports;
    } catch (error) {
        console.error('Error getting project reports:', error);
        if (error instanceof HttpError) {
            throw error;
        }
        throw new HttpError({
            message: 'Failed to get corruption reports',
            code: 500,
        });
    }
};

export const getUserProjectReports = async (userId: string) => {
    try {
        // Find all projects created by this user (as contractor or government)
        const userProjects = await Project.find(
            {
                $or: [{ contractor: userId }, { government: userId }],
            },
            { _id: 1 }
        );

        // If no projects, return empty array
        if (!userProjects.length) {
            return [];
        }

        // Get the project IDs
        const projectIds = userProjects.map((project) => project._id);

        // Get all corruption reports for these projects
        const reports = await Report.find({
            project: { $in: projectIds },
        })
            .populate('project', 'title _id')
            .populate('reportedBy.userId', 'name _id')
            .sort({ createdAt: -1 })
            .lean();

        return reports;
    } catch (error) {
        console.error('Error getting user project reports:', error);
        throw new HttpError({
            message: 'Failed to get corruption reports',
            code: 500,
        });
    }
};

export const updateReportStatus = async (
    reportId: string,
    userId: string,
    status: 'pending' | 'investigating' | 'resolved' | 'rejected',
    rejectionReason?: string
) => {
    try {
        // Find the report
        const report = await Report.findById(reportId);
        if (!report) {
            throw new HttpError({ message: 'Report not found', code: 404 });
        }

        // Get the associated project
        const project = await Project.findById(report.project);
        if (!project) {
            throw new HttpError({
                message: 'Associated project not found',
                code: 404,
            });
        }

        // Check if the user is authorized (project creator)
        const isProjectCreator =
            project.contractor.toString() === userId ||
            project.government.toString() === userId;

        if (!isProjectCreator) {
            throw new HttpError({
                message: 'Unauthorized to update this report',
                code: 403,
            });
        }

        // Update the status and rejection reason if applicable
        const updateData: { status: string; rejectionReason?: string } = {
            status,
        };
        if (status === 'rejected' && rejectionReason) {
            updateData.rejectionReason = rejectionReason;
        }

        const updatedReport = await Report.findByIdAndUpdate(
            reportId,
            updateData,
            { new: true }
        );

        // Send notification to the user who reported if not anonymous
        if (report.reportedBy && report.reportedBy.userId && !report.reportedBy.isAnonymous) {
            const projectTitle = project.title || 'a project';
            const statusMap: Record<string, string> = {
                investigating: 'is now being investigated',
                resolved: 'has been resolved',
                rejected: 'has been rejected',
                pending: 'is pending review'
            };

            const messageText = `Your report for ${projectTitle} ${statusMap[status]}`;

            await notificationService.createNotification({
                recipientId: report.reportedBy.userId.toString(),
                senderId: userId,
                type: 'PROJECT_UPDATE',
                message: messageText,
                entityId: reportId,
                entityType: 'Project',
                metadata: {
                    projectId: project._id,
                    projectTitle: projectTitle,
                    reportStatus: status,
                    rejectionReason: rejectionReason
                },
            });
        }

        return updatedReport;
    } catch (error) {
        console.error('Error updating report status:', error);
        if (error instanceof HttpError) {
            throw error;
        }
        throw new HttpError({
            message: 'Failed to update report status',
            code: 500,
        });
    }
};

export const getReportById = async (reportId: string, userId?: string) => {
    try {
        // Find the report
        const report = await Report.findById(reportId)
            .populate('project', 'title _id contractor government')
            .populate('reportedBy.userId', 'name _id')
            .lean();

        if (!report) {
            throw new HttpError({ message: 'Report not found', code: 404 });
        }

        // Check if user is authorized (project creator) if userId is provided
        if (userId) {
            const project = report.project as any; // Using any due to populated fields
            const isProjectCreator =
                project.contractor.toString() === userId ||
                project.government.toString() === userId;

            // Only project creators can see details about who reported (if not anonymous)
            if (
                !isProjectCreator &&
                report.reportedBy &&
                !report.reportedBy.isAnonymous
            ) {
                // Hide reporter details for non-project creators
                if (report.reportedBy) {
                    delete report.reportedBy.userId;
                }
            }
        } else {
            // Anonymous access - always hide reporter details
            if (report.reportedBy) {
                delete report.reportedBy.userId;
            }
        }

        return report;
    } catch (error) {
        console.error('Error getting report by ID:', error);
        if (error instanceof HttpError) {
            throw error;
        }
        throw new HttpError({
            message: 'Failed to get corruption report',
            code: 500,
        });
    }
};
