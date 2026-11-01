import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { JwtPayload, UserRole } from "../types";

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: UserRole;
    employeeId?: string;
  };
}

export const authenticateToken = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    res.status(401).json({ success: false, message: "Access denied. Authentication token missing." });
    return;
  }

  try {
    const secret = process.env.JWT_SECRET || "worktrack_enterprise_jwt_super_secret_key_2026!";
    const decoded = jwt.verify(token, secret) as JwtPayload;

    req.user = {
      id: decoded.userId,
      email: decoded.email,
      role: decoded.role,
      employeeId: decoded.employeeId,
    };

    next();
  } catch (error) {
    res.status(403).json({ success: false, message: "Invalid or expired session token." });
  }
};

