import { Router } from "express";
import { getUserStats } from "../controllers/userController";
import { authenticate } from "../middleware/auth";

const router = Router();

router.get("/stats", authenticate, getUserStats);

export default router;
