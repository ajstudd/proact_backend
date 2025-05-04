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
        if (projectData.contractor) {
            projectData.contractor = toObjectId(projectData.contractor);
        }
        if (projectData.government) {
            projectData.government = toObjectId(projectData.government);
        }
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
        const project = await Project.findById(projectId)
            .populate('contractor', 'name _id')
            .populate('government', 'name _id')
            .populate({
                path: 'comments',
                populate: [
                    {
                        path: 'user',
                        select: 'name _id photo',
                    },
                    {
                        path: 'replies',
                        populate: {
                            path: 'user',
                            select: 'name _id photo',
                        },
                    },
                ],
            });
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

export const getAllTrimmedProjects = async (userId?: string) => {
    try {
        // Filter query - if userId is provided, filter for projects where
        // the user is either the government or contractor
        const filter: any = {};
        if (userId) {
            filter.$or = [{ government: userId }, { contractor: userId }];
        }

        // Only select the fields we want to return
        const projects = await Project.find(filter, {
            title: 1,
            bannerUrl: 1,
            description: 1,
            location: 1,
            budget: 1,
            expenditure: 1,
            likes: 1,
            dislikes: 1,
            associatedProfiles: 1,
            contractor: 1,
            government: 1,
            createdAt: 1,
            updatedAt: 1,
        })
            .populate('contractor', 'name _id')
            .populate('government', 'name _id');

        return projects;
    } catch (error) {
        console.log(error);
        throw new Error('Fetching trimmed projects failed!');
    }
};

export const addUpdateToProject = async (
    projectId: string,
    updateData: {
        content: string;
        media?: string[];
        purchasedItems?: any[];
        utilisedItems?: any[];
    }
) => {
    console.log('updateData', updateData);
    try {
        const project = await Project.findById(projectId);
        if (!project) {
            throw new Error('Project not found!');
        }

        // Validate purchasedItems
        if (
            updateData.purchasedItems &&
            Array.isArray(updateData.purchasedItems)
        ) {
            for (const item of updateData.purchasedItems) {
                if (
                    !item.name ||
                    typeof item.name !== 'string' ||
                    typeof item.quantity !== 'number' ||
                    item.quantity <= 0 ||
                    typeof item.price !== 'number' ||
                    item.price < 0
                ) {
                    throw new Error(
                        `Invalid purchased item data: ${JSON.stringify(item)}`
                    );
                }
            }
        }

        // Validate utilisedItems
        if (
            updateData.utilisedItems &&
            Array.isArray(updateData.utilisedItems)
        ) {
            for (const item of updateData.utilisedItems) {
                if (
                    !item.name ||
                    typeof item.name !== 'string' ||
                    typeof item.quantity !== 'number' ||
                    item.quantity <= 0
                ) {
                    throw new Error(
                        `Invalid utilised item data: ${JSON.stringify(item)}`
                    );
                }
            }
        }

        // Add purchased items to inventory and update expenditure
        let totalSpent = 0;
        if (
            updateData.purchasedItems &&
            Array.isArray(updateData.purchasedItems)
        ) {
            updateData.purchasedItems.forEach((item) => {
                const idx = project.inventory.findIndex(
                    (inv: any) =>
                        inv.name.toLowerCase() === item.name.toLowerCase()
                );
                if (idx >= 0) {
                    project.inventory[idx].quantity += item.quantity;
                    project.inventory[idx].totalSpent +=
                        item.price * item.quantity;
                } else {
                    project.inventory.push({
                        name: item.name,
                        quantity: item.quantity,
                        price: item.price,
                        totalSpent: item.price * item.quantity,
                    });
                }
                totalSpent += item.price * item.quantity;
            });
            // Check if budget is available
            if (project.expenditure + totalSpent > project.budget) {
                throw new Error(
                    `Insufficient budget. Attempted to spend ${project.expenditure + totalSpent}, but budget is ${project.budget}.`
                );
            }
            project.expenditure += totalSpent;
        }

        // Deduct utilised items from inventory and add to usedItems
        if (
            updateData.utilisedItems &&
            Array.isArray(updateData.utilisedItems)
        ) {
            // Check inventory before deduction
            for (const item of updateData.utilisedItems) {
                const idx = project.inventory.findIndex(
                    (inv: any) =>
                        inv.name.toLowerCase() === item.name.toLowerCase()
                );
                if (idx < 0) {
                    throw new Error(
                        `Item "${item.name}" is not available in inventory.`
                    );
                }
                if (project.inventory[idx].quantity < item.quantity) {
                    throw new Error(
                        `Not enough quantity of "${item.name}" in inventory to utilise. Available: ${project.inventory[idx].quantity}, Requested: ${item.quantity}`
                    );
                }
            }
            // Deduct after all checks pass
            updateData.utilisedItems.forEach((item: any) => {
                const idx = project.inventory.findIndex(
                    (inv: any) =>
                        inv.name.toLowerCase() === item.name.toLowerCase()
                );
                if (idx >= 0) {
                    project.inventory[idx].quantity -= item.quantity;
                    if (project.inventory[idx].quantity < 0)
                        project.inventory[idx].quantity = 0;
                }
                // Track used items
                const usedIdx = project.usedItems.findIndex(
                    (u: any) => u.name.toLowerCase() === item.name.toLowerCase()
                );
                if (usedIdx >= 0) {
                    project.usedItems[usedIdx].quantity += item.quantity;
                } else {
                    project.usedItems.push({
                        name: item.name,
                        quantity: item.quantity,
                    });
                }
            });
        }

        // Save project with updated inventory/expenditure
        await project.save();

        // Add update with purchased/utilised items
        project.updates.push({
            content: updateData.content,
            media: updateData.media || [],
            purchasedItems: updateData.purchasedItems || [],
            utilisedItems: updateData.utilisedItems || [],
        });
        await project.save();

        return project;
    } catch (error: any) {
        // Provide more specific error messages for known cases
        if (
            error.message &&
            (error.message.includes('not available in inventory') ||
                error.message.includes('Not enough quantity') ||
                error.message.includes('Insufficient budget') ||
                error.message.includes('Invalid purchased item data') ||
                error.message.includes('Invalid utilised item data'))
        ) {
            throw new Error(error.message);
        }
        console.log(error);
        throw new Error('Adding update to project failed!');
    }
};

