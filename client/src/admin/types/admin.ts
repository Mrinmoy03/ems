import { EmployeeProfile } from "../../employee/types/employee"
import { EmployeeTask } from "../../employee/types/task"
import { LeaveRequest, LeaveStatus, LeaveType } from "../../employee/types/leave"

export type EmployeeAccountStatus = "active" | "inactive" | "deactivated"
export type TodayAttendanceStatus = "working" | "on-break" | "logged-out" | "present" | "absent" | "on-leave"

export interface AdminEmployee extends EmployeeProfile {
  employeeId?: string
  name: string
  avatar: string
  departmentId?: string
  departmentCode?: string
  accountStatus: EmployeeAccountStatus
  attendanceToday: TodayAttendanceStatus
  checkInToday?: string
  checkOutToday?: string
  hoursLoggedToday?: number
  activeTasksCount: number
  completedTasksCount: number
  credentialsProvisioned: boolean
  password?: string
  tempPassword?: string // For mock credential provisioning notice only
}

export interface Department {
  id: string
  name: string
  code: string
  description: string
  headEmployeeId?: string
  headEmployeeName?: string
  employeeCount: number
  activeTasksCount: number
  isArchived: boolean
  createdAt: string
  updatedAt: string
}

export interface DeadlineChangeRecord {
  id: string
  taskId: string
  taskTitle: string
  oldDeadline: string
  newDeadline: string
  reason: string
  changedBy: string
  changedAt: string
}

export interface AdminTask extends EmployeeTask {
  assignedTo: string[] // Array of Employee IDs (single or multiple)
  assignedEmployeeNames?: string[]
  assignedBy: string
  priority?: "low" | "medium" | "high" | "urgent"
  startDate?: string
  deadlineHistory?: DeadlineChangeRecord[]
  delayReason?: string
}

export interface AdminAttendanceDay {
  id: string
  employeeId: string
  employeeName: string
  employeeAvatar: string
  department: string
  date: string // YYYY-MM-DD
  dayOfWeek: string
  checkIn: string
  checkOut: string
  breakDuration: string
  breakDurationSeconds: number
  netHoursWorked: number
  status: "present" | "absent" | "half-day" | "on-leave" | "working" | "on-break" | "logged-out"
  notes?: string
}

export interface AdminLeaveRecord extends LeaveRequest {
  employeeId: string
  employeeName: string
  totalDays: number
  appliedDate: string
}

export interface AdminDailyReport {
  id: string
  employeeId: string
  employeeName: string
  employeeAvatar: string
  department: string
  date: string
  totalHoursWorked: number
  tasksCompletedCount: number
  tasksInProgressCount: number
  summary: string
  blockers?: string
}

export interface AdminSuperAdminComment {

  id: string
  targetType: "employee" | "task" | "leave" | "attendance" | "general"
  targetId?: string
  targetTitle?: string
  authorName: string
  authorRole: string
  comment: string
  createdAt: string
  status: "open" | "reviewed" | "addressed"
}

export interface CreateEmployeeInput {
  employeeId?: string // Admin-specified login ID / Employee ID (e.g. EMP-1050)
  firstName: string
  lastName: string
  email: string
  password?: string // Admin-specified login password
  designation: string
  department: string
  phone: string
  location: string
  accountStatus: EmployeeAccountStatus
  provisionPassword?: boolean
}

export interface CreateDepartmentInput {
  name: string
  code: string
  description: string
  headEmployeeId?: string
}

export interface CreateAdminTaskInput {
  title: string
  description?: string
  category: string
  deadline: string // ISO date-time string
  startDate?: string
  assignedTo: string[] // Array of employee IDs
  priority?: "low" | "medium" | "high" | "urgent"
  projectId?: string
  projectName?: string
  projectPartId?: string
  projectPartName?: string
}

export type { LeaveStatus, LeaveType }
