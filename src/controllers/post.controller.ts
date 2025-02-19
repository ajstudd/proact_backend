import imageService from '@/services/image.service';
import postService from '@/services/post.service';
import userService from '@/services/user.service';
import { Request, Response } from 'express';

export const createPost = async (req: Request, res: Response) => {
    const { body } = req;
    const postRes = await postService.createPost({
        ...body,
        user: req.user?.id,
    });
    return res.json(postRes);
};

export const getOnlyMyPosts = async (req: Request, res: Response) => {
    const user = req.user;
    const posts = await postService.getOnlyMyPosts(user ? user.id : '');
    return res.json({ posts });
};

export const getAllPosts = async (req: Request, res: Response) => {
    const user = req.user;
    const posts = await postService.getAllPosts(user ? user.id : undefined);
    return res.json({ posts });
};

export const getPostById = async (
    req: Request<{ postId: string }>,
    res: Response
) => {
    const { postId } = req.params;
    const post = await postService.getPostById(postId);
    return res.json({ post });
};

export const addComment = async (req: Request, res: Response) => {
    const { body } = req;
    const post = await postService.applyComments(body);
    return res.json({ message: 'Comment added', post });
};

export const getPostImageWithPassword = async (req: Request, res: Response) => {
    const { password, postId } = req.body;
    const post = await postService.getPostImageWithPassword(postId, password);
    return res.json(post);
};

export default {
    createPost,
    getAllPosts,
    getPostImageWithPassword,
    getPostById,
    addComment,
};
