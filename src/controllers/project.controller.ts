import { Request, Response } from 'express';
import { CustomRequest } from '../types/CustomRequest';
import {
    createProject,
    updateProject,
    deleteProject,
    getProjectById,
    getAllProjects,
    getAllTrimmedProjects,
    addUpdateToProject,
    removeUpdateFromProject,
    editUpdateInProject,
    getProjectUpdates,
    searchProjects,
    filterProjects,
    fastSearch,
} from '@/services/project.service';
import { uploadFile } from '../services/fileUpload.service';

export const createProjectController = async (
    req: CustomRequest,
    res: Response
) => {
    try {
        const files = req.files as {
            [fieldname: string]: Express.Multer.File[];
        };
        console.log('files', files);

        // Process banner upload if it exists
        let bannerUrl = '';
        if (files && files.banner && files.banner.length > 0) {
            const bannerResult = await uploadFile(files.banner[0]);
            bannerUrl = bannerResult.url;
        }

        // Process PDF upload if it exists
        let pdfUrl = '';
        if (files && files.pdf && files.pdf.length > 0) {
            const pdfResult = await uploadFile(files.pdf[0]);
            pdfUrl = pdfResult.url;
        }

        // Create project with form data and file URLs
        const projectData = {
            ...req.body,
            bannerUrl,
            pdfUrl,
        };

        const project = await createProject(projectData);

        res.status(201).json({
            message: 'Project Created Successfully!',
            project,
        });
    } catch (err: any) {
        console.log('Error in createProjectController:', err);
        res.status(500).json({
            message: err.message || 'Internal Server Error!',
        });
    }
};

export const updateProjectController = async (req: Request, res: Response) => {
    try {
        const project = await updateProject(req.params.id, req.body);
        res.status(200).json({
            message: 'Project Updated Successfully!',
            project,
        });
    } catch (err: any) {
        console.log(err);
        res.status(500).json({
            message: err.message || 'Internal Server Error!',
        });
    }
};

export const deleteProjectController = async (req: Request, res: Response) => {
    try {
        await deleteProject(req.params.id);
        res.status(200).json({
            message: 'Project Deleted Successfully!',
        });
    } catch (err: any) {
        console.log(err);
        res.status(500).json({
            message: err.message || 'Internal Server Error!',
        });
    }
};

export const getProjectByIdController = async (req: Request, res: Response) => {
    try {
        const project = await getProjectById(req.params.id);
        res.status(200).json({
            project,
        });
    } catch (err: any) {
        console.log(err);
        res.status(500).json({
            message: err.message || 'Internal Server Error!',
        });
    }
};

export const getAllProjectsController = async (req: Request, res: Response) => {
    try {
        const projects = await getAllProjects();
        res.status(200).json({ projects });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Internal Server Error!' });
    }
};

export const getAllTrimmedProjectsController = async (
    req: Request,
    res: Response
) => {
    try {
        const projects = await getAllTrimmedProjects();
        res.status(200).json({ projects });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Internal Server Error!' });
    }
};

export const addProjectUpdateController = async (
    req: Request,
    res: Response
) => {
    try {
        const { projectId } = req.params;
        const { content, media } = req.body;

        const project = await addUpdateToProject(projectId, {
            content,
            media,
        });

        res.status(200).json({
            message: 'Update added to project successfully!',
            project,
        });
    } catch (err: any) {
        console.log(err);
        res.status(500).json({
            message: err.message || 'Internal Server Error!',
        });
    }
};

export const removeProjectUpdateController = async (
    req: Request,
    res: Response
) => {
    try {
        const { projectId, updateId } = req.params;

        const project = await removeUpdateFromProject(projectId, updateId);

        res.status(200).json({
            message: 'Update removed from project successfully!',
            project,
        });
    } catch (err: any) {
        console.log(err);
        res.status(500).json({
            message: err.message || 'Internal Server Error!',
        });
    }
};

