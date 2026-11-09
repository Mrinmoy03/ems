import { Router } from "express";
import {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  createNotification,
} from "../controllers/notificationController";
import { authenticateToken } from "../middleware/auth";

const router = Router();

router.get("/", authenticateToken, getNotifications);
router.patch("/read-all", authenticateToken, markAllNotificationsRead);
router.patch("/:id/read", authenticateToken, markNotificationRead);
router.post("/", authenticateToken, createNotification);

export default router;

