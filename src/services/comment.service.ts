import Comment from '../models/comment.model';

export const createComment = async (req: any) => {
    const { project, content } = req.body;
    const user = req.user._id; // JWT middleware se user ka id aayega

    if (!content) {
        throw new Error('Comment Content is Required!');
    }

    const comment = await Comment.create({
        project,
        user,
        content,
    });

    return comment;
};

export const getCommentsByProject = async (projectId: string) => {
    const comments = await Comment.find({ project: projectId })
        .populate('user', 'name email profile')
        .sort({ createdAt: -1 });

    return comments;
};
