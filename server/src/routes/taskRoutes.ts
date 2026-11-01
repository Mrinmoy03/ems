import { Router } from "express";
import {
  getAllTasks,
  createTask,
  updateTaskProgress,
} from "../controllers/taskController";
import { authenticateToken } from "../middleware/auth";

const router = Router();

router.get("/", authenticateToken, getAllTasks);
router.post("/", authenticateToken, createTask);
router.patch("/:id/progress", authenticateToken, updateTaskProgress);

export default router;

