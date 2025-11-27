import { Router } from 'express';
import { uploadImage } from '../controllers/uploadController';
import { upload } from '../middleware/upload';
import { authenticate } from '../middleware/auth';

const router = Router();

router.post('/', authenticate, upload.single('image'), uploadImage);
router.post('/audio', authenticate, upload.single('audio'), uploadImage); // Reuse controller logic as it just returns URL

export default router;

