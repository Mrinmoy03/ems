"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const routes_1 = __importDefault(require("./routes"));
const errorHandler_1 = require("./middleware/errorHandler");
const app = (0, express_1.default)();
// Enable Cross-Origin Resource Sharing (CORS)
app.use((0, cors_1.default)({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
}));
// Body Parsing
app.use(express_1.default.json({ limit: "15mb" }));
app.use(express_1.default.urlencoded({ extended: true, limit: "15mb" }));
// Static uploads directory (ensures server/uploads/avatars exists and is served)
const uploadsDirs = [
    path_1.default.resolve(__dirname, "../uploads"),
    path_1.default.resolve(process.cwd(), "server/uploads"),
    path_1.default.resolve(process.cwd(), "uploads"),
];
uploadsDirs.forEach((dir) => {
    if (!fs_1.default.existsSync(dir)) {
        try {
            fs_1.default.mkdirSync(dir, { recursive: true });
        }
        catch { }
    }
    const avatarsSubdir = path_1.default.join(dir, "avatars");
    if (!fs_1.default.existsSync(avatarsSubdir)) {
        try {
            fs_1.default.mkdirSync(avatarsSubdir, { recursive: true });
        }
        catch { }
    }
    app.use("/uploads", express_1.default.static(dir));
});
// System Health Endpoint
app.get("/api/health", (_req, res) => {
    res.status(200).json({
        status: "online",
        system: "WorkTrack Enterprise Management System API",
        version: "2.4.0",
        timestamp: new Date().toISOString(),
        governance: "Mon–Sat 48-Hour Corporate Standard",
    });
});
// Mount modular API routes
app.use("/api", routes_1.default);
// 404 & Error Handling
app.use(errorHandler_1.notFoundHandler);
app.use(errorHandler_1.errorHandler);
exports.default = app;
