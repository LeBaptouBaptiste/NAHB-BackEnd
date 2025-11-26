"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const uploadController_1 = require("../controllers/uploadController");
const upload_1 = require("../middleware/upload");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.post('/', auth_1.authenticate, upload_1.upload.single('image'), uploadController_1.uploadImage);
exports.default = router;
//# sourceMappingURL=uploadRoutes.js.map