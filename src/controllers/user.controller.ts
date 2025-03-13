import { Request, Response } from 'express';
import userService from '@/services/user.service';
import { HttpError } from '@/helpers/HttpError';

export const updateUser = async (req: Request, res: Response) => {
    try {
        const updatedUser = await userService.updateUser(
            req.body,
            req.user!.id
        );
        return res
            .status(200)
            .json({ message: 'User updated successfully', user: updatedUser });
    } catch (error) {
        const err = error as { code?: number; message: string };
        return res.status(err.code || 500).json({ message: err.message });
    }
};

export const getUserById = async (req: Request, res: Response) => {
    try {
        const user = await userService.getUserById(req.params.id);
        return res.status(200).json(user);
    } catch (error) {
        const err = error as { code?: number; message: string };
        return res.status(err.code || 500).json({ message: err.message });
    }
};

export const getUserByEmail = async (req: Request, res: Response) => {
    try {
        const user = await userService.getUserByEmail(req.params.email);
        return res.status(200).json(user);
    } catch (error) {
        const err = error as { code?: number; message: string };
        return res.status(err.code || 500).json({ message: err.message });
    }
};

/** 📞 Get User by Phone */
export const getUserByPhone = async (req: Request, res: Response) => {
    try {
        const user = await userService.getUserByPhone(req.params.phone);
        return res.status(200).json(user);
    } catch (error) {
        const err = error as { code?: number; message: string };
        return res.status(err.code || 500).json({ message: err.message });
    }
};

export const getUserByEmailOrPhone = async (req: Request, res: Response) => {
    try {
        const { email, phone } = req.query;
        const user = await userService.getUserByEmailOrPhone(
            email as string,
            phone as string
        );
        return res.status(200).json(user);
    } catch (error) {
        const err = error as { code?: number; message: string };
        return res.status(err.code || 500).json({ message: err.message });
    }
};

export const createUser = async (req: Request, res: Response) => {
    try {
        const newUser = await userService.createUser(req.body);
        return res
            .status(201)
            .json({ message: 'User created successfully', user: newUser });
    } catch (error) {
        const err = error as { code?: number; message: string };
        return res.status(err.code || 500).json({ message: err.message });
    }
};

export const getUsersByIds = async (req: Request, res: Response) => {
    try {
        const userIds = req.body.userIds as string[];
        if (!userIds || !Array.isArray(userIds)) {
            throw new HttpError({ message: 'Invalid user IDs', code: 400 });
        }
        const users = await userService.getUsersByIds(userIds);
        return res.status(200).json(users);
    } catch (error) {
        const err = error as { code?: number; message: string };
        return res.status(err.code || 500).json({ message: err.message });
    }
};

export const updateUserScore = async (req: Request, res: Response) => {
    try {
        const { score } = req.body;
        if (typeof score !== 'number') {
            throw new HttpError({ message: 'Invalid score value', code: 400 });
        }
        const updatedUser = await userService.updateUserScore(
            req.user!.id,
            score
        );
        return res
            .status(200)
            .json({ message: 'User score updated', user: updatedUser });
    } catch (error) {
        const err = error as { code?: number; message: string };
        return res.status(err.code || 500).json({ message: err.message });
    }
};

export const deleteUserById = async (req: Request, res: Response) => {
    try {
        await userService.deleteUserById(req.params.id);
        return res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
        const err = error as { code?: number; message: string };
        return res.status(err.code || 500).json({ message: err.message });
    }
};

export const bookmarkProject = async (req: Request, res: Response) => {
    try {
        const { projectId } = req.body;
        if (!projectId) {
            throw new HttpError({
                message: 'Project ID is required',
                code: 400,
            });
        }

        const result = await userService.bookmarkProject(
            req.user!.id,
            projectId
        );
        return res.status(200).json(result);
    } catch (error) {
        const err = error as { code?: number; message: string };
        return res.status(err.code || 500).json({ message: err.message });
    }
};

export const removeBookmark = async (req: Request, res: Response) => {
    try {
        const { projectId } = req.params;
        if (!projectId) {
            throw new HttpError({
                message: 'Project ID is required',
                code: 400,
            });
        }

        const result = await userService.removeBookmark(
            req.user!.id,
            projectId
        );
        return res.status(200).json(result);
    } catch (error) {
        const err = error as { code?: number; message: string };
        return res.status(err.code || 500).json({ message: err.message });
    }
};

export const getBookmarkedProjects = async (req: Request, res: Response) => {
    try {
        const bookmarks = await userService.getBookmarkedProjects(req.user!.id);
        return res.status(200).json({ bookmarks });
    } catch (error) {
        const err = error as { code?: number; message: string };
        return res.status(err.code || 500).json({ message: err.message });
    }
};

export default {
    updateUser,
    getUserById,
    getUserByEmail,
    getUserByPhone,
    getUserByEmailOrPhone,
    createUser,
    getUsersByIds,
    updateUserScore,
    deleteUserById,
    bookmarkProject,
    removeBookmark,
    getBookmarkedProjects,
};
