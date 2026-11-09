import { Router } from "express";
import {
  getAllTasks,
  createTask,
  updateTaskProgress,
  updateTaskDeadline,
  deleteTask,
} from "../controllers/taskController";
import { authenticateToken } from "../middleware/auth";

const router = Router();

router.get("/", authenticateToken, getAllTasks);
router.post("/", authenticateToken, createTask);
router.patch("/:id/progress", authenticateToken, updateTaskProgress);
router.patch("/:id/deadline", authenticateToken, updateTaskDeadline);
router.delete("/:id", authenticateToken, deleteTask);

export default router;

