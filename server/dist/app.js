"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const path_1 = __importDefault(require("path"));
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
app.use(express_1.default.json({ limit: "10mb" }));
app.use(express_1.default.urlencoded({ extended: true, limit: "10mb" }));
// Static uploads directory
app.use("/uploads", express_1.default.static(path_1.default.join(process.cwd(), process.env.UPLOAD_DIR || "uploads")));
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
