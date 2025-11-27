import { Router } from "express";
import {
	createPage,
	getPagesByStory,
	getPage,
	updatePage,
	deletePage,
	setStartPage,
} from "../controllers/pageController";
import { authenticate, authorize } from "../middleware/auth";

const router = Router();

// Author routes (protected)
router.post("/", authenticate, authorize(["author", "admin"]), createPage);
router.put("/:id", authenticate, authorize(["author", "admin"]), updatePage);
router.delete("/:id", authenticate, authorize(["author", "admin"]), deletePage);
router.post(
	"/set-start",
	authenticate,
	authorize(["author", "admin"]),
	setStartPage
);

// Public routes
router.get("/story/:storyId", getPagesByStory);
router.get("/:id", getPage);

export default router;
