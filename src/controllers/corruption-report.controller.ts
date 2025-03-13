import { Request, Response } from 'express';
import { HttpError } from '@/helpers/HttpError';
import * as corruptionReportService from '@/services/corruption-report.service';
import { uploadFile } from '@/services/fileUpload.service';
import { CustomRequest } from '@/types/CustomRequest';

export const createReport = async (req: CustomRequest, res: Response) => {
    try {
        const { projectId, description } = req.body;

        if (!projectId || !description) {
            throw new HttpError({
                message: 'Project ID and description are required',
                code: 400,
            });
        }

        const userId = req.user?.id;

        const files = req.files as
            | {
                  [fieldname: string]: Express.Multer.File[];
              }
            | undefined;

        const report = await corruptionReportService.createCorruptionReport({
            projectId,
            description,
            userId,
            file:
                files && files.attachment && files.attachment.length > 0
                    ? files.attachment[0]
                    : undefined,
        });

        res.status(201).json({
            success: true,
            message:
                'Corruption report submitted successfully. Thank you for helping to combat corruption.',
            report,
        });
    } catch (error) {
        console.error('Error in createReport controller:', error);
        const err = error as Error & { code?: number };
        res.status(err.code || 500).json({
            success: false,
            message: err.message || 'Failed to submit corruption report',
        });
    }
};

export const getProjectReports = async (req: Request, res: Response) => {
    try {
        const { projectId } = req.params;

        if (!req.user?.id) {
            throw new HttpError({
                message: 'Authentication required',
                code: 401,
            });
        }

        const reports = await corruptionReportService.getProjectReports(
            projectId,
            req.user.id
        );

        res.status(200).json({
            success: true,
            reports,
        });
    } catch (error) {
        console.error('Error in getProjectReports controller:', error);
        const err = error as Error & { code?: number };
        res.status(err.code || 500).json({
            success: false,
            message: err.message || 'Failed to retrieve corruption reports',
        });
    }
};

export const getUserProjectReports = async (req: Request, res: Response) => {
    try {
        if (!req.user?.id) {
            throw new HttpError({
                message: 'Authentication required',
                code: 401,
            });
        }

        const reports = await corruptionReportService.getUserProjectReports(
            req.user.id
        );

        res.status(200).json({
            success: true,
            reports,
        });
    } catch (error) {
        console.error('Error in getUserProjectReports controller:', error);
        const err = error as Error & { code?: number };
        res.status(err.code || 500).json({
            success: false,
            message: err.message || 'Failed to retrieve corruption reports',
        });
    }
};

export const updateReportStatus = async (req: Request, res: Response) => {
    try {
        const { reportId } = req.params;
        const { status, rejectionReason } = req.body;

        if (!req.user?.id) {
            throw new HttpError({
                message: 'Authentication required',
                code: 401,
            });
        }

        if (
            !['pending', 'investigating', 'resolved', 'rejected'].includes(
                status
            )
        ) {
            throw new HttpError({ message: 'Invalid status value', code: 400 });
        }

        const report = await corruptionReportService.updateReportStatus(
            reportId,
            req.user.id,
            status as 'pending' | 'investigating' | 'resolved' | 'rejected',
            rejectionReason
        );

        res.status(200).json({
            success: true,
            message: `Report status updated to ${status}`,
            report,
        });
    } catch (error) {
        console.error('Error in updateReportStatus controller:', error);
        const err = error as Error & { code?: number };
        res.status(err.code || 500).json({
            success: false,
            message: err.message || 'Failed to update report status',
        });
    }
};

export const getReportById = async (req: Request, res: Response) => {
    try {
        const { reportId } = req.params;

        const userId = req.user?.id;

        const report = await corruptionReportService.getReportById(
            reportId,
            userId
        );

        res.status(200).json({
            success: true,
            report,
        });
    } catch (error) {
        console.error('Error in getReportById controller:', error);
        const err = error as Error & { code?: number };
        res.status(err.code || 500).json({
            success: false,
            message: err.message || 'Failed to retrieve corruption report',
        });
    }
};
