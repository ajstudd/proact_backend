/* eslint-disable prettier/prettier */
import { Schema, model } from 'mongoose';

const ProjectSchema = new Schema(
    {
        title: { type: String, required: true },
        bannerUrl: { type: String, required: true },
        pdfUrl: { type: String },
        description: { type: String },
        location: {
            lat: { type: Number, required: true },
            lng: { type: Number, required: true },
            place: { type: String, required: true },
        },
        budget: { type: Number, required: true },
        expenditure: { type: Number, default: 0 },
        likes: [{ type: Schema.Types.ObjectId, ref: 'User' }],
        dislikes: [{ type: Schema.Types.ObjectId, ref: 'User' }],
        comments: [{ type: Schema.Types.ObjectId, ref: 'Comment' }],
        updates: [
            {
                content: { type: String, required: true },
                media: [{ type: String }], // Array of URLs
                date: { type: Date, default: Date.now },
            },
        ],
        associatedProfiles: [{ type: Schema.Types.ObjectId, ref: 'User' }],
        contractor: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        government: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
    },
    { timestamps: true }
);

export default model('Project', ProjectSchema);
