"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const reportController_1 = require("../controllers/reportController");
const router = (0, express_1.Router)();
// Protected: Report a story
router.post('/story/:storyId', auth_1.authenticate, reportController_1.reportStory);
// Protected: Get user's reports
router.get('/my-reports', auth_1.authenticate, reportController_1.getMyReports);
exports.default = router;
//# sourceMappingURL=reportRoutes.js.map