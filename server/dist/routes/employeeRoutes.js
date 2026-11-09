"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const employeeController_1 = require("../controllers/employeeController");
const auth_1 = require("../middleware/auth");
const roleGuard_1 = require("../middleware/roleGuard");
const router = (0, express_1.Router)();
// Employee Listing (accessible by authenticated users)
router.get("/", auth_1.authenticateToken, employeeController_1.getAllEmployees);
router.get("/:id", auth_1.authenticateToken, employeeController_1.getEmployeeById);
// Employee Provisioning & Credential Management (Admin or Super Admin only)
router.post("/", auth_1.authenticateToken, roleGuard_1.isAdminOrSuperAdmin, employeeController_1.createEmployee);
router.put("/:id", auth_1.authenticateToken, roleGuard_1.isAdminOrSuperAdmin, employeeController_1.updateEmployee);
router.put("/:id/password", auth_1.authenticateToken, roleGuard_1.isAdminOrSuperAdmin, employeeController_1.updateEmployeePassword);
exports.default = router;