export const removeUpdateFromProject = async (
    projectId: string,
    updateId: string
) => {
    try {
        const project = await Project.findByIdAndUpdate(
            projectId,
            {
                $pull: {
                    updates: { _id: updateId },
                },
            },
            { new: true }
        );

        if (!project) {
            throw new Error('Project not found!');
        }
        return project;
    } catch (error) {
        console.log(error);
        throw new Error('Removing update from project failed!');
    }
};

export const editUpdateInProject = async (
    projectId: string,
    updateId: string,
    updateData: { content?: string; media?: string[] }
) => {
    try {
        const updateFields: { [key: string]: any } = {};

        if (updateData.content !== undefined) {
            updateFields['updates.$.content'] = updateData.content;
        }

        if (updateData.media !== undefined) {
            updateFields['updates.$.media'] = updateData.media;
        }

        const project = await Project.findOneAndUpdate(
            { _id: projectId, 'updates._id': updateId },
            { $set: updateFields },
            { new: true }
        );

        if (!project) {
            throw new Error('Project or update not found!');
        }
        return project;
    } catch (error) {
        console.log(error);
        throw new Error('Editing update in project failed!');
    }
};

export const getProjectUpdates = async (projectId: string) => {
    try {
        const project = await Project.findById(projectId, { updates: 1 });
        if (!project) {
            throw new Error('Project not found!');
        }
        return project.updates;
    } catch (error) {
        console.log(error);
        throw new Error('Fetching project updates failed!');
    }
};

export const searchProjects = async (
    searchTerm: string,
    options: {
        limit?: number;
        skip?: number;
        sortBy?: string;
        sortOrder?: 'asc' | 'desc';
        filter?: Record<string, any>;
    } = {}
) => {
    try {
        // Return empty array for very short search terms to avoid expensive searches
        if (!searchTerm || searchTerm.trim().length < 2) {
            return { projects: [], total: 0 };
        }

        const searchRegex = new RegExp(searchTerm.trim(), 'i');

        // Default options
        const limit = options.limit || 10;
        const skip = options.skip || 0;
        const sortBy = options.sortBy || 'createdAt';
        const sortOrder = options.sortOrder || 'desc';
        const filter = options.filter || {};

        // Build the search query
        const searchQuery = {
            $or: [
                { title: searchRegex },
                { description: searchRegex },
                { 'location.place': searchRegex },
            ],
            ...filter, // Add any additional filters
        };

        // Build sort object
        const sort: { [key: string]: 'asc' | 'desc' } = {};
        sort[sortBy] = sortOrder;

        // Execute query and get count in parallel for efficiency
        const [projects, total] = await Promise.all([
            Project.find(searchQuery, {
                title: 1,
                bannerUrl: 1,
                description: 1,
                location: 1,
                budget: 1,
                contractor: 1,
                government: 1,
                _id: 1,
                createdAt: 1,
            })
                .sort(sort)
                .skip(skip)
                .limit(limit)
                .populate('contractor', 'name _id')
                .populate('government', 'name _id')
                .lean(),

            Project.countDocuments(searchQuery),
        ]);

        return {
            projects,
            total,
            limit,
            skip,
            hasMore: total > skip + projects.length,
        };
    } catch (error) {
        console.log('Error in searchProjects service:', error);
        throw new Error('Project search failed!');
    }
};

