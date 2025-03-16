import bcrypt from 'bcryptjs';
import User from '../models/user.model';
import { IRequestUser, IUser, UpdateUserPayload } from '../types';
import { HttpError } from '../helpers/HttpError';
import { FilterQuery } from 'mongoose';
import mongoose from 'mongoose';
import crypto from 'crypto';
import emailService from './email.service';

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
        Pick<
            IUser,
            | 'phone'
            | 'email'
            | 'name'
            | 'password'
            | 'role'
            | 'contractorLicense'
        >
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

const editUserProfile = async (userId: string, payload: UpdateUserPayload) => {
    const user = await User.findById(userId);
    if (!user) {
        throw new HttpError({ message: 'User not found!', code: 404 });
    }

    const updateData: any = { ...payload };

    // Handle profile photo update
    if (payload.photo) {
        // For photo, we're storing the filename directly rather than an ObjectId
        // This is different from the schema definition, so we need to update it accordingly
        updateData.photo = payload.photo;

        // Note: If you want to maintain the ObjectId reference in the future,
        // you would need to create an Image document first and then reference its _id
    }

    // Handle email change with verification
    if (payload.email && payload.email !== user.email) {
        // Check if the new email is already taken
        const emailExists = await User.findOne({ email: payload.email });
        if (emailExists) {
            throw new HttpError({ message: 'Email already in use', code: 409 });
        }

        // Generate verification token
        const emailVerificationToken = crypto.randomBytes(32).toString('hex');

        // Update user with verification details
        user.resetPasswordToken = emailVerificationToken;
        user.resetPasswordExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

        // Store new email temporarily for verification
        user.set('newEmailPending', payload.email);
        await user.save();

        // Send verification email
        try {
            await emailService.sendEmailVerification(
                payload.email,
                emailVerificationToken,
                process.env.FRONTEND_URL || 'http://localhost:3000'
            );

            // Don't update email directly, it will be updated after verification
            delete updateData.email;
        } catch (error) {
            throw new HttpError({
                message: 'Failed to send verification email',
                code: 500,
            });
        }
    }

    // Handle phone change with verification (commented for now)
    if (payload.phone && payload.phone !== user.phone) {
        // Check if phone is already taken
        const phoneExists = await User.findOne({ phone: payload.phone });
        if (phoneExists) {
            throw new HttpError({
                message: 'Phone number already in use',
                code: 409,
            });
        }

        /*
        // Generate OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        
        // Store OTP and set expiry
        user.resetPasswordToken = otp;
        user.resetPasswordExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
        
        // TODO: Integrate with SMS service
        // await smsService.sendSMS({
        //     to: payload.phone,
        //     message: `Your verification code is: ${otp}`
        // });
        
        // Don't update phone directly
        delete updateData.phone;
        
        // Store new phone temporarily for verification
        user.set('newPhonePending', payload.phone);
        await user.save();
        */
        // For now, update phone directly without verification
    }

    // Handle password update
    if (payload.password) {
        updateData.password = bcrypt.hashSync(payload.password, 10);
    }

    const updatedUser = await User.findByIdAndUpdate(userId, updateData, {
        new: true,
    }).lean();

    // If we successfully updated the user and there was a photo change, we could
    // delete the old photo from GridFS here if needed
    // This would involve:
    // 1. Check if oldPhotoId exists
    // 2. Call a function to delete the file from GridFS

    return getUserProfileData(updatedUser as IUser);
};

const verifyEmailUpdate = async (token: string, email: string) => {
    const user = await User.findOne({
        resetPasswordToken: token,
        resetPasswordExpires: { $gt: Date.now() },
    }).select('+newEmailPending');
    //did select because newEmailPending was set as select false in the schema, so we need to select it to get the value

    if (!user) {
        throw new HttpError({ message: 'Invalid or expired token', code: 400 });
    }

    const pendingEmail = user.get('newEmailPending');

    if (!pendingEmail || pendingEmail !== email) {
        throw new HttpError({
            message: 'Invalid email verification request',
            code: 400,
        });
    }

    const emailExists = await User.findOne({
        email,
        _id: { $ne: user._id },
    });

    if (emailExists) {
        throw new HttpError({ message: 'Email already in use', code: 409 });
    }

    user.email = email;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    user.set('newEmailPending', undefined);
    user.isVerified = true;

    await user.save();

    return getUserProfileData(user.toObject());
};

