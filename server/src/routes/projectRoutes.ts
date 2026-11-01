import { Router } from "express";
import {
  getAllProjects,
  getProjectById,
  createProject,
  updateProjectPartProgress,
} from "../controllers/projectController";
import { authenticateToken } from "../middleware/auth";
import { isAdminOrSuperAdmin } from "../middleware/roleGuard";

const router = Router();

router.get("/", authenticateToken, getAllProjects);
router.get("/:id", authenticateToken, getProjectById);
router.post("/", authenticateToken, isAdminOrSuperAdmin, createProject);
router.patch("/parts/:partId/progress", authenticateToken, updateProjectPartProgress);

export default router;

