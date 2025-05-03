import { Request, Response } from 'express';
import { HttpError } from '@/helpers/HttpError';
import projectAnalysisService from '@/services/projectAnalysis.service';

export const getGovernmentDashboard = async (req: Request, res: Response) => {
    try {
        if (!req.user || req.user.role !== 'GOVERNMENT') {
            throw new HttpError({
                message: 'Only government users can access this dashboard',
                code: 403,
            });
        }

        const governmentId = req.user.id;
        const { aggregateAnalysis, projects } =
            await projectAnalysisService.getAggregateAnalysis(governmentId);

        return res.status(200).json({
            success: true,
            message: 'Government dashboard data retrieved successfully',
            analysis: aggregateAnalysis,
            projects,
        });
    } catch (error) {
        console.error('Error in getGovernmentDashboard controller:', error);
        const err = error as { code?: number; message: string };
        return res.status(err.code || 500).json({
            success: false,
            message: err.message || 'Failed to retrieve dashboard data',
        });
    }
};

export const getProjectAnalysis = async (req: Request, res: Response) => {
    try {
        const { projectId } = req.params;

        if (!req.user) {
            throw new HttpError({
                message: 'Authentication required',
                code: 401,
            });
        }

        const analysis = await projectAnalysisService.getProjectAnalysis(
            projectId,
            req.user.id
        );

        return res.status(200).json({
            success: true,
            message: 'Project analysis retrieved successfully',
            analysis,
        });
    } catch (error) {
        console.error('Error in getProjectAnalysis controller:', error);
        const err = error as { code?: number; message: string };
        return res.status(err.code || 500).json({
            success: false,
            message: err.message || 'Failed to retrieve project analysis',
        });
    }
};

export const regenerateProjectAnalysis = async (
    req: Request,
    res: Response
) => {
    try {
        const { projectId } = req.params;

        if (!req.user) {
            throw new HttpError({
                message: 'Authentication required',
                code: 401,
            });
        }

        const analysis =
            await projectAnalysisService.generateProjectAnalysis(projectId);

        return res.status(200).json({
            success: true,
            message: 'Project analysis regenerated successfully',
            analysis,
        });
    } catch (error) {
        console.error('Error in regenerateProjectAnalysis controller:', error);
        const err = error as { code?: number; message: string };
        return res.status(err.code || 500).json({
            success: false,
            message: err.message || 'Failed to regenerate project analysis',
        });
    }
};

export const regenerateGovernmentAnalysis = async (
    req: Request,
    res: Response
) => {
    try {
        if (!req.user || req.user.role !== 'GOVERNMENT') {
            throw new HttpError({
                message: 'Only government users can regenerate dashboard data',
                code: 403,
            });
        }

        const governmentId = req.user.id;
        const analysis =
            await projectAnalysisService.generateAggregateAnalysis(
                governmentId
            );

        return res.status(200).json({
            success: true,
            message: 'Government dashboard data regenerated successfully',
            analysis,
        });
    } catch (error) {
        console.error(
            'Error in regenerateGovernmentAnalysis controller:',
            error
        );
        const err = error as { code?: number; message: string };
        return res.status(err.code || 500).json({
            success: false,
            message: err.message || 'Failed to regenerate dashboard data',
        });
    }
};

export default {
    getGovernmentDashboard,
    getProjectAnalysis,
    regenerateProjectAnalysis,
    regenerateGovernmentAnalysis,
};
