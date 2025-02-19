import { Router } from 'express';
import authRoute from './routes/auth.route';
import imageRoute from './routes/image.route';
import userRoute from './routes/user.route';
import postRoute from './routes/post.route';

const router = Router();

router.use('/posts', postRoute);
router.use('/auth', authRoute);
router.use('/image', imageRoute);
router.use('/user', userRoute);

export default router;
