import Project from '../models/project.model';

export const likeProject = async (projectId: string, userId: string) => {
    try {
        // Remove from dislikes if exists
        await Project.findByIdAndUpdate(projectId, {
            $pull: { dislikes: userId },
        });

        // Add to likes if not already liked
        const updatedProject = await Project.findByIdAndUpdate(
            projectId,
            { $addToSet: { likes: userId } },
            { new: true }
        ).populate('likes dislikes');

        return updatedProject;
    } catch (error) {
        throw error;
    }
};

export const dislikeProject = async (projectId: string, userId: string) => {
    try {
        // Remove from likes if exists
        await Project.findByIdAndUpdate(projectId, {
            $pull: { likes: userId },
        });

        // Add to dislikes if not already disliked
        const updatedProject = await Project.findByIdAndUpdate(
            projectId,
            { $addToSet: { dislikes: userId } },
            { new: true }
        ).populate('likes dislikes');

        return updatedProject;
    } catch (error) {
        throw error;
    }
};

export const unlikeProject = async (projectId: string, userId: string) => {
    try {
        const updatedProject = await Project.findByIdAndUpdate(
            projectId,
            { $pull: { likes: userId } },
            { new: true }
        ).populate('likes dislikes');

        return updatedProject;
    } catch (error) {
        throw error;
    }
};

export const undislikeProject = async (projectId: string, userId: string) => {
    try {
        const updatedProject = await Project.findByIdAndUpdate(
            projectId,
            { $pull: { dislikes: userId } },
            { new: true }
        ).populate('likes dislikes');

        return updatedProject;
    } catch (error) {
        throw error;
    }
};
