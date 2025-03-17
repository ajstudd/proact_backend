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
    getContractorsForGovernment,
    updateProjectExpenditure,
} from '@/services/project.service';
import { uploadFile } from '../services/fileUpload.service';
import notificationService from '@/services/notification.service';

export const createProjectController = async (
    req: CustomRequest,
    res: Response
) => {
    try {
        const files = req.files as {
            [fieldname: string]: Express.Multer.File[];
        };
        console.log('files', files);

        let bannerUrl = '';
        if (files && files.banner && files.banner.length > 0) {
            const bannerResult = await uploadFile(files.banner[0]);
            bannerUrl = bannerResult.url;
        }

        let pdfUrl = '';
        if (files && files.pdf && files.pdf.length > 0) {
            const pdfResult = await uploadFile(files.pdf[0]);
            pdfUrl = pdfResult.url;
        }

        const projectData = {
            ...req.body,
            bannerUrl,
            pdfUrl,
            government: req.user ? req.user.id : null,
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
        const userId = req.query.userId as string;
        const projects = await getAllTrimmedProjects(userId);
        res.status(200).json({ projects });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Internal Server Error!' });
    }
};

export const addProjectUpdateController = async (
    req: CustomRequest,
    res: Response
) => {
    try {
        const { projectId } = req.params;
        const { content } = req.body;
        const files = req.files as {
            [fieldname: string]: Express.Multer.File[];
        };

        const mediaUrls: string[] = [];

        if (files && files.media && files.media.length > 0) {
            for (const file of files.media) {
                const uploadResult = await uploadFile(file);
                mediaUrls.push(uploadResult.url);
            }
        }

        const project = await addUpdateToProject(projectId, {
            content,
            media: mediaUrls,
        });

        if (
            req.user &&
            project.contractor.toString() === req.user.id.toString()
        ) {
            const governmentId = project.government.toString();

            await notificationService.createNotification({
                recipientId: governmentId,
                senderId: req.user.id,
                type: 'PROJECT_UPDATE',
                message: `New update added to project: ${project.title}`,
                entityId: projectId,
                entityType: 'Project',
                metadata: {
                    projectTitle: project.title,
                    updateContent: content.substring(0, 100), // First 100 chars of update
                },
            });
        }

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

        if (
            req.user &&
            project.contractor.toString() === req.user.id.toString()
        ) {
            const governmentId = project.government.toString();

            await notificationService.createNotification({
                recipientId: governmentId,
                senderId: req.user.id,
                type: 'PROJECT_UPDATE',
                message: `An update was removed from project: ${project.title}`,
                entityId: projectId,
                entityType: 'Project',
                metadata: {
                    projectTitle: project.title,
                    action: 'update_removed',
                },
            });
        }

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
    req: CustomRequest,
    res: Response
) => {
    try {
        const { projectId, updateId } = req.params;
        const { content, keepExistingMedia } = req.body;
        const files = req.files as {
            [fieldname: string]: Express.Multer.File[];
        };

        const updateData: { content?: string; media?: string[] } = {};

        if (content !== undefined) {
            updateData.content = content;
        }

        // First get the current project to access existing media if needed
        let existingProject;
        if (keepExistingMedia === 'true') {
            existingProject = await getProjectById(projectId);
            const existingUpdate = existingProject.updates.find(
                (update: any) => update._id.toString() === updateId
            );
            if (existingUpdate) {
                updateData.media = existingUpdate.media || [];
            }
        }

        // Handle media uploads if files are provided
        if (files && files.media && files.media.length > 0) {
            const mediaUrls: string[] = [];

            for (const file of files.media) {
                const uploadResult = await uploadFile(file);
                mediaUrls.push(uploadResult.url);
            }

            // If keeping existing media, combine arrays, otherwise replace
            if (updateData.media && keepExistingMedia === 'true') {
                updateData.media = [...updateData.media, ...mediaUrls];
            } else {
                updateData.media = mediaUrls;
            }
        }

        const project = await editUpdateInProject(
            projectId,
            updateId,
            updateData
        );

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

        // Take out filters if any
        const filterParams: Record<string, any> = {};

        // Process budget range if given
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

        // Process location filter if given
        if (filters.location) {
            filterParams['location.place'] = new RegExp(
                filters.location as string,
                'i'
            );
        }

        // Process date ranges if there are any
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

        // check if this is a search or just filtering
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

        // Get through pagination parameters
        const searchOptions = {
            limit: limit ? parseInt(limit as string) : 20,
            skip: page
                ? (parseInt(page as string) - 1) *
                  (limit ? parseInt(limit as string) : 20)
                : 0,
        };

        // Create search parameters
        const searchParams: any = {};

        if (title) searchParams.title = title as string;
        if (description) searchParams.description = description as string;
        if (location) searchParams.location = location as string;
        if (id) searchParams.id = id as string;

        // Handle date filters
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

export const getContractorsForGovernmentController = async (
    req: CustomRequest,
    res: Response
) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        const governmentId = req.user.id; // Get the user ID from auth middleware
        const contractors = await getContractorsForGovernment(governmentId);

        res.status(200).json({
            contractors,
            message: 'Contractors fetched successfully',
        });
    } catch (err: any) {
        console.log('Error in getContractorsForGovernmentController:', err);
        res.status(500).json({
            message: err.message || 'Internal Server Error!',
        });
    }
};

// New controller for updating project expenditure
export const updateProjectExpenditureController = async (
    req: CustomRequest,
    res: Response
) => {
    try {
        const { projectId } = req.params;
        const { expenditure } = req.body;

        if (expenditure === undefined || isNaN(Number(expenditure))) {
            return res.status(400).json({
                message: 'Valid expenditure amount is required',
            });
        }

        const project = await updateProjectExpenditure(
            projectId,
            Number(expenditure)
        );

        // Send notification to government if expenditure is updated by contractor
        if (
            req.user &&
            project.contractor.toString() === req.user.id.toString()
        ) {
            const governmentId = project.government.toString();

            await notificationService.createNotification({
                recipientId: governmentId,
                senderId: req.user.id,
                type: 'PROJECT_UPDATE',
                message: `Expenditure updated for project: ${project.title}`,
                entityId: projectId,
                entityType: 'Project',
                metadata: {
                    projectTitle: project.title,
                    expenditure: expenditure,
                },
            });
        }

        res.status(200).json({
            message: 'Project expenditure updated successfully!',
            project,
        });
    } catch (err: any) {
        console.log('Error in updateProjectExpenditureController:', err);
        res.status(500).json({
            message: err.message || 'Internal Server Error!',
        });
    }
};
