"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = __importDefault(require("http"));
const dotenv_1 = __importDefault(require("dotenv"));
const app_1 = __importDefault(require("./app"));
const db_1 = require("./config/db");
const initDb_1 = require("./config/initDb");
dotenv_1.default.config();
const PORT = parseInt(process.env.PORT || "5000", 10);
const server = http_1.default.createServer(app_1.default);
async function bootstrap() {
    server.listen(PORT, async () => {
        console.log(`=======================================================`);
        console.log(`🚀 WorkTrack Server running on: http://localhost:${PORT}`);
        console.log(`📡 API Endpoints base:          http://localhost:${PORT}/api`);
        console.log(`🌐 CORS allowed origin:         ${process.env.CLIENT_URL || "http://localhost:5173"}`);
        console.log(`=======================================================`);
        // Verify MySQL Database connection & initialize schema
        const isConnected = await (0, db_1.testConnection)();
        if (isConnected) {
            await (0, initDb_1.initializeDatabase)();
        }
        else {
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
