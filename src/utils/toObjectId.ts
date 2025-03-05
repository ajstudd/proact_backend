import mongoose from 'mongoose';

export const toObjectId = (
    value: string | mongoose.Types.ObjectId
): mongoose.Types.ObjectId | string =>
    mongoose.isValidObjectId(value)
        ? new mongoose.Types.ObjectId(value)
        : value;
