import { Response } from "express";
import pool from "../config/db";
import { AuthenticatedRequest } from "../middleware/auth";

const generateId = (prefix: string) => `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 7)}`;

export interface NotificationPayload {
  userId?: string | null;
  roleTarget?: "all" | "admin" | "super-admin" | "employee";
  title: string;
  message: string;
  type?: "task" | "leave" | "attendance" | "report" | "system";
  entityId?: string | null;
}

// In-memory fallback notifications store when MySQL is offline
let memoryNotifications: any[] = [];

/**
 * Reusable server-side helper to record notification alerts across controllers.
 */
export async function createNotificationInternal(payload: NotificationPayload): Promise<string> {
  const notifId = generateId("notif");
  const {
    userId = null,
    roleTarget = "all",
    title,
    message,
    type = "system",
    entityId = null,
  } = payload;

  const newRecord = {
    id: notifId,
    user_id: userId,
    role_target: roleTarget,
    title,
    message,
    type,
    entity_id: entityId,
    is_read: 0,
    created_at: new Date().toISOString(),
  };

  try {
    await pool.query(
      `INSERT INTO notifications (id, user_id, role_target, title, message, type, entity_id, is_read)
       VALUES (?, ?, ?, ?, ?, ?, ?, FALSE)`,
      [notifId, userId, roleTarget, title, message, type, entityId]
    );
  } catch (err: any) {
    console.warn("Notice: storing notification in-memory fallback:", err.message);
    memoryNotifications.unshift(newRecord);
  }

  return notifId;
}

export const getNotifications = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const user = req.user;
    if (!user) {
      res.status(401).json({ success: false, message: "Unauthorized." });
      return;
    }

    try {
      let query = "";
      const params: any[] = [];

      if (user.role === "super-admin") {
        query = `
          SELECT * FROM notifications
          WHERE user_id = ? OR role_target IN ('all', 'admin', 'super-admin')
          ORDER BY created_at DESC LIMIT 50
        `;
        params.push(user.id);
      } else if (user.role === "admin") {
        query = `
          SELECT * FROM notifications
          WHERE user_id = ? OR role_target IN ('all', 'admin')
          ORDER BY created_at DESC LIMIT 50
        `;
        params.push(user.id);
      } else {
        // Employee
        query = `
          SELECT * FROM notifications
          WHERE user_id = ? OR (role_target = 'employee' AND user_id IS NULL) OR role_target = 'all'
          ORDER BY created_at DESC LIMIT 50
        `;
        params.push(user.id);
      }

      const [rows]: any = await pool.query(query, params);
      const notifications = rows || [];
      const unreadCount = notifications.filter((n: any) => !n.is_read).length;

      res.status(200).json({
        success: true,
        notifications,
        unreadCount,
      });
      return;
    } catch (dbErr: any) {
      // Offline fallback from memory store
      const userRole = user.role;
      const filtered = memoryNotifications.filter((n) => {
        if (userRole === "super-admin") return n.user_id === user.id || ["all", "admin", "super-admin"].includes(n.role_target);
        if (userRole === "admin") return n.user_id === user.id || ["all", "admin"].includes(n.role_target);
        return n.user_id === user.id || n.role_target === "employee" || n.role_target === "all";
      });

      const unreadCount = filtered.filter((n) => !n.is_read).length;
      res.status(200).json({
        success: true,
        notifications: filtered,
        unreadCount,
      });
    }
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const markNotificationRead = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    try {
      await pool.query("UPDATE notifications SET is_read = TRUE WHERE id = ?", [id]);
    } catch {
      const target = memoryNotifications.find((n) => n.id === id);
      if (target) target.is_read = 1;
    }

    res.status(200).json({
      success: true,
      message: "Notification marked as read.",
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const markAllNotificationsRead = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const user = req.user;
    if (!user) {
      res.status(401).json({ success: false, message: "Unauthorized." });
      return;
    }

    try {
      if (user.role === "super-admin" || user.role === "admin") {
        await pool.query(
          "UPDATE notifications SET is_read = TRUE WHERE user_id = ? OR role_target IN ('all', 'admin', 'super-admin')",
          [user.id]
        );
      } else {
        await pool.query(
          "UPDATE notifications SET is_read = TRUE WHERE user_id = ? OR role_target = 'employee' OR role_target = 'all'",
          [user.id]
        );
      }
    } catch {
      memoryNotifications.forEach((n) => {
        n.is_read = 1;
      });
    }

    res.status(200).json({
      success: true,
      message: "All notifications marked as read.",
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createNotification = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { userId, roleTarget, title, message, type, entityId } = req.body;

    if (!title || !message) {
      res.status(400).json({ success: false, message: "Title and message are required." });
      return;
    }

    const notificationId = await createNotificationInternal({
      userId,
      roleTarget,
      title,
      message,
      type,
      entityId,
    });

    res.status(201).json({
      success: true,
      message: "Notification created successfully.",
      notificationId,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

