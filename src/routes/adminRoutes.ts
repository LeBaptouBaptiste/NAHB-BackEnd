import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import {
    requireAdmin,
    getAllUsers,
    toggleUserBan,
    toggleStorySuspension,
    getAllReports,
    updateReportStatus,
    getPlatformStats,
    getAllStories,
} from '../controllers/adminController';

const router = Router();

// All admin routes require authentication and admin role
router.use(authenticate);
router.use(requireAdmin);

// User management
router.get('/users', getAllUsers);
router.patch('/users/:userId/ban', toggleUserBan);

// Story management
router.get('/stories', getAllStories);
router.patch('/stories/:storyId/suspend', toggleStorySuspension);

// Report management
router.get('/reports', getAllReports);
router.patch('/reports/:reportId', updateReportStatus);

// Platform statistics
router.get('/stats', getPlatformStats);

export default router;

