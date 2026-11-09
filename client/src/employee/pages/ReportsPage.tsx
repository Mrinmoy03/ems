import React, { useState, useMemo, useEffect, useCallback } from "react"
import { MonthlySummary } from "../components/MonthlySummary"
import { PerformanceChart } from "../components/charts/PerformanceChart"
import { HoursWorkedChart } from "../components/charts/HoursWorkedChart"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { FileText, Download, Search, ChevronsUpDown, Send, Plus } from "lucide-react"
import { getCurrentMonthKey, getMonthData } from "../data/mockReports"
import { YearMonthPicker } from "../components/YearMonthPicker"
import { useEmployee } from "../context/EmployeeContext"
import { useAuth } from "../../auth/context/AuthContext"
import { useResolvedEodReports } from "../hooks/useResolvedEodReports"
import { EodReportCard } from "../components/reports/EodReportCard"
import { ReportsPagination } from "../components/reports/ReportsPagination"
import { downloadDailyEodPDF, exportMonthlyEodPDF } from "../utils/exportEodReport"
import { DailyEodReport } from "../types/report"
import { api } from "../../services/api"
import { toast } from "sonner"

export const ReportsPage: React.FC = () => {
  const { tasks, timer } = useEmployee()
  const { user: authUser } = useAuth()
  const [selectedMonthKey, setSelectedMonthKey] = useState<string>(() => getCurrentMonthKey())
  const [searchQuery, setSearchQuery] = useState<string>("")
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [pageSize, setPageSize] = useState<number>(10)

  // Real backend EOD reports state
  const [backendReports, setBackendReports] = useState<DailyEodReport[]>([])
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false)
  const [summaryInput, setSummaryInput] = useState("")
  const [completedTasksInput, setCompletedTasksInput] = useState("")
  const [challengesInput, setChallengesInput] = useState("")
  const [nextDayPlanInput, setNextDayPlanInput] = useState("")
  const [hoursWorkedInput, setHoursWorkedInput] = useState("8.0")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const fetchBackendReports = useCallback(async () => {
    const empId = authUser?.employeeId || authUser?.id
    if (!empId) return
    try {
      const res = await api.reports.getEod({ employeeId: empId, limit: "100" })
      if (res && res.success && Array.isArray(res.reports)) {
        const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
        const mapped: DailyEodReport[] = res.reports.map((row: any) => {
          const d = new Date(row.date)
          const dayOfWeek = daysOfWeek[d.getDay()] || "Monday"
          const taskLines = (row.tasks_completed || "").split("\n").filter(Boolean)
          const completedTasksList = taskLines.map((t: string, i: number) => ({
            id: `tsk-${row.id}-${i + 1}`,
            title: t,
            category: row.department_name || "General",
            completedAt: row.date,
            isLate: false,
          }))

          return {
            id: row.id,
            date: typeof row.date === "string" ? row.date.slice(0, 10) : new Date(row.date).toISOString().slice(0, 10),
            dayOfWeek,
            checkIn: "09:00 AM",
            checkOut: "06:00 PM",
            breakDuration: "45m",
            hoursLogged: `${row.hours_worked || 8}h 00m`,
            hoursWorked: Number(row.hours_worked) || 8,
            tasksTotal: completedTasksList.length,
            tasksCompleted: completedTasksList.length,
            tasksPending: 0,
            completedTasks: completedTasksList,
            inProgressTasks: row.next_day_plan ? [{
              id: `plan-${row.id}`,
              title: row.next_day_plan,
              category: "Next Shift Plan",
              progress: 0,
              status: "in-progress" as const,
              notes: row.challenges ? `Challenges noted: ${row.challenges}` : undefined,
            }] : [],
            summary: row.summary,
            submittedAt: row.created_at ? new Date(row.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "06:00 PM",
          }
        })
        setBackendReports(mapped)
      }
    } catch (err: any) {
      console.warn("Backend reports fetch notice:", err.message)
    }
  }, [authUser])

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

  const handleOpenSubmitModal = () => {
    const todayCompleted = tasks.filter(t => t.progress === 100 || t.status === "completed").map(t => t.title).join("\n")
    setCompletedTasksInput(todayCompleted)
    const elapsedHrs = (timer.elapsedSeconds / 3600).toFixed(1)
    setHoursWorkedInput(Number(elapsedHrs) > 0 ? elapsedHrs : "8.0")
    setIsSubmitModalOpen(true)
  }

  const handleSubmitEod = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!summaryInput.trim()) {
      toast.error("Please provide an executive summary for today's shift.")
      return
    }

    const empId = authUser?.employeeId || authUser?.id
    if (!empId) {
      toast.error("Employee session not found.")
      return
    }

    setIsSubmitting(true)
    try {
      const today = new Date().toISOString().split("T")[0]
      const tasksArr = completedTasksInput.split("\n").map(t => t.trim()).filter(Boolean)

      await api.reports.submitEod({
        employeeId: empId,
        date: today,
        summary: summaryInput.trim(),
        tasksCompleted: tasksArr,
        challenges: challengesInput.trim() || undefined,
        nextDayPlan: nextDayPlanInput.trim() || undefined,
        hoursWorked: parseFloat(hoursWorkedInput) || 8.0,
      })

      try {
        const ch = new BroadcastChannel("worktrack_eod")
        ch.postMessage({ type: "EOD_FILED" })
        ch.close()
      } catch {}

      toast.success("End-of-Day (EOD) report filed successfully!")
      setIsSubmitModalOpen(false)
      setSummaryInput("")
      setChallengesInput("")
      setNextDayPlanInput("")
      fetchBackendReports()
    } catch (err: any) {
      toast.error(err.message || "Failed to submit EOD report.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const currentMonthData = getMonthData(selectedMonthKey)
  const { monthName, year } = currentMonthData

  // Dynamically synchronize live context tasks & working timer with active month's EOD shift reports
  const resolvedEodReports = useResolvedEodReports({
    currentMonthData,
    selectedMonthKey,
    tasks,
    timer,
  })

  // Merge real database reports with any local fallback reports
  const allReports = useMemo(() => {
    if (backendReports.length > 0) {
      const dbDates = new Set(backendReports.map(r => r.date))
      const extra = resolvedEodReports.filter(r => !dbDates.has(r.date))
      return [...backendReports, ...extra]
    }
    return resolvedEodReports
  }, [backendReports, resolvedEodReports])

  // Reset pagination on month or search changes
  useEffect(() => {
    setCurrentPage(1)
  }, [selectedMonthKey, searchQuery])

  // Filter EOD reports by search query
  const filteredReports = useMemo(() => {
    if (!searchQuery.trim()) return allReports
    const q = searchQuery.toLowerCase()
    return allReports.filter(rep => {
      const matchDate = rep.date.toLowerCase().includes(q) || (rep.dayOfWeek && rep.dayOfWeek.toLowerCase().includes(q))
      const matchSummary = rep.summary.toLowerCase().includes(q)
      const matchTasks = rep.completedTasks.some(
        t => t.title.toLowerCase().includes(q) || t.id.toLowerCase().includes(q) || (t.category && t.category.toLowerCase().includes(q))
      )
      return matchDate || matchSummary || matchTasks
    })
  }, [allReports, searchQuery])

  // Pagination calculations
  const totalPages = Math.max(1, Math.ceil(filteredReports.length / pageSize))
  const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages)
  const displayedReports = useMemo(() => {
    const startIndex = (safeCurrentPage - 1) * pageSize
    return filteredReports.slice(startIndex, startIndex + pageSize)
  }, [filteredReports, safeCurrentPage, pageSize])

  // Set of expanded EOD card IDs
  const [expandedCardIds, setExpandedCardIds] = useState<Set<string>>(() => new Set())

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
    return displayedReports.length > 0 && displayedReports.every(rep => expandedCardIds.has(rep.id))
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
      downloadDailyEodPDF(report, authUser?.employeeId || authUser?.id)
    } else {
      toast.success(`Exporting EOD report for ${date} (PDF)`)
    }
  }

  const handleExportMonthSummary = () => {
    exportMonthlyEodPDF(monthName, year, currentMonthData.eodReports.length, authUser?.employeeId || authUser?.id)
  }

  return (
    <div className="space-y-6">
      {/* Top Header with Month Selector & Export Action */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            Employee Performance & EOD Reports
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            View automated End-of-Day (EOD) summaries, daily completed deliverables, and monthly performance metrics
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
          <Button
            size="sm"
            onClick={handleOpenSubmitModal}
            className="h-[46px] px-4 rounded-lg text-xs font-semibold gap-2 bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
          >
            <Plus className="h-4 w-4" />
            File EOD Report
          </Button>

          <YearMonthPicker
            selectedMonthKey={selectedMonthKey}
            onMonthChange={setSelectedMonthKey}
          />

          <Button
            variant="outline"
            size="sm"
            onClick={handleExportMonthSummary}
            className="h-[46px] px-4 rounded-lg text-xs font-semibold gap-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800 shadow-2xs transition-colors"
          >
            <Download className="h-4 w-4 text-slate-500 dark:text-slate-400" />
            Export Monthly Summary
          </Button>
        </div>
      </div>

      {/* Monthly Summary Cards */}
      <MonthlySummary
        monthKey={selectedMonthKey}
        onMonthChange={setSelectedMonthKey}
      />

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <PerformanceChart />
        <HoursWorkedChart />
      </div>

      {/* Month-Wise Daily EOD Reports Log */}
      <Card className="border-slate-200/90 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900 overflow-hidden">
        {/* Card Header with Month Option Tabs & Search */}
        <CardHeader className="p-4 pb-3 border-b border-slate-100 dark:border-slate-800 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <CardTitle className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                Shift EOD Summaries ({filteredReports.length})
              </CardTitle>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
                <Input
                  type="text"
                  placeholder="Filter shift reports..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="pl-8 text-xs h-8 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950"
                />
              </div>

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

        {/* List of Month-Wise EOD Reports */}
        <CardContent className="p-4 space-y-3">
          {displayedReports.length === 0 ? (
            <div className="py-12 text-center text-slate-400 space-y-2">
              <FileText className="h-8 w-8 mx-auto text-slate-300 dark:text-slate-700" />
              <p className="text-sm font-medium text-slate-600 dark:text-slate-300">No shift reports found</p>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                No EOD reports match "{searchQuery}" in {monthName} {year}. Click "File EOD Report" to submit today's work summary.
              </p>
              {searchQuery && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSearchQuery("")}
                  className="mt-2 text-xs"
                >
                  Clear Search
                </Button>
              )}
            </div>
          ) : (
            displayedReports.map(rep => (
              <EodReportCard
                key={rep.id}
                report={rep}
                isExpanded={expandedCardIds.has(rep.id)}
                onToggle={() => toggleCard(rep.id)}
                onDownload={handleDownloadReport}
                timerSessionState={timer.sessionState}
              />
            ))
          )}
        </CardContent>

        {/* Reusable Pagination Footer */}
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

      {/* File EOD Report Dialog Modal */}
      <Dialog open={isSubmitModalOpen} onOpenChange={setIsSubmitModalOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-600" />
              File End-Of-Day (EOD) Report
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Submit your workday deliverables, executive summary, and next-day plan to administration.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmitEod} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Executive Workday Summary *</Label>
              <Textarea
                rows={3}
                placeholder="Brief summary of achievements, progress made, and deliverables completed today..."
                value={summaryInput}
                onChange={e => setSummaryInput(e.target.value)}
                required
                className="text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Completed Deliverables (One per line)</Label>
              <Textarea
                rows={3}
                placeholder="e.g. Completed user authentication flow&#10;Integrated attendance API&#10;Tested MariaDB queries"
                value={completedTasksInput}
                onChange={e => setCompletedTasksInput(e.target.value)}
                className="text-xs font-mono"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Challenges / Blockers</Label>
                <Input
                  placeholder="e.g. Awaiting client API keys..."
                  value={challengesInput}
                  onChange={e => setChallengesInput(e.target.value)}
                  className="text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Hours Worked</Label>
                <Input
                  type="number"
                  step="0.1"
                  min="0.5"
                  max="24"
                  value={hoursWorkedInput}
                  onChange={e => setHoursWorkedInput(e.target.value)}
                  className="text-xs font-mono"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Next Shift Plan</Label>
              <Input
                placeholder="e.g. Complete task assignment UI and finalize sprint..."
                value={nextDayPlanInput}
                onChange={e => setNextDayPlanInput(e.target.value)}
                className="text-xs"
              />
            </div>

            <DialogFooter className="pt-3">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsSubmitModalOpen(false)}
                disabled={isSubmitting}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={isSubmitting}
                className="text-xs bg-blue-600 hover:bg-blue-700 text-white font-medium gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                {isSubmitting ? "Submitting..." : "Submit EOD Report"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}