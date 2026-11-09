import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import pool from "../config/db";

// Helper to generate a random or structured UUID
const generateId = (prefix: string) => `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 7)}`;

export const getAllEmployees = async (_req: Request, res: Response): Promise<void> => {
  try {
    const [rows]: any = await pool.query(`
      SELECT e.id, e.employee_id, e.first_name, e.last_name, e.email, e.phone,
             e.designation, e.department_id, d.name as department_name, d.code as department_code, e.location,
             e.avatar_url, e.join_date, e.status, u.role,
             a.id as attendance_id,
             a.punch_in as check_in_today,
             a.punch_out as check_out_today,
             a.status as attendance_status,
             a.total_duration_seconds as seconds_logged_today,
             CASE
               WHEN a.punch_in IS NOT NULL AND a.punch_out IS NULL THEN 'working'
               WHEN a.punch_in IS NOT NULL AND a.punch_out IS NOT NULL THEN 'logged-out'
               WHEN a.status = 'on-leave' THEN 'on-leave'
               ELSE 'absent'
             END as attendance_today,
             (SELECT COUNT(*) FROM tasks t WHERE t.assigned_to = e.id AND t.status IN ('pending', 'in-progress', 'overdue')) as active_tasks_count,
             (SELECT COUNT(*) FROM tasks t WHERE t.assigned_to = e.id AND t.status = 'completed') as completed_tasks_count
      FROM employees e
      LEFT JOIN departments d ON e.department_id = d.id
      LEFT JOIN users u ON e.user_id = u.id
      LEFT JOIN attendance a ON e.id = a.employee_id AND a.date = CURDATE()
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
      SELECT e.*, d.name as department_name, d.code as department_code, u.role,
             a.punch_in as check_in_today,
             a.punch_out as check_out_today,
             a.status as attendance_status,
             a.total_duration_seconds as seconds_logged_today,
             CASE
               WHEN a.punch_in IS NOT NULL AND a.punch_out IS NULL THEN 'working'
               WHEN a.punch_in IS NOT NULL AND a.punch_out IS NOT NULL THEN 'logged-out'
               WHEN a.status = 'on-leave' THEN 'on-leave'
               ELSE 'absent'
             END as attendance_today,
             (SELECT COUNT(*) FROM tasks t WHERE t.assigned_to = e.id AND t.status IN ('pending', 'in-progress', 'overdue')) as active_tasks_count,
             (SELECT COUNT(*) FROM tasks t WHERE t.assigned_to = e.id AND t.status = 'completed') as completed_tasks_count
      FROM employees e
      LEFT JOIN departments d ON e.department_id = d.id
      LEFT JOIN users u ON e.user_id = u.id
      LEFT JOIN attendance a ON e.id = a.employee_id AND a.date = CURDATE()
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

    if (!firstName || !lastName || !email || !password || !phone) {
      res.status(400).json({
        success: false,
        message: "First name, last name, email, phone number (Employee Login ID), and initial password are required.",
      });
      return;
    }

    // Auto-generate employee ID if not provided
    let finalEmpId = (employeeId && employeeId.trim()) 
      ? employeeId.trim().toUpperCase() 
      : `EMP-${Math.floor(1000 + Math.random() * 9000)}`;

    await connection.beginTransaction();

    // Check duplicate employee ID and regenerate if needed
    const [existingEmpId]: any = await connection.query(
      "SELECT id FROM employees WHERE employee_id = ?",
      [finalEmpId]
    );
    if (existingEmpId && existingEmpId.length > 0) {
      finalEmpId = `EMP-${Math.floor(1000 + Math.random() * 9000)}`;
    }

    // Check duplicate email
    const [existingEmail]: any = await connection.query(
      "SELECT id FROM users WHERE LOWER(email) = ?",
      [email.toLowerCase().trim()]
    );
    if (existingEmail && existingEmail.length > 0) {
      await connection.rollback();
      res.status(400).json({
        success: false,
        message: "An account with this email address already exists.",
      });
      return;
    }

    // Check duplicate phone number (since it is the employee login ID)
    const cleanDigits = phone.replace(/\D/g, "");
    const [existingPhone]: any = await connection.query(
      "SELECT id FROM employees WHERE phone = ? OR REPLACE(REPLACE(REPLACE(REPLACE(phone, ' ', ''), '-', ''), '(', ''), ')', '') = ?",
      [phone.trim(), cleanDigits || phone.trim()]
    );
    if (existingPhone && existingPhone.length > 0) {
      await connection.rollback();
      res.status(400).json({
        success: false,
        message: `An employee with phone number "${phone.trim()}" already exists.`,
      });
      return;
    }

    // Resolve departmentId (check if it matches a department ID or department name)
    let resolvedDeptId: string | null = null;
    if (departmentId) {
      const [deptRows]: any = await connection.query(
        "SELECT id FROM departments WHERE id = ? OR LOWER(name) = ? LIMIT 1",
        [departmentId, departmentId.toLowerCase().trim()]
      );
      if (deptRows && deptRows.length > 0) {
        resolvedDeptId = deptRows[0].id;
      }
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
        finalEmpId,
        firstName.trim(),
        lastName.trim(),
        email.toLowerCase().trim(),
        phone.trim(),
        designation.trim(),
        resolvedDeptId,
        location || "Main HQ",
        joinDate || new Date().toISOString().split("T")[0],
        accountStatus || "active",
      ]
    );

    await connection.commit();

    res.status(201).json({
      success: true,
      message: `Employee ${firstName} ${lastName} created successfully! Phone number ${phone.trim()} is set as their Login ID.`,
      employee: {
        id: empDbId,
        employeeId: finalEmpId,
        name: `${firstName} ${lastName}`,
        email,
        phone: phone.trim(),
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

export const updateEmployee = async (req: Request, res: Response): Promise<void> => {
  const connection = await pool.getConnection();
  try {
    const { id } = req.params;
    const {
      firstName,
      lastName,
      email,
      designation,
      departmentId,
      department,
      phone,
      location,
      accountStatus,
    } = req.body;

    // Find the employee record
    const [empRows]: any = await connection.query(
      "SELECT id, user_id, employee_id, email, phone FROM employees WHERE id = ? OR employee_id = ?",
      [id, id]
    );

    if (!empRows || empRows.length === 0) {
      res.status(404).json({ success: false, message: "Employee not found." });
      return;
    }

    const currentEmp = empRows[0];

    await connection.beginTransaction();

    // Check duplicate email if changing
    if (email && email.toLowerCase().trim() !== currentEmp.email.toLowerCase()) {
      const [existingEmail]: any = await connection.query(
        "SELECT id FROM users WHERE LOWER(email) = ? AND id != ?",
        [email.toLowerCase().trim(), currentEmp.user_id]
      );
      if (existingEmail && existingEmail.length > 0) {
        await connection.rollback();
        res.status(400).json({ success: false, message: "An account with this email address already exists." });
        return;
      }
    }

    // Check duplicate phone if changing
    if (phone && phone.trim() !== currentEmp.phone) {
      const cleanDigits = phone.replace(/\D/g, "");
      const [existingPhone]: any = await connection.query(
        "SELECT id FROM employees WHERE (phone = ? OR REPLACE(REPLACE(REPLACE(REPLACE(phone, ' ', ''), '-', ''), '(', ''), ')', '') = ?) AND id != ?",
        [phone.trim(), cleanDigits || phone.trim(), currentEmp.id]
      );
      if (existingPhone && existingPhone.length > 0) {
        await connection.rollback();
        res.status(400).json({ success: false, message: `An employee with phone number "${phone.trim()}" already exists.` });
        return;
      }
    }

    // Resolve departmentId (supports department ID, department name, or code)
    const deptSearch = departmentId || department;
    let resolvedDeptId: string | null = null;
    if (deptSearch && deptSearch !== "none" && deptSearch !== "unassigned" && deptSearch !== "Unassigned") {
      const [deptRows]: any = await connection.query(
        "SELECT id FROM departments WHERE id = ? OR LOWER(name) = ? OR LOWER(code) = ? LIMIT 1",
        [deptSearch, deptSearch.toLowerCase().trim(), deptSearch.toLowerCase().trim()]
      );
      if (deptRows && deptRows.length > 0) {
        resolvedDeptId = deptRows[0].id;
      }
    }

    // Update employees table
    const empUpdates: string[] = [];
    const empValues: any[] = [];

    if (firstName) { empUpdates.push("first_name = ?"); empValues.push(firstName.trim()); }
    if (lastName) { empUpdates.push("last_name = ?"); empValues.push(lastName.trim()); }
    if (email) { empUpdates.push("email = ?"); empValues.push(email.toLowerCase().trim()); }
    if (phone) { empUpdates.push("phone = ?"); empValues.push(phone.trim()); }
    if (designation) { empUpdates.push("designation = ?"); empValues.push(designation.trim()); }
    if (deptSearch !== undefined) { empUpdates.push("department_id = ?"); empValues.push(resolvedDeptId); }
    if (location !== undefined) { empUpdates.push("location = ?"); empValues.push(location.trim()); }
    if (accountStatus) { empUpdates.push("status = ?"); empValues.push(accountStatus); }

    if (empUpdates.length > 0) {
      empValues.push(currentEmp.id);
      await connection.query(`UPDATE employees SET ${empUpdates.join(", ")} WHERE id = ?`, empValues);
    }

    // Also update users table if email or status changed
    const userUpdates: string[] = [];
    const userValues: any[] = [];
    if (email) { userUpdates.push("email = ?"); userValues.push(email.toLowerCase().trim()); }
    if (accountStatus) { userUpdates.push("status = ?"); userValues.push(accountStatus); }
    if (userUpdates.length > 0) {
      userValues.push(currentEmp.user_id);
      await connection.query(`UPDATE users SET ${userUpdates.join(", ")} WHERE id = ?`, userValues);
    }

    await connection.commit();

    res.status(200).json({
      success: true,
      message: "Employee profile and department assignment updated successfully.",
      employee: {
        id: currentEmp.id,
        employeeId: currentEmp.employee_id,
        departmentId: resolvedDeptId,
      }
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
