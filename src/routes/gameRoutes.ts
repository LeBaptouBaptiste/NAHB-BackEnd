import { Router } from 'express';
import { startGame, makeChoice, getSessions, getSession, getPathStats, getStoryStats } from '../controllers/gameController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.post('/start', authenticate, startGame);
router.post('/choice', authenticate, makeChoice);
router.get('/sessions', authenticate, getSessions);
router.get('/session/:id', authenticate, getSession);
router.get('/session/:sessionId/path-stats', authenticate, getPathStats);
router.get('/story/:storyId/stats', authenticate, getStoryStats);

export default router;
