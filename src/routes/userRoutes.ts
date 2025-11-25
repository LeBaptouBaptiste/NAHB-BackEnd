import { Router } from 'express';
import { getUsername } from '../controllers/userController';
import { authenticate } from '../middleware/auth';

const router = Router();

// Author routes (protected)
router.get('/:id', authenticate, getUsername);

export default router;