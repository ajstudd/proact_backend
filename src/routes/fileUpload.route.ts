import express from 'express';
import { upload } from '@/services/fileUpload.service';
import { uploadFile, getFile } from '@/controllers/fileUpload.controller';

const router = express.Router();

router.post('/upload', upload.single('file'), uploadFile);
router.get('/:filename', getFile);

export default router;
