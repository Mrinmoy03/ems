import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

const pool = mysql.createPool({
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

export async function testConnection(): Promise<boolean> {
  try {
    const connection = await pool.getConnection();
    console.log("✅ MySQL Database connected successfully to:", process.env.DB_NAME || "worktrack_ems");
    connection.release();
    return true;
  } catch (error: any) {
    console.warn("⚠️ MySQL Connection Notice:", error.message);
    console.warn("⚠️ WorkTrack API will operate with mock fallback handlers if database is not reachable.");
    return false;
  }
}

export default pool;

