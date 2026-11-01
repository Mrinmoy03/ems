"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isAnyUser = exports.isAdminOrSuperAdmin = exports.isSuperAdmin = exports.requireRole = void 0;
const requireRole = (allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            res.status(401).json({ success: false, message: "Unauthorized. Authentication required." });
            return;
        }
        if (!allowedRoles.includes(req.user.role)) {
            res.status(403).json({
                success: false,
                message: `Forbidden. This operation requires [${allowedRoles.join(", ")}] permissions.`,
            });
            return;
        }
        next();
    };
};
exports.requireRole = requireRole;
exports.isSuperAdmin = (0, exports.requireRole)(["super-admin"]);
exports.isAdminOrSuperAdmin = (0, exports.requireRole)(["admin", "super-admin"]);
exports.isAnyUser = (0, exports.requireRole)(["employee", "admin", "super-admin"]);
