import { Request, Response } from "express";
import pool from "../config/db";
import { AuthenticatedRequest } from "../middleware/auth";

const generateId = (prefix: string) => `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 7)}`;

export const getAllLeaves = async (req: Request, res: Response): Promise<void> => {
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
    const params: any[] = [];

    if (employeeId) {
      query += ` AND (l.employee_id = ? OR e.employee_id = ?)`;
      params.push(employeeId, employeeId);
    }
    if (status) {
      query += ` AND l.status = ?`;
      params.push(status);
    }

    query += ` ORDER BY l.created_at DESC`;

    const [rows]: any = await pool.query(query, params);

    res.status(200).json({
      success: true,
      leaves: rows || [],
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const applyLeave = async (req: Request, res: Response): Promise<void> => {
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

    await pool.query(
      `INSERT INTO leave_requests (id, employee_id, leave_type, start_date, end_date, reason, status)
       VALUES (?, ?, ?, ?, ?, ?, 'pending')`,
      [leaveId, employeeId, leaveType, startDate, endDate, reason.trim()]
    );

    res.status(201).json({
      success: true,
      message: "Leave request submitted successfully. Awaiting Super Admin review.",
      leaveId,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// EXCLUSIVE SUPER ADMIN ENDPOINT
export const decideLeaveRequest = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
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

    const [result]: any = await pool.query(
      `UPDATE leave_requests
       SET status = ?, super_admin_remarks = ?, decision_by = ?, decision_at = NOW()
       WHERE id = ?`,
      [decision, remarks || null, superAdminUserId, id]
    );

    if (result.affectedRows === 0) {
      res.status(404).json({ success: false, message: "Leave request record not found." });
      return;
    }

    res.status(200).json({
      success: true,
      message: `Leave request marked as ${decision.toUpperCase()} by Super Admin authority.`,
      status: decision,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

