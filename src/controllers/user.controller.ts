import imageService from '@/services/image.service';
import userService from '@/services/user.service';
import { Request, Response } from 'express';

export const updateUser = async (req: Request, res: Response) => {
    const { body } = req;

    userService.update(body, req.user!.id);

    return res.json({ message: 'User updated' });
};

export default {
    updateUser,
};
