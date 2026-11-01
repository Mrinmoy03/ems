import React, { createContext, useContext, useState, useMemo, useCallback, useEffect, useRef } from "react"
import { EmployeeProfile, EmployeeNotification, NotificationPreferences } from "../types/employee"
import { EmployeeTask, TaskProgress, TaskCounts } from "../types/task"
import { LeaveRequest, ApplyLeaveInput, UpdateLeaveInput } from "../types/leave"
import { RecentActivityItem } from "../types/report"
import { initialMockEmployee, initialMockNotifications } from "../data/mockEmployee"
import { initialMockTasks } from "../data/mockTasks"
import { initialMockLeaveRequests } from "../data/mockLeaveRequests"
import { initialRecentActivities } from "../data/mockReports"
import { deriveTaskStatus, calculateTaskCounts } from "../utils/taskStatus"
import { formatDurationToHuman } from "../utils/formatDuration"
import { useWorkingTimer } from "../hooks/useWorkingTimer"
import { useProjects } from "../../context/ProjectContext"
import { toast } from "sonner"

interface AddTaskInput {
  title: string
  description?: string
  category?: string
  deadline: string
  isSelfCreated?: boolean
  projectId?: string
  projectName?: string
  projectPartId?: string
  projectPartName?: string
}

const DEFAULT_NOTIFICATION_PREFERENCES: NotificationPreferences = {
  taskDeadlineApproaching: true,
  lunchBreakReminder: true,
  eodAutoDigest: true,
}

interface EmployeeContextValue {
  employee: EmployeeProfile
  notifications: EmployeeNotification[]
  unreadNotificationCount: number
  notificationPreferences: NotificationPreferences
  tasks: EmployeeTask[]
  taskCounts: TaskCounts
  leaveRequests: LeaveRequest[]
  recentActivities: RecentActivityItem[]
  timer: ReturnType<typeof useWorkingTimer>

  // Actions
  updateEmployeeAvatar: (newUrl: string) => void
  markNotificationRead: (id: string) => void
  markAllNotificationsRead: () => void
  addNotification: (
    input: Omit<EmployeeNotification, "id" | "isRead" | "timestamp"> & { timestamp?: string }
  ) => void
  updateNotificationPreferences: (prefs: Partial<NotificationPreferences>) => void
  addTask: (input: AddTaskInput) => EmployeeTask
  updateTaskProgress: (id: string, progress: TaskProgress, comment?: string) => void
  updateTaskComment: (id: string, comment: string) => void
  markTaskComplete: (id: string) => void
  applyForLeave: (input: ApplyLeaveInput) => LeaveRequest
  updateLeaveRequest: (input: UpdateLeaveInput) => boolean
}

const EmployeeContext = createContext<EmployeeContextValue | undefined>(undefined)

