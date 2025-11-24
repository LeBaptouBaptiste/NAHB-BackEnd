"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const storyController_1 = require("../controllers/storyController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// Author routes (protected)
router.post('/', auth_1.authenticate, (0, auth_1.authorize)(['author', 'admin']), storyController_1.createStory);
router.get('/my', auth_1.authenticate, (0, auth_1.authorize)(['author', 'admin']), storyController_1.getMyStories);
router.put('/:id', auth_1.authenticate, (0, auth_1.authorize)(['author', 'admin']), storyController_1.updateStory);
router.delete('/:id', auth_1.authenticate, (0, auth_1.authorize)(['author', 'admin']), storyController_1.deleteStory);
// Public routes
router.get('/published', storyController_1.getPublishedStories);
router.get('/:id', storyController_1.getStory);
exports.default = router;
//# sourceMappingURL=storyRoutes.js.map