import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import {
    rateStory,
    getStoryRatings,
    getUserRating,
    deleteRating,
} from '../controllers/ratingController';

const router = Router();

// Public: Get ratings for a story
router.get('/story/:storyId', getStoryRatings);

// Protected: Rate a story
router.post('/story/:storyId', authenticate, rateStory);

// Protected: Get user's rating for a story
router.get('/story/:storyId/me', authenticate, getUserRating);

// Protected: Delete user's rating
router.delete('/story/:storyId', authenticate, deleteRating);

export default router;

