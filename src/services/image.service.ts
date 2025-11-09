import ImageModel from '@/models/image.model';

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

const getImageById = async (imageId: string) => {
    const image = await ImageModel.findById(imageId).select('+localPath');

    return image;
};

export default {
    saveImage,
    getImageById,
};
