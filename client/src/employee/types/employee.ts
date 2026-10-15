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
