import userController from '@/controllers/user.controller';
import { verifyToken } from '@/middlewares/verifyToken.middleware';
import { catchAsync } from 'catch-async-express';
import { Router } from 'express';

const router = Router();

router.patch(
    '/update',
    verifyToken({ strict: true }),
    catchAsync(userController.updateUser)
);

export default router;
