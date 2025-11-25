import { Router } from 'express';
import { uploadImage } from '../controllers/uploadController';
import { upload } from '../middleware/upload';
import { authenticate } from '../middleware/auth';

const router = Router();

router.post('/', authenticate, upload.single('image'), uploadImage);

export default router;

