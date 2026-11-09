import { Router } from "express";
import {
  getAllDepartments,
  createDepartment,
  updateDepartment,
  deleteDepartment,
  toggleArchiveDepartment,
} from "../controllers/departmentController";
import { authenticateToken } from "../middleware/auth";
import { isAdminOrSuperAdmin } from "../middleware/roleGuard";

const router = Router();

router.get("/", authenticateToken, getAllDepartments);
router.post("/", authenticateToken, isAdminOrSuperAdmin, createDepartment);
router.put("/:id", authenticateToken, isAdminOrSuperAdmin, updateDepartment);
router.patch("/:id/archive", authenticateToken, isAdminOrSuperAdmin, toggleArchiveDepartment);
router.delete("/:id", authenticateToken, isAdminOrSuperAdmin, deleteDepartment);

export default router;

