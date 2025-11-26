"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const favoriteController_1 = require("../controllers/favoriteController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.post('/story/:storyId', auth_1.authenticate, favoriteController_1.toggleFavorite);
router.get('/story/:storyId', auth_1.authenticate, favoriteController_1.checkFavorite);
router.get('/me', auth_1.authenticate, favoriteController_1.getFavorites);
exports.default = router;
//# sourceMappingURL=favoriteRoutes.js.map