export type TaskStatus = "pending" | "in-progress" | "completed" | "overdue"

export type TaskProgress = 0 | 25 | 50 | 75 | 100

export interface EmployeeTask {
  id: string
  title: string
  description?: string
  category?: string
  deadline: string // ISO date-time string
  status: TaskStatus
  progress: TaskProgress
  isSelfCreated: boolean
  comment?: string // Explanation comment for delay/progress
  completedAt?: string
  isCompletedLate?: boolean // Flag indicating task was completed after deadline
  carriedOverFrom?: string // Date e.g. "Oct 14, 2026" if continued from previous day
  carriedOverNotes?: string // Progress notes when carried forward
  createdAt: string
  updatedAt: string
}

export type TaskFilterType = "all" | "pending" | "in-progress" | "completed" | "overdue"

export interface TaskCounts {
  all: number
  pending: number
  inProgress: number
  completed: number
  overdue: number
}
