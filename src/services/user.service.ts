import bcrypt from 'bcryptjs';
import User from '../models/user.model';
import { IRequestUser, IUser, UpdateUserPayload } from '../types';
import { HttpError } from '../helpers/HttpError';
import { FilterQuery } from 'mongoose';
import mongoose from 'mongoose';

const getUserById = async (userId: string) => {
    const user = await User.findById(userId).lean();
    if (!user) {
        throw new HttpError({ message: 'User not found!', code: 404 });
    }
    return user;
};

const updateUser = async (payload: UpdateUserPayload, userId: string) => {
    const updatedUser = await User.findByIdAndUpdate(userId, payload, {
        new: true,
    }).lean();
    if (!updatedUser) {
        throw new HttpError({ message: 'User not found!', code: 404 });
    }
    return updatedUser;
};

const getUserByEmail = async (email: string) => {
    const user = await User.findOne({ email }).lean();
    if (!user) {
        throw new HttpError({ message: 'User not found!', code: 404 });
    }
    return user;
};

const getUserByPhone = async (phone: string) => {
    const user = await User.findOne({ phone }).lean();
    if (!user) {
        throw new HttpError({ message: 'User not found!', code: 404 });
    }
    return user;
};

const getUserByEmailOrPhone = async (email?: string, phone?: string) => {
    if (!email && !phone) {
        throw new HttpError({ message: 'Email or phone required!', code: 400 });
    }

    const user = await User.findOne({
        $or: [{ email }, { phone }],
    }).lean();

    if (!user) {
        throw new HttpError({ message: 'User not found!', code: 404 });
    }
    return user;
};

const createUser = async (
    payload: Partial<
        Pick<IUser, 'phone' | 'email' | 'name' | 'password' | 'role'>
    >
) => {
    if (!payload.email && !payload.phone) {
        throw new HttpError({
            message: 'Email or phone is required!',
            code: 400,
        });
    }

    const existingUser = await User.findOne({
        $or: [{ email: payload.email }, { phone: payload.phone }],
    }).lean();

    if (existingUser) {
        throw new HttpError({ message: 'User already exists!', code: 409 });
    }

    if (payload.password) {
        payload.password = bcrypt.hashSync(payload.password, 10);
    }

    const user = await User.create(payload);
    return getUserById(user._id.toString());
};

const getUsersByIds = async (userIds: string[]) => {
    const users = await User.find({ _id: { $in: userIds } }).lean();
    return users;
};

const updateUserScore = async (userId: string, score: number) => {
    const user = await User.findByIdAndUpdate(
        userId,
        { reputationScore: score },
        { new: true }
    ).lean();
    if (!user) {
        throw new HttpError({ message: 'User not found!', code: 404 });
    }
    return user;
};

const deleteUserById = async (userId: string) => {
    const deletedUser = await User.findByIdAndDelete(userId).lean();
    if (!deletedUser) {
        throw new HttpError({ message: 'User not found!', code: 404 });
    }
    return { message: 'User deleted successfully' };
};

const bookmarkProject = async (userId: string, projectId: string) => {
    // Validate projectId is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(projectId)) {
        throw new HttpError({ message: 'Invalid project ID', code: 400 });
    }

    const user = await User.findByIdAndUpdate(
        userId,
        { $addToSet: { bookmarks: projectId } }, // Using $addToSet to avoid duplicates
        { new: true }
    )
        .populate({
            path: 'bookmarks',
            select: 'title bannerUrl description location budget createdAt',
        })
        .lean();

    if (!user) {
        throw new HttpError({ message: 'User not found!', code: 404 });
    }

    return {
        message: 'Project bookmarked successfully',
        bookmarks: user.bookmarks,
    };
};

const removeBookmark = async (userId: string, projectId: string) => {
    if (!mongoose.Types.ObjectId.isValid(projectId)) {
        throw new HttpError({ message: 'Invalid project ID', code: 400 });
    }

    const user = await User.findByIdAndUpdate(
        userId,
        { $pull: { bookmarks: projectId } },
        { new: true }
    )
        .populate({
            path: 'bookmarks',
            select: 'title bannerUrl description location budget createdAt',
        })
        .lean();

    if (!user) {
        throw new HttpError({ message: 'User not found!', code: 404 });
    }

    return {
        message: 'Bookmark removed successfully',
        bookmarks: user.bookmarks,
    };
};

const getBookmarkedProjects = async (userId: string) => {
    const user = await User.findById(userId)
        .populate({
            path: 'bookmarks',
            select: 'title bannerUrl description location budget contractor government createdAt updatedAt',
            populate: [
                { path: 'contractor', select: 'name _id' },
                { path: 'government', select: 'name _id' },
            ],
        })
        .lean();

    if (!user) {
        throw new HttpError({ message: 'User not found!', code: 404 });
    }

    return user.bookmarks || [];
};

export default {
    updateUser,
    getUserById,
    createUser,
    getUserByEmail,
    updateUserScore,
    getUsersByIds,
    getUserByPhone,
    getUserByEmailOrPhone,
    deleteUserById,
    bookmarkProject,
    removeBookmark,
    getBookmarkedProjects,
};
