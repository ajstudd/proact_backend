import Project from '../models/project.model';
import mongoose from 'mongoose';
import { toObjectId } from '../utils/toObjectId';

interface ProjectData {
    title: string;
    bannerUrl?: string;
    pdfUrl?: string;
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
        // Convert string IDs to ObjectIds
        if (projectData.contractor) {
            projectData.contractor = toObjectId(projectData.contractor);
        }

        if (projectData.government) {
            projectData.government = toObjectId(projectData.government);
        }

        // Create project with the data including URLs from file upload
        const project = await Project.create({
            title: projectData.title,
            bannerUrl: projectData.bannerUrl || '',
            pdfUrl: projectData.pdfUrl || '',
            description: projectData.description,
            location: projectData.location,
            budget: projectData.budget,
            contractor: projectData.contractor,
            government: projectData.government,
        });

        return project;
    } catch (error) {
        console.log('Error in createProject service:', error);
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
