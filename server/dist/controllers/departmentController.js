"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.toggleArchiveDepartment = exports.deleteDepartment = exports.updateDepartment = exports.createDepartment = exports.getAllDepartments = void 0;
const db_1 = __importDefault(require("../config/db"));
const generateId = (prefix) => `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 7)}`;
const getAllDepartments = async (_req, res) => {
    try {
        const [rows] = await db_1.default.query(`
      SELECT d.*, 
             COUNT(DISTINCT e.id) as employee_count,
             COUNT(DISTINCT t.id) as active_tasks_count
      FROM departments d
      LEFT JOIN employees e ON d.id = e.department_id
      LEFT JOIN tasks t ON (t.department_id = d.id OR t.assigned_to = e.id) AND t.status IN ('pending', 'in-progress', 'overdue')
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
        const [existingCode] = await db_1.default.query("SELECT id FROM departments WHERE code = ? OR name = ?", [code.trim().toUpperCase(), name.trim()]);
        if (existingCode && existingCode.length > 0) {
            res.status(409).json({
                success: false,
                message: `Department with code '${code.trim().toUpperCase()}' or name '${name.trim()}' already exists.`,
            });
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
const updateDepartment = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, code, description, color } = req.body;
        const [existing] = await db_1.default.query("SELECT * FROM departments WHERE id = ?", [id]);
        if (!existing || existing.length === 0) {
            res.status(404).json({ success: false, message: "Department not found." });
            return;
        }
        const updates = [];
        const values = [];
        if (name) {
            updates.push("name = ?");
            values.push(name.trim());
        }
        if (code) {
            updates.push("code = ?");
            values.push(code.trim().toUpperCase());
        }
        if (description !== undefined) {
            updates.push("description = ?");
            values.push(description);
        }
        if (color !== undefined) {
            updates.push("color = ?");
            values.push(color);
        }
        if (updates.length > 0) {
            values.push(id);
            await db_1.default.query(`UPDATE departments SET ${updates.join(", ")} WHERE id = ?`, values);
        }
        res.status(200).json({ success: true, message: "Department updated successfully." });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.updateDepartment = updateDepartment;
const deleteDepartment = async (req, res) => {
    try {
        const { id } = req.params;
        // Check if any employees are linked to this department
        const [empRows] = await db_1.default.query("SELECT id FROM employees WHERE department_id = ? LIMIT 1", [id]);
        if (empRows && empRows.length > 0) {
            res.status(400).json({
                success: false,
                message: "Cannot delete department: There are active employees assigned. Reassign them first.",
            });
            return;
        }
        await db_1.default.query("DELETE FROM departments WHERE id = ? OR LOWER(name) = ?", [id, id.toLowerCase()]);
        res.status(200).json({ success: true, message: "Department deleted successfully." });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.deleteDepartment = deleteDepartment;
const toggleArchiveDepartment = async (req, res) => {
    try {
        const { id } = req.params;
        const { isArchived } = req.body;
        const [deptRows] = await db_1.default.query("SELECT * FROM departments WHERE id = ? OR LOWER(name) = ?", [id, id.toLowerCase()]);
        if (!deptRows || deptRows.length === 0) {
            res.status(404).json({ success: false, message: "Department not found." });
            return;
        }
        const currentDept = deptRows[0];
        const newArchivedState = typeof isArchived === "boolean" ? isArchived : !currentDept.is_archived;
        if (newArchivedState) {
            const [empRows] = await db_1.default.query("SELECT id FROM employees WHERE department_id = ? LIMIT 1", [currentDept.id]);
            if (empRows && empRows.length > 0) {
                res.status(400).json({
                    success: false,
                    message: "Cannot archive department: Active employees are currently assigned.",
                });
                return;
            }
        }
        try {
            await db_1.default.query("UPDATE departments SET is_archived = ? WHERE id = ?", [newArchivedState, currentDept.id]);
        }
        catch {
            await db_1.default.query("ALTER TABLE departments ADD COLUMN is_archived BOOLEAN DEFAULT FALSE");
            await db_1.default.query("UPDATE departments SET is_archived = ? WHERE id = ?", [newArchivedState, currentDept.id]);
        }
        res.status(200).json({
            success: true,
            message: newArchivedState ? "Department archived successfully." : "Department restored successfully.",
            isArchived: newArchivedState,
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.toggleArchiveDepartment = toggleArchiveDepartment;
