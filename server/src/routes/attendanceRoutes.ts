import { Router } from "express";
import {
  getAttendance,
  punchIn,
  punchOut,
} from "../controllers/attendanceController";
import { authenticateToken } from "../middleware/auth";

const router = Router();

router.get("/", authenticateToken, getAttendance);
router.post("/punch-in", authenticateToken, punchIn);
router.post("/punch-out", authenticateToken, punchOut);

export default router;

