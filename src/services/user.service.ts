import bcrypt from 'bcryptjs';
import User from '../models/user.model';
import { IRequestUser, IUser, UpdateUserPayload } from '../types';
import { HttpError } from '../helpers/HttpError';
// import configs from '../configs';
import { FilterQuery } from 'mongoose';

const getUserById = async (userId: string) => {
    const fetchQuery: FilterQuery<IUser> = {
        _id: userId,
    };

    const userDoc = await User.findOne(fetchQuery);
    if (!userDoc) {
        throw new HttpError({ message: 'User not found!', code: 404 });
    }

    const user = userDoc.toObject({ getters: true, virtuals: true });

    // Hack: append max limit to limited card

    return {
        ...user,
    };
};

const update = async (payload: UpdateUserPayload, userId: string) => {
    const user = await User.findOneAndUpdate({ _id: userId }, payload, {
        new: true,
    });
    if (!user) {
        throw new Error('User not found');
    }
    return await getUserById(user.id);
};

const getUserByEmail = async (email: string) => {
    const userDoc = await User.findOne({
        email,
    });
    if (!userDoc) {
        throw new HttpError({ message: 'User not found!', code: 404 });
    }

    const user = userDoc.toObject({ getters: true, virtuals: true });

    return {
        ...user,
    };
};

const createUser = async (
    payload: Partial<
        Pick<IUser, 'phone' | 'email' | 'name' | 'password' | 'role'>
    >
) => {
    const query: FilterQuery<IUser> = {};
    if (payload.email) {
        query.email = payload.email;
    }
    if (payload.phone) {
        query.phone = payload.phone;
    }

    const existingUser = await User.findOne({
        ...query,
    });

    if (existingUser) {
        throw new HttpError({ message: 'User already exists!', code: 409 });
    }

    const createQuery: Partial<IUser> = {
        ...payload,
    };

    if (payload.password) {
        const hashedPassword = bcrypt.hashSync(payload.password);
        createQuery.password = hashedPassword;
    }

    const user = await User.create({
        ...createQuery,
    });
    return await getUserById(user.id);
};

const getUsersByIds = async (userIds: string[]) => {
    const users = await User.find({ _id: { $in: userIds } });
    return users.map((user) =>
        user.toObject({ getters: true, virtuals: true })
    );
};

const getUserByPhone = async (phone: string) => {
    const userDoc = await User.findOne({ phone });
    if (!userDoc) {
        throw new HttpError({ code: 404, message: 'User not found!' });
    }

    const user = userDoc.toObject();

    return { ...user };
};

const updateUserScore = async (userId: string, score: number) => {
    const user = await User.findOneAndUpdate(
        { _id: userId },
        { score },
        { new: true }
    );

    if (!user) {
        throw new HttpError({ code: 404, message: 'User not found!' });
    }

    return user.toObject();
};

const getUserByEmailOrPhone = async (email: string, phone: string) => {
    const userDoc = await User.findOne({
        $or: [{ email }, { phone }],
    });

    if (!userDoc) {
        throw new HttpError({ code: 404, message: 'User not found!' });
    }

    const user = userDoc.toObject();

    return { ...user };
};

const deleteUserById = async (userId: string) => {
    await User.deleteOne({ _id: userId });
};

export default {
    update,
    getUserById,
    createUser,
    getUserByEmail,
    updateUserScore,
    getUsersByIds,
    getUserByPhone,
    getUserByEmailOrPhone,
    deleteUserById,
};
