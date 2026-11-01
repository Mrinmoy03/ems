import http from "http";
import dotenv from "dotenv";
import app from "./app";
import { testConnection } from "./config/db";
import { initializeDatabase } from "./config/initDb";

dotenv.config();

const PORT = parseInt(process.env.PORT || "5000", 10);
const server = http.createServer(app);

async function bootstrap() {
  server.listen(PORT, async () => {
    console.log(`=======================================================`);
    console.log(`🚀 WorkTrack Server running on: http://localhost:${PORT}`);
    console.log(`📡 API Endpoints base:          http://localhost:${PORT}/api`);
    console.log(`🌐 CORS allowed origin:         ${process.env.CLIENT_URL || "http://localhost:5173"}`);
    console.log(`=======================================================`);

    // Verify MySQL Database connection & initialize schema
    const isConnected = await testConnection();
    if (isConnected) {
      await initializeDatabase();
    } else {
      console.log(`ℹ️ [Mock Mode Ready]: WorkTrack frontend can also authenticate with preset seed accounts:`);
      console.log(`   👑 Super Admin: superadmin@vamastudio.com / SuperAdmin@2026!`);
      console.log(`   🛡️ Admin:       admin@vamastudio.com / Admin@2026!`);
      console.log(`   👤 Employee:    alex.m@vamastudio.com / Employee@2026!`);
    }
  });
}

bootstrap().catch((err) => {
  console.error("❌ Fatal Error during server bootstrap:", err);
  process.exit(1);
});

