import React, { useState, useMemo, useEffect } from "react"
import { useAdmin } from "../context/AdminContext"
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
import { downloadDailyEodCSV } from "../../employee/utils/exportEodReport"
import { WorkingDaysModal } from "../../employee/components/WorkingDaysModal"
import { DailyEodReport } from "../../employee/types/report"
import { toast } from "sonner"

export const ReportsPage: React.FC = () => {
  const { employees, departments } = useAdmin()

  const [selectedMonthKey, setSelectedMonthKey] = useState<string>(() => getCurrentMonthKey())
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>("all")
  const [selectedDept, setSelectedDept] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState<string>("")
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [workingDaysModalOpen, setWorkingDaysModalOpen] = useState(false)
  const [pageSize, setPageSize] = useState<number>(10)

  const currentMonthData = getMonthData(selectedMonthKey)
  const { monthName, year, summary, eodReports } = currentMonthData

  // Reset pagination on month, employee, or search change
  useEffect(() => {
    setCurrentPage(1)
  }, [selectedMonthKey, selectedEmployeeId, selectedDept, searchQuery])

  // Associate each EOD report with an employee
  const enrichedReports = useMemo(() => {
    return eodReports.map((report, index) => {
      // Deterministically assign employee to each report for multi-employee org view
      const empIndex = index % employees.length
      const assignedEmp = employees[empIndex] || employees[0]

      return {
        ...report,
        employeeId: assignedEmp.id,
        employeeName: assignedEmp.name,
        employeeAvatar: assignedEmp.avatar,
        employeeDepartment: assignedEmp.department,
        employeeDesignation: assignedEmp.designation,
      }
    })
  }, [eodReports, employees])

  // Filter reports
  const filteredReports = useMemo(() => {
    return enrichedReports.filter(rep => {
      // Employee filter
      if (selectedEmployeeId !== "all" && rep.employeeId !== selectedEmployeeId) {
        return false
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
        const matchSummary = rep.summary.toLowerCase().includes(q)
        const matchEmp =
          rep.employeeName.toLowerCase().includes(q) ||
          rep.employeeId.toLowerCase().includes(q)
        const matchTasks = rep.completedTasks.some(
          t =>
            t.title.toLowerCase().includes(q) ||
            t.id.toLowerCase().includes(q) ||
            (t.category && t.category.toLowerCase().includes(q))
        )

        return matchDate || matchSummary || matchEmp || matchTasks
      }

      return true
    })
  }, [enrichedReports, selectedEmployeeId, selectedDept, searchQuery])

  // Pagination calculations
  const totalPages = Math.max(1, Math.ceil(filteredReports.length / pageSize))
  const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages)
  const displayedReports = useMemo(() => {
    const startIndex = (safeCurrentPage - 1) * pageSize
    return filteredReports.slice(startIndex, startIndex + pageSize)
  }, [filteredReports, safeCurrentPage, pageSize])

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

  const handleDownloadReport = (date: string) => {
    const report = displayedReports.find(r => r.date === date)
    if (report) {
      downloadDailyEodCSV(report)
    } else {
      toast.success(`Exporting audited EOD report for ${date} (PDF/CSV)`)
    }
  }

  const handleExportMonthSummary = () => {
    toast.success(`Exporting organization monthly summary for ${monthName} ${year} (PDF/CSV)`)
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
            {summary.daysPresent} Shifts
          </p>
          <p className="text-[11px] text-emerald-600 dark:text-emerald-400">Recorded attendance</p>
        </div>

        <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Net Work Hours</span>
            <Clock className="w-3.5 h-3.5 text-blue-500" />
          </div>
          <p className="text-xl font-bold text-indigo-600 dark:text-indigo-400">
            {summary.totalHoursWorked.toFixed(1)}h
          </p>
          <p className="text-[11px] text-slate-400">Total shift time</p>
        </div>

        <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Completed Tasks</span>
            <Briefcase className="w-3.5 h-3.5 text-purple-500" />
          </div>
          <p className="text-xl font-bold text-slate-900 dark:text-slate-100">
            {summary.tasksCompleted}
          </p>
          <p className="text-[11px] text-slate-400">Deliverables finished</p>
        </div>

        <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-1 col-span-2 md:col-span-1">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Completion Rate</span>
            <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-[10px]">
              {summary.completionRate}%
            </Badge>
          </div>
          <p className="text-xl font-bold text-slate-900 dark:text-slate-100">
            {summary.completionRate}%
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
