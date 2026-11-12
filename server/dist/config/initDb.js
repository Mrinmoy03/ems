"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeDatabase = initializeDatabase;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const db_1 = __importDefault(require("./db"));
async function initializeDatabase() {
    console.log("🔄 Initializing WorkTrack database schema and seed data...");
    try {
        const schemaSql = fs_1.default.readFileSync(path_1.default.join(__dirname, "schema.sql"), "utf-8");
        const queries = schemaSql
            .split(";")
            .map((q) => q.trim())
            .filter((q) => q.length > 0 && !q.startsWith("--"));
        const connection = await db_1.default.getConnection();
        for (const query of queries) {
            try {
                await connection.query(query);
            }
            catch (err) {
                // Table or database might already exist, continue
            }
        }
        // Seed Super Admin
        const superAdminPasswordHash = await bcryptjs_1.default.hash("SuperAdmin@2026!", 10);
        await connection.query(`INSERT IGNORE INTO users (id, email, password_hash, role, status)
       VALUES (?, ?, ?, 'super-admin', 'active')`, ["user-superadmin-01", "superadmin@vamastudio.com", superAdminPasswordHash]);
        // Seed Admin
        const adminPasswordHash = await bcryptjs_1.default.hash("Admin@2026!", 10);
        await connection.query(`INSERT IGNORE INTO users (id, email, password_hash, role, status)
       VALUES (?, ?, ?, 'admin', 'active')`, ["user-admin-01", "admin@vamastudio.com", adminPasswordHash]);
        // Seed Departments ONLY if departments table is completely empty (first time installation only)
        const [existingDepts] = await connection.query("SELECT COUNT(*) as count FROM departments");
        if (existingDepts && existingDepts[0]?.count === 0) {
            const departments = [
                ["dept-eng", "Engineering", "ENG", "Software engineering and platform architecture", "#3b82f6"],
                ["dept-des", "UI/UX Design", "DES", "User interface and experience design studio", "#8b5cf6"],
                ["dept-qa", "Quality Assurance", "QA", "Automated and manual testing, compliance", "#10b981"],
                ["dept-ops", "DevOps & Cloud", "OPS", "Infrastructure, CI/CD, and site reliability", "#f59e0b"],
                ["dept-hr", "Human Resources", "HR", "People operations and talent acquisition", "#ec4899"],
            ];
            for (const [id, name, code, desc, color] of departments) {
                await connection.query(`INSERT IGNORE INTO departments (id, name, code, description, color) VALUES (?, ?, ?, ?, ?)`, [id, name, code, desc, color]);
            }
        }
        // Clean state: Admins and Super Admins exist, but employees are created by Admin
        connection.release();
        console.log("✅ WorkTrack database schema and admin credentials initialized successfully!");
        console.log("👑 Super Admin: superadmin@vamastudio.com / SuperAdmin@2026!");
        console.log("🛡️ Admin: admin@vamastudio.com / Admin@2026!");
    }
    catch (err) {
        console.warn("⚠️ Database initialization notice (DB may not be configured yet):", err.message);
    }
}
if (require.main === module) {
    initializeDatabase().then(() => process.exit(0));
}
