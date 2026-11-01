import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth, UserRole } from "../context/AuthContext";

interface ProtectedRouteProps {
  children: React.ReactElement;
  allowedRoles?: UserRole[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { user, isAuthenticated, role } = useAuth();
  const location = useLocation();

  if (!isAuthenticated || !user) {
    // Redirect unauthenticated visitors to /login preserving the requested path
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If specific roles are required, enforce role-based boundaries
  if (allowedRoles && allowedRoles.length > 0) {
    // Super Admin has executive clearance across admin and super-admin routes
    const hasAccess =
      allowedRoles.includes(role!) ||
      (role === "super-admin" && allowedRoles.includes("admin"));

    if (!hasAccess) {
      // Divert to respective appropriate workspace
      if (role === "employee") {
        return <Navigate to="/employee" replace />;
      }
      if (role === "admin") {
        return <Navigate to="/admin" replace />;
      }
      if (role === "super-admin") {
        return <Navigate to="/super-admin" replace />;
      }
    }
  }

  return children;
};

