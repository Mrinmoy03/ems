import { Router } from "express";
import {
  getAllLeaves,
  applyLeave,
  decideLeaveRequest,
} from "../controllers/leaveController";
import { authenticateToken } from "../middleware/auth";
import { isSuperAdmin } from "../middleware/roleGuard";

const router = Router();

router.get("/", authenticateToken, getAllLeaves);
router.post("/", authenticateToken, applyLeave);

// EXCLUSIVE SUPER ADMIN ENDPOINT
router.put("/:id/decision", authenticateToken, isSuperAdmin, decideLeaveRequest);

export default router;

