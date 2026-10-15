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
