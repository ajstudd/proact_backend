import { Router } from 'express';
import authRoute from './routes/auth.route';
import imageRoute from './routes/image.route';
import userRoute from './routes/user.route';
import otpRoute from './routes/otp.routes';
import corruptionReportRoutes from './routes/corruption-report.route';
import fileRoute from './routes/fileUpload.route';
import analysisRoute from './routes/analysis.route';
import projectRoute from './routes/project.route';
import feedbackRoute from './routes/feedback.route';
import notificationRoute from './routes/notification.route';

const router = Router();

router.use('/auth', authRoute);
router.use('/image', imageRoute);
router.use('/user', userRoute);
router.use('/otp', otpRoute);
router.use('/file', fileRoute);
router.use('/project', projectRoute);
router.use('/corruption-reports', corruptionReportRoutes);
router.use('/feedback', feedbackRoute);
router.use('/notifications', notificationRoute);
router.use('/analysis', analysisRoute);

export default router;
