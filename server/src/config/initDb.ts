import fs from "fs";
import path from "path";
import bcrypt from "bcryptjs";
import pool from "./db";

export async function initializeDatabase() {
  console.log("🔄 Initializing WorkTrack database schema and seed data...");

  try {
    const schemaSql = fs.readFileSync(path.join(__dirname, "schema.sql"), "utf-8");
    const queries = schemaSql
      .split(";")
      .map((q) => q.trim())
      .filter((q) => q.length > 0 && !q.startsWith("--"));

    const connection = await pool.getConnection();

    for (const query of queries) {
      try {
        await connection.query(query);
      } catch (err: any) {
        // Table or database might already exist, continue
      }
    }

    // Seed Super Admin
    const superAdminPasswordHash = await bcrypt.hash("SuperAdmin@2026!", 10);
    await connection.query(
      `INSERT IGNORE INTO users (id, email, password_hash, role, status)
       VALUES (?, ?, ?, 'super-admin', 'active')`,
      ["user-superadmin-01", "superadmin@vamastudio.com", superAdminPasswordHash]
    );

    // Seed Admin
    const adminPasswordHash = await bcrypt.hash("Admin@2026!", 10);
    await connection.query(
      `INSERT IGNORE INTO users (id, email, password_hash, role, status)
       VALUES (?, ?, ?, 'admin', 'active')`,
      ["user-admin-01", "admin@vamastudio.com", adminPasswordHash]
    );

    // Seed Departments
    const departments = [
      ["dept-eng", "Engineering", "ENG", "Software engineering and platform architecture", "#3b82f6"],
      ["dept-des", "UI/UX Design", "DES", "User interface and experience design studio", "#8b5cf6"],
      ["dept-qa", "Quality Assurance", "QA", "Automated and manual testing, compliance", "#10b981"],
      ["dept-ops", "DevOps & Cloud", "OPS", "Infrastructure, CI/CD, and site reliability", "#f59e0b"],
      ["dept-hr", "Human Resources", "HR", "People operations and talent acquisition", "#ec4899"],
    ];

    for (const [id, name, code, desc, color] of departments) {
      await connection.query(
        `INSERT IGNORE INTO departments (id, name, code, description, color) VALUES (?, ?, ?, ?, ?)`,
        [id, name, code, desc, color]
      );
    }

    // Seed Sample Employee
    const empPasswordHash = await bcrypt.hash("Employee@2026!", 10);
    await connection.query(
      `INSERT IGNORE INTO users (id, email, password_hash, role, status)
       VALUES (?, ?, ?, 'employee', 'active')`,
      ["user-emp-01", "alex.m@vamastudio.com", empPasswordHash]
    );

    await connection.query(
      `INSERT IGNORE INTO employees (id, user_id, employee_id, first_name, last_name, email, phone, designation, department_id, location, join_date, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        "emp-001",
        "user-emp-01",
        "VAMA-001",
        "Alex",
        "Morgan",
        "alex.m@vamastudio.com",
        "+1 (555) 234-5678",
        "Senior Frontend Engineer",
        "dept-eng",
        "San Francisco HQ",
        "2024-01-15",
        "active",
      ]
    );

    connection.release();
    console.log("✅ WorkTrack database schema and seed credentials initialized successfully!");
    console.log("👑 Super Admin: superadmin@vamastudio.com / SuperAdmin@2026!");
    console.log("🛡️ Admin: admin@vamastudio.com / Admin@2026!");
    console.log("👤 Employee: alex.m@vamastudio.com / Employee@2026!");
  } catch (err: any) {
    console.warn("⚠️ Database initialization notice (DB may not be configured yet):", err.message);
  }
}

if (require.main === module) {
  initializeDatabase().then(() => process.exit(0));
}

