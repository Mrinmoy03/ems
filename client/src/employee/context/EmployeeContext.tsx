import React, { createContext, useContext, useState, useMemo, useCallback } from "react"
import { EmployeeProfile, EmployeeNotification } from "../types/employee"
import { EmployeeTask, TaskProgress, TaskCounts } from "../types/task"
import { LeaveRequest, ApplyLeaveInput, UpdateLeaveInput } from "../types/leave"
import { RecentActivityItem } from "../types/report"
import { initialMockEmployee, initialMockNotifications } from "../data/mockEmployee"
import { initialMockTasks } from "../data/mockTasks"
import { initialMockLeaveRequests } from "../data/mockLeaveRequests"
import { initialRecentActivities } from "../data/mockReports"
import { deriveTaskStatus, calculateTaskCounts } from "../utils/taskStatus"
import { useWorkingTimer } from "../hooks/useWorkingTimer"
import { toast } from "sonner"

interface AddTaskInput {
  title: string
  description?: string
  category?: string
  deadline: string
  isSelfCreated?: boolean
}

interface EmployeeContextValue {
  employee: EmployeeProfile
  notifications: EmployeeNotification[]
  unreadNotificationCount: number
  tasks: EmployeeTask[]
  taskCounts: TaskCounts
  leaveRequests: LeaveRequest[]
  recentActivities: RecentActivityItem[]
  timer: ReturnType<typeof useWorkingTimer>

  // Actions
  updateEmployeeAvatar: (newUrl: string) => void
  markNotificationRead: (id: string) => void
  markAllNotificationsRead: () => void
  addTask: (input: AddTaskInput) => EmployeeTask
  updateTaskProgress: (id: string, progress: TaskProgress, comment?: string) => void
  updateTaskComment: (id: string, comment: string) => void
  markTaskComplete: (id: string) => void
  applyForLeave: (input: ApplyLeaveInput) => LeaveRequest
  updateLeaveRequest: (input: UpdateLeaveInput) => boolean
}

const EmployeeContext = createContext<EmployeeContextValue | undefined>(undefined)

