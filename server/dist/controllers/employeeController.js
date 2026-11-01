"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateEmployeePassword = exports.createEmployee = exports.getEmployeeById = exports.getAllEmployees = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const db_1 = __importDefault(require("../config/db"));
// Helper to generate a random or structured UUID
const generateId = (prefix) => `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 7)}`;
const getAllEmployees = async (_req, res) => {
    try {
        const [rows] = await db_1.default.query(`
      SELECT e.id, e.employee_id, e.first_name, e.last_name, e.email, e.phone,
             e.designation, e.department_id, d.name as department_name, e.location,
             e.avatar_url, e.join_date, e.status, u.role
      FROM employees e
      LEFT JOIN departments d ON e.department_id = d.id
      LEFT JOIN users u ON e.user_id = u.id
      ORDER BY e.created_at DESC
    `);
        res.status(200).json({
            success: true,
            employees: rows || [],
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.getAllEmployees = getAllEmployees;
const getEmployeeById = async (req, res) => {
    try {
        const { id } = req.params;
        const [rows] = await db_1.default.query(`
      SELECT e.*, d.name as department_name, u.role
      FROM employees e
      LEFT JOIN departments d ON e.department_id = d.id
      LEFT JOIN users u ON e.user_id = u.id
      WHERE e.id = ? OR e.employee_id = ?
    `, [id, id]);
        if (!rows || rows.length === 0) {
            res.status(404).json({ success: false, message: "Employee not found." });
            return;
        }
        res.status(200).json({
            success: true,
            employee: rows[0],
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.getEmployeeById = getEmployeeById;
const createEmployee = async (req, res) => {
    const connection = await db_1.default.getConnection();
    try {
        const { employeeId, firstName, lastName, email, password, designation, departmentId, phone, location, accountStatus, joinDate, } = req.body;
        if (!firstName || !lastName || !email || !password || !employeeId) {
            res.status(400).json({
                success: false,
                message: "First name, last name, email, employee ID, and initial password are required.",
            });
            return;
        }
        await connection.beginTransaction();
        // Check duplicate email
        const [existing] = await connection.query("SELECT id FROM users WHERE LOWER(email) = ?", [email.toLowerCase().trim()]);
        if (existing && existing.length > 0) {
            await connection.rollback();
            res.status(400).json({
                success: false,
                message: "An account with this email address already exists.",
            });
            return;
        }
        const userId = generateId("usr");
        const empDbId = generateId("emp");
        const passwordHash = await bcryptjs_1.default.hash(password, 10);
        // 1. Insert into users
        await connection.query(`INSERT INTO users (id, email, password_hash, role, status)
       VALUES (?, ?, ?, 'employee', ?)`, [userId, email.toLowerCase().trim(), passwordHash, accountStatus || "active"]);
        // 2. Insert into employees
        await connection.query(`INSERT INTO employees (id, user_id, employee_id, first_name, last_name, email, phone, designation, department_id, location, join_date, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [
            empDbId,
            userId,
            employeeId.trim().toUpperCase(),
            firstName.trim(),
            lastName.trim(),
            email.toLowerCase().trim(),
            phone || null,
            designation.trim(),
            departmentId || null,
            location || "Main HQ",
            joinDate || new Date().toISOString().split("T")[0],
            accountStatus || "active",
        ]);
        await connection.commit();
        res.status(201).json({
            success: true,
            message: `Employee ${firstName} ${lastName} created successfully with login credentials!`,
            employee: {
                id: empDbId,
                employeeId,
                name: `${firstName} ${lastName}`,
                email,
                designation,
                status: accountStatus || "active",
            },
        });
    }
    catch (error) {
        await connection.rollback();
        res.status(500).json({ success: false, message: error.message });
    }
    finally {
        connection.release();
    }
};
exports.createEmployee = createEmployee;
const updateEmployeePassword = async (req, res) => {
    try {
        const { id } = req.params;
        const { newPassword } = req.body;
        if (!newPassword || newPassword.length < 6) {
            res.status(400).json({
                success: false,
                message: "Password must be at least 6 characters long.",
            });
            return;
        }
        const passwordHash = await bcryptjs_1.default.hash(newPassword, 10);
        // Find the associated user_id
        const [empRows] = await db_1.default.query("SELECT user_id, email, first_name, last_name FROM employees WHERE id = ? OR employee_id = ?", [id, id]);
        if (!empRows || empRows.length === 0) {
            res.status(404).json({ success: false, message: "Employee not found." });
            return;
        }
        const userId = empRows[0].user_id;
        await db_1.default.query("UPDATE users SET password_hash = ? WHERE id = ?", [passwordHash, userId]);
        res.status(200).json({
            success: true,
            message: `Login credentials updated for ${empRows[0].first_name} ${empRows[0].last_name}.`,
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.updateEmployeePassword = updateEmployeePassword;
