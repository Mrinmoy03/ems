import React, { useState, useMemo } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Calendar,
  Clock,
  CheckCircle2,
  Search,
  Layers,
  ChevronLeft,
  ChevronRight,
  FileText,
  Info,
  CalendarRange,
  AlertTriangle,
  ArrowRightCircle,
  Hourglass,
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { format } from "date-fns"
import { getCurrentMonthKey, getMonthData } from "../data/mockReports"
import { formatStandardDate } from "../utils/date"
import { TaskStatusBadge } from "./TaskStatusBadge"
import { YearMonthPicker } from "./YearMonthPicker"
import { useEmployee } from "../context/EmployeeContext"
import { isTaskCompletedLate } from "../utils/taskStatus"
import { cn } from "@/lib/utils"

interface SelectedTaskDetails {
  id: string
  title: string
  category?: string
  date: string
  dayOfWeek: string
  hoursFormatted: string
  summary?: string
  isCompletedLate?: boolean
  delayReason?: string
}

export const TaskHistoryView: React.FC = () => {
  const { tasks } = useEmployee()
  const [selectedMonthKey, setSelectedMonthKey] = useState<string>(() => getCurrentMonthKey())
  const [searchQuery, setSearchQuery] = useState<string>("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [viewingTask, setViewingTask] = useState<SelectedTaskDetails | null>(null)
  const pageSize = 5 // Show 5 days per page for readability

  const monthData = getMonthData(selectedMonthKey)
  const { workingDays, summary, monthName, year } = monthData

  // Merge live completed tasks into the active month's current day
  const resolvedWorkingDays = useMemo(() => {
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

  // Reset page when month, search, or category changes
  React.useEffect(() => {
    setCurrentPage(1)
  }, [selectedMonthKey, searchQuery, selectedCategory])

  // Extract all unique categories for filter pills
  const availableCategories = useMemo(() => {
    const cats = new Set<string>()
    resolvedWorkingDays.forEach(day => {
      day.completedTasks.forEach(t => {
        if (t.category) cats.add(t.category)
      })
    })
    return ["all", ...Array.from(cats)]
  }, [resolvedWorkingDays])

  // Filter working days based on search query and category
  const filteredDays = useMemo(() => {
    const q = searchQuery.toLowerCase().trim()
    return resolvedWorkingDays
      .map(day => {
        // Filter tasks within the day
        const matchedTasks = day.completedTasks.filter(task => {
          const matchCat = selectedCategory === "all" || task.category === selectedCategory
          const matchSearch =
            !q ||
            task.title.toLowerCase().includes(q) ||
            task.id.toLowerCase().includes(q) ||
            (task.category && task.category.toLowerCase().includes(q)) ||
            day.date.toLowerCase().includes(q) ||
            day.dayOfWeek.toLowerCase().includes(q) ||
            (day.summary && day.summary.toLowerCase().includes(q))
          return matchCat && matchSearch
        })

        return {
          ...day,
          matchedTasks,
        }
      })
      .filter(day => day.matchedTasks.length > 0)
  }, [resolvedWorkingDays, searchQuery, selectedCategory])

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(filteredDays.length / pageSize))
  const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages)
  const displayedDays = useMemo(() => {
    const startIndex = (safeCurrentPage - 1) * pageSize
    return filteredDays.slice(startIndex, startIndex + pageSize)
  }, [filteredDays, safeCurrentPage, pageSize])

  const totalCompletedInView = useMemo(() => {
    return filteredDays.reduce((acc, d) => acc + d.matchedTasks.length, 0)
  }, [filteredDays])

  return (
    <div className="space-y-6">
      {/* 1. Header with Month Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2">
            Day-by-Day Task & Work History
            <span className="text-xs font-normal text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
              {monthName} {year}
            </span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Chronological audit of completed deliverables, daily achievements, and past assignments
          </p>
        </div>

        {/* Year & Month Hierarchical Selector */}
        <YearMonthPicker
          selectedMonthKey={selectedMonthKey}
          onMonthChange={setSelectedMonthKey}
        />
      </div>

      {/* 2. Quick KPI Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-start gap-3 shadow-2xs">
          <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="h-4 w-4" />
          </div>
          <div>
            <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Completed Tasks
            </p>
            <p className="text-xl font-bold text-slate-900 dark:text-slate-100 tabular-nums mt-0.5">
              {summary.tasksCompleted}
            </p>
            <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-0.5 font-medium">
              {summary.completionRate}% delivery rate
            </p>
          </div>
        </div>

        <div className="p-3.5 rounded-xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-start gap-3 shadow-2xs">
          <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400">
            <CalendarRange className="h-4 w-4" />
          </div>
          <div>
            <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Days Recorded
            </p>
            <p className="text-xl font-bold text-slate-900 dark:text-slate-100 tabular-nums mt-0.5">
              {summary.daysPresent} / {summary.workingDays}
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              Active working days
            </p>
          </div>
        </div>

        <div className="p-3.5 rounded-xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-start gap-3 shadow-2xs">
          <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
            <Clock className="h-4 w-4" />
          </div>
          <div>
            <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Total Hours Logged
            </p>
            <p className="text-xl font-bold text-slate-900 dark:text-slate-100 tabular-nums mt-0.5">
              {summary.totalHoursWorked}h
            </p>
            <p className="text-[11px] text-indigo-600 dark:text-indigo-400 mt-0.5 font-medium">
              Avg {(summary.totalHoursWorked / summary.daysPresent).toFixed(1)}h / day
            </p>
          </div>
        </div>

        <div className="p-3.5 rounded-xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-start gap-3 shadow-2xs">
          <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400">
            <Layers className="h-4 w-4" />
          </div>
          <div>
            <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Daily Output Avg
            </p>
            <p className="text-xl font-bold text-slate-900 dark:text-slate-100 tabular-nums mt-0.5">
              {(summary.tasksCompleted / summary.daysPresent).toFixed(1)}
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              Tasks delivered / day
            </p>
          </div>
        </div>
      </div>

      {/* 3. Search and Category Filter Bar */}
      <Card className="border-slate-200/90 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900">
        <CardContent className="p-4 space-y-3">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative w-full md:w-80">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
              <Input
                type="text"
                placeholder="Search by task title, ID, day, or summary..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-8 h-8 text-xs bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
              />
            </div>

            <span className="text-xs text-slate-500 dark:text-slate-400">
              Showing <strong className="text-slate-800 dark:text-slate-200">{filteredDays.length}</strong> days ({totalCompletedInView} completed deliverables)
            </span>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none pt-1 border-t border-slate-100 dark:border-slate-800/80">
            <span className="text-[11px] text-slate-400 font-medium whitespace-nowrap mr-1">
              Filter Category:
            </span>
            {availableCategories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={cn(
                  "px-2.5 py-1 rounded-md text-xs font-medium whitespace-nowrap transition-all border",
                  selectedCategory === cat
                    ? "bg-blue-50 dark:bg-blue-950/80 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 font-semibold"
                    : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60"
                )}
              >
                {cat === "all" ? "All Categories" : cat}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 4. Day-by-Day Grouped Work History List */}
      <div className="space-y-4">
        {displayedDays.length === 0 ? (
          <Card className="border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-12 text-center text-slate-400 space-y-2">
            <FileText className="h-8 w-8 mx-auto text-slate-300 dark:text-slate-700" />
            <p className="text-sm font-medium text-slate-600 dark:text-slate-300">No task history found</p>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              No tasks matched your search query in {monthName} {year}.
            </p>
            {(searchQuery || selectedCategory !== "all") && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchQuery("")
                  setSelectedCategory("all")
                }}
                className="mt-2 text-xs"
              >
                Reset Filters
              </Button>
            )}
          </Card>
        ) : (
          displayedDays.map(day => (
            <Card
              key={day.date}
              className="border-slate-200/90 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900 overflow-hidden hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
            >
              {/* Day Header */}
              <CardHeader className="p-4 pb-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 rounded-lg">
                    <Calendar className="h-4 w-4" />
                  </div>
                  <div>
                    <CardTitle className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                      {day.date}
                      <span className="text-xs font-normal text-slate-500 dark:text-slate-400">
                        ({day.dayOfWeek})
                      </span>
                    </CardTitle>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 font-mono">
                      Shift: {day.checkIn} – {day.checkOut}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                    <Clock className="h-3 w-3" />
                    {day.hoursFormatted} logged
                  </span>

                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                    <CheckCircle2 className="h-3 w-3" />
                    {day.matchedTasks.length} Delivered
                  </span>
                </div>
              </CardHeader>

              <CardContent className="p-4 space-y-3">
                {/* EOD Accomplishment Summary */}
                {day.summary && (
                  <div className="p-3 rounded-lg bg-slate-50/80 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800/80 text-xs">
                    <span className="font-semibold text-slate-700 dark:text-slate-300 block mb-0.5">
                      Day Accomplishment Note:
                    </span>
                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                      {day.summary}
                    </p>
                  </div>
                )}

                {/* List of Completed Task Cards for this day */}
                <div className="space-y-2">
                  <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                    Deliverables Finished ({day.matchedTasks.length}):
                  </span>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                    {day.matchedTasks.map(task => (
                      <div
                        key={task.id}
                        className="p-3 rounded-lg border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900/80 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors flex items-start justify-between gap-3 group"
                      >
                        <div className="space-y-1 min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-[11px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950 px-1.5 py-0.2 rounded border border-blue-100 dark:border-blue-900/60">
                              {task.id}
                            </span>
                            {task.category && (
                              <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10px] font-medium">
                                <Layers className="h-2.5 w-2.5" />
                                {task.category}
                              </span>
                            )}
                          </div>

                          <p className="font-semibold text-slate-800 dark:text-slate-200 text-xs leading-snug">
                            {task.title}
                          </p>
                        </div>

                        <div className="flex flex-col items-end gap-1 shrink-0">
                          {task.isCompletedLate ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700">
                              <AlertTriangle className="h-2.5 w-2.5 text-amber-600 dark:text-amber-400" />
                              Completed (Late)
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                              <CheckCircle2 className="h-3 w-3" />
                              100%
                            </span>
                          )}

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              setViewingTask({
                                id: task.id,
                                title: task.title,
                                category: task.category,
                                date: day.date,
                                dayOfWeek: day.dayOfWeek,
                                hoursFormatted: day.hoursFormatted,
                                summary: day.summary,
                                isCompletedLate: task.isCompletedLate,
                                delayReason: task.delayReason,
                              })
                            }
                            className="h-6 px-1.5 text-[10px] text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                          >
                            <Info className="h-3 w-3 mr-1" />
                            Details
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* In Progress / Carried Forward Tasks for this day */}
                {day.inProgressTasks && day.inProgressTasks.length > 0 && (
                  <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                      <ArrowRightCircle className="h-3 w-3 text-blue-500" />
                      In Progress / Carried Forward ({day.inProgressTasks.length}):
                    </span>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                      {day.inProgressTasks.map(task => (
                        <div
                          key={task.id}
                          className="p-3 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-start justify-between gap-3 text-xs"
                        >
                          <div className="space-y-1 min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-[11px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950 px-1.5 py-0.2 rounded border border-blue-100 dark:border-blue-900/60">
                                {task.id}
                              </span>
                              {task.category && (
                                <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10px] font-medium">
                                  <Layers className="h-2.5 w-2.5" />
                                  {task.category}
                                </span>
                              )}
                            </div>

                            <p className="font-semibold text-slate-800 dark:text-slate-200 text-xs leading-snug">
                              {task.title}
                            </p>

                            {task.notes && (
                              <p className="text-[11px] text-slate-500 dark:text-slate-400 italic">
                                "{task.notes}"
                              </p>
                            )}
                          </div>

                          <div className="flex flex-col items-end gap-1 shrink-0">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                              <Hourglass className="h-2.5 w-2.5" />
                              {task.progress ?? 0}%
                            </span>
                            {task.carriedForwardTo && (
                              <span className="text-[9.5px] text-slate-400 font-mono">
                                &rarr; {task.carriedForwardTo}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* 5. Pagination Footer */}
      {filteredDays.length > pageSize && (
        <Card className="border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900">
          <CardContent className="p-3 sm:px-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400">
            <div>
              Showing{" "}
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                {(safeCurrentPage - 1) * pageSize + 1}
              </span>{" "}
              to{" "}
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                {Math.min(safeCurrentPage * pageSize, filteredDays.length)}
              </span>{" "}
              of{" "}
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                {filteredDays.length}
              </span>{" "}
              days ({monthName} {year})
            </div>

            <div className="flex items-center gap-1.5">
              <Button
                variant="outline"
                size="sm"
                disabled={safeCurrentPage <= 1}
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                className="h-8 px-2.5 text-xs border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 disabled:opacity-40"
              >
                <ChevronLeft className="h-3.5 w-3.5 mr-1" />
                Previous
              </Button>

              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={cn(
                      "h-8 min-w-[32px] px-2 rounded-md font-medium transition-colors text-xs border",
                      safeCurrentPage === page
                        ? "bg-blue-600 border-blue-600 text-white font-bold shadow-sm"
                        : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                    )}
                  >
                    {page}
                  </button>
                ))}
              </div>

              <Button
                variant="outline"
                size="sm"
                disabled={safeCurrentPage >= totalPages}
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                className="h-8 px-2.5 text-xs border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 disabled:opacity-40"
              >
                Next
                <ChevronRight className="h-3.5 w-3.5 ml-1" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 6. Historical Task Details Modal */}
      <Dialog
        open={Boolean(viewingTask)}
        onOpenChange={open => !open && setViewingTask(null)}
      >
        <DialogContent className="sm:max-w-md bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
          <DialogHeader>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded font-bold border border-blue-100 dark:border-blue-900">
                {viewingTask?.id}
              </span>
              <TaskStatusBadge status="completed" isLate={viewingTask?.isCompletedLate} />
            </div>
            <DialogTitle className="text-slate-900 dark:text-slate-100 text-base">
              {viewingTask?.title}
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500 dark:text-slate-400">
              Completed deliverable record from shift history
            </DialogDescription>
          </DialogHeader>

          {viewingTask && (
            <div className="space-y-3.5 text-xs py-2">
              <div className="grid grid-cols-2 gap-2.5 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                <div>
                  <span className="text-slate-400 block text-[11px]">Completed Date</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {viewingTask.date} ({viewingTask.dayOfWeek})
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Shift Duration</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {viewingTask.hoursFormatted} logged
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Category</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {viewingTask.category || "General Work"}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Final Progress</span>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                    100% {viewingTask.isCompletedLate ? (
                      <span className="text-amber-600 dark:text-amber-400 font-bold text-[10px] bg-amber-50 dark:bg-amber-950/60 px-1.5 py-0.2 rounded border border-amber-200 dark:border-amber-800">
                        Late
                      </span>
                    ) : "(Completed)"}
                  </span>
                </div>
              </div>

              {/* Delay Reason Callout if completed late */}
              {viewingTask.isCompletedLate && viewingTask.delayReason && (
                <div className="p-3 bg-amber-50/80 dark:bg-amber-950/40 rounded-lg border border-amber-200 dark:border-amber-900/60 text-xs">
                  <div className="flex items-center gap-1.5 text-amber-800 dark:text-amber-300 font-bold mb-1">
                    <AlertTriangle className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                    <span>Delay Reason / Audit Note:</span>
                  </div>
                  <p className="text-amber-900 dark:text-amber-200 leading-relaxed italic pl-5">
                    "{viewingTask.delayReason}"
                  </p>
                </div>
              )}

              {viewingTask.summary && (
                <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-lg border border-slate-100 dark:border-slate-800">
                  <p className="font-semibold text-slate-800 dark:text-slate-200 mb-1">
                    Shift Accomplishment Summary:
                  </p>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                    {viewingTask.summary}
                  </p>
                </div>
              )}
            </div>
          )}

          <div className="flex justify-end pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setViewingTask(null)}
              className="text-xs"
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
