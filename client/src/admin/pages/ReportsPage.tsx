import React, { useState, useMemo, useEffect, useCallback } from "react"
import { useAdmin } from "../context/AdminContext"
import { api } from "../../services/api"
import { Card, CardHeader, CardTitle, CardContent } from "../../components/ui/card"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Badge } from "../../components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select"
import {
  FileText,
  Search,
  ChevronsUpDown,
  Download,
  CalendarDays,
  Briefcase,
  Clock,
  CheckCircle2,
  Calendar,
} from "lucide-react"
import { getCurrentMonthKey, getMonthData } from "../../employee/data/mockReports"
import { YearMonthPicker } from "../../employee/components/YearMonthPicker"
import { EodReportCard } from "../../employee/components/reports/EodReportCard"
import { ReportsPagination } from "../../employee/components/reports/ReportsPagination"
import { DownloadMonthlyEodButton } from "../../employee/components/reports/DownloadMonthlyEodButton"
import { downloadDailyEodPDF, exportMonthlyEodPDF } from "../../employee/utils/exportEodReport"
import { WorkingDaysModal } from "../../employee/components/WorkingDaysModal"
import { DailyEodReport } from "../../employee/types/report"

export const ReportsPage: React.FC = () => {
  const { employees, departments } = useAdmin()

  const [selectedMonthKey, setSelectedMonthKey] = useState<string>(() => getCurrentMonthKey())
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>("all")
  const [selectedDept, setSelectedDept] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState<string>("")
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [workingDaysModalOpen, setWorkingDaysModalOpen] = useState(false)
  const [pageSize, setPageSize] = useState<number>(10)

  // Real backend EOD reports
  const [backendReports, setBackendReports] = useState<any[]>([])

  const fetchBackendReports = useCallback(async () => {
    try {
      const res = await api.reports.getEod({ limit: "100" })
      if (res && res.success && Array.isArray(res.reports)) {
        const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
        const mapped = res.reports.map((row: any) => {
          const dateStr = typeof row.date === "string" ? row.date.split("T")[0] : new Date(row.date).toISOString().split("T")[0]
          const [yr, mo, da] = dateStr.split("-").map(Number)
          const dateObj = yr && mo && da ? new Date(yr, mo - 1, da) : new Date(row.date)
          const dayOfWeek = daysOfWeek[dateObj.getDay()] || "Monday"
          const taskLines = (row.tasks_completed || "").split("\n").filter(Boolean)
          const completedTasksList = taskLines.map((t: string, i: number) => ({
            id: `tsk-${row.id}-${i + 1}`,
            title: t,
            category: row.department_name || "General",
            completedAt: row.date,
            isLate: false,
          }))

          const checkInFormatted = row.check_in_time
            ? new Date(row.check_in_time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
            : "—"
          const checkOutFormatted = row.check_out_time
            ? new Date(row.check_out_time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
            : (row.punch_out ? new Date(row.punch_out).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "—")

          return {
            id: row.id,
            employeeId: row.emp_code || row.employee_id,
            employeeName: `${row.first_name || ""} ${row.last_name || ""}`.trim() || row.emp_code || "Staff",
            employeeAvatar: row.avatar_url || `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80`,
            employeeDepartment: row.department_name || "General",
            employeeDesignation: row.designation || "Staff",
            date: dateStr,
            dayOfWeek,
            checkIn: checkInFormatted,
            checkOut: checkOutFormatted,
            breakDuration: "0m",
            hoursLogged: `${Number(row.hours_worked || 8).toFixed(1)}h`,
            hoursWorked: Number(row.hours_worked) || 8,
            tasksTotal: completedTasksList.length,
            tasksCompleted: completedTasksList.length,
            tasksPending: 0,
            completedTasks: completedTasksList,
            inProgressTasks: row.next_day_plan && row.next_day_plan.trim() ? [{
              id: `plan-${row.id}`,
              title: row.next_day_plan,
              category: "Next Shift Plan",
              progress: 0,
              status: "in-progress" as const,
              notes: row.challenges ? `Challenges noted: ${row.challenges}` : undefined,
            }] : [],
            summary: row.summary,
            submittedAt: row.created_at ? new Date(row.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "—",
          }
        })
        setBackendReports(mapped)
      }
    } catch (err: any) {
      console.warn("Backend reports fetch notice:", err.message)
    }
  }, [])

  useEffect(() => {
    fetchBackendReports()
    const timerId = setInterval(fetchBackendReports, 20000)
    window.addEventListener("focus", fetchBackendReports)

    let ch: BroadcastChannel | null = null
    try {
      ch = new BroadcastChannel("worktrack_eod")
      ch.onmessage = () => {
        fetchBackendReports()
      }
    } catch {}

    return () => {
      clearInterval(timerId)
      window.removeEventListener("focus", fetchBackendReports)
      if (ch) ch.close()
    }
  }, [fetchBackendReports])

  const currentMonthData = getMonthData(selectedMonthKey)
  const { monthName, year, summary, eodReports } = currentMonthData

  // Reset pagination on month, employee, or search change
  useEffect(() => {
    setCurrentPage(1)
  }, [selectedMonthKey, selectedEmployeeId, selectedDept, searchQuery])

  // Associate each EOD report with an employee (preferring real MariaDB records)
  const enrichedReports = useMemo(() => {
    if (backendReports.length > 0) {
      return backendReports
    }
    return eodReports.map((report, index) => {
      // Deterministically assign employee to each report for multi-employee org view
      const empIndex = index % employees.length
      const assignedEmp = employees[empIndex] || employees[0]

      return {
        ...report,
        employeeId: assignedEmp?.id || "EMP-001",
        employeeName: assignedEmp?.name || "Staff",
        employeeAvatar: assignedEmp?.avatar || "",
        employeeDepartment: assignedEmp?.department || "General",
        employeeDesignation: assignedEmp?.designation || "Staff",
      }
    })
  }, [backendReports, eodReports, employees])

  // Filter reports
  const filteredReports = useMemo(() => {
    return enrichedReports.filter(rep => {
      // Month filter
      if (selectedMonthKey) {
        const isIsoMatch = typeof rep.date === "string" && rep.date.startsWith(selectedMonthKey)
        const isMonthNameMatch = typeof rep.date === "string" && (rep.date.includes(monthName) || rep.date.includes(monthName.slice(0, 3)))
        if (!isIsoMatch && !isMonthNameMatch) {
          return false
        }
      }

      // Employee filter
      if (selectedEmployeeId !== "all") {
        const cleanSelected = selectedEmployeeId.toLowerCase().replace(/[\s-_]+/g, "")
        const cleanEmpId = (rep.employeeId || "").toLowerCase().replace(/[\s-_]+/g, "")
        if (cleanEmpId !== cleanSelected && rep.employeeId !== selectedEmployeeId) {
          return false
        }
      }

      // Department filter
      if (selectedDept !== "all" && rep.employeeDepartment !== selectedDept) {
        return false
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        const matchDate =
          rep.date.toLowerCase().includes(q) ||
          (rep.dayOfWeek && rep.dayOfWeek.toLowerCase().includes(q))
        const matchSummary = (rep.summary || "").toLowerCase().includes(q)
        const matchEmp =
          (rep.employeeName || "").toLowerCase().includes(q) ||
          (rep.employeeId || "").toLowerCase().includes(q)
        const matchTasks = (rep.completedTasks || []).some(
          (t: any) =>
            t.title.toLowerCase().includes(q) ||
            t.id.toLowerCase().includes(q) ||
            (t.category && t.category.toLowerCase().includes(q))
        )

        return matchDate || matchSummary || matchEmp || matchTasks
      }

      return true
    })
  }, [enrichedReports, selectedMonthKey, monthName, selectedEmployeeId, selectedDept, searchQuery])

  // Pagination calculations
  const totalPages = Math.max(1, Math.ceil(filteredReports.length / pageSize))
  const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages)
  const displayedReports = useMemo(() => {
    const startIndex = (safeCurrentPage - 1) * pageSize
    return filteredReports.slice(startIndex, startIndex + pageSize)
  }, [filteredReports, safeCurrentPage, pageSize])

  // Dynamic metrics derived directly from real filteredReports for the selected period
  const dynamicDaysPresent = useMemo(() => {
    if (filteredReports.length > 0) {
      const dates = new Set(filteredReports.map(r => r.date))
      return dates.size
    }
    return summary.daysPresent
  }, [filteredReports, summary.daysPresent])

  const dynamicTotalHours = useMemo(() => {
    if (filteredReports.length > 0) {
      return filteredReports.reduce((acc, r) => acc + (Number(r.hoursWorked) || 0), 0)
    }
    return summary.totalHoursWorked
  }, [filteredReports, summary.totalHoursWorked])

  const dynamicTasksCompleted = useMemo(() => {
    if (filteredReports.length > 0) {
      return filteredReports.reduce((acc, r) => acc + (r.completedTasks?.length || r.tasksCompleted || 0), 0)
    }
    return summary.tasksCompleted
  }, [filteredReports, summary.tasksCompleted])

  const dynamicCompletionRate = useMemo(() => {
    return dynamicTasksCompleted > 0 ? 100 : summary.completionRate
  }, [dynamicTasksCompleted, summary.completionRate])

  // Dynamic month stats to pass to YearMonthPicker
  const monthStats = useMemo(() => {
    const dates = new Set(filteredReports.map(r => r.date))
    const totalTasks = filteredReports.reduce((acc, r) => acc + (r.completedTasks?.length || r.tasksCompleted || 0), 0)
    return {
      [selectedMonthKey]: {
        daysCount: dates.size || summary.daysPresent,
        taskCount: totalTasks || summary.tasksCompleted,
      },
    }
  }, [filteredReports, selectedMonthKey, summary.daysPresent, summary.tasksCompleted])

  // Expanded card tracking - default expand first item
  const [expandedCardIds, setExpandedCardIds] = useState<Set<string>>(
    () => new Set(eodReports[0] ? [eodReports[0].id] : [])
  )

  const toggleCard = (id: string) => {
    setExpandedCardIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const allExpanded = useMemo(() => {
    return (
      displayedReports.length > 0 &&
      displayedReports.every(rep => expandedCardIds.has(rep.id))
    )
  }, [displayedReports, expandedCardIds])

  const toggleAllCards = () => {
    if (allExpanded) {
      setExpandedCardIds(new Set())
    } else {
      setExpandedCardIds(new Set(displayedReports.map(rep => rep.id)))
    }
  }

  const handleDownloadReport = (date: string, reportItem?: any) => {
    const report = reportItem || displayedReports.find(r => r.date === date)
    if (report) {
      downloadDailyEodPDF(report, report.employeeId || (selectedEmployeeId !== "all" ? selectedEmployeeId : undefined))
    }
  }

  const handleExportMonthSummary = () => {
    exportMonthlyEodPDF(
      monthName,
      year,
      filteredReports.length,
      selectedEmployeeId !== "all" ? selectedEmployeeId : undefined
    )
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
            <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              End-of-Day (EOD) Shift Reports & Deliverables
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Audited daily shift deliverables, punch-in/out timestamps, break durations, and in-progress milestone carryovers.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Button
            onClick={() => setWorkingDaysModalOpen(true)}
            variant="outline"
            className="text-xs h-9 flex items-center gap-1.5"
          >
            <CalendarDays className="w-3.5 h-3.5 text-indigo-500" />
            <span>Working Calendar</span>
          </Button>

          <Button
            onClick={handleExportMonthSummary}
            className="text-xs h-9 bg-indigo-600 hover:bg-indigo-700 text-white font-medium flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Monthly Audit</span>
          </Button>
        </div>
      </div>

      {/* Monthly KPI Overview Grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Period Schedule</span>
            <Calendar className="w-3.5 h-3.5 text-indigo-500" />
          </div>
          <p className="text-xl font-bold text-slate-900 dark:text-slate-100">
            {summary.workingDays} Days
          </p>
          <p className="text-[11px] text-slate-400">Mon–Sat standard</p>
        </div>

        <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Logged Days</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
          </div>
          <p className="text-xl font-bold text-slate-900 dark:text-slate-100">
            {dynamicDaysPresent} Shifts
          </p>
          <p className="text-[11px] text-emerald-600 dark:text-emerald-400">Recorded attendance</p>
        </div>

        <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Net Work Hours</span>
            <Clock className="w-3.5 h-3.5 text-blue-500" />
          </div>
          <p className="text-xl font-bold text-indigo-600 dark:text-indigo-400">
            {dynamicTotalHours.toFixed(1)}h
          </p>
          <p className="text-[11px] text-slate-400">Total shift time</p>
        </div>

        <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Completed Tasks</span>
            <Briefcase className="w-3.5 h-3.5 text-purple-500" />
          </div>
          <p className="text-xl font-bold text-slate-900 dark:text-slate-100">
            {dynamicTasksCompleted}
          </p>
          <p className="text-[11px] text-slate-400">Deliverables finished</p>
        </div>

        <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-1 col-span-2 md:col-span-1">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Completion Rate</span>
            <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-[10px]">
              {dynamicCompletionRate}%
            </Badge>
          </div>
          <p className="text-xl font-bold text-slate-900 dark:text-slate-100">
            {dynamicCompletionRate}%
          </p>
          <p className="text-[11px] text-slate-400">Milestone velocity</p>
        </div>
      </div>

      {/* Main EOD Reports Card */}
      <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
        <CardHeader className="p-5 border-b border-slate-100 dark:border-slate-800 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
                <FileText className="h-4 w-4" />
              </div>
              <div>
                <CardTitle className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                  EOD Shift Report Cards
                  <span className="text-xs font-normal text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                    {monthName} {year}
                  </span>
                </CardTitle>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Expandable audit views matching employee shift logs, deliverables, and carried tasks
                </p>
              </div>
            </div>

            {/* Hierarchical YearMonthPicker */}
            <YearMonthPicker
              selectedMonthKey={selectedMonthKey}
              onMonthChange={setSelectedMonthKey}
              monthStats={monthStats}
              variant="compact"
            />
          </div>

          {/* Filters Toolbar */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800/80">
            <div className="flex flex-1 items-center gap-2 flex-wrap">
              {/* Search */}
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
                <Input
                  type="text"
                  placeholder="Search days, tasks, or summary..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="pl-8 h-8 text-xs bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
                />
              </div>

              {/* Employee filter */}
              <div className="w-48">
                <Select value={selectedEmployeeId} onValueChange={setSelectedEmployeeId}>
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue placeholder="All Employees" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Employees</SelectItem>
                    {employees.map(emp => (
                      <SelectItem key={emp.id} value={emp.id}>
                        {emp.name} ({emp.id})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Department filter */}
              <div className="w-40">
                <Select value={selectedDept} onValueChange={setSelectedDept}>
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue placeholder="All Departments" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Departments</SelectItem>
                    {departments.map(dept => (
                      <SelectItem key={dept.id} value={dept.name}>
                        {dept.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Showing count, Download Monthly EOD & Expand All Toggle */}
            <div className="flex items-center gap-2.5 self-end md:self-auto shrink-0 flex-wrap">
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Showing <strong className="text-slate-800 dark:text-slate-200">{filteredReports.length}</strong> shift reports
              </span>

              <DownloadMonthlyEodButton
                monthName={monthName}
                year={year}
                reports={filteredReports}
              />

              {displayedReports.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={toggleAllCards}
                  className="h-8 px-2.5 text-xs font-medium gap-1.5 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 shadow-2xs"
                >
                  <ChevronsUpDown className="h-3.5 w-3.5 text-slate-500 dark:text-slate-400" />
                  {allExpanded ? "Collapse All" : "Expand All"}
                </Button>
              )}
            </div>
          </div>
        </CardHeader>

        {/* EOD Shift Reports Cards List */}
        <CardContent className="p-5 space-y-4">
          {displayedReports.length === 0 ? (
            <div className="py-16 text-center text-slate-400 space-y-2">
              <FileText className="h-8 w-8 mx-auto text-slate-300 dark:text-slate-700" />
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                No shift reports found
              </p>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                No EOD reports match your current filters in {monthName} {year}.
              </p>
              {(searchQuery || selectedEmployeeId !== "all" || selectedDept !== "all") && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSearchQuery("")
                    setSelectedEmployeeId("all")
                    setSelectedDept("all")
                  }}
                  className="mt-2 text-xs"
                >
                  Reset Filters
                </Button>
              )}
            </div>
          ) : (
            displayedReports.map(rep => (
              <div key={rep.id} className="space-y-1.5">
                {/* Employee Header Ribbon for Admin Context */}
                <div className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-slate-100/70 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800 text-xs">
                  <div className="flex items-center gap-2.5">
                    <img
                      src={rep.employeeAvatar}
                      alt={rep.employeeName}
                      className="w-5 h-5 rounded-full object-cover border border-slate-300 dark:border-slate-700"
                    />
                    <span className="font-bold text-slate-900 dark:text-slate-100">
                      {rep.employeeName}
                    </span>
                    <span className="text-[11px] text-slate-500">
                      &bull; {rep.employeeDesignation} &bull; {rep.employeeDepartment}
                    </span>
                  </div>
                  <span className="font-mono text-[10px] text-slate-400 font-medium">
                    {rep.employeeId}
                  </span>
                </div>

                {/* Exact EodReportCard matching employee format */}
                <EodReportCard
                  report={rep as DailyEodReport}
                  isExpanded={expandedCardIds.has(rep.id)}
                  onToggle={() => toggleCard(rep.id)}
                  onDownload={handleDownloadReport}
                />
              </div>
            ))
          )}
        </CardContent>

        {/* Reusable Pagination Footer with 10 / 20 / 30 selector */}
        <ReportsPagination
          currentPage={safeCurrentPage}
          totalPages={totalPages}
          totalItems={filteredReports.length}
          pageSize={pageSize}
          pageSizeOptions={[10, 20, 30]}
          monthName={monthName}
          year={year}
          onPageChange={setCurrentPage}
          onPageSizeChange={setPageSize}
        />
      </Card>

      {/* Working Days Policy Modal */}
      <WorkingDaysModal
        isOpen={workingDaysModalOpen}
        onClose={() => setWorkingDaysModalOpen(false)}
      />
    </div>
  )
}
