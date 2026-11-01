"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notFoundHandler = exports.errorHandler = void 0;
const errorHandler = (err, _req, res, _next) => {
    console.error("❌ Unhandled Application Error:", err);
    const statusCode = err.status || err.statusCode || 500;
    const message = err.message || "An internal enterprise server error occurred.";
    res.status(statusCode).json({
        success: false,
        message,
        ...(process.env.NODE_ENV === "development" ? { stack: err.stack } : {}),
    });
};
exports.errorHandler = errorHandler;
const notFoundHandler = (req, res) => {
    res.status(404).json({
        success: false,
        message: `Resource not found: ${req.method} ${req.originalUrl}`,
    });
};
exports.notFoundHandler = notFoundHandler;
