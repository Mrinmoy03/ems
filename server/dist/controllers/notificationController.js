"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createNotification = exports.markAllNotificationsRead = exports.markNotificationRead = exports.getNotifications = void 0;
exports.createNotificationInternal = createNotificationInternal;
const db_1 = __importDefault(require("../config/db"));
const generateId = (prefix) => `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 7)}`;
// In-memory fallback notifications store when MySQL is offline
let memoryNotifications = [];
/**
 * Reusable server-side helper to record notification alerts across controllers.
 */
async function createNotificationInternal(payload) {
    const notifId = generateId("notif");
    const { userId = null, roleTarget = "all", title, message, type = "system", entityId = null, } = payload;
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
        await db_1.default.query(`INSERT INTO notifications (id, user_id, role_target, title, message, type, entity_id, is_read)
       VALUES (?, ?, ?, ?, ?, ?, ?, FALSE)`, [notifId, userId, roleTarget, title, message, type, entityId]);
    }
    catch (err) {
        console.warn("Notice: storing notification in-memory fallback:", err.message);
        memoryNotifications.unshift(newRecord);
    }
    return notifId;
}
const getNotifications = async (req, res) => {
    try {
        const user = req.user;
        if (!user) {
            res.status(401).json({ success: false, message: "Unauthorized." });
            return;
        }
        try {
            let query = "";
            const params = [];
            if (user.role === "super-admin") {
                query = `
          SELECT * FROM notifications
          WHERE user_id = ? OR role_target IN ('all', 'admin', 'super-admin')
          ORDER BY created_at DESC LIMIT 50
        `;
                params.push(user.id);
            }
            else if (user.role === "admin") {
                query = `
          SELECT * FROM notifications
          WHERE user_id = ? OR role_target IN ('all', 'admin')
          ORDER BY created_at DESC LIMIT 50
        `;
                params.push(user.id);
            }
            else {
                // Employee
                query = `
          SELECT * FROM notifications
          WHERE user_id = ? OR (role_target = 'employee' AND user_id IS NULL) OR role_target = 'all'
          ORDER BY created_at DESC LIMIT 50
        `;
                params.push(user.id);
            }
            const [rows] = await db_1.default.query(query, params);
            const notifications = rows || [];
            const unreadCount = notifications.filter((n) => !n.is_read).length;
            res.status(200).json({
                success: true,
                notifications,
                unreadCount,
            });
            return;
        }
        catch (dbErr) {
            // Offline fallback from memory store
            const userRole = user.role;
            const filtered = memoryNotifications.filter((n) => {
                if (userRole === "super-admin")
                    return n.user_id === user.id || ["all", "admin", "super-admin"].includes(n.role_target);
                if (userRole === "admin")
                    return n.user_id === user.id || ["all", "admin"].includes(n.role_target);
                return n.user_id === user.id || n.role_target === "employee" || n.role_target === "all";
            });
            const unreadCount = filtered.filter((n) => !n.is_read).length;
            res.status(200).json({
                success: true,
                notifications: filtered,
                unreadCount,
            });
        }
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.getNotifications = getNotifications;
const markNotificationRead = async (req, res) => {
    try {
        const { id } = req.params;
        try {
            await db_1.default.query("UPDATE notifications SET is_read = TRUE WHERE id = ?", [id]);
        }
        catch {
            const target = memoryNotifications.find((n) => n.id === id);
            if (target)
                target.is_read = 1;
        }
        res.status(200).json({
            success: true,
            message: "Notification marked as read.",
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.markNotificationRead = markNotificationRead;
const markAllNotificationsRead = async (req, res) => {
    try {
        const user = req.user;
        if (!user) {
            res.status(401).json({ success: false, message: "Unauthorized." });
            return;
        }
        try {
            if (user.role === "super-admin" || user.role === "admin") {
                await db_1.default.query("UPDATE notifications SET is_read = TRUE WHERE user_id = ? OR role_target IN ('all', 'admin', 'super-admin')", [user.id]);
            }
            else {
                await db_1.default.query("UPDATE notifications SET is_read = TRUE WHERE user_id = ? OR role_target = 'employee' OR role_target = 'all'", [user.id]);
            }
        }
        catch {
            memoryNotifications.forEach((n) => {
                n.is_read = 1;
            });
        }
        res.status(200).json({
            success: true,
            message: "All notifications marked as read.",
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.markAllNotificationsRead = markAllNotificationsRead;
const createNotification = async (req, res) => {
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
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.createNotification = createNotification;