const getUserProfileData = (user: IUser) => {
    const {
        password,
        resetPasswordToken,
        resetPasswordExpires,
        ...safeUserData
    } = user;

    return safeUserData;
};

const getUserProfile = async (userId: string) => {
    const user = await User.findById(userId)
        .select('-password -resetPasswordToken -resetPasswordExpires')
        .lean();

    if (!user) {
        throw new HttpError({ message: 'User not found!', code: 404 });
    }

    return user;
};

const resetPassword = async (
    userId: string,
    oldPassword: string,
    newPassword: string
) => {
    // Find user by ID and select password field which is normally excluded
    const user = await User.findById(userId).select('+password');
    if (!user) {
        throw new HttpError({ message: 'User not found!', code: 404 });
    }

    // Verify old password
    const isPasswordValid =
        user.password && bcrypt.compareSync(oldPassword, user.password);
    if (!isPasswordValid) {
        throw new HttpError({
            message: 'Old password is incorrect',
            code: 400,
        });
    }

    // Hash new password
    const hashedPassword = bcrypt.hashSync(newPassword, 10);

    // Update password
    user.password = hashedPassword;
    await user.save();

    return { success: true };
};

/**
 * Search users by query string (matches email, name, phone, or ID)
 */
const searchUsers = async (
    query: string,
    options: {
        limit?: number;
        skip?: number;
        role?: string;
    } = {}
) => {
    try {
        if (!query || query.trim().length < 1) {
            return { users: [], total: 0 };
        }

        const { limit = 10, skip = 0, role } = options;

        // Build the search filter
        const searchFilter: FilterQuery<IUser> = {};
        const trimmedQuery = query.trim();

        // Search for exact ID match if query looks like MongoDB ObjectId
        if (mongoose.Types.ObjectId.isValid(trimmedQuery)) {
            searchFilter._id = trimmedQuery;
        } else {
            // Otherwise search across multiple fields
            searchFilter.$or = [
                { email: { $regex: trimmedQuery, $options: 'i' } },
                { name: { $regex: trimmedQuery, $options: 'i' } },
                { username: { $regex: trimmedQuery, $options: 'i' } },
            ];

            // If phone number, also search by phone
            // Only add phone search if query contains number-like characters
            if (/\d/.test(trimmedQuery)) {
                searchFilter.$or.push({
                    phone: { $regex: trimmedQuery, $options: 'i' },
                });
            }
        }

        // Add role filter if specified
        if (role) {
            searchFilter.role = role;
        }

        // Execute search query and count in parallel
        const [users, total] = await Promise.all([
            User.find(searchFilter, {
                name: 1,
                username: 1,
                email: 1,
                phone: 1,
                role: 1,
                photo: 1,
                isVerified: 1,
                createdAt: 1,
            })
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            User.countDocuments(searchFilter),
        ]);

        return {
            users,
            total,
            limit,
            skip,
            hasMore: total > skip + users.length,
        };
    } catch (error) {
        console.error('Error in searchUsers service:', error);
        throw new HttpError({ message: 'User search failed', code: 500 });
    }
};

/**
 * Search specifically for contractors
 */
const searchContractors = async (
    query: string,
    options: {
        limit?: number;
        skip?: number;
    } = {}
) => {
    return searchUsers(query, {
        ...options,
        role: 'CONTRACTOR',
    });
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
    editUserProfile,
    verifyEmailUpdate,
    getUserProfile,
    resetPassword,
    searchUsers,
    searchContractors,
};
