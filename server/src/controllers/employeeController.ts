import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import pool from "../config/db";

// Helper to generate a random or structured UUID
const generateId = (prefix: string) => `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 7)}`;

export const getAllEmployees = async (_req: Request, res: Response): Promise<void> => {
  try {
    const [rows]: any = await pool.query(`
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
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getEmployeeById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const [rows]: any = await pool.query(
      `
      SELECT e.*, d.name as department_name, u.role
      FROM employees e
      LEFT JOIN departments d ON e.department_id = d.id
      LEFT JOIN users u ON e.user_id = u.id
      WHERE e.id = ? OR e.employee_id = ?
    `,
      [id, id]
    );

    if (!rows || rows.length === 0) {
      res.status(404).json({ success: false, message: "Employee not found." });
      return;
    }

    res.status(200).json({
      success: true,
      employee: rows[0],
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createEmployee = async (req: Request, res: Response): Promise<void> => {
  const connection = await pool.getConnection();
  try {
    const {
      employeeId,
      firstName,
      lastName,
      email,
      password,
      designation,
      departmentId,
      phone,
      location,
      accountStatus,
      joinDate,
    } = req.body;

    if (!firstName || !lastName || !email || !password || !employeeId) {
      res.status(400).json({
        success: false,
        message: "First name, last name, email, employee ID, and initial password are required.",
      });
      return;
    }

    await connection.beginTransaction();

    // Check duplicate email
    const [existing]: any = await connection.query(
      "SELECT id FROM users WHERE LOWER(email) = ?",
      [email.toLowerCase().trim()]
    );
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
    const passwordHash = await bcrypt.hash(password, 10);

    // 1. Insert into users
    await connection.query(
      `INSERT INTO users (id, email, password_hash, role, status)
       VALUES (?, ?, ?, 'employee', ?)`,
      [userId, email.toLowerCase().trim(), passwordHash, accountStatus || "active"]
    );

    // 2. Insert into employees
    await connection.query(
      `INSERT INTO employees (id, user_id, employee_id, first_name, last_name, email, phone, designation, department_id, location, join_date, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
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
      ]
    );

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
  } catch (error: any) {
    await connection.rollback();
    res.status(500).json({ success: false, message: error.message });
  } finally {
    connection.release();
  }
};

export const updateEmployeePassword = async (req: Request, res: Response): Promise<void> => {
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

    const passwordHash = await bcrypt.hash(newPassword, 10);

    // Find the associated user_id
    const [empRows]: any = await pool.query(
      "SELECT user_id, email, first_name, last_name FROM employees WHERE id = ? OR employee_id = ?",
      [id, id]
    );

    if (!empRows || empRows.length === 0) {
      res.status(404).json({ success: false, message: "Employee not found." });
      return;
    }

    const userId = empRows[0].user_id;

    await pool.query("UPDATE users SET password_hash = ? WHERE id = ?", [passwordHash, userId]);

    res.status(200).json({
      success: true,
      message: `Login credentials updated for ${empRows[0].first_name} ${empRows[0].last_name}.`,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
