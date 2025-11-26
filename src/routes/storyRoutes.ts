import { Router } from 'express';
import {
    createStory,
    getMyStories,
    getStory,
    updateStory,
    deleteStory,
    getPublishedStories,
    getTags,
} from '../controllers/storyController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

// Author routes (protected)
router.post('/', authenticate, authorize(['author', 'admin']), createStory);
router.get('/my', authenticate, authorize(['author', 'admin']), getMyStories);
router.put('/:id', authenticate, authorize(['author', 'admin']), updateStory);
router.delete('/:id', authenticate, authorize(['author', 'admin']), deleteStory);

// Public routes
router.get('/published', getPublishedStories);
router.get('/tags', getTags);
router.get('/:id', getStory);

export default router;