export const EmployeeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [employee, setEmployee] = useState<EmployeeProfile>(initialMockEmployee)
  const [notifications, setNotifications] = useState<EmployeeNotification[]>(initialMockNotifications)
  const [tasks, setTasks] = useState<EmployeeTask[]>(initialMockTasks)
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>(initialMockLeaveRequests)
  const [recentActivities, setRecentActivities] = useState<RecentActivityItem[]>(initialRecentActivities)

  const timer = useWorkingTimer()

  // Calculate live task counts
  const taskCounts = useMemo(() => {
    return calculateTaskCounts(tasks)
  }, [tasks])

  const unreadNotificationCount = useMemo(() => {
    return notifications.filter(n => !n.isRead).length
  }, [notifications])

  const updateEmployeeAvatar = useCallback((newUrl: string) => {
    setEmployee(prev => ({ ...prev, avatarUrl: newUrl }))
    toast.success("Profile avatar updated successfully")
  }, [])

  const markNotificationRead = useCallback((id: string) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, isRead: true } : n))
    )
  }, [])

  const markAllNotificationsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
    toast.success("All notifications marked as read")
  }, [])

  const addTask = useCallback((input: AddTaskInput): EmployeeTask => {
    const nowIso = new Date().toISOString()
    const newTask: EmployeeTask = {
      id: `TSK-${Math.floor(100 + Math.random() * 900)}`,
      title: input.title.trim(),
      description: input.description?.trim(),
      category: input.category || "General",
      deadline: input.deadline,
      status: "pending",
      progress: 0,
      isSelfCreated: input.isSelfCreated ?? true,
      createdAt: nowIso,
      updatedAt: nowIso,
    }

    setTasks(prev => [newTask, ...prev])

    // Record activity
    setRecentActivities(prev => [
      {
        id: `act-${Date.now()}`,
        type: "task_created",
        title: "Task Added",
        description: `Added "${newTask.title}" to task list.`,
        timestamp: nowIso,
        meta: { taskId: newTask.id },
      },
      ...prev,
    ])

    toast.success(`Task "${newTask.title}" created successfully`)
    return newTask
  }, [])

  const updateTaskProgress = useCallback((id: string, progress: TaskProgress, comment?: string) => {
    const nowIso = new Date().toISOString()

    setTasks(prev =>
      prev.map(task => {
        if (task.id !== id) return task

        const isCompleted = progress === 100
        const deadlineTime = new Date(task.deadline).getTime()
        const isNowPastDeadline = !isNaN(deadlineTime) && Date.now() > deadlineTime
        const wasOverdue = task.status === "overdue" || isNowPastDeadline
        const isCompletedLate = isCompleted ? (task.isCompletedLate || wasOverdue) : false

        const updatedTask: EmployeeTask = {
          ...task,
          progress,
          comment: comment ? comment.trim() : task.comment,
          status: isCompleted ? "completed" : deriveTaskStatus({ ...task, progress }),
          completedAt: isCompleted ? (task.completedAt || nowIso) : task.completedAt,
          isCompletedLate,
          updatedAt: nowIso,
        }

        return updatedTask
      })
    )

    setRecentActivities(prev => [
      {
        id: `act-${Date.now()}`,
        type: progress === 100 ? "task_completed" : "task_progress",
        title: progress === 100 ? "Task Completed" : "Progress Updated",
        description:
          progress === 100
            ? `Completed task ${id} (100%).`
            : `Updated task ${id} progress to ${progress}%.`,
        timestamp: nowIso,
        meta: { taskId: id, progress },
      },
      ...prev,
    ])

    if (progress === 100) {
      toast.success(`Task ${id} marked as completed!`)
    } else {
      toast.success(`Task progress updated to ${progress}%`)
    }
  }, [])

  const updateTaskComment = useCallback((id: string, comment: string) => {
    const nowIso = new Date().toISOString()
    setTasks(prev =>
      prev.map(task => {
        if (task.id !== id) return task
        return {
          ...task,
          comment: comment.trim(),
          updatedAt: nowIso,
        }
      })
    )
    toast.success("Delay note / explanation updated successfully")
  }, [])

  const markTaskComplete = useCallback((id: string) => {
    updateTaskProgress(id, 100)
  }, [updateTaskProgress])

  const applyForLeave = useCallback((input: ApplyLeaveInput): LeaveRequest => {
    const nowIso = new Date().toISOString()
    const newLeave: LeaveRequest = {
      id: `LV-${Math.floor(100 + Math.random() * 900)}`,
      leaveType: input.leaveType,
      startDate: input.startDate,
      endDate: input.endDate,
      daysCount: input.daysCount,
      reason: input.reason.trim(),
      status: "pending",
      appliedAt: nowIso,
    }

    setLeaveRequests(prev => [newLeave, ...prev])

    setRecentActivities(prev => [
      {
        id: `act-${Date.now()}`,
        type: "leave_applied",
        title: "Leave Applied",
        description: `Submitted ${newLeave.leaveType} for ${newLeave.daysCount} day(s).`,
        timestamp: nowIso,
      },
      ...prev,
    ])

    toast.success("Leave application submitted successfully (Pending Super Admin approval)")
    return newLeave
  }, [])

  const updateLeaveRequest = useCallback((input: UpdateLeaveInput): boolean => {
    let success = false
    let failureReason = ""

    setLeaveRequests(prev => {
      const target = prev.find(l => l.id === input.id)
      if (!target) {
        failureReason = "Leave request not found."
        return prev
      }

      if (target.status !== "pending") {
        failureReason = `Cannot edit leave request: This application has already been ${target.status} and cannot be modified.`
        return prev
      }

      success = true
      return prev.map(l => {
        if (l.id === input.id) {
          return {
            ...l,
            leaveType: input.leaveType,
            startDate: input.startDate,
            endDate: input.endDate,
            daysCount: input.daysCount,
            reason: input.reason.trim(),
          }
        }
        return l
      })
    })

    if (success) {
      setRecentActivities(prev => [
        {
          id: `act-${Date.now()}`,
          type: "leave_applied",
          title: "Leave Request Modified",
          description: `Updated ${input.leaveType} (${input.daysCount} day${input.daysCount === 1 ? "" : "s"}).`,
          timestamp: new Date().toISOString(),
        },
        ...prev,
      ])
      toast.success("Leave request updated successfully")
    } else if (failureReason) {
      toast.error(failureReason)
    }

    return success
  }, [])

  const value = useMemo(
    () => ({
      employee,
      notifications,
      unreadNotificationCount,
      tasks,
      taskCounts,
      leaveRequests,
      recentActivities,
      timer,
      updateEmployeeAvatar,
      markNotificationRead,
      markAllNotificationsRead,
      addTask,
      updateTaskProgress,
      updateTaskComment,
      markTaskComplete,
      applyForLeave,
      updateLeaveRequest,
    }),
    [
      employee,
      notifications,
      unreadNotificationCount,
      tasks,
      taskCounts,
      leaveRequests,
      recentActivities,
      timer,
      updateEmployeeAvatar,
      markNotificationRead,
      markAllNotificationsRead,
      addTask,
      updateTaskProgress,
      updateTaskComment,
      markTaskComplete,
      applyForLeave,
      updateLeaveRequest,
    ]
  )

  return <EmployeeContext.Provider value={value}>{children}</EmployeeContext.Provider>
}

export function useEmployee() {
  const context = useContext(EmployeeContext)
  if (!context) {
    throw new Error("useEmployee must be used within an EmployeeProvider")
  }
  return context
}
