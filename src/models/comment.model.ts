import mongoose, { Schema, Document } from 'mongoose';

interface IComment extends Document {
    project: mongoose.Schema.Types.ObjectId;
    user: mongoose.Schema.Types.ObjectId;
    content: string;
    createdAt: Date;
    updatedAt: Date;
}

const commentSchema = new Schema<IComment>(
    {
        project: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Project',
            required: true,
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        content: {
            type: String,
            required: true,
        },
    },
    { timestamps: true }
);

const Comment = mongoose.model<IComment>('Comment', commentSchema);

export default Comment;
