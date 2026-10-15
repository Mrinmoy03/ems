import React, { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { format } from "date-fns"
import { getCurrentMonthKey, getMonthData } from "../data/mockReports"
import { YearMonthPicker } from "./YearMonthPicker"
import { useEmployee } from "../context/EmployeeContext"
import { isTaskCompletedLate } from "../utils/taskStatus"
import { formatStandardDate } from "../utils/date"
import { cn } from "@/lib/utils"
import {
  Briefcase,
  Clock,
  CheckCircle2,
  Search,
  AlertTriangle,
} from "lucide-react"

export interface WorkingDaysModalProps {
  isOpen: boolean
  onClose: () => void
  initialMonthKey?: string
}

export const WorkingDaysModal: React.FC<WorkingDaysModalProps> = ({
  isOpen,
  onClose,
  initialMonthKey,
}) => {
  const { tasks } = useEmployee()
  const defaultMonthKey = getCurrentMonthKey()
  const [selectedMonthKey, setSelectedMonthKey] = useState(initialMonthKey || defaultMonthKey)
  const [searchQuery, setSearchQuery] = useState("")

  // Keep synced if initialMonthKey changes
  React.useEffect(() => {
    if (initialMonthKey) {
      setSelectedMonthKey(initialMonthKey)
    }
  }, [initialMonthKey])

  const currentMonthData = getMonthData(selectedMonthKey)
  const { summary, workingDays, monthName, year } = currentMonthData

  // Merge live completed tasks into the active month's current day
  const resolvedWorkingDays = React.useMemo(() => {
    const activeKey = getCurrentMonthKey()
    if (selectedMonthKey !== activeKey || workingDays.length === 0) {
      return workingDays
    }

    const completedStateTasks = tasks.filter(t => t.progress === 100 || t.status === "completed")

    return workingDays.map((day, idx) => {
      if (idx !== 0) return day

      const existingIds = new Set(day.completedTasks.map(t => t.id))

      const updatedExisting = day.completedTasks.map(t => {
        const liveMatch = tasks.find(item => item.id === t.id)
        if (liveMatch) {
          return {
            ...t,
            isCompletedLate: isTaskCompletedLate(liveMatch),
            delayReason: liveMatch.comment || t.delayReason,
          }
        }
        return t
      })

      const newlyAdded = completedStateTasks
        .filter(t => !existingIds.has(t.id))
        .map(t => ({
          id: t.id,
          title: t.title,
          category: t.category,
          completedAt: t.completedAt,
          isCompletedLate: isTaskCompletedLate(t),
          delayReason: t.comment,
        }))

      const combined = [...newlyAdded, ...updatedExisting]

      const liveInProgress = tasks
        .filter(t => t.progress < 100 && t.status !== "completed")
        .map(t => {
          const tomorrow = new Date()
          tomorrow.setDate(tomorrow.getDate() + 1)
          return {
            id: t.id,
            title: t.title,
            category: t.category,
            progress: t.progress,
            status: (t.status === "overdue" ? "overdue" : "in-progress") as "in-progress" | "pending" | "overdue",
            carriedForwardTo: `Next Shift (${format(tomorrow, "MMM dd, yyyy")})`,
            notes: t.comment || "In progress",
          }
        })

      return {
        ...day,
        date: idx === 0 ? formatStandardDate(new Date()) : day.date,
        dayOfWeek: idx === 0 ? format(new Date(), "EEEE") : day.dayOfWeek,
        tasksCompletedCount: combined.length,
        tasksCompletedLateCount: combined.filter(t => t.isCompletedLate).length,
        completedTasks: combined,
        inProgressTasks: liveInProgress,
      }
    })
  }, [workingDays, selectedMonthKey, tasks])

  const filteredDays = resolvedWorkingDays.filter(day => {
    const q = searchQuery.toLowerCase()
    return (
      day.date.toLowerCase().includes(q) ||
      day.dayOfWeek.toLowerCase().includes(q) ||
      day.hoursFormatted.toLowerCase().includes(q) ||
      day.completedTasks.some(t => t.title.toLowerCase().includes(q) || t.id.toLowerCase().includes(q))
    )
  })

  return (
    <Dialog open={isOpen} onOpenChange={open => !open && onClose()}>
      <DialogContent className="max-w-3xl max-h-[85vh] flex flex-col p-0 overflow-hidden bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
        {/* Header */}
        <DialogHeader className="p-5 pb-3 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pr-6">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 rounded-lg">
                <Briefcase className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  Working Days & Hours Breakdown
                </DialogTitle>
                <DialogDescription className="text-xs text-slate-500 dark:text-slate-400">
                  Detailed shift duration and attendance logs for {monthName} {year}
                </DialogDescription>
              </div>
            </div>

            {/* Year & Month Picker inside Modal */}
            <YearMonthPicker
              selectedMonthKey={selectedMonthKey}
              onMonthChange={setSelectedMonthKey}
              variant="compact"
            />
          </div>

          {/* Quick Metrics Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
            <div className="p-2.5 rounded-lg bg-blue-50/60 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/50">
              <span className="text-[10px] text-blue-700 dark:text-blue-300 font-medium uppercase tracking-wider block">
                Working Days
              </span>
              <span className="text-base font-bold text-blue-950 dark:text-blue-100">
                {summary.daysPresent} / {summary.workingDays}
              </span>
              <span className="text-[10px] text-blue-600 dark:text-blue-400 block mt-0.5">
                Present / Scheduled
              </span>
            </div>

            <div className="p-2.5 rounded-lg bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/50">
              <span className="text-[10px] text-indigo-700 dark:text-indigo-300 font-medium uppercase tracking-wider block">
                Hours Logged
              </span>
              <span className="text-base font-bold text-indigo-950 dark:text-indigo-100">
                {summary.totalHoursWorked}h
              </span>
              <span className="text-[10px] text-indigo-600 dark:text-indigo-400 block mt-0.5">
                Avg {(summary.totalHoursWorked / summary.daysPresent).toFixed(1)}h/day
              </span>
            </div>

            <div className="p-2.5 rounded-lg bg-emerald-50/60 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/50">
              <span className="text-[10px] text-emerald-700 dark:text-emerald-300 font-medium uppercase tracking-wider block">
                Tasks Completed
              </span>
              <span className="text-base font-bold text-emerald-950 dark:text-emerald-100">
                {summary.tasksCompleted}
              </span>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 block mt-0.5">
                {summary.completionRate}% completion rate
              </span>
            </div>

            <div className="p-2.5 rounded-lg bg-amber-50/60 dark:bg-amber-950/40 border border-amber-100 dark:border-amber-900/50">
              <span className="text-[10px] text-amber-700 dark:text-amber-300 font-medium uppercase tracking-wider block">
                Avg Task Time
              </span>
              <span className="text-base font-bold text-amber-950 dark:text-amber-100">
                {summary.averageCompletionHours}h
              </span>
              <span className="text-[10px] text-amber-600 dark:text-amber-400 block mt-0.5">
                Per Deliverable
              </span>
            </div>
          </div>
        </DialogHeader>

        {/* Search & Filter Bar */}
        <div className="p-3 px-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/60 flex items-center justify-between gap-3 shrink-0">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
            <Input
              type="text"
              placeholder="Search by date, day, or task title..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-8 h-8 text-xs bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
            />
          </div>
          <span className="text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">
            Showing <strong className="text-slate-800 dark:text-slate-200">{filteredDays.length}</strong> of {workingDays.length} working days
          </span>
        </div>

        {/* Scrollable Working Days Table */}
        <div className="flex-1 min-h-0 overflow-y-auto scrollbar-thin">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="sticky top-0 z-10 bg-slate-50/95 dark:bg-slate-900/95 backdrop-blur-sm border-b border-slate-200 dark:border-slate-800">
              <tr className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                <th className="py-2.5 px-4 w-10 text-center">#</th>
                <th className="py-2.5 px-4">Date & Day</th>
                <th className="py-2.5 px-4">Punch In / Out</th>
                <th className="py-2.5 px-4">Hours Logged</th>
                <th className="py-2.5 px-4">Status</th>
                <th className="py-2.5 px-4">Tasks Completed</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredDays.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    No working days matching "{searchQuery}"
                  </td>
                </tr>
              ) : (
                filteredDays.map((day, idx) => (
                  <tr
                    key={day.date}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="py-3 px-4 text-center font-mono text-slate-400 text-[11px]">
                      {idx + 1}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900 dark:text-slate-100">
                        {day.date}
                      </div>
                      <div className="text-[11px] text-slate-400">{day.dayOfWeek}</div>
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-300 font-mono text-[11px] whitespace-nowrap">
                      {day.checkIn} - {day.checkOut}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                        <Clock className="h-3 w-3 text-blue-500" />
                        {day.hoursFormatted}
                      </span>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        Present
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            {day.tasksCompletedCount} Tasks
                          </span>
                          {day.tasksCompletedLateCount && day.tasksCompletedLateCount > 0 ? (
                            <span className="text-[10px] font-semibold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-1.5 py-0.5 rounded border border-amber-200 dark:border-amber-800 flex items-center gap-1">
                              <AlertTriangle className="h-2.5 w-2.5" />
                              {day.tasksCompletedLateCount} late
                            </span>
                          ) : null}
                        </div>
                        <div className="flex flex-wrap gap-1 max-w-sm">
                          {day.completedTasks.map(task => (
                            <span
                              key={task.id}
                              title={task.delayReason ? `${task.title} (Delay: ${task.delayReason})` : task.title}
                              className={cn(
                                "text-[10px] px-1.5 py-0.5 rounded truncate max-w-[190px] inline-flex items-center gap-1",
                                task.isCompletedLate
                                  ? "bg-amber-50 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800/80"
                                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                              )}
                            >
                              <strong className="font-mono text-slate-800 dark:text-slate-200 mr-0.5">{task.id}:</strong>
                              <span className="truncate">{task.title}</span>
                              {task.isCompletedLate && (
                                <span className="text-[9px] font-bold text-amber-700 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/60 px-1 rounded shrink-0">
                                  Late
                                </span>
                              )}
                            </span>
                          ))}
                        </div>
                        {day.inProgressTasks && day.inProgressTasks.length > 0 && (
                          <div className="flex flex-wrap gap-1 max-w-sm pt-1 border-t border-slate-100 dark:border-slate-800">
                            {day.inProgressTasks.map(task => (
                              <span
                                key={task.id}
                                title={`${task.title} (${task.progress}% - Carried Forward)`}
                                className="text-[10px] px-1.5 py-0.5 rounded truncate max-w-[190px] inline-flex items-center gap-1 bg-blue-50/80 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200/70 dark:border-blue-800/60"
                              >
                                <strong className="font-mono mr-0.5">{task.id}:</strong>
                                <span className="truncate">{task.title}</span>
                                <span className="text-[9px] font-bold bg-blue-100 dark:bg-blue-900/60 px-1 rounded shrink-0">
                                  {task.progress ?? 0}%
                                </span>
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="p-3 px-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/60 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 shrink-0">
          <span>
            Total logged in {monthName} {year}: <strong className="text-slate-800 dark:text-slate-200">{summary.totalHoursWorked} hours</strong>
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            className="h-8 text-xs border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300"
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
