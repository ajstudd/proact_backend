import { Schema, model } from 'mongoose';

const FileSchema = new Schema(
    {
        filename: { type: String, required: true },
        originalName: { type: String, required: true },
        contentType: { type: String, required: true },
        size: { type: Number, required: true },
        uploadDate: { type: Date, default: Date.now },
        url: { type: String, required: true },
    },
    { timestamps: true }
);

export default model('File', FileSchema);
