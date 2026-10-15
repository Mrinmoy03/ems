import { EmployeeProfile, EmployeeNotification } from "../types/employee"

export const initialMockEmployee: EmployeeProfile = {
  id: "EMP-1042",
  firstName: "Alex",
  lastName: "Morgan",
  email: "alex.morgan@worktrack.io",
  designation: "Senior Frontend Engineer",
  department: "Product Engineering",
  avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
  joinDate: "2023-03-15",
  phone: "+1 (555) 382-9012",
  location: "San Francisco, CA",
}

export const initialMockNotifications: EmployeeNotification[] = [
  {
    id: "notif-1",
    title: "New Task Assigned",
    message: "Admin assigned 'Refactor authentication state flow' with deadline 4:00 PM.",
    timestamp: new Date(Date.now() - 35 * 60 * 1000).toISOString(),
    isRead: false,
    type: "task",
  },
  {
    id: "notif-2",
    title: "Leave Status Updated",
    message: "Super Admin approved your Casual Leave for next Friday.",
    timestamp: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
    isRead: false,
    type: "leave",
  },
  {
    id: "notif-3",
    title: "Task Reminder",
    message: "Deadline approaching for 'Fix responsive navigation overflow'.",
    timestamp: new Date(Date.now() - 5 * 3600 * 1000).toISOString(),
    isRead: true,
    type: "reminder",
  },
]
