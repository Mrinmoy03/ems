import React, { useState, useMemo } from "react"
import { useEmployee } from "../context/EmployeeContext"
import { WorkingTimer } from "../components/WorkingTimer"
import { HoursWorkedChart } from "../components/charts/HoursWorkedChart"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { formatDurationToHuman } from "../utils/formatDuration"
import {
  Calendar,
  Coffee,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Search,
  Download,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
} from "lucide-react"
import { format } from "date-fns"
import { getCurrentMonthKey, getMonthData } from "../data/mockReports"
import { formatStandardDate } from "../utils/date"
import { YearMonthPicker } from "../components/YearMonthPicker"
import { WorkingDaysModal } from "../components/WorkingDaysModal"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

import { isTaskCompletedLate } from "../utils/taskStatus"

type TimesheetPeriodType = "weekly" | string

export const TimesheetPage: React.FC = () => {
  const { timer, tasks } = useEmployee()
  const { breaks, elapsedSeconds, loginTime, logoutTime, sessionState } = timer

  // View state: "weekly" or specific monthKey (e.g. dynamic current month or archived period)
  const [activePeriod, setActivePeriod] = useState<TimesheetPeriodType>("weekly")
  const [selectedMonthKey, setSelectedMonthKey] = useState<string>(() => getCurrentMonthKey())
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [isWorkingDaysModalOpen, setIsWorkingDaysModalOpen] = useState(false)
  const pageSize = 10

  // Live completed tasks from EmployeeContext
  const liveCompletedTasks = useMemo(() => {
    return tasks
      .filter(t => t.progress === 100 || t.status === "completed")
      .map(t => ({
        id: t.id,
        title: t.title,
        category: t.category,
        isCompletedLate: isTaskCompletedLate(t),
        delayReason: t.comment,
      }))
  }, [tasks])

  // Reset pagination on view change or search
  React.useEffect(() => {
    setCurrentPage(1)
  }, [activePeriod, searchQuery])

  // Current live weekly records synced with Oct 15 (Thursday)
  const weeklyLog = useMemo(() => [
    {
      id: "shift-today",
      date: "Oct 15 (Today)",
      dayOfWeek: "Thursday",
      inTime: format(new Date(loginTime), "hh:mm a"),
      outTime: sessionState === "logged-out" ? (logoutTime ? format(new Date(logoutTime), "hh:mm a") : "05:00 PM") : "Active Session",
      breakDuration: `${breaks.length * 45 || 0} mins`,
      totalHours: formatDurationToHuman(elapsedSeconds),
      status: sessionState === "logged-out" ? "Completed" : "In Progress",
      tasksCompletedCount: liveCompletedTasks.length,
      completedTasks: liveCompletedTasks,
    },
    {
      id: "shift-oct-14",
      date: "Oct 14 (Wed)",
      dayOfWeek: "Wednesday",
      inTime: "08:45 AM",
      outTime: "06:00 PM",
      breakDuration: "45 mins",
      totalHours: "8h 30m",
      status: "Completed",
      tasksCompletedCount: 3,
      completedTasks: [
        { id: "TSK-198", title: "Sidebar Badge Counter Zero Suppression", category: "Frontend" },
        {
          id: "TSK-197",
          title: "Working Timer Lunch Mode Resumption",
          category: "Core Features",
          isCompletedLate: true,
          delayReason: "Waiting on cross-device battery saver timer edge case testing.",
        },
        { id: "TSK-196", title: "Today Task Card Height Lock", category: "Design System" },
      ],
    },
    {
      id: "shift-oct-13",
      date: "Oct 13 (Tue)",
      dayOfWeek: "Tuesday",
      inTime: "08:45 AM",
      outTime: "06:00 PM",
      breakDuration: "45 mins",
      totalHours: "8h 30m",
      status: "Completed",
      tasksCompletedCount: 4,
      completedTasks: [
        { id: "TSK-195", title: "Responsive Layout Fixes for Mobile Viewports", category: "Frontend" },
        { id: "TSK-194", title: "Updated Table Styling & Border Densities", category: "Design System" },
        { id: "TSK-193", title: "Timer Pause Handlers for Break Durations", category: "Core Features" },
        { id: "TSK-192", title: "EOD Summary Generation Integration", category: "Operations" },
      ],
    },
    {
      id: "shift-oct-12",
      date: "Oct 12 (Mon)",
      dayOfWeek: "Monday",
      inTime: "08:50 AM",
      outTime: "05:48 PM",
      breakDuration: "45 mins",
      totalHours: "8h 13m",
      status: "Completed",
      tasksCompletedCount: 3,
      completedTasks: [
        { id: "TSK-191", title: "Audited Form Validation Rules with Zod", category: "Security" },
        { id: "TSK-190", title: "Prepared Employee Data Models", category: "Architecture" },
        { id: "TSK-189", title: "In-Memory Mock Stores Setup", category: "Architecture" },
      ],
    },
    {
      id: "shift-oct-09",
      date: "Oct 09 (Fri)",
      dayOfWeek: "Friday",
      inTime: "08:50 AM",
      outTime: "05:45 PM",
      breakDuration: "45 mins",
      totalHours: "8h 10m",
      status: "Completed",
      tasksCompletedCount: 5,
      completedTasks: [
        { id: "TSK-188", title: "Sprint Wrap-Up & Deliverable QA", category: "General" },
        { id: "TSK-187", title: "Weekly Code Reviews & Linting", category: "Quality Assurance" },
        { id: "TSK-186", title: "Merged Analytics Chart Integrations", category: "Analytics" },
      ],
    },
    {
      id: "shift-oct-08",
      date: "Oct 08 (Thu)",
      dayOfWeek: "Thursday",
      inTime: "08:45 AM",
      outTime: "06:00 PM",
      breakDuration: "45 mins",
      totalHours: "8h 30m",
      status: "Completed",
      tasksCompletedCount: 2,
      completedTasks: [
        { id: "TSK-183", title: "Performance Profiling for Large Task Lists", category: "Architecture" },
        { id: "TSK-182", title: "Refactor Timer State Machine", category: "Core Features" },
      ],
    },
  ], [breaks.length, elapsedSeconds, loginTime, logoutTime, sessionState, liveCompletedTasks])

  // Get active items based on period
  const activeItems = useMemo(() => {
    if (activePeriod === "weekly") {
      return weeklyLog.map(item => ({
        id: item.id,
        date: item.date,
        dayOfWeek: item.dayOfWeek,
        inTime: item.inTime,
        outTime: item.outTime,
        breakDuration: item.breakDuration,
        totalHours: item.totalHours,
        status: item.status,
        tasksCompletedCount: item.tasksCompletedCount,
        completedTasks: item.completedTasks,
      }))
    }

    const monthData = getMonthData(activePeriod)
    const activeKey = getCurrentMonthKey()
    return monthData.workingDays.map((day, idx) => {
      // If current active month and today's shift (idx === 0)
      if (activePeriod === activeKey && idx === 0) {
        return {
          id: `shift-month-0`,
          date: formatStandardDate(new Date()),
          dayOfWeek: format(new Date(), "EEEE"),
          inTime: format(new Date(loginTime), "hh:mm a"),
          outTime: sessionState === "logged-out" ? (logoutTime ? format(new Date(logoutTime), "hh:mm a") : "05:00 PM") : "Active Session",
          breakDuration: `${breaks.length * 45 || 0} mins`,
          totalHours: formatDurationToHuman(elapsedSeconds),
          status: sessionState === "logged-out" ? "Completed" : "In Progress",
          tasksCompletedCount: liveCompletedTasks.length,
          completedTasks: liveCompletedTasks,
        }
      }
      return {
        id: `shift-month-${idx}`,
        date: day.date,
        dayOfWeek: day.dayOfWeek,
        inTime: day.checkIn,
        outTime: day.checkOut,
        breakDuration: day.breakDuration || "45 mins",
        totalHours: day.hoursFormatted,
        status: "Completed",
        tasksCompletedCount: day.tasksCompletedCount,
        completedTasks: day.completedTasks,
      }
    })
  }, [activePeriod, weeklyLog, loginTime, logoutTime, sessionState, breaks.length, elapsedSeconds, liveCompletedTasks])

  // Filter items by search
  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return activeItems
    const q = searchQuery.toLowerCase()
    return activeItems.filter(item => {
      const matchDate = item.date.toLowerCase().includes(q) || (item.dayOfWeek && item.dayOfWeek.toLowerCase().includes(q))
      const matchHours = item.totalHours.toLowerCase().includes(q)
      const matchTasks = item.completedTasks?.some(
        t => t.title.toLowerCase().includes(q) || t.id.toLowerCase().includes(q) || (t.category && t.category.toLowerCase().includes(q))
      )
      return matchDate || matchHours || matchTasks
    })
  }, [activeItems, searchQuery])

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(filteredItems.length / pageSize))
  const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages)
  const displayedItems = useMemo(() => {
    const startIndex = (safeCurrentPage - 1) * pageSize
    return filteredItems.slice(startIndex, startIndex + pageSize)
  }, [filteredItems, safeCurrentPage, pageSize])

  // Active Period Metrics
  const activeMetrics = useMemo(() => {
    if (activePeriod === "weekly") {
      return {
        title: "Active Work Week (Oct 08 – Oct 14)",
        totalHours: "39.4h",
        daysPresent: "5 / 5",
        avgHours: "7.9h",
        tasksCount: 17,
        statusNote: "+1.4h vs weekly target",
      }
    }
    const mData = getMonthData(activePeriod)
    return {
      title: `${mData.monthName} ${mData.year} Monthly Total`,
      totalHours: `${mData.summary.totalHoursWorked}h`,
      daysPresent: `${mData.summary.daysPresent} / ${mData.summary.workingDays}`,
      avgHours: `${(mData.summary.totalHoursWorked / (mData.summary.daysPresent || 1)).toFixed(1)}h`,
      tasksCount: mData.summary.tasksCompleted,
      statusNote: `${mData.summary.completionRate}% tasks delivery rate`,
    }
  }, [activePeriod])

  const handleExportTimesheet = () => {
    const mData = getMonthData(activePeriod)
    const label =
      activePeriod === "weekly"
        ? "Current Week"
        : `${mData.monthName} ${mData.year}`
    toast.success(`Exporting timesheet for ${label} (PDF/CSV)`)
  }

  return (
    <div className="space-y-6">
      {/* Header with Period Selection & Export */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            Timesheet & Attendance
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Track active work sessions, lunch breaks, and historical shift logs across weekly and monthly periods
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {/* Quick Period Hierarchical Year/Month & Weekly Selector */}
          <YearMonthPicker
            allowWeekly={true}
            isWeeklySelected={activePeriod === "weekly"}
            onSelectWeekly={() => setActivePeriod("weekly")}
            selectedMonthKey={activePeriod === "weekly" ? selectedMonthKey : activePeriod}
            onMonthChange={(mKey) => {
              setSelectedMonthKey(mKey)
              setActivePeriod(mKey)
            }}
          />

          <Button
            variant="outline"
            size="sm"
            onClick={handleExportTimesheet}
            className="h-[46px] px-4 rounded-lg text-xs font-semibold gap-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800 shadow-2xs transition-colors"
          >
            <Download className="h-4 w-4 text-slate-500 dark:text-slate-400" />
            Export Timesheet
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Working Timer & Today's Breaks (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <WorkingTimer />

          {/* Today's Breaks Breakdown */}
          <Card className="border-slate-200/90 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900">
            <CardHeader className="p-4 pb-2 border-b border-slate-100 dark:border-slate-800 flex flex-row items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400 rounded-lg">
                  <Coffee className="h-4 w-4" />
                </div>
                <CardTitle className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                  Today's Lunch & Breaks
                </CardTitle>
              </div>
              <span className="text-xs text-slate-400">{breaks.length} logged</span>
            </CardHeader>
            <CardContent className="p-4">
              {breaks.length === 0 ? (
                <p className="text-xs text-slate-400 py-3 text-center">
                  No breaks recorded yet for today's session
                </p>
              ) : (
                <div className="space-y-2">
                  {breaks.map((b, idx) => (
                    <div
                      key={b.id}
                      className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 text-xs border border-slate-100 dark:border-slate-800 text-slate-700 dark:text-slate-300"
                    >
                      <span className="font-semibold text-slate-700 dark:text-slate-200">Break #{idx + 1}</span>
                      <span className="text-slate-500 dark:text-slate-400">
                        {format(new Date(b.start), "hh:mm a")} —{" "}
                        {b.end ? format(new Date(b.end), "hh:mm a") : "Ongoing"}
                      </span>
                      <span className="font-mono text-slate-700 dark:text-slate-200 font-bold">
                        {formatDurationToHuman(b.durationSeconds)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right: Hours Chart & Historical Shift Records (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <HoursWorkedChart />

          {/* Historical Timesheet Card */}
          <Card className="border-slate-200/90 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900 overflow-hidden">
            {/* Card Header with View Switcher (Weekly vs Months) */}
            <CardHeader className="p-4 pb-3 border-b border-slate-100 dark:border-slate-800 space-y-3">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 rounded-lg">
                    <Calendar className="h-4 w-4" />
                  </div>
                  <div>
                    <CardTitle className="text-sm font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                      Shifts & Attendance Records
                    </CardTitle>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      {activeMetrics.title}
                    </p>
                  </div>
                </div>

                {/* View Switcher: Weekly vs Scalable Year & Month Picker */}
                <YearMonthPicker
                  allowWeekly={true}
                  isWeeklySelected={activePeriod === "weekly"}
                  onSelectWeekly={() => setActivePeriod("weekly")}
                  selectedMonthKey={activePeriod === "weekly" ? selectedMonthKey : activePeriod}
                  onMonthChange={(mKey) => {
                    setSelectedMonthKey(mKey)
                    setActivePeriod(mKey)
                  }}
                  variant="compact"
                />
              </div>

              {/* Quick Metrics Strip */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800/80 text-xs">
                <div className="p-2 rounded-lg bg-blue-50/50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/40">
                  <span className="text-[10px] text-blue-700 dark:text-blue-300 uppercase tracking-wider block font-medium">
                    Total Hours
                  </span>
                  <span className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    {activeMetrics.totalHours}
                  </span>
                </div>

                <div className="p-2 rounded-lg bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/40">
                  <span className="text-[10px] text-indigo-700 dark:text-indigo-300 uppercase tracking-wider block font-medium">
                    Days Attended
                  </span>
                  <span className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    {activeMetrics.daysPresent}
                  </span>
                </div>

                <div className="p-2 rounded-lg bg-emerald-50/50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40">
                  <span className="text-[10px] text-emerald-700 dark:text-emerald-300 uppercase tracking-wider block font-medium">
                    Daily Average
                  </span>
                  <span className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    {activeMetrics.avgHours}
                  </span>
                </div>

                <div className="p-2 rounded-lg bg-amber-50/50 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900/40 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-amber-700 dark:text-amber-300 uppercase tracking-wider block font-medium">
                      Tasks Completed
                    </span>
                    <span className="text-sm font-bold text-slate-900 dark:text-slate-100">
                      {activeMetrics.tasksCount}
                    </span>
                  </div>

                  {activePeriod !== "weekly" && (
                    <button
                      onClick={() => setIsWorkingDaysModalOpen(true)}
                      title="Inspect full working days breakdown"
                      className="p-1.5 rounded-md hover:bg-amber-100 dark:hover:bg-amber-900/60 text-amber-700 dark:text-amber-300 transition-colors"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Search filter input */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2 border-t border-slate-100 dark:border-slate-800/80">
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
                  <Input
                    type="text"
                    placeholder="Search dates, hours, or tasks..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="pl-8 h-8 text-xs bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
                  />
                </div>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 text-right">
                  Showing <strong className="text-slate-800 dark:text-slate-200">{filteredItems.length}</strong> shifts
                </span>
              </div>
            </CardHeader>

            {/* Shift Records Table */}
            <CardContent className="p-0 overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/60 text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    <th className="p-3 pl-4">Date & Day</th>
                    <th className="p-3">Clock In</th>
                    <th className="p-3">Clock Out</th>
                    <th className="p-3">Breaks</th>
                    <th className="p-3">Total Worked</th>
                    <th className="p-3">Tasks Completed</th>
                    <th className="p-3 pr-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {displayedItems.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-400">
                        No shift records found matching "{searchQuery}"
                      </td>
                    </tr>
                  ) : (
                    displayedItems.map(item => (
                      <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                        {/* Date */}
                        <td className="p-3 pl-4">
                          <div className="font-semibold text-slate-800 dark:text-slate-200">
                            {item.date}
                          </div>
                          {item.dayOfWeek && (
                            <div className="text-[10px] text-slate-400">{item.dayOfWeek}</div>
                          )}
                        </td>

                        {/* Clock In */}
                        <td className="p-3 text-slate-600 dark:text-slate-400 font-mono text-[11px] whitespace-nowrap">
                          {item.inTime}
                        </td>

                        {/* Clock Out */}
                        <td className="p-3 text-slate-600 dark:text-slate-400 font-mono text-[11px] whitespace-nowrap">
                          {item.outTime}
                        </td>

                        {/* Breaks */}
                        <td className="p-3 text-slate-500 dark:text-slate-400 whitespace-nowrap">
                          {item.breakDuration}
                        </td>

                        {/* Total Worked */}
                        <td className="p-3 whitespace-nowrap">
                          <span className="font-mono font-bold text-slate-900 dark:text-slate-100 inline-flex items-center gap-1 bg-slate-100 dark:bg-slate-800/80 px-2 py-0.5 rounded text-xs">
                            <Clock className="h-3 w-3 text-blue-500" />
                            {item.totalHours}
                          </span>
                        </td>

                        {/* Completed Tasks */}
                        <td className="p-3">
                          <div className="space-y-1">
                            <span className="inline-flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400 text-xs">
                              <CheckCircle2 className="h-3 w-3" />
                              {item.tasksCompletedCount} Completed
                            </span>
                            <div className="flex flex-wrap gap-1 max-w-[200px]">
                              {item.completedTasks?.slice(0, 2).map(t => (
                                <span
                                  key={t.id}
                                  title={t.delayReason ? `${t.title} (Delay: ${t.delayReason})` : t.title}
                                  className={cn(
                                    "text-[10px] px-1.5 py-0.5 rounded truncate max-w-[180px] inline-flex items-center gap-1",
                                    t.isCompletedLate
                                      ? "bg-amber-50 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800"
                                      : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                                  )}
                                >
                                  <strong className="font-mono text-slate-800 dark:text-slate-200 mr-0.5">{t.id}:</strong>
                                  <span className="truncate">{t.title}</span>
                                  {t.isCompletedLate && (
                                    <span className="text-[9px] font-bold text-amber-700 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/60 px-1 rounded shrink-0">
                                      Late
                                    </span>
                                  )}
                                </span>
                              ))}
                              {item.completedTasks && item.completedTasks.length > 2 && (
                                <span className="text-[10px] text-slate-400 font-medium">
                                  +{item.completedTasks.length - 2} more
                                </span>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Status */}
                        <td className="p-3 pr-4 whitespace-nowrap">
                          <span
                            className={cn(
                              "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold",
                              item.status === "Completed"
                                ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                                : "bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800"
                            )}
                          >
                            <ShieldCheck className="h-3 w-3" /> {item.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </CardContent>

            {/* Pagination Controls for Monthly Views */}
            {filteredItems.length > pageSize && (
              <div className="p-3 sm:px-5 sm:py-3.5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/70 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400">
                <div>
                  Showing{" "}
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {(safeCurrentPage - 1) * pageSize + 1}
                  </span>{" "}
                  to{" "}
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {Math.min(safeCurrentPage * pageSize, filteredItems.length)}
                  </span>{" "}
                  of{" "}
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {filteredItems.length}
                  </span>{" "}
                  shifts
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
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Reusable Working Days Breakdown Modal */}
      <WorkingDaysModal
        isOpen={isWorkingDaysModalOpen}
        onClose={() => setIsWorkingDaysModalOpen(false)}
        initialMonthKey={activePeriod === "weekly" ? getCurrentMonthKey() : activePeriod}
      />
    </div>
  )
}
