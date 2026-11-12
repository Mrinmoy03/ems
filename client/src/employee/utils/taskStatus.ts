import { EmployeeTask, TaskStatus, TaskCounts } from "../types/task"

/**
 * Derives the strict status of a task.
 * Business Rules:
 * 1. Completed tasks (progress === 100 or status === 'completed') can NEVER be overdue.
 * 2. Incomplete tasks past their deadline are 'overdue'.
 * 3. Tasks in progress with valid deadlines are 'in-progress'.
 * 4. Unstarted tasks are 'pending'.
 */
export function deriveTaskStatus(task: Pick<EmployeeTask, 'deadline' | 'status' | 'progress'>, referenceTime = new Date()): TaskStatus {
  if (task.progress === 100 || task.status === "completed") {
    return "completed"
  }

  const deadlineDate = new Date(task.deadline)
  if (!isNaN(deadlineDate.getTime()) && deadlineDate.getTime() < referenceTime.getTime()) {
    return "overdue"
  }

  if (task.progress > 0 || task.status === "in-progress") {
    return "in-progress"
  }

  return "pending"
}

/**
 * Calculates live task counts ensuring single source of truth across all components.
 */
export function calculateTaskCounts(tasks: EmployeeTask[], referenceTime = new Date()): TaskCounts {
  const counts: TaskCounts = {
    all: tasks.length,
    pending: 0,
    inProgress: 0,
    completed: 0,
    overdue: 0,
  }

  for (const task of tasks) {
    const currentStatus = deriveTaskStatus(task, referenceTime)
    if (currentStatus === "completed") {
      counts.completed++
    } else if (currentStatus === "overdue") {
      counts.overdue++
    } else if (currentStatus === "in-progress") {
      counts.inProgress++
    } else {
      counts.pending++
    }
  }

  return counts
}

/**
 * Returns today's date formatted as YYYY-MM-DD in local time
 */
export function getTodayDateString(): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, "0")
  const day = String(now.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

/**
 * Determines if a task belongs to a specific calendar date view.
 * 1. For Today:
 *    - Incomplete tasks (pending, in-progress, overdue) carry forward and are shown for today.
 *    - Completed tasks are ONLY shown if they were completed today. Tasks completed on prior days belong to history.
 * 2. For any specific date (e.g. 2026-11-09):
 *    - Matches tasks completed on that date, scheduled for that date, or created on that date.
 * 3. For empty date (""):
 *    - Matches all tasks across all dates.
 */
export function isTaskForDate(task: EmployeeTask, targetDateStr: string, todayStr = getTodayDateString()): boolean {
  if (!targetDateStr) return true

  const isCompleted = task.progress === 100 || task.status === "completed"
  // Strictly DO NOT fall back to updatedAt: updatedAt gets modified on any record write/sync.
  const completedDate = (task.completedAt || "").slice(0, 10)
  const deadlineDate = (task.deadline || "").slice(0, 10)
  const createdDate = (task.createdAt || "").slice(0, 10)

  if (targetDateStr === todayStr) {
    if (isCompleted) {
      // Completed deliverables ONLY belong to today if they were completed today,
      // or if scheduled for today and not completed on a prior date.
      return (Boolean(completedDate) && completedDate === todayStr) || (!completedDate && deadlineDate === todayStr)
    }
    // Incomplete tasks (pending, in-progress, overdue) always carry forward and are shown in today's active tasks
    return true
  }

  return (
    completedDate === targetDateStr ||
    deadlineDate === targetDateStr ||
    createdDate === targetDateStr ||
    Boolean(task.deadline && task.deadline.includes(targetDateStr)) ||
    Boolean(task.completedAt && task.completedAt.includes(targetDateStr))
  )
}

/**
 * Checks if a task was completed after its deadline or flagged as completed late.
 */
export function isTaskCompletedLate(
  task: Pick<EmployeeTask, "completedAt" | "deadline" | "status" | "progress" | "isCompletedLate">
): boolean {
  if (task.isCompletedLate) return true
  const isCompleted = task.progress === 100 || task.status === "completed"
  if (!isCompleted || !task.completedAt || !task.deadline) return false
  const completedTime = new Date(task.completedAt).getTime()
  const deadlineTime = new Date(task.deadline).getTime()
  return !isNaN(completedTime) && !isNaN(deadlineTime) && completedTime > deadlineTime
}

export function getStatusBadgeConfig(status: TaskStatus, isLate = false) {
  switch (status) {
    case "completed":
      if (isLate) {
        return {
          variant: "warning" as const,
          label: "Completed (Late)",
          colorClass: "text-amber-800 bg-amber-50/90 border-amber-300 dark:text-amber-300 dark:bg-amber-950/70 dark:border-amber-700/80",
          dotColor: "bg-amber-500",
        }
      }
      return {
        variant: "success" as const,
        label: "Completed",
        colorClass: "text-emerald-700 bg-emerald-50 border-emerald-200 dark:text-emerald-300 dark:bg-emerald-950/60 dark:border-emerald-800",
        dotColor: "bg-emerald-500",
      }
    case "in-progress":
      return {
        variant: "warning" as const,
        label: "In Progress",
        colorClass: "text-amber-700 bg-amber-50 border-amber-200 dark:text-amber-300 dark:bg-amber-950/60 dark:border-amber-800",
        dotColor: "bg-amber-500",
      }
    case "overdue":
      return {
        variant: "destructive" as const,
        label: "Overdue",
        colorClass: "text-red-700 bg-red-50 border-red-200 dark:text-red-300 dark:bg-red-950/60 dark:border-red-800",
        dotColor: "bg-red-500",
      }
    case "pending":
    default:
      return {
        variant: "pending" as const,
        label: "Pending",
        colorClass: "text-slate-600 bg-slate-100 border-slate-200 dark:text-slate-300 dark:bg-slate-800 dark:border-slate-700",
        dotColor: "bg-slate-400",
      }
  }
}
