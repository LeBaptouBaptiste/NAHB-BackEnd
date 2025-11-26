"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const ratingController_1 = require("../controllers/ratingController");
const router = (0, express_1.Router)();
// Public: Get ratings for a story
router.get('/story/:storyId', ratingController_1.getStoryRatings);
// Protected: Rate a story
router.post('/story/:storyId', auth_1.authenticate, ratingController_1.rateStory);
// Protected: Get user's rating for a story
router.get('/story/:storyId/me', auth_1.authenticate, ratingController_1.getUserRating);
// Protected: Delete user's rating
router.delete('/story/:storyId', auth_1.authenticate, ratingController_1.deleteRating);
exports.default = router;
//# sourceMappingURL=ratingRoutes.js.map