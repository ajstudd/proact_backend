import imageService from '@/services/image.service';
import { IComment } from '@/types';
import { Request, Response } from 'express';

const comment = async (req: Request, res: Response) => {
    const image = await imageService.applyComments(req.body);

    return res.json({ message: 'Comments applied', image });
};

const save = async (req: Request, res: Response) => {
    const { file } = req;

    if (!file) {
        return res.status(400).json({ message: 'Image is required' });
    }
    if (file.size > 30 * 1024 * 1024) {
        return res.status(400).json({ message: 'Image size is too big' });
    }

    const image = await imageService.saveImage({
        filename: file.filename,
        localPath: file.path,
    });

    return res.json({ message: 'Image saved', image });
};

const getImageById = async (
    req: Request<{ imageId: string }>,
    res: Response
) => {
    const { imageId } = req.params;

    const image = await imageService.getImageById(imageId);

    return res.sendFile(image?.localPath ?? '');
};
export default {
    comment,
    getImageById,
    save,
};
