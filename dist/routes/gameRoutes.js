"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const gameController_1 = require("../controllers/gameController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.post('/start', auth_1.authenticate, gameController_1.startGame);
router.post('/choice', auth_1.authenticate, gameController_1.makeChoice);
router.get('/sessions', auth_1.authenticate, gameController_1.getSessions);
router.get('/session/:id', auth_1.authenticate, gameController_1.getSession);
exports.default = router;
//# sourceMappingURL=gameRoutes.js.map