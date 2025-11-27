import { Router } from "express";
import {
	toggleFavorite,
	checkFavorite,
	getFavorites,
} from "../controllers/favoriteController";
import { authenticate } from "../middleware/auth";

const router = Router();

router.post("/story/:storyId", authenticate, toggleFavorite);
router.get("/story/:storyId", authenticate, checkFavorite);
router.get("/me", authenticate, getFavorites);

export default router;
