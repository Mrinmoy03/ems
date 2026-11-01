"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.punchOut = exports.punchIn = exports.getAttendance = void 0;
const db_1 = __importDefault(require("../config/db"));
const generateId = (prefix) => `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 7)}`;
const getAttendance = async (req, res) => {
    try {
        const { employeeId, date, month, year } = req.query;
        let query = `
      SELECT a.*, e.first_name, e.last_name, e.employee_id as emp_code, d.name as department_name
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
        const { employeeId } = req.body;
        const today = new Date().toISOString().split("T")[0];
        const now = new Date();
        const [existing] = await db_1.default.query("SELECT id, punch_in FROM attendance WHERE employee_id = ? AND date = ?", [employeeId, today]);
        if (existing && existing.length > 0 && existing[0].punch_in) {
            res.status(400).json({
                success: false,
                message: "Already punched in for today's shift.",
            });
            return;
        }
        const attendanceId = generateId("att");
        await db_1.default.query(`INSERT INTO attendance (id, employee_id, date, punch_in, status)
       VALUES (?, ?, ?, ?, 'present')
       ON DUPLICATE KEY UPDATE punch_in = ?`, [attendanceId, employeeId, today, now, now]);
        res.status(200).json({
            success: true,
            message: "Shift started. Punched in successfully at " + now.toLocaleTimeString(),
            punchInTime: now.toISOString(),
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.punchIn = punchIn;
const punchOut = async (req, res) => {
    try {
        const { employeeId } = req.body;
        const today = new Date().toISOString().split("T")[0];
        const now = new Date();
        const [existing] = await db_1.default.query("SELECT id, punch_in FROM attendance WHERE employee_id = ? AND date = ?", [employeeId, today]);
        if (!existing || existing.length === 0 || !existing[0].punch_in) {
            res.status(400).json({
                success: false,
                message: "No active punch-in found for today.",
            });
            return;
        }
        const punchInDate = new Date(existing[0].punch_in);
        const durationSeconds = Math.max(0, Math.floor((now.getTime() - punchInDate.getTime()) / 1000));
        await db_1.default.query(`UPDATE attendance
       SET punch_out = ?, total_duration_seconds = ?
       WHERE id = ?`, [now, durationSeconds, existing[0].id]);
        res.status(200).json({
            success: true,
            message: "Shift concluded. Punched out successfully at " + now.toLocaleTimeString(),
            punchOutTime: now.toISOString(),
            durationSeconds,
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.punchOut = punchOut;
