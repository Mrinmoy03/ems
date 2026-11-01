"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const leaveController_1 = require("../controllers/leaveController");
const auth_1 = require("../middleware/auth");
const roleGuard_1 = require("../middleware/roleGuard");
const router = (0, express_1.Router)();
router.get("/", auth_1.authenticateToken, leaveController_1.getAllLeaves);
router.post("/", auth_1.authenticateToken, leaveController_1.applyLeave);
// EXCLUSIVE SUPER ADMIN ENDPOINT
router.put("/:id/decision", auth_1.authenticateToken, roleGuard_1.isSuperAdmin, leaveController_1.decideLeaveRequest);
exports.default = router;
