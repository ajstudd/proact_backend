import express from 'express';
import { upload } from '@/services/fileUpload.service';
import {
    uploadFile,
    getFile,
    deleteFile,
    listFiles,
} from '@/controllers/fileUpload.controller';

const router = express.Router();

router.post('/upload', upload.single('file'), uploadFile);
router.get('/find/:filename', getFile);
router.delete('/:filename', deleteFile);
router.get('/files', listFiles);

export default router;
