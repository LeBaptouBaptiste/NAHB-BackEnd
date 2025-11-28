import express from 'express';
import { exportStory, importStory } from '../controllers/migrationController';
import { authenticate } from '../middleware/auth';
import { upload } from '../middleware/upload';

const router = express.Router();

router.get('/export/:storyId', authenticate, exportStory);
router.post('/import', authenticate, upload.single('file'), importStory);

export default router;
