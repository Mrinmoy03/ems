import { Router } from "express";
import {
  getAllEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployeePassword,
} from "../controllers/employeeController";
import { authenticateToken } from "../middleware/auth";
import { isAdminOrSuperAdmin } from "../middleware/roleGuard";

const router = Router();

// Employee Listing (accessible by authenticated users)
router.get("/", authenticateToken, getAllEmployees);
router.get("/:id", authenticateToken, getEmployeeById);

// Employee Provisioning & Credential Management (Admin or Super Admin only)
router.post("/", authenticateToken, isAdminOrSuperAdmin, createEmployee);
router.put("/:id/password", authenticateToken, isAdminOrSuperAdmin, updateEmployeePassword);

export default router;

