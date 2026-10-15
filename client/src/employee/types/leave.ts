export type LeaveType = "Casual Leave" | "Sick Leave" | "Paid Leave" | "Annual Leave" | "Unpaid Leave"
export type LeaveStatus = "pending" | "approved" | "rejected"

export interface LeaveRequest {
  id: string
  leaveType: LeaveType
  startDate: string // YYYY-MM-DD
  endDate: string // YYYY-MM-DD
  daysCount: number
  reason: string
  status: LeaveStatus
  appliedAt: string // ISO timestamp
  adminComment?: string
}

export interface ApplyLeaveInput {
  leaveType: LeaveType
  startDate: string
  endDate: string
  daysCount: number
  reason: string
}

export interface UpdateLeaveInput {
  id: string
  leaveType: LeaveType
  startDate: string
  endDate: string
  daysCount: number
  reason: string
}
