"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const pageController_1 = require("../controllers/pageController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// Author routes (protected)
router.post('/', auth_1.authenticate, (0, auth_1.authorize)(['author', 'admin']), pageController_1.createPage);
router.put('/:id', auth_1.authenticate, (0, auth_1.authorize)(['author', 'admin']), pageController_1.updatePage);
router.delete('/:id', auth_1.authenticate, (0, auth_1.authorize)(['author', 'admin']), pageController_1.deletePage);
router.post('/set-start', auth_1.authenticate, (0, auth_1.authorize)(['author', 'admin']), pageController_1.setStartPage);
// Public routes
router.get('/story/:storyId', pageController_1.getPagesByStory);
router.get('/:id', pageController_1.getPage);
exports.default = router;
//# sourceMappingURL=pageRoutes.js.map