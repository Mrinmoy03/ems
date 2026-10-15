import { useMemo } from "react"
import { format } from "date-fns"
import { DailyEodReport, MonthData } from "../types/report"
import { EmployeeTask } from "../types/task"
import { WorkSessionState } from "../types/timer"
import { isTaskCompletedLate } from "../utils/taskStatus"
import { formatDurationToHuman } from "../utils/formatDuration"
import { formatStandardDate } from "../utils/date"
import { getCurrentMonthKey } from "../data/mockReports"

interface UseResolvedEodReportsParams {
  currentMonthData: MonthData
  selectedMonthKey: string
  tasks: EmployeeTask[]
  timer: {
    sessionState: WorkSessionState
    elapsedSeconds: number
    logoutTime?: string | null
  }
}

/**
 * Hook to resolve and synchronize EOD shift reports.
 * Dynamically binds live EmployeeContext task states, late flags, and working timer
 * metrics with active and historical monthly report data.
 */
export function useResolvedEodReports({
  currentMonthData,
  selectedMonthKey,
  tasks,
  timer,
}: UseResolvedEodReportsParams): DailyEodReport[] {
  return useMemo(() => {
    const baseReports = currentMonthData.eodReports || []
    const activeKey = getCurrentMonthKey()
    if (selectedMonthKey !== activeKey || baseReports.length === 0) {
      return baseReports
    }

    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    const nextShiftLabel = `Next Shift (${format(tomorrow, "MMM dd, yyyy")})`

    // Live tasks that are completed (progress === 100 or status === "completed")
    const completedStateTasks = tasks.filter(t => t.progress === 100 || t.status === "completed")

    // Live tasks that are in-progress / overdue / pending (progress < 100 and status !== "completed")
    const liveInProgressTasks = tasks
      .filter(t => t.progress < 100 && t.status !== "completed")
      .map(t => ({
        id: t.id,
        title: t.title,
        category: t.category,
        progress: t.progress,
        status: (t.status === "overdue" ? "overdue" : "in-progress") as "in-progress" | "pending" | "overdue",
        carriedForwardTo: nextShiftLabel,
        notes: t.comment || "Active assignment in progress; carrying forward to next shift.",
      }))

    return baseReports.map((rep, idx) => {
      const matchingDay = currentMonthData.workingDays?.find(w => w.date === rep.date)
      const fallbackCheckIn = rep.checkIn || matchingDay?.checkIn || "08:45 AM"
      const fallbackCheckOut = rep.checkOut || matchingDay?.checkOut || "06:00 PM"
      const fallbackBreak = rep.breakDuration || matchingDay?.breakDuration || "45m"

      // Historical reports (idx !== 0)
      if (idx !== 0) {
        return {
          ...rep,
          checkIn: fallbackCheckIn,
          checkOut: fallbackCheckOut,
          breakDuration: fallbackBreak,
        }
      }

      // Today's shift (idx === 0)
      const existingTaskIds = new Set(rep.completedTasks.map(t => t.id))

      // Update any existing tasks with live late status / comments if tracked
      const updatedExisting = rep.completedTasks.map(t => {
        const liveMatch = tasks.find(item => item.id === t.id)
        if (liveMatch) {
          const isLate = isTaskCompletedLate(liveMatch)
          return {
            ...t,
            isCompletedLate: isLate,
            delayReason: liveMatch.comment || t.delayReason,
          }
        }
        return t
      })

      // Add newly completed tasks that aren't yet in the EOD shift report
      const newlyAdded = completedStateTasks
        .filter(t => !existingTaskIds.has(t.id))
        .map(t => ({
          id: t.id,
          title: t.title,
          category: t.category,
          completedAt: t.completedAt,
          isCompletedLate: isTaskCompletedLate(t),
          delayReason: t.comment,
        }))

      const combinedTasks = [...newlyAdded, ...updatedExisting]
      const lateCount = combinedTasks.filter(t => t.isCompletedLate).length

      const isLoggedOut = timer.sessionState === "logged-out"
      const isOnBreak = timer.sessionState === "on-break"
      const formattedWorkedHours = formatDurationToHuman(timer.elapsedSeconds)

      return {
        ...rep,
        date: formatStandardDate(new Date()),
        dayOfWeek: format(new Date(), "EEEE"),
        checkIn: fallbackCheckIn,
        checkOut: isLoggedOut
          ? (timer.logoutTime ? new Date(timer.logoutTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "05:45 PM")
          : "Live Session (Active Shift)",
        breakDuration: "45m",
        hoursLogged: isLoggedOut
          ? `${formattedWorkedHours} logged`
          : `${formattedWorkedHours} (live session)`,
        hoursWorked: Number((timer.elapsedSeconds / 3600).toFixed(2)),
        submittedAt: isLoggedOut
          ? (timer.logoutTime || new Date().toISOString())
          : "Active Shift (Auto-submits on Logout)",
        tasksCompleted: combinedTasks.length,
        tasksCompletedLate: lateCount,
        tasksPending: liveInProgressTasks.length,
        tasksInProgressCount: liveInProgressTasks.length,
        completedTasks: combinedTasks,
        inProgressTasks: liveInProgressTasks,
        summary: isLoggedOut
          ? `Today's shift finalized and submitted upon logout. Delivered ${combinedTasks.length} deliverables with ${liveInProgressTasks.length} in-progress tasks carried forward to next shift. Total ${formattedWorkedHours} logged.`
          : isOnBreak
          ? `Shift paused on lunch break. ${combinedTasks.length} deliverables completed, ${liveInProgressTasks.length} tasks in progress.`
          : `Active work shift in progress. Tracking session duration live with ${combinedTasks.length} completed deliverables and ${liveInProgressTasks.length} in-progress tasks today.`,
      }
    })
  }, [currentMonthData, selectedMonthKey, tasks, timer.sessionState, timer.elapsedSeconds, timer.logoutTime])
}
