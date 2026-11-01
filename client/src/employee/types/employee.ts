export interface EmployeeProfile {
  id: string
  firstName: string
  lastName: string
  email: string
  designation: string
  department: string
  avatarUrl: string
  joinDate: string
  phone: string
  location: string
}

export interface EmployeeNotification {
  id: string
  title: string
  message: string
  timestamp: string
  isRead: boolean
  type: "task" | "leave" | "system" | "reminder"
}

export interface NotificationPreferences {
  taskDeadlineApproaching: boolean // 30 min before deadline
  lunchBreakReminder: boolean // Alert if lunch break exceeds 60 min
  eodAutoDigest: boolean // Display summary of completed assignments at workday wrap-up
}
