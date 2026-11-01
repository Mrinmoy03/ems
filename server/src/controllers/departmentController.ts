import { Request, Response } from "express";
import pool from "../config/db";

const generateId = (prefix: string) => `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 7)}`;

export const getAllDepartments = async (_req: Request, res: Response): Promise<void> => {
  try {
    const [rows]: any = await pool.query(`
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
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createDepartment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, code, description, color } = req.body;

    if (!name || !code) {
      res.status(400).json({ success: false, message: "Department name and code are required." });
      return;
    }

    const deptId = generateId("dept");

    await pool.query(
      "INSERT INTO departments (id, name, code, description, color) VALUES (?, ?, ?, ?, ?)",
      [deptId, name.trim(), code.trim().toUpperCase(), description || null, color || "#3b82f6"]
    );

    res.status(201).json({
      success: true,
      message: "Department created successfully.",
      departmentId: deptId,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

