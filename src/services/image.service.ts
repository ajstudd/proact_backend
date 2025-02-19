import ImageModel from '@/models/image.model';
import postModel from '@/models/post.model';
import { IComment } from '@/types';

const saveImage = async ({
    filename,
    localPath,
}: {
    filename: string;
    localPath: string;
}) => {
    const image = await ImageModel.create({
        image: filename,
        localPath,
    });
    return image.toObject();
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

const getImageById = async (imageId: string) => {
    const image = await ImageModel.findById(imageId).select('+localPath');

    return image;
};

export default {
    saveImage,
    applyComments,
    getImageById,
};
