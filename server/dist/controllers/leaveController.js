"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.decideLeaveRequest = exports.applyLeave = exports.getAllLeaves = void 0;
const db_1 = __importDefault(require("../config/db"));
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
            query += ` AND (l.employee_id = ? OR e.employee_id = ?)`;
            params.push(employeeId, employeeId);
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
        const leaveId = generateId("lv");
        await db_1.default.query(`INSERT INTO leave_requests (id, employee_id, leave_type, start_date, end_date, reason, status)
       VALUES (?, ?, ?, ?, ?, ?, 'pending')`, [leaveId, employeeId, leaveType, startDate, endDate, reason.trim()]);
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