export const EmployeeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { syncTaskProgressToProject } = useProjects()
  const [employee, setEmployee] = useState<EmployeeProfile>(initialMockEmployee)
  const [notifications, setNotifications] = useState<EmployeeNotification[]>(initialMockNotifications)
  const [tasks, setTasks] = useState<EmployeeTask[]>(initialMockTasks)
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>(initialMockLeaveRequests)
  const [recentActivities, setRecentActivities] = useState<RecentActivityItem[]>(initialRecentActivities)

  // Notification Preferences with localStorage persistence
  const [notificationPreferences, setNotificationPreferences] = useState<NotificationPreferences>(() => {
    try {
      const saved = localStorage.getItem("worktrack_notification_preferences")
      return saved ? JSON.parse(saved) : DEFAULT_NOTIFICATION_PREFERENCES
    } catch {
      return DEFAULT_NOTIFICATION_PREFERENCES
    }
  })

  const updateNotificationPreferences = useCallback((prefs: Partial<NotificationPreferences>) => {
    setNotificationPreferences(prev => {
      const updated = { ...prev, ...prefs }
      try {
        localStorage.setItem("worktrack_notification_preferences", JSON.stringify(updated))
      } catch {
        // ignore storage errors
      }
      return updated
    })
  }, [])

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

  // When a notification is marked as read, remove it from active notification bar
  const markNotificationRead = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
    toast.success("Notification marked as read")
  }, [])

  // When all notifications are marked as read, clear them all from notification bar
  const markAllNotificationsRead = useCallback(() => {
    setNotifications([])
    toast.success("All notifications marked as read")
  }, [])

  // Add new notification and ensure it is always prepended to the top
  const addNotification = useCallback(
    (input: Omit<EmployeeNotification, "id" | "isRead" | "timestamp"> & { timestamp?: string }) => {
      const newNotif: EmployeeNotification = {
        id: `notif-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        timestamp: input.timestamp || new Date().toISOString(),
        isRead: false,
        ...input,
      }
      setNotifications(prev => [newNotif, ...prev])
    },
    []
  )

  // --- REACTIVE NOTIFICATION ALERT LOGIC ---

  // 1. Task Deadline Approaching (30 Minutes Before Deadline)
  const alertedDeadlineTaskIdsRef = useRef<Set<string>>(new Set())

  useEffect(() => {
    if (!notificationPreferences.taskDeadlineApproaching) return

    const checkImpendingDeadlines = () => {
      const now = Date.now()
      tasks.forEach(task => {
        if (task.progress === 100 || task.status === "completed") return
        const deadlineTime = new Date(task.deadline).getTime()
        if (isNaN(deadlineTime)) return

        const diffMs = deadlineTime - now
        // Between 0 and 30 minutes away
        if (diffMs > 0 && diffMs <= 30 * 60 * 1000) {
          if (!alertedDeadlineTaskIdsRef.current.has(task.id)) {
            alertedDeadlineTaskIdsRef.current.add(task.id)
            const minutesLeft = Math.max(1, Math.round(diffMs / 60000))
            addNotification({
              title: "Task Deadline Approaching",
              message: `"${task.title}" is due in ${minutesLeft} minute${minutesLeft === 1 ? "" : "s"} (${task.category}).`,
              type: "reminder",
            })
            toast.warning(`Deadline approaching: "${task.title}"`, {
              description: `Due in ${minutesLeft} minute${minutesLeft === 1 ? "" : "s"}. Please update progress or submit deliverable.`,
            })
          }
        }
      })
    }

    checkImpendingDeadlines()
    const interval = window.setInterval(checkImpendingDeadlines, 10000)
    return () => window.clearInterval(interval)
  }, [tasks, notificationPreferences.taskDeadlineApproaching, addNotification])

  // 2. Lunch Break Active Reminder (> 60 Minutes)
  const lunchAlertTriggeredRef = useRef(false)

  useEffect(() => {
    if (timer.sessionState === "on-break") {
      lunchAlertTriggeredRef.current = false
    }
  }, [timer.sessionState])

  useEffect(() => {
    if (!notificationPreferences.lunchBreakReminder) return
    if (timer.sessionState !== "on-break" || !timer.currentBreakStart) return

    const checkBreakDuration = () => {
      const breakStartMs = new Date(timer.currentBreakStart!).getTime()
      const breakSec = Math.max(0, Math.floor((Date.now() - breakStartMs) / 1000))

      // 60 minutes threshold = 3600 seconds
      if (breakSec >= 3600 && !lunchAlertTriggeredRef.current) {
        lunchAlertTriggeredRef.current = true
        addNotification({
          title: "Lunch Break Exceeded",
          message: "Your active lunch break has exceeded 60 minutes. Please resume your shift.",
          type: "reminder",
        })
        toast.warning("Lunch break exceeded 60 minutes", {
          description: "Click 'Resume Shift' on your working timer to resume tracking active work hours.",
        })
      }
    }

    checkBreakDuration()
    const interval = window.setInterval(checkBreakDuration, 5000)
    return () => window.clearInterval(interval)
  }, [timer.sessionState, timer.currentBreakStart, notificationPreferences.lunchBreakReminder, addNotification])

  // 3. Daily EOD Auto-Digest (Workday Wrap-Up Summary)
  const eodDigestTriggeredRef = useRef(false)

  useEffect(() => {
    if (timer.sessionState === "working") {
      eodDigestTriggeredRef.current = false
    }

    if (timer.sessionState === "logged-out" && notificationPreferences.eodAutoDigest) {
      if (!eodDigestTriggeredRef.current) {
        eodDigestTriggeredRef.current = true
        const completedCount = tasks.filter(t => t.progress === 100 || t.status === "completed").length
        const formattedHours = formatDurationToHuman(timer.elapsedSeconds)
        addNotification({
          title: "Daily EOD Shift Digest",
          message: `Shift wrapped up! You logged ${formattedHours} with ${completedCount} deliverable(s) completed today.`,
          type: "reminder",
        })
        toast.success("EOD Shift Digest compiled", {
          description: `Logged ${formattedHours} with ${completedCount} completed deliverable(s).`,
        })
      }
    }
  }, [timer.sessionState, timer.elapsedSeconds, tasks, notificationPreferences.eodAutoDigest, addNotification])

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
      projectId: input.projectId,
      projectName: input.projectName,
      projectPartId: input.projectPartId,
      projectPartName: input.projectPartName,
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

    // Prepend new notification to top of notification bar
    addNotification({
      title: "New Task Created",
      message: `Task "${newTask.title}" (${newTask.category}) was added to your queue.`,
      timestamp: nowIso,
      type: "task",
    })

    toast.success(`Task "${newTask.title}" created successfully`)
    return newTask
  }, [addNotification])

  const updateTaskProgress = useCallback((id: string, progress: TaskProgress, comment?: string) => {
    const nowIso = new Date().toISOString()

    // Sync to parent project part if this task is project-linked
    const targetTask = tasks.find(t => t.id === id)
    if (targetTask?.projectId && targetTask?.projectPartId) {
      syncTaskProgressToProject(targetTask.projectId, targetTask.projectPartId, progress)
    }

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
      addNotification({
        title: "Task Completed",
        message: `Task ${id} has been marked as completed!`,
        timestamp: nowIso,
        type: "task",
      })
      toast.success(`Task ${id} marked as completed!`)
    } else {
      toast.success(`Task progress updated to ${progress}%`)
    }
  }, [addNotification, tasks, syncTaskProgressToProject])

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

    // Prepend new notification to top of notification bar
    addNotification({
      title: "Leave Request Submitted",
      message: `Your ${newLeave.leaveType} for ${newLeave.daysCount} day(s) was submitted.`,
      timestamp: nowIso,
      type: "leave",
    })

    toast.success("Leave application submitted successfully (Pending Super Admin approval)")
    return newLeave
  }, [addNotification])

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
      notificationPreferences,
      tasks,
      taskCounts,
      leaveRequests,
      recentActivities,
      timer,
      updateEmployeeAvatar,
      markNotificationRead,
      markAllNotificationsRead,
      addNotification,
      updateNotificationPreferences,
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
      notificationPreferences,
      tasks,
      taskCounts,
      leaveRequests,
      recentActivities,
      timer,
      updateEmployeeAvatar,
      markNotificationRead,
      markAllNotificationsRead,
      addNotification,
      updateNotificationPreferences,
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
