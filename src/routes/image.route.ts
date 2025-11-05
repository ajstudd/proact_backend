import imageController from '@/controllers/image.controller';
import { catchAsync } from 'catch-async-express';
import { upload } from '@/helpers/multer';
import { Router } from 'express';

const router = Router();

// save in public folder

router.post('/save', upload.single('image'), catchAsync(imageController.save));
router.get('/get/:imageId', catchAsync(imageController.getImageById));

export default router;
