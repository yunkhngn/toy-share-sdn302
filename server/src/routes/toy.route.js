import { Router } from "express";
import { requireAuth } from "../middlewares/auth.middleware.js";
import { uploadToyImages } from "../middlewares/upload.middleware.js";
import {
  listToys,
  getToyById,
  listMyToys,
  createToy,
  updateToy,
  deleteToy,
} from "../controllers/toy.controller.js";

const router = Router();

router.get("/mine", requireAuth, listMyToys);
router.get("/", listToys);
router.get("/:id", getToyById);
router.post("/", requireAuth, uploadToyImages, createToy);
router.put("/:id", requireAuth, uploadToyImages, updateToy);
router.delete("/:id", requireAuth, deleteToy);

export default router;
