import { Router } from "express";
import { requireAuth } from "../middlewares/auth.middleware.js";
import {
  createRequest,
  listBorrowed,
  listLent,
  approveRequest,
  rejectRequest,
  cancelRequest,
  reportReturn,
  confirmReturn,
} from "../controllers/request.controller.js";

const router = Router();

router.use(requireAuth);

router.post("/", createRequest);
router.get("/borrowed", listBorrowed);
router.get("/lent", listLent);
router.patch("/:id/approve", approveRequest);
router.patch("/:id/reject", rejectRequest);
router.patch("/:id/cancel", cancelRequest);
router.patch("/:id/return", reportReturn);
router.patch("/:id/confirm-return", confirmReturn);

export default router;
