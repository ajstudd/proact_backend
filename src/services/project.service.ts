import Project from '../models/project.model';
import { uploadFile } from './fileUpload.service';
import { toObjectId } from '../utils/toObjectId';
import mongoose, { ObjectId } from 'mongoose';

interface ProjectData {
    title: string;
    banner?: Express.Multer.File; // Optional Now
    pdf?: Express.Multer.File;
    description: string;
    location: {
        lat: number;
        lng: number;
        place: string;
    };
    budget: number;
    contractor: string | mongoose.Types.ObjectId;
    government: string | mongoose.Types.ObjectId;
}

export const createProject = async (projectData: ProjectData) => {
    try {
        let bannerUrl = '';
        let pdfUrl = '';

        if (projectData.banner) {
            const { url } = await uploadFile(projectData.banner);
            bannerUrl = url; // ✅ Save Download URL
            console.log('✅ Banner Uploaded:', bannerUrl);
        }

        if (projectData.pdf) {
            const { url } = await uploadFile(projectData.pdf);
            pdfUrl = url; // ✅ Save Download URL
        }

        projectData.contractor = toObjectId(projectData.contractor);
        projectData.government = toObjectId(projectData.government);

        const project = await Project.create({
            title: projectData.title,
            bannerUrl,
            pdfUrl,
            description: projectData.description,
            location: projectData.location,
            budget: projectData.budget,
            contractor: projectData.contractor,
            government: projectData.government,
        });

        return project;
    } catch (error) {
        console.log(error);
        throw new Error('Project creation failed!');
    }
};

export const updateProject = async (
    projectId: string,
    projectData: Partial<ProjectData>
) => {
    try {
        const project = await Project.findByIdAndUpdate(
            projectId,
            projectData,
            { new: true }
        );
        if (!project) {
            throw new Error('Project not found!');
        }
        return project;
    } catch (error) {
        console.log(error);
        throw new Error('Project update failed!');
    }
};

export const deleteProject = async (projectId: string) => {
    try {
        const project = await Project.findByIdAndDelete(projectId);
        if (!project) {
            throw new Error('Project not found!');
        }
        return project;
    } catch (error) {
        console.log(error);
        throw new Error('Project deletion failed!');
    }
};

export const getProjectById = async (projectId: string) => {
    try {
        const project = await Project.findById(projectId);
        if (!project) {
            throw new Error('Project not found!');
        }
        return project;
    } catch (error) {
        console.log(error);
        throw new Error('Fetching project failed!');
    }
};

export const getAllProjects = async () => {
    try {
        const projects = await Project.find();
        return projects;
    } catch (error) {
        console.log(error);
        throw new Error('Fetching projects failed!');
    }
};
