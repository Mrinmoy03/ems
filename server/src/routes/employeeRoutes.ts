import { Router } from "express";
import {
  getAllEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  updateEmployeeAvatar,
  updateEmployeePassword,
} from "../controllers/employeeController";
import { authenticateToken } from "../middleware/auth";
import { isAdminOrSuperAdmin } from "../middleware/roleGuard";

const router = Router();

// Employee Listing (accessible by authenticated users)
router.get("/", authenticateToken, getAllEmployees);
router.get("/:id", authenticateToken, getEmployeeById);

// Employee Profile & Avatar Update (Self or Admin)
router.put("/:id/avatar", authenticateToken, updateEmployeeAvatar);
router.put("/:id", authenticateToken, updateEmployee);

// Employee Provisioning & Credential Management (Admin or Super Admin only)
router.post("/", authenticateToken, isAdminOrSuperAdmin, createEmployee);
router.put("/:id/password", authenticateToken, isAdminOrSuperAdmin, updateEmployeePassword);

export default router;

