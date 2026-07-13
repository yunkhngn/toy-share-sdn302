import { Router } from "express";
import { requireAuth } from "../middlewares/auth.middleware.js";
import { register, login, getMe, updateMe } from "../controllers/auth.controller.js";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.get("/me", requireAuth, getMe);
router.put("/me", requireAuth, updateMe);

export default router;
