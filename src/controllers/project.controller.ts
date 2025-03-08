import { Request, Response } from 'express';
import { CustomRequest } from '../types/CustomRequest';
import {
    createProject,
    updateProject,
    deleteProject,
    getProjectById,
    getAllProjects,
    getAllTrimmedProjects,
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
