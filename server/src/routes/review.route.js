import { Router } from "express";
import { requireAuth } from "../middlewares/auth.middleware.js";
import { createReview, listReviewsByToy } from "../controllers/review.controller.js";

const router = Router();

router.post("/", requireAuth, createReview);
router.get("/toy/:toyId", listReviewsByToy);

export default router;
