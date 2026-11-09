import { Router } from "express";
import authRoutes from "./authRoutes";
import employeeRoutes from "./employeeRoutes";
import projectRoutes from "./projectRoutes";
import taskRoutes from "./taskRoutes";
import attendanceRoutes from "./attendanceRoutes";
import leaveRoutes from "./leaveRoutes";
import reportRoutes from "./reportRoutes";
import departmentRoutes from "./departmentRoutes";
import notificationRoutes from "./notificationRoutes";

const router = Router();

router.use("/auth", authRoutes);
router.use("/employees", employeeRoutes);
router.use("/projects", projectRoutes);
router.use("/tasks", taskRoutes);
router.use("/attendance", attendanceRoutes);
router.use("/leave", leaveRoutes);
router.use("/reports", reportRoutes);
router.use("/departments", departmentRoutes);
router.use("/notifications", notificationRoutes);

export default router;

