"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticateToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    if (!token) {
        res.status(401).json({ success: false, message: "Access denied. Authentication token missing." });
        return;
    }
    try {
        const secret = process.env.JWT_SECRET || "worktrack_enterprise_jwt_super_secret_key_2026!";
        const decoded = jsonwebtoken_1.default.verify(token, secret);
        req.user = {
            id: decoded.userId,
            email: decoded.email,
            role: decoded.role,
            employeeId: decoded.employeeId,
        };
        next();
    }
    catch (error) {
        res.status(403).json({ success: false, message: "Invalid or expired session token." });
    }
};
exports.authenticateToken = authenticateToken;
