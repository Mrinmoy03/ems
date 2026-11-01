"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.testConnection = testConnection;
const promise_1 = __importDefault(require("mysql2/promise"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const pool = promise_1.default.createPool({
    host: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT || "3306", 10),
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "worktrack_ems",
    waitForConnections: true,
    connectionLimit: 15,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 10000,
});
async function testConnection() {
    try {
        const connection = await pool.getConnection();
        console.log("✅ MySQL Database connected successfully to:", process.env.DB_NAME || "worktrack_ems");
        connection.release();
        return true;
    }
    catch (error) {
        console.warn("⚠️ MySQL Connection Notice:", error.message);
        console.warn("⚠️ WorkTrack API will operate with mock fallback handlers if database is not reachable.");
        return false;
    }
}
exports.default = pool;
