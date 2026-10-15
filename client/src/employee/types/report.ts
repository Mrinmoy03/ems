export interface CompletedTaskSummary {
  id: string
  title: string
  category?: string
  completedAt?: string
  isCompletedLate?: boolean
  delayReason?: string
}

export interface InProgressTaskSummary {
  id: string
  title: string
  category?: string
  progress?: number // 0-100 percentage
  status?: "in-progress" | "pending" | "overdue"
  carriedForwardTo?: string // Target shift or date e.g. "Oct 15, 2026" or "Next Shift"
  notes?: string
}

export interface WorkingDayDetail {
  date: string
  dayOfWeek: string
  hoursLogged: number
  hoursFormatted: string
  checkIn: string
  checkOut: string
  breakDuration?: string
  status: "present" | "half-day" | "leave" | "holiday"
  tasksCompletedCount: number
  tasksCompletedLateCount?: number
  completedTasks: CompletedTaskSummary[]
  inProgressTasks?: InProgressTaskSummary[]
  summary?: string
}

export interface DailyEodReport {
  id: string
  date: string
  dayOfWeek?: string
  checkIn?: string // Log in / punch-in time e.g. "08:55 AM"
  checkOut?: string // Log out / punch-out time e.g. "05:10 PM" or "Live Session"
  breakDuration?: string // Duration of break e.g. "45m"
  hoursLogged: string // Formatted string e.g. "8h 15m"
  hoursWorked: number // Decimal hours e.g. 8.25
  tasksTotal?: number
  tasksCompleted: number
  tasksCompletedLate?: number
  tasksPending: number
  tasksInProgressCount?: number
  completedTasks: CompletedTaskSummary[]
  inProgressTasks?: InProgressTaskSummary[]
  summary: string
  submittedAt: string
}

export interface MonthlyReport {
  month: string
  year: number
  workingDays: number
  daysPresent: number
  totalHoursWorked: number
  tasksCompleted: number
  completionRate: number // percentage
  averageCompletionHours?: number
}

export interface MonthData {
  monthKey: string // "2026-10", "2026-09"
  monthName: string
  year: number
  summary: MonthlyReport
  workingDays: WorkingDayDetail[]
  eodReports: DailyEodReport[]
}

export interface RecentActivityItem {
  id: string
  type: "task_created" | "task_progress" | "task_completed" | "leave_applied" | "lunch_break"
  title: string
  description: string
  timestamp: string
  meta?: {
    taskId?: string
    progress?: number
    status?: string
  }
}
