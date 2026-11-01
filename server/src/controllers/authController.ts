import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import pool from "../config/db";
import { AuthenticatedRequest } from "../middleware/auth";
import { UserRole } from "../types";

const JWT_SECRET = process.env.JWT_SECRET || "worktrack_enterprise_jwt_super_secret_key_2026!";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

// Pre-defined enterprise accounts (as requested by user)
const PRESET_ACCOUNTS = [
  {
    id: "user-superadmin-01",
    email: "superadmin@vamastudio.com",
    role: "super-admin" as UserRole,
    name: "System Super Admin",
    employeeId: "SA-001",
    plainPassword: "SuperAdmin@2026!",
  },
  {
    id: "user-admin-01",
    email: "admin@vamastudio.com",
    role: "admin" as UserRole,
    name: "Operations Admin",
    employeeId: "ADM-001",
    plainPassword: "Admin@2026!",
  },
  {
    id: "user-emp-01",
    email: "alex.m@vamastudio.com",
    role: "employee" as UserRole,
    name: "Alex Morgan",
    employeeId: "VAMA-001",
    plainPassword: "Employee@2026!",
  },
];

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { emailOrId, password } = req.body;

    if (!emailOrId || !password) {
      res.status(400).json({
        success: false,
        message: "Email/Employee ID and password are required.",
      });
      return;
    }

    const cleanInput = emailOrId.trim().toLowerCase();

    // 1. First check preset enterprise credentials
    const preset = PRESET_ACCOUNTS.find(
      (acc) =>
        acc.email.toLowerCase() === cleanInput ||
        acc.employeeId.toLowerCase() === cleanInput
    );

    if (preset && password === preset.plainPassword) {
      const token = jwt.sign(
        {
          userId: preset.id,
          email: preset.email,
          role: preset.role,
          employeeId: preset.employeeId,
        },
        JWT_SECRET,
        { expiresIn: "7d" }
      );

      res.status(200).json({
        success: true,
        message: `Welcome back, ${preset.name}!`,
        token,
        user: {
          id: preset.id,
          email: preset.email,
          role: preset.role,
          name: preset.name,
          employeeId: preset.employeeId,
          status: "active",
        },
      });
      return;
    }

    // 2. Query MySQL Database if running
    try {
      const [rows]: any = await pool.query(
        `SELECT u.id, u.email, u.password_hash, u.role, u.status,
                e.id as emp_db_id, e.employee_id, e.first_name, e.last_name, e.designation, e.department_id, e.avatar_url
         FROM users u
         LEFT JOIN employees e ON u.id = e.user_id
         WHERE LOWER(u.email) = ? OR LOWER(e.employee_id) = ?`,
        [cleanInput, cleanInput]
      );

      if (rows && rows.length > 0) {
        const dbUser = rows[0];

        if (dbUser.status !== "active") {
          res.status(403).json({
            success: false,
            message: "Account is inactive or suspended. Please contact platform administration.",
          });
          return;
        }

        const isMatch = await bcrypt.compare(password, dbUser.password_hash);
        if (isMatch) {
          const userName = dbUser.first_name
            ? `${dbUser.first_name} ${dbUser.last_name}`
            : dbUser.email.split("@")[0];

          const token = jwt.sign(
            {
              userId: dbUser.id,
              email: dbUser.email,
              role: dbUser.role,
              employeeId: dbUser.employee_id,
            },
            JWT_SECRET,
            { expiresIn: "7d" }
          );

          res.status(200).json({
            success: true,
            message: `Welcome back, ${userName}!`,
            token,
            user: {
              id: dbUser.id,
              employeeDbId: dbUser.emp_db_id,
              employeeId: dbUser.employee_id,
              email: dbUser.email,
              role: dbUser.role,
              name: userName,
              designation: dbUser.designation,
              departmentId: dbUser.department_id,
              avatarUrl: dbUser.avatar_url,
              status: dbUser.status,
            },
          });
          return;
        }
      }
    } catch (dbErr: any) {
      console.warn("DB login lookup fallback notice:", dbErr.message);
    }

    res.status(401).json({
      success: false,
      message: "Invalid credentials. Please verify your login email/ID and password.",
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getMe = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Unauthorized." });
      return;
    }

    res.status(200).json({
      success: true,
      user: req.user,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const logout = async (_req: Request, res: Response): Promise<void> => {
  res.status(200).json({
    success: true,
    message: "Logged out successfully from WorkTrack.",
  });
};

