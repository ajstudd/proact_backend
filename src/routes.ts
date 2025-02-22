import { Router } from 'express';
import authRoute from './routes/auth.route';
import imageRoute from './routes/image.route';
import userRoute from './routes/user.route';
import postRoute from './routes/post.route';
import otpRoute from './routes/otp.routes';

const router = Router();

router.use('/posts', postRoute);
router.use('/auth', authRoute);
router.use('/image', imageRoute);
router.use('/user', userRoute);
router.use('/otp', otpRoute);

export default router;
