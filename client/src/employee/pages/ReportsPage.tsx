import React, { useState, useMemo, useEffect } from "react"
import { MonthlySummary } from "../components/MonthlySummary"
import { PerformanceChart } from "../components/charts/PerformanceChart"
import { HoursWorkedChart } from "../components/charts/HoursWorkedChart"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { FileText, Download, Search, ChevronsUpDown } from "lucide-react"
import { getCurrentMonthKey, getMonthData } from "../data/mockReports"
import { YearMonthPicker } from "../components/YearMonthPicker"
import { useEmployee } from "../context/EmployeeContext"
import { useResolvedEodReports } from "../hooks/useResolvedEodReports"
import { EodReportCard } from "../components/reports/EodReportCard"
import { ReportsPagination } from "../components/reports/ReportsPagination"
import { toast } from "sonner"

export const ReportsPage: React.FC = () => {
  const { tasks, timer } = useEmployee()
  const [selectedMonthKey, setSelectedMonthKey] = useState<string>(() => getCurrentMonthKey())
  const [searchQuery, setSearchQuery] = useState<string>("")
  const [currentPage, setCurrentPage] = useState<number>(1)
  const pageSize = 10

  const currentMonthData = getMonthData(selectedMonthKey)
  const { monthName, year } = currentMonthData

  // Dynamically synchronize live context tasks & working timer with active month's EOD shift reports
  const resolvedEodReports = useResolvedEodReports({
    currentMonthData,
    selectedMonthKey,
    tasks,
    timer,
  })

  // Reset pagination on month or search changes
  useEffect(() => {
    setCurrentPage(1)
  }, [selectedMonthKey, searchQuery])

  // Filter EOD reports by search query
  const filteredReports = useMemo(() => {
    if (!searchQuery.trim()) return resolvedEodReports
    const q = searchQuery.toLowerCase()
    return resolvedEodReports.filter(rep => {
      const matchDate = rep.date.toLowerCase().includes(q) || (rep.dayOfWeek && rep.dayOfWeek.toLowerCase().includes(q))
      const matchSummary = rep.summary.toLowerCase().includes(q)
      const matchTasks = rep.completedTasks.some(
        t => t.title.toLowerCase().includes(q) || t.id.toLowerCase().includes(q) || (t.category && t.category.toLowerCase().includes(q))
      )
      return matchDate || matchSummary || matchTasks
    })
  }, [resolvedEodReports, searchQuery])

  // Pagination calculations
  const totalPages = Math.max(1, Math.ceil(filteredReports.length / pageSize))
  const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages)
  const displayedReports = useMemo(() => {
    const startIndex = (safeCurrentPage - 1) * pageSize
    return filteredReports.slice(startIndex, startIndex + pageSize)
  }, [filteredReports, safeCurrentPage, pageSize])

  // Set of expanded EOD card IDs - default to today's active shift ("eod-oct-15")
  const [expandedCardIds, setExpandedCardIds] = useState<Set<string>>(() => new Set(["eod-oct-15"]))

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

  const handleDownloadReport = (date: string) => {
    toast.success(`Exporting EOD report for ${date} (PDF/CSV)`)
  }

  const handleExportMonthSummary = () => {
    toast.success(`Exporting full monthly report for ${monthName} ${year} (PDF/CSV)`)
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

        <div className="flex items-center gap-2 self-start sm:self-auto">
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

      {/* Monthly Summary Cards (Synced with selectedMonthKey & clickable Working Days) */}
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
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 rounded-lg">
                <FileText className="h-4 w-4" />
              </div>
              <div>
                <CardTitle className="text-sm font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                  End-of-Day (EOD) Shift Reports
                  <span className="text-xs font-normal text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                    {monthName} {year}
                  </span>
                </CardTitle>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Daily recorded hours, completed tasks, and shift summary notes
                </p>
              </div>
            </div>

            <YearMonthPicker
              selectedMonthKey={selectedMonthKey}
              onMonthChange={setSelectedMonthKey}
              variant="compact"
            />
          </div>

          {/* Search bar, count & global Expand All toggle */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2 border-t border-slate-100 dark:border-slate-800/80">
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
              <Input
                type="text"
                placeholder="Search days, summary, or completed tasks..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-8 h-8 text-xs bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
              />
            </div>

            <div className="flex items-center gap-2.5 self-end sm:self-auto">
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Showing <strong className="text-slate-800 dark:text-slate-200">{filteredReports.length}</strong> shift reports
              </span>

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
                No EOD reports match "{searchQuery}" in {monthName} {year}.
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
          monthName={monthName}
          year={year}
          onPageChange={setCurrentPage}
        />
      </Card>
    </div>
  )
}