// Optional: Add a method for advanced filtering without search term
export const filterProjects = async (
    filters: Record<string, any>,
    options: {
        limit?: number;
        skip?: number;
        sortBy?: string;
        sortOrder?: 'asc' | 'desc';
    } = {}
) => {
    try {
        // Default options
        const limit = options.limit || 10;
        const skip = options.skip || 0;
        const sortBy = options.sortBy || 'createdAt';
        const sortOrder = options.sortOrder || 'desc';

        // Build sort object
        const sort: { [key: string]: 'asc' | 'desc' } = {};
        sort[sortBy] = sortOrder;

        // Execute query with filters
        const [projects, total] = await Promise.all([
            Project.find(filters, {
                title: 1,
                bannerUrl: 1,
                description: 1,
                location: 1,
                budget: 1,
                _id: 1,
                createdAt: 1,
            })
                .sort(sort)
                .skip(skip)
                .limit(limit)
                .lean(),

            Project.countDocuments(filters),
        ]);

        return {
            projects,
            total,
            limit,
            skip,
            hasMore: total > skip + projects.length,
        };
    } catch (error) {
        console.log('Error in filterProjects service:', error);
        throw new Error('Project filtering failed!');
    }
};

export const fastSearch = async (
    searchParams: {
        title?: string;
        description?: string;
        location?: string;
        date?: {
            startDate?: Date;
            endDate?: Date;
        };
        id?: string;
    },
    options: {
        limit?: number;
        skip?: number;
    } = {}
) => {
    try {
        // Default options
        const limit = options.limit || 20;
        const skip = options.skip || 0;

        // Build the search query
        const query: Record<string, any> = {};

        // Search by ID if provided
        if (searchParams.id) {
            try {
                if (mongoose.Types.ObjectId.isValid(searchParams.id)) {
                    query._id = new mongoose.Types.ObjectId(searchParams.id);
                } else {
                    // If ID search is requested but invalid, return empty results
                    return {
                        projects: [],
                        total: 0,
                        limit,
                        skip,
                        hasMore: false,
                    };
                }
            } catch (error) {
                console.log('Invalid ID format:', error);
                return {
                    projects: [],
                    total: 0,
                    limit,
                    skip,
                    hasMore: false,
                };
            }
        } else {
            // Build other search criteria
            if (searchParams.title) {
                query.title = { $regex: searchParams.title, $options: 'i' };
            }

            if (searchParams.description) {
                query.description = {
                    $regex: searchParams.description,
                    $options: 'i',
                };
            }

            if (searchParams.location) {
                query['location.place'] = {
                    $regex: searchParams.location,
                    $options: 'i',
                };
            }

            // Handle date range search
            if (searchParams.date) {
                const dateQuery: Record<string, any> = {};
                if (searchParams.date.startDate) {
                    dateQuery.$gte = new Date(searchParams.date.startDate);
                }
                if (searchParams.date.endDate) {
                    dateQuery.$lte = new Date(searchParams.date.endDate);
                }
                if (Object.keys(dateQuery).length > 0) {
                    query.createdAt = dateQuery;
                }
            }
        }

        // Execute query and get count
        const [projects, total] = await Promise.all([
            Project.find(query, {
                title: 1,
                bannerUrl: 1,
                description: 1,
                location: 1,
                budget: 1,
                contractor: 1,
                government: 1,
                _id: 1,
                createdAt: 1,
                updatedAt: 1,
            })
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .populate('contractor', 'name _id')
                .populate('government', 'name _id')
                .lean(),
            Project.countDocuments(query),
        ]);

        return {
            projects,
            total,
            limit,
            skip,
            hasMore: total > skip + projects.length,
        };
    } catch (error) {
        console.log('Error in fastSearch service:', error);
        throw new Error('Fast project search failed!');
    }
};

export const getContractorsForGovernment = async (governmentId: string) => {
    try {
        // Find all projects where the government ID matches
        const projects = await Project.find({
            government: governmentId,
        }).populate('contractor', 'name _id email photo');

        // Extract unique contractors from the projects
        const contractorsMap = new Map();

        projects.forEach((project) => {
            if (project.contractor) {
                contractorsMap.set(
                    project.contractor._id.toString(),
                    project.contractor
                );
            }
        });

        // Convert map values to array
        const contractors = Array.from(contractorsMap.values());

        return contractors;
    } catch (error) {
        console.log('Error in getContractorsForGovernment service:', error);
        throw new Error('Fetching contractors failed!');
    }
};

export const updateProjectExpenditure = async (
    projectId: string,
    expenditure: number
) => {
    try {
        const project = await Project.findByIdAndUpdate(
            projectId,
            { expenditure },
            { new: true }
        );

        if (!project) {
            throw new Error('Project not found!');
        }
        return project;
    } catch (error) {
        console.log('Error in updateProjectExpenditure service:', error);
        throw new Error('Project expenditure update failed!');
    }
};
