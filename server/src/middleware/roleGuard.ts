import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "./auth";
import { UserRole } from "../types";

export const requireRole = (allowedRoles: UserRole[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
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

export const isSuperAdmin = requireRole(["super-admin"]);
export const isAdminOrSuperAdmin = requireRole(["admin", "super-admin"]);
export const isAnyUser = requireRole(["employee", "admin", "super-admin"]);

