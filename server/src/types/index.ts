export type UserRole = "employee" | "admin" | "super-admin";

export type AccountStatus = "active" | "inactive" | "suspended";

export type TaskStatus = "pending" | "in-progress" | "completed" | "overdue";
export type TaskPriority = "low" | "medium" | "high" | "urgent";

export type ProjectStatus = "planning" | "in-progress" | "on-hold" | "completed" | "archived";

export type LeaveType = "casual" | "sick" | "annual" | "unpaid" | "maternity" | "paternity";
export type LeaveStatus = "pending" | "approved" | "rejected";

export type BreakType = "lunch" | "tea" | "other";

export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
  employeeId?: string;
  firstName?: string;
  lastName?: string;
  status: AccountStatus;
}

export interface JwtPayload {
  userId: string;
  email: string;
  role: UserRole;
  employeeId?: string;
}

