import bcrypt from 'bcryptjs';
import { IComment, IPost } from '../types';
import postModel from '@/models/post.model';

const createPost = async (payload: Partial<IPost>) => {
    if (payload.password) {
        const hashedPassword = bcrypt.hashSync(payload.password);
        payload.password = hashedPassword;
    }
    const post = await postModel.create(payload);
    return post;
};

const applyComments = async (comment: IComment) => {
    const image = await postModel.findOneAndUpdate(
        {
            _id: comment.postid,
        },
        {
            $set: {
                comments: comment,
            },
        },
        {
            new: true,
        }
    );

    return image;
};

const getPostImageWithPassword = async (postId: string, password: string) => {
    const post = await postModel
        .findById(postId)
        .populate('images')
        .populate('user');
    if (!post) {
        return null;
    }
    if (typeof post.password === 'undefined') {
        console.error('Post password is undefined');
        return null;
    }
    const isMatch = await bcrypt.compare(password, post.password);
    if (!isMatch) {
        return null;
    }
    return {
        ...post.toJSON(),
        password: undefined,
    };
};

export const getPostById = async (postId: string) => {
    const post = await postModel.findById(postId).select('-password');
    if (post?.isLocked) {
        post.images = [];
    }
    return post;
};

export const getPostByIdWithPassword = async (
    postId: string,
    password: string
) => {
    const post = await postModel
        .findById(postId)
        .populate('images')
        .populate('user');
    if (!post) {
        return null;
    }
    const isMatch = await bcrypt.compare(password, post.password);
    if (!isMatch) {
        return null;
    }
    return {
        ...post.toJSON(),
        password: undefined,
    };
};

export const getOnlyMyPosts = async (userId: string) => {
    const posts = await postModel
        .find({ ownerId: userId })
        .populate('images')
        .select('-password')
        .sort({ createdAt: -1 });
    return posts;
};

export const getAllPosts = async (userId?: string) => {
    const posts = await postModel
        .find()
        .populate('images')
        .populate('user')
        .select('-password')
        .sort({ createdAt: -1 });
    posts.map((post) => {
        if (post.isLocked && post.user?.id !== userId) {
            post.images = [];
        }
        if (post.isLocked && post.user?.id === userId) {
            post.isLocked = false;
        }
    });
    return posts;
};

export default {
    createPost,
    applyComments,
    getOnlyMyPosts,
    getPostById,
    getPostImageWithPassword,
    getAllPosts,
};
