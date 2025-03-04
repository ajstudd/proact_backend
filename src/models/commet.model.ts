import { Schema, model } from 'mongoose';

const CommentSchema = new Schema(
    {
        project: {
            type: Schema.Types.ObjectId,
            ref: 'Project',
            required: true,
        },
        user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        content: { type: String, required: true },
    },
    { timestamps: true }
);

export default model('Comment', CommentSchema);
