import { Router } from "express";
import {
  getAllDepartments,
  createDepartment,
} from "../controllers/departmentController";
import { authenticateToken } from "../middleware/auth";
import { isAdminOrSuperAdmin } from "../middleware/roleGuard";

const router = Router();

router.get("/", authenticateToken, getAllDepartments);
router.post("/", authenticateToken, isAdminOrSuperAdmin, createDepartment);

export default router;

