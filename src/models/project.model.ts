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
                media: [{ type: String }],
                date: { type: Date, default: Date.now },
                // Optionally, you can add a field for items in the update itself
                purchasedItems: [
                    {
                        name: { type: String, required: true },
                        quantity: { type: Number, required: true },
                        price: { type: Number, required: true },
                    },
                ],
                utilisedItems: [
                    {
                        name: { type: String, required: true },
                        quantity: { type: Number, required: true },
                    },
                ],
            },
        ],
        inventory: [
            {
                name: { type: String, required: true },
                quantity: { type: Number, required: true },
                price: { type: Number, required: true },
                totalSpent: { type: Number, required: true },
            },
        ],
        usedItems: [
            {
                name: { type: String, required: true },
                quantity: { type: Number, required: true },
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

// Create indexes for faster searching
ProjectSchema.index({
    title: 'text',
    description: 'text',
    'location.place': 'text',
});
ProjectSchema.index({ createdAt: -1 });
ProjectSchema.index({ budget: 1 });
ProjectSchema.index({ 'location.place': 1 });

export default model('Project', ProjectSchema);
