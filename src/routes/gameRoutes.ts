import { Router } from 'express';
import { startGame, makeChoice, getSessions, getSession } from '../controllers/gameController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.post('/start', authenticate, startGame);
router.post('/choice', authenticate, makeChoice);
router.get('/sessions', authenticate, getSessions);
router.get('/session/:id', authenticate, getSession);

export default router;
