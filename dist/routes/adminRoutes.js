"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const adminController_1 = require("../controllers/adminController");
const router = (0, express_1.Router)();
// All admin routes require authentication and admin role
router.use(auth_1.authenticate);
router.use(adminController_1.requireAdmin);
// User management
router.get('/users', adminController_1.getAllUsers);
router.patch('/users/:userId/ban', adminController_1.toggleUserBan);
// Story management
router.get('/stories', adminController_1.getAllStories);
router.patch('/stories/:storyId/suspend', adminController_1.toggleStorySuspension);
// Report management
router.get('/reports', adminController_1.getAllReports);
router.patch('/reports/:reportId', adminController_1.updateReportStatus);
// Platform statistics
router.get('/stats', adminController_1.getPlatformStats);
exports.default = router;
//# sourceMappingURL=adminRoutes.js.map