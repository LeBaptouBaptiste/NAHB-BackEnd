import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { reportStory, getMyReports } from '../controllers/reportController';

const router = Router();

// Protected: Report a story
router.post('/story/:storyId', authenticate, reportStory);

// Protected: Get user's reports
router.get('/my-reports', authenticate, getMyReports);

export default router;

