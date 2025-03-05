import { Request, Response } from 'express';
import { CustomRequest } from '../types/CustomRequest';
import {
    createProject,
    updateProject,
    deleteProject,
    getProjectById,
    getAllProjects,
} from '@/services/project.service';

export const createProjectController = async (
    req: CustomRequest,
    res: Response
) => {
    try {
        console.log('Received Files:', req.files); // Debugging

        const projectData = {
            ...req.body,
            banner: req.files?.banner?.[0] ?? null, // ✅ Ensure it's defined
            pdf: req.files?.pdf?.[0] ?? null,
        };

        console.log('Banner File:', projectData.banner); // Debugging
        console.log('PDF File:', projectData.pdf); // Debugging

        const project = await createProject(projectData);
        res.status(201).json({
            message: 'Project Created Successfully!',
            project,
        });
    } catch (err: any) {
        console.log(err);
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
