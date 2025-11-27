import { Router } from "express";
import { register, login, getMe } from "../controllers/authController";
import { authenticate } from "../middleware/auth";
import { createRateLimiter } from "../middleware/rateLimiter";

const router = Router();

const authLimiter = createRateLimiter({
	windowMs: 10 * 60 * 1000,
	max: 10,
	message: "Too many authentication attempts, please try again later.",
});

router.post("/register", authLimiter, register);
router.post("/login", authLimiter, login);
router.get("/me", authenticate, getMe);

export default router;
