"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.decideLeaveRequest = exports.applyLeave = exports.getAllLeaves = void 0;
const db_1 = __importDefault(require("../config/db"));
const notificationController_1 = require("./notificationController");
const generateId = (prefix) => `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 7)}`;
const getAllLeaves = async (req, res) => {
    try {
        const { employeeId, status } = req.query;
        let query = `
      SELECT l.*,
             e.first_name, e.last_name, e.employee_id as emp_code,
             d.name as department_name,
             u.email as approver_email
      FROM leave_requests l
      JOIN employees e ON l.employee_id = e.id
      LEFT JOIN departments d ON e.department_id = d.id
      LEFT JOIN users u ON l.decision_by = u.id
      WHERE 1=1
    `;
        const params = [];
        if (employeeId) {
            query += ` AND (l.employee_id = ? OR e.employee_id = ? OR e.user_id = ?)`;
            params.push(employeeId, employeeId, employeeId);
        }
        if (status) {
            query += ` AND l.status = ?`;
            params.push(status);
        }
        query += ` ORDER BY l.created_at DESC`;
        const [rows] = await db_1.default.query(query, params);
        res.status(200).json({
            success: true,
            leaves: rows || [],
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.getAllLeaves = getAllLeaves;
const applyLeave = async (req, res) => {
    try {
        const { employeeId, leaveType, startDate, endDate, reason } = req.body;
        if (!employeeId || !leaveType || !startDate || !endDate || !reason) {
            res.status(400).json({
                success: false,
                message: "Employee ID, leave type, start date, end date, and reason are required.",
            });
            return;
        }
        // Resolve employee database primary key
        const [empRows] = await db_1.default.query(`SELECT id, user_id, employee_id, first_name, last_name FROM employees 
       WHERE id = ? OR employee_id = ? OR user_id = ?`, [employeeId, employeeId, employeeId]);
        if (!empRows || empRows.length === 0) {
            res.status(404).json({ success: false, message: `Employee record not found for: ${employeeId}` });
            return;
        }
        const resolvedEmp = empRows[0];
        const leaveId = generateId("lv");
        await db_1.default.query(`INSERT INTO leave_requests (id, employee_id, leave_type, start_date, end_date, reason, status)
       VALUES (?, ?, ?, ?, ?, ?, 'pending')`, [leaveId, resolvedEmp.id, leaveType, startDate, endDate, reason.trim()]);
        // Auto-notify Super Admin
        try {
            await (0, notificationController_1.createNotificationInternal)({
                roleTarget: "super-admin",
                title: "Leave Request Submitted",
                message: `${resolvedEmp.first_name} ${resolvedEmp.last_name} (${resolvedEmp.employee_id}) applied for ${leaveType} (${startDate} to ${endDate}). Awaiting review.`,
                type: "leave",
                entityId: leaveId,
            });
        }
        catch (err) {
            console.warn("Notice: could not dispatch leave notification:", err.message);
        }
        res.status(201).json({
            success: true,
            message: "Leave request submitted successfully. Awaiting Super Admin review.",
            leaveId,
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.applyLeave = applyLeave;
// EXCLUSIVE SUPER ADMIN ENDPOINT
const decideLeaveRequest = async (req, res) => {
    try {
        const { id } = req.params;
        const { decision, remarks } = req.body; // 'approved' | 'rejected'
        if (!["approved", "rejected"].includes(decision)) {
            res.status(400).json({
                success: false,
                message: "Decision must be either 'approved' or 'rejected'.",
            });
            return;
        }
        const superAdminUserId = req.user?.id || "user-superadmin-01";
        const [result] = await db_1.default.query(`UPDATE leave_requests
       SET status = ?, super_admin_remarks = ?, decision_by = ?, decision_at = NOW()
       WHERE id = ?`, [decision, remarks || null, superAdminUserId, id]);
        if (result.affectedRows === 0) {
            res.status(404).json({ success: false, message: "Leave request record not found." });
            return;
        }
        // Auto-notify employee about Super Admin's decision
        try {
            const [empRows] = await db_1.default.query(`SELECT e.user_id, e.first_name, e.last_name, l.leave_type 
         FROM leave_requests l 
         JOIN employees e ON l.employee_id = e.id 
         WHERE l.id = ?`, [id]);
            const targetEmp = empRows?.[0];
            await (0, notificationController_1.createNotificationInternal)({
                userId: targetEmp?.user_id || null,
                roleTarget: "employee",
                title: `Leave Request ${decision.toUpperCase()}`,
                message: `Your leave request for ${targetEmp?.leave_type || "leave"} has been ${decision} by Super Admin.${remarks ? ` Remarks: ${remarks}` : ""}`,
                type: "leave",
                entityId: id,
            });
        }
        catch (err) {
            console.warn("Notice: could not dispatch leave decision notification:", err.message);
        }
        res.status(200).json({
            success: true,
            message: `Leave request marked as ${decision.toUpperCase()} by Super Admin authority.`,
            status: decision,
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.decideLeaveRequest = decideLeaveRequest;
