"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createDepartment = exports.getAllDepartments = void 0;
const db_1 = __importDefault(require("../config/db"));
const generateId = (prefix) => `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 7)}`;
const getAllDepartments = async (_req, res) => {
    try {
        const [rows] = await db_1.default.query(`
      SELECT d.*, COUNT(e.id) as employee_count
      FROM departments d
      LEFT JOIN employees e ON d.id = e.department_id
      GROUP BY d.id
      ORDER BY d.name ASC
    `);
        res.status(200).json({
            success: true,
            departments: rows || [],
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.getAllDepartments = getAllDepartments;
const createDepartment = async (req, res) => {
    try {
        const { name, code, description, color } = req.body;
        if (!name || !code) {
            res.status(400).json({ success: false, message: "Department name and code are required." });
            return;
        }
        const deptId = generateId("dept");
        await db_1.default.query("INSERT INTO departments (id, name, code, description, color) VALUES (?, ?, ?, ?, ?)", [deptId, name.trim(), code.trim().toUpperCase(), description || null, color || "#3b82f6"]);
        res.status(201).json({
            success: true,
            message: "Department created successfully.",
            departmentId: deptId,
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.createDepartment = createDepartment;
