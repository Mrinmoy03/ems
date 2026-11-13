"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.punchOut = exports.punchIn = exports.getAttendance = void 0;
const db_1 = __importDefault(require("../config/db"));
const reportController_1 = require("./reportController");
const notificationController_1 = require("./notificationController");
const generateId = (prefix) => `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 7)}`;
const getAttendance = async (req, res) => {
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
        const params = [];
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
        const [rows] = await db_1.default.query(query, params);
        res.status(200).json({
            success: true,
            attendance: rows || [],
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.getAttendance = getAttendance;
const punchIn = async (req, res) => {
    try {
        const rawEmpId = req.body?.employeeId || req.user?.employeeId || req.user?.id;
        if (!rawEmpId) {
            res.status(400).json({ success: false, message: "Employee identifier is required." });
            return;
        }
        const today = new Date().toISOString().split("T")[0];
        const now = new Date();
        // 1. Resolve employee primary key from employees table
        const [empRows] = await db_1.default.query(`SELECT id, employee_id, first_name, last_name FROM employees 
       WHERE id = ? OR employee_id = ? OR user_id = ?`, [rawEmpId, rawEmpId, rawEmpId]);
        if (!empRows || empRows.length === 0) {
            if (rawEmpId.startsWith("ADM") || rawEmpId.startsWith("SA") || req.user?.role === "admin" || req.user?.role === "super-admin") {
                res.status(200).json({ success: true, message: "Administrative role bypass: shift attendance tracking is not required for management." });
                return;
            }
            res.status(404).json({ success: false, message: `Employee record not found for: ${rawEmpId}` });
            return;
        }
        const resolvedEmp = empRows[0];
        const empDbId = resolvedEmp.id;
        // 2. Check existing attendance for today
        const [existing] = await db_1.default.query("SELECT id, punch_in, punch_out, status FROM attendance WHERE employee_id = ? AND (date = CURDATE() OR date = ?)", [empDbId, today]);
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
        await db_1.default.query(`INSERT INTO attendance (id, employee_id, date, punch_in, status)
       VALUES (?, ?, CURDATE(), ?, 'present')
       ON DUPLICATE KEY UPDATE punch_in = COALESCE(punch_in, VALUES(punch_in)), status = 'present'`, [attendanceId, empDbId, now]);
        // Notify admins
        try {
            await (0, notificationController_1.createNotificationInternal)({
                roleTarget: "admin",
                title: "Attendance Check-In",
                message: `${resolvedEmp.first_name} ${resolvedEmp.last_name} (${resolvedEmp.employee_id}) clocked into shift at ${now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}.`,
                type: "attendance",
                entityId: attendanceId,
            });
        }
        catch (err) {
            console.warn("Notice: could not dispatch attendance notification:", err.message);
        }
        res.status(200).json({
            success: true,
            message: "Shift started. Punched in successfully at " + now.toLocaleTimeString(),
            punchInTime: now.toISOString(),
            attendanceId,
        });
    }
    catch (error) {
        console.error("Error in punchIn:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.punchIn = punchIn;
const punchOut = async (req, res) => {
    try {
        const rawEmpId = req.body?.employeeId || req.user?.employeeId || req.user?.id;
        if (!rawEmpId) {
            res.status(400).json({ success: false, message: "Employee identifier is required." });
            return;
        }
        const today = new Date().toISOString().split("T")[0];
        const now = new Date();
        const [empRows] = await db_1.default.query(`SELECT id, employee_id FROM employees 
       WHERE id = ? OR employee_id = ? OR user_id = ?`, [rawEmpId, rawEmpId, rawEmpId]);
        if (!empRows || empRows.length === 0) {
            if (rawEmpId.startsWith("ADM") || rawEmpId.startsWith("SA") || req.user?.role === "admin" || req.user?.role === "super-admin") {
                res.status(200).json({ success: true, message: "Administrative role bypass: shift attendance tracking is not required for management." });
                return;
            }
            res.status(404).json({ success: false, message: "Employee not found." });
            return;
        }
        const empDbId = empRows[0].id;
        const [existing] = await db_1.default.query("SELECT id, punch_in FROM attendance WHERE employee_id = ? AND (date = CURDATE() OR date = ?)", [empDbId, today]);
        if (!existing || existing.length === 0 || !existing[0].punch_in) {
            res.status(400).json({
                success: false,
                message: "No active punch-in found for today.",
            });
            return;
        }
        const lunchBreakSeconds = Number(req.body?.lunchBreakSeconds ?? req.body?.breakSeconds) || 0;
        const providedTotalDuration = Number(req.body?.totalDurationSeconds) || 0;
        const punchInDate = new Date(existing[0].punch_in);
        const grossSeconds = Math.max(0, Math.floor((now.getTime() - punchInDate.getTime()) / 1000));
        // Active work timer duration is preserved without false re-deductions
        const durationSeconds = providedTotalDuration > 0
            ? providedTotalDuration
            : Math.max(0, grossSeconds - lunchBreakSeconds);
        await db_1.default.query(`UPDATE attendance
       SET punch_out = ?, total_duration_seconds = ?, lunch_break_seconds = GREATEST(COALESCE(lunch_break_seconds, 0), ?)
       WHERE id = ?`, [now, durationSeconds, lunchBreakSeconds, existing[0].id]);
        // Auto-sync completed shift to eod_reports
        try {
            await (0, reportController_1.syncAttendanceToEodReports)(empDbId);
        }
        catch { }
        res.status(200).json({
            success: true,
            message: "Shift concluded. Punched out successfully at " + now.toLocaleTimeString(),
            punchOutTime: now.toISOString(),
            durationSeconds,
        });
    }
    catch (error) {
        console.error("Error in punchOut:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.punchOut = punchOut;