export const editProjectUpdateController = async (
    req: Request,
    res: Response
) => {
    try {
        const { projectId, updateId } = req.params;
        const { content, media } = req.body;

        const project = await editUpdateInProject(projectId, updateId, {
            content,
            media,
        });

        res.status(200).json({
            message: 'Update edited successfully!',
            project,
        });
    } catch (err: any) {
        console.log(err);
        res.status(500).json({
            message: err.message || 'Internal Server Error!',
        });
    }
};

export const getProjectUpdatesController = async (
    req: Request,
    res: Response
) => {
    try {
        const { projectId } = req.params;

        const updates = await getProjectUpdates(projectId);

        res.status(200).json({
            updates,
        });
    } catch (err: any) {
        console.log(err);
        res.status(500).json({
            message: err.message || 'Internal Server Error!',
        });
    }
};

export const searchProjectsController = async (req: Request, res: Response) => {
    try {
        const { query, limit, page, sortBy, sortOrder, ...filters } = req.query;

        // Parse query parameters
        const searchOptions = {
            limit: limit ? parseInt(limit as string) : 10,
            skip: page
                ? (parseInt(page as string) - 1) *
                  (limit ? parseInt(limit as string) : 10)
                : 0,
            sortBy: (sortBy as string) || 'createdAt',
            sortOrder: (sortOrder as 'asc' | 'desc') || 'desc',
        };

        // Extract filters if any
        const filterParams: Record<string, any> = {};

        // Process budget range if provided
        if (filters.minBudget || filters.maxBudget) {
            filterParams.budget = {};
            if (filters.minBudget) {
                filterParams.budget.$gte = parseInt(
                    filters.minBudget as string
                );
            }
            if (filters.maxBudget) {
                filterParams.budget.$lte = parseInt(
                    filters.maxBudget as string
                );
            }
        }

        // Process location filter if provided
        if (filters.location) {
            filterParams['location.place'] = new RegExp(
                filters.location as string,
                'i'
            );
        }

        // Process date ranges if provided
        if (filters.startDate || filters.endDate) {
            filterParams.createdAt = {};
            if (filters.startDate) {
                filterParams.createdAt.$gte = new Date(
                    filters.startDate as string
                );
            }
            if (filters.endDate) {
                filterParams.createdAt.$lte = new Date(
                    filters.endDate as string
                );
            }
        }

        let result;

        // Determine if this is a search or just filtering
        if (query) {
            result = await searchProjects(query as string, {
                ...searchOptions,
                filter: filterParams,
            });
        } else {
            result = await filterProjects(filterParams, searchOptions);
        }

        res.status(200).json({
            message: 'Projects fetched successfully',
            ...result,
        });
    } catch (err: any) {
        console.log('Error in searchProjectsController:', err);
        res.status(500).json({
            message: err.message || 'Internal Server Error!',
        });
    }
};

export const fastSearchProjectsController = async (
    req: Request,
    res: Response
) => {
    try {
        const {
            title,
            description,
            location,
            startDate,
            endDate,
            id,
            limit,
            page,
        } = req.query;

        // Parse pagination parameters
        const searchOptions = {
            limit: limit ? parseInt(limit as string) : 20,
            skip: page
                ? (parseInt(page as string) - 1) *
                  (limit ? parseInt(limit as string) : 20)
                : 0,
        };

        // Build search parameters
        const searchParams: any = {};

        if (title) searchParams.title = title as string;
        if (description) searchParams.description = description as string;
        if (location) searchParams.location = location as string;
        if (id) searchParams.id = id as string;

        // Handle date parameters
        if (startDate || endDate) {
            searchParams.date = {};
            if (startDate) searchParams.date.startDate = startDate;
            if (endDate) searchParams.date.endDate = endDate;
        }

        const result = await fastSearch(searchParams, searchOptions);

        res.status(200).json({
            message: 'Projects found successfully',
            ...result,
        });
    } catch (err: any) {
        console.log('Error in fastSearchProjectsController:', err);
        res.status(500).json({
            message: err.message || 'Internal Server Error!',
        });
    }
};
