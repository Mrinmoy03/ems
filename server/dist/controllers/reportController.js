"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.downloadEodPdf = exports.submitEodReport = exports.getEodReports = void 0;
const db_1 = __importDefault(require("../config/db"));
const pdfService_1 = require("../services/pdfService");
const generateId = (prefix) => `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 7)}`;
const getEodReports = async (req, res) => {
    try {
        const { employeeId, date, month, year, page = "1", limit = "10" } = req.query;
        const pageNum = parseInt(page, 10) || 1;
        const limitNum = parseInt(limit, 10) || 10;
        const offset = (pageNum - 1) * limitNum;
        let query = `
      SELECT r.*, e.first_name, e.last_name, e.employee_id as emp_code, e.designation, d.name as department_name
      FROM eod_reports r
      JOIN employees e ON r.employee_id = e.id
      LEFT JOIN departments d ON e.department_id = d.id
      WHERE 1=1
    `;
        const params = [];
        if (employeeId) {
            query += ` AND (r.employee_id = ? OR e.employee_id = ?)`;
            params.push(employeeId, employeeId);
        }
        if (date) {
            query += ` AND r.date = ?`;
            params.push(date);
        }
        if (month && year) {
            query += ` AND MONTH(r.date) = ? AND YEAR(r.date) = ?`;
            params.push(month, year);
        }
        // Count query
        const [countRows] = await db_1.default.query(query.replace(/SELECT r\.\*,.*?FROM/, "SELECT COUNT(*) as total FROM"), params);
        const total = countRows[0]?.total || 0;
        query += ` ORDER BY r.date DESC LIMIT ? OFFSET ?`;
        params.push(limitNum, offset);
        const [rows] = await db_1.default.query(query, params);
        res.status(200).json({
            success: true,
            reports: rows || [],
            pagination: {
                page: pageNum,
                limit: limitNum,
                total,
                totalPages: Math.ceil(total / limitNum) || 1,
            },
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.getEodReports = getEodReports;
const submitEodReport = async (req, res) => {
    try {
        const { employeeId, date, summary, tasksCompleted, challenges, nextDayPlan, hoursWorked } = req.body;
        if (!employeeId || !date || !summary) {
            res.status(400).json({
                success: false,
                message: "Employee ID, report date, and executive summary are required.",
            });
            return;
        }
        const reportId = generateId("eod");
        const tasksString = Array.isArray(tasksCompleted) ? tasksCompleted.join("\n") : (tasksCompleted || "");
        await db_1.default.query(`INSERT INTO eod_reports (id, employee_id, date, summary, tasks_completed, challenges, next_day_plan, hours_worked)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE summary = VALUES(summary), tasks_completed = VALUES(tasks_completed), challenges = VALUES(challenges), next_day_plan = VALUES(next_day_plan), hours_worked = VALUES(hours_worked)`, [
            reportId,
            employeeId,
            date,
            summary,
            tasksString,
            challenges || null,
            nextDayPlan || null,
            hoursWorked || 8.0,
        ]);
        res.status(201).json({
            success: true,
            message: "End-Of-Day report submitted successfully.",
            reportId,
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.submitEodReport = submitEodReport;
const downloadEodPdf = async (req, res) => {
    try {
        const { reportId, employeeId, date } = req.query;
        let query = `
      SELECT r.*, e.first_name, e.last_name, e.employee_id as emp_code, e.designation, d.name as department_name
      FROM eod_reports r
      JOIN employees e ON r.employee_id = e.id
      LEFT JOIN departments d ON e.department_id = d.id
      WHERE 1=1
    `;
        const params = [];
        if (reportId) {
            query += ` AND r.id = ?`;
            params.push(reportId);
        }
        else if (employeeId && date) {
            query += ` AND (r.employee_id = ? OR e.employee_id = ?) AND r.date = ?`;
            params.push(employeeId, employeeId, date);
        }
        else {
            // Fallback sample data for demo/export testing
            const sampleData = {
                employeeName: "Alex Morgan",
                employeeId: "VAMA-001",
                department: "Engineering",
                designation: "Senior Frontend Engineer",
                reportDate: date || new Date().toISOString().split("T")[0],
                hoursWorked: 8.5,
                tasksCompleted: [
                    "Delivered responsive Project Management integration with weighted progress calculation.",
                    "Implemented multi-role authentication with strict Super Admin leave approval authority.",
                    "Built universal data pagination and clean REST API endpoints for attendance & reports.",
                ],
                challenges: "Ensured backwards compatibility with mock store while database server connects.",
                nextDayPlan: "Conduct performance profiling on large department lists and audit token refresh lifecycle.",
            };
            res.setHeader("Content-Type", "application/pdf");
            res.setHeader("Content-Disposition", `attachment; filename=WorkTrack-EOD-AlexMorgan.pdf`);
            (0, pdfService_1.generateEodPdf)(sampleData, res);
            return;
        }
        const [rows] = await db_1.default.query(query, params);
        const report = rows && rows.length > 0 ? rows[0] : null;
        const pdfData = {
            employeeName: report ? `${report.first_name} ${report.last_name}` : "WorkTrack Employee",
            employeeId: report ? report.emp_code : "VAMA-001",
            department: report ? (report.department_name || "General") : "Engineering",
            designation: report ? report.designation : "Staff Engineer",
            reportDate: report ? report.date : (date || new Date().toISOString().split("T")[0]),
            hoursWorked: report ? report.hours_worked : 8.0,
            tasksCompleted: report && report.tasks_completed ? report.tasks_completed.split("\n") : [report?.summary || "Completed daily deliverables"],
            challenges: report?.challenges || "None reported.",
            nextDayPlan: report?.next_day_plan || "Continue assigned sprint targets.",
        };
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", `attachment; filename=WorkTrack-EOD-${pdfData.employeeId}-${pdfData.reportDate}.pdf`);
        (0, pdfService_1.generateEodPdf)(pdfData, res);
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.downloadEodPdf = downloadEodPdf;
