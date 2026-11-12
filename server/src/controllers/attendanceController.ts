import { Request, Response } from "express";
import pool from "../config/db";
import { syncAttendanceToEodReports } from "./reportController";
import { createNotificationInternal } from "./notificationController";

const generateId = (prefix: string) => `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 7)}`;

export const getAttendance = async (req: Request, res: Response): Promise<void> => {
  try {
    const { employeeId, date, month, year } = req.query;

    let query = `
      SELECT a.id,
             a.employee_id,
             CAST(a.date AS CHAR) as date,
             a.punch_in,
             a.punch_out,
             a.total_duration_seconds,
             a.status,
             a.created_at,
             a.updated_at,
             e.first_name,
             e.last_name,
             e.employee_id as emp_code,
             d.name as department_name
      FROM attendance a
      JOIN employees e ON a.employee_id = e.id
      LEFT JOIN departments d ON e.department_id = d.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (employeeId) {
      query += ` AND (a.employee_id = ? OR e.employee_id = ?)`;
      params.push(employeeId, employeeId);
    }
    if (date) {
      query += ` AND a.date = ?`;
      params.push(date);
    }
    if (month && year) {
      query += ` AND MONTH(a.date) = ? AND YEAR(a.date) = ?`;
      params.push(month, year);
    }

    query += ` ORDER BY a.date DESC`;

    const [rows]: any = await pool.query(query, params);

    res.status(200).json({
      success: true,
      attendance: rows || [],
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const punchIn = async (req: Request, res: Response): Promise<void> => {
  try {
    const rawEmpId = req.body?.employeeId || (req as any).user?.employeeId || (req as any).user?.id;
    if (!rawEmpId) {
      res.status(400).json({ success: false, message: "Employee identifier is required." });
      return;
    }

    const today = new Date().toISOString().split("T")[0];
    const now = new Date();

    // 1. Resolve employee primary key from employees table
    const [empRows]: any = await pool.query(
      `SELECT id, employee_id, first_name, last_name FROM employees 
       WHERE id = ? OR employee_id = ? OR user_id = ?`,
      [rawEmpId, rawEmpId, rawEmpId]
    );

    if (!empRows || empRows.length === 0) {
      if (rawEmpId.startsWith("ADM") || rawEmpId.startsWith("SA") || (req as any).user?.role === "admin" || (req as any).user?.role === "super-admin") {
        res.status(200).json({ success: true, message: "Administrative role bypass: shift attendance tracking is not required for management." });
        return;
      }
      res.status(404).json({ success: false, message: `Employee record not found for: ${rawEmpId}` });
      return;
    }

    const resolvedEmp = empRows[0];
    const empDbId = resolvedEmp.id;

    // 2. Check existing attendance for today
    const [existing]: any = await pool.query(
      "SELECT id, punch_in, punch_out, status FROM attendance WHERE employee_id = ? AND (date = CURDATE() OR date = ?)",
      [empDbId, today]
    );

    if (existing && existing.length > 0 && existing[0].punch_in) {
      res.status(200).json({
        success: true,
        message: "Shift already clocked in.",
        punchInTime: existing[0].punch_in,
        attendanceId: existing[0].id,
      });
      return;
    }

    const attendanceId = generateId("att");

    await pool.query(
      `INSERT INTO attendance (id, employee_id, date, punch_in, status)
       VALUES (?, ?, CURDATE(), ?, 'present')
       ON DUPLICATE KEY UPDATE punch_in = COALESCE(punch_in, VALUES(punch_in)), status = 'present'`,
      [attendanceId, empDbId, now]
    );

    // Notify admins
    try {
      await createNotificationInternal({
        roleTarget: "admin",
        title: "Attendance Check-In",
        message: `${resolvedEmp.first_name} ${resolvedEmp.last_name} (${resolvedEmp.employee_id}) clocked into shift at ${now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}.`,
        type: "attendance",
        entityId: attendanceId,
      });
    } catch (err: any) {
      console.warn("Notice: could not dispatch attendance notification:", err.message);
    }

    res.status(200).json({
      success: true,
      message: "Shift started. Punched in successfully at " + now.toLocaleTimeString(),
      punchInTime: now.toISOString(),
      attendanceId,
    });
  } catch (error: any) {
    console.error("Error in punchIn:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const punchOut = async (req: Request, res: Response): Promise<void> => {
  try {
    const rawEmpId = req.body?.employeeId || (req as any).user?.employeeId || (req as any).user?.id;
    if (!rawEmpId) {
      res.status(400).json({ success: false, message: "Employee identifier is required." });
      return;
    }

    const today = new Date().toISOString().split("T")[0];
    const now = new Date();

    const [empRows]: any = await pool.query(
      `SELECT id, employee_id FROM employees 
       WHERE id = ? OR employee_id = ? OR user_id = ?`,
      [rawEmpId, rawEmpId, rawEmpId]
    );

    if (!empRows || empRows.length === 0) {
      if (rawEmpId.startsWith("ADM") || rawEmpId.startsWith("SA") || (req as any).user?.role === "admin" || (req as any).user?.role === "super-admin") {
        res.status(200).json({ success: true, message: "Administrative role bypass: shift attendance tracking is not required for management." });
        return;
      }
      res.status(404).json({ success: false, message: "Employee not found." });
      return;
    }

    const empDbId = empRows[0].id;

    const [existing]: any = await pool.query(
      "SELECT id, punch_in FROM attendance WHERE employee_id = ? AND (date = CURDATE() OR date = ?)",
      [empDbId, today]
    );

    if (!existing || existing.length === 0 || !existing[0].punch_in) {
      res.status(400).json({
        success: false,
        message: "No active punch-in found for today.",
      });
      return;
    }

    const punchInDate = new Date(existing[0].punch_in);
    const durationSeconds = Math.max(0, Math.floor((now.getTime() - punchInDate.getTime()) / 1000));

    await pool.query(
      `UPDATE attendance
       SET punch_out = ?, total_duration_seconds = ?
       WHERE id = ?`,
      [now, durationSeconds, existing[0].id]
    );

    // Auto-sync completed shift to eod_reports
    try {
      await syncAttendanceToEodReports(empDbId);
    } catch {}

    res.status(200).json({
      success: true,
      message: "Shift concluded. Punched out successfully at " + now.toLocaleTimeString(),
      punchOutTime: now.toISOString(),
      durationSeconds,
    });
  } catch (error: any) {
    console.error("Error in punchOut:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

