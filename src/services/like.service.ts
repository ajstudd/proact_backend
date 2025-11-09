import Project from '../models/project.model';
import User from '../models/user.model';
import notificationService from './notification.service';

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
        ).populate('likes dislikes government');

        // Send notification to project creator (government) when someone likes their project
        if (
            updatedProject &&
            updatedProject &&
            updatedProject &&
            updatedProject &&
            updatedProject &&
            updatedProject.government &&
            userId !== updatedProject.government._id.toString()
        ) {
            // Get the sender's name
            const sender = await User.findById(userId).select('name');
            const senderName = sender?.name || 'Someone';

            await notificationService.createNotification({
                recipientId: updatedProject.government._id.toString(),
                senderId: userId,
                type: 'PROJECT_UPDATE',
                message: `${senderName} liked your project: ${updatedProject.title}`,
                entityId: projectId,
                entityType: 'Project',
                metadata: {
                    projectTitle: updatedProject ? updatedProject.title : '',
                    action: 'like',
                },
            });
        }

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
        ).populate('likes dislikes government');

        // Send notification to project creator (government) when someone dislikes their project
        if (
            updatedProject &&
            updatedProject.government &&
            userId !== updatedProject.government._id.toString()
        ) {
            // Get the sender's name
            const sender = await User.findById(userId).select('name');
            const senderName = sender?.name || 'Someone';

            await notificationService.createNotification({
                recipientId: updatedProject.government._id.toString(),
                senderId: userId,
                type: 'PROJECT_UPDATE',
                message: `${senderName} disliked your project: ${updatedProject.title}`,
                entityId: projectId,
                entityType: 'Project',
                metadata: {
                    projectTitle: updatedProject.title,
                    action: 'dislike',
                },
            });
        }

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
