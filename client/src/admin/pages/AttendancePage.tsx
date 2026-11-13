import React, { useState, useMemo } from "react"
import { useNavigate } from "react-router-dom"
import { useAdmin } from "../context/AdminContext"
import { DataPagination } from "@/components/common/DataPagination"
import { toast } from "sonner"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table"
import { Input } from "../../components/ui/input"
import { Button } from "../../components/ui/button"
import { Badge } from "../../components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select"
import {
  Clock,
  Coffee,
  Search,
  Eye,
  Download,
  Calendar,
  X,
  RotateCcw,
} from "lucide-react"

export const AttendancePage: React.FC = () => {
  const navigate = useNavigate()
  const { attendance, departments } = useAdmin()

  const [searchTerm, setSearchTerm] = useState("")
  const [selectedDept, setSelectedDept] = useState("all")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [selectedDate, setSelectedDate] = useState<string>("")
  const [selectedMonth, setSelectedMonth] = useState<string>("all")
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [pageSize, setPageSize] = useState<number>(10)

  // Current and historical date presets
  const todayStr = useMemo(() => {
    const d = new Date()
    const yr = d.getFullYear()
    const mo = String(d.getMonth() + 1).padStart(2, "0")
    const da = String(d.getDate()).padStart(2, "0")
    return `${yr}-${mo}-${da}`
  }, [])

  const yesterdayStr = useMemo(() => {
    const d = new Date()
    d.setDate(d.getDate() - 1)
    const yr = d.getFullYear()
    const mo = String(d.getMonth() + 1).padStart(2, "0")
    const da = String(d.getDate()).padStart(2, "0")
    return `${yr}-${mo}-${da}`
  }, [])

  const currentMonthKey = useMemo(() => {
    const d = new Date()
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
  }, [])

  const previousMonthKey = useMemo(() => {
    const d = new Date()
    d.setMonth(d.getMonth() - 1)
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
  }, [])

  // Available months list (past 12 months + any records present in attendance)
  const availableMonths = useMemo(() => {
    const monthsSet = new Set<string>()
    const d = new Date()
    for (let i = 0; i < 12; i++) {
      const target = new Date(d.getFullYear(), d.getMonth() - i, 1)
      const key = `${target.getFullYear()}-${String(target.getMonth() + 1).padStart(2, "0")}`
      monthsSet.add(key)
    }
    attendance.forEach(a => {
      if (a.date && a.date.length >= 7) {
        monthsSet.add(a.date.slice(0, 7))
      }
    })
    return Array.from(monthsSet).sort().reverse().map(key => {
      const [year, month] = key.split("-")
      const date = new Date(Number(year), Number(month) - 1, 1)
      const label = date.toLocaleDateString("en-US", { month: "long", year: "numeric" })
      return { key, label }
    })
  }, [attendance])

  // Reset page when filters change
  React.useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, selectedDept, selectedStatus, selectedDate, selectedMonth])

  // Filtered attendance records
  const filteredAttendance = useMemo(() => {
    return attendance.filter(record => {
      const matchSearch =
        record.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.employeeId.toLowerCase().includes(searchTerm.toLowerCase())

      const matchDept = selectedDept === "all" || record.department === selectedDept
      const matchStatus = selectedStatus === "all" || record.status === selectedStatus

      // Date & Month filter
      const matchDate = !selectedDate || record.date === selectedDate
      const matchMonth = selectedMonth === "all" || (record.date && record.date.startsWith(selectedMonth))

      return matchSearch && matchDept && matchStatus && matchDate && matchMonth
    })
  }, [attendance, searchTerm, selectedDept, selectedStatus, selectedDate, selectedMonth])

  // Pagination calculations
  const totalPages = Math.max(1, Math.ceil(filteredAttendance.length / pageSize))
  const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages)
  const displayedAttendance = useMemo(() => {
    const startIndex = (safeCurrentPage - 1) * pageSize
    return filteredAttendance.slice(startIndex, startIndex + pageSize)
  }, [filteredAttendance, safeCurrentPage, pageSize])

  // Summary Metrics calculated dynamically from filtered records
  const presentCount = filteredAttendance.filter(a => a.status === "present" || a.status === "working").length
  const totalHours = filteredAttendance.reduce((sum, a) => sum + (Number(a.netHoursWorked) || 0), 0)
  const avgHours = filteredAttendance.length > 0 ? (totalHours / filteredAttendance.length).toFixed(1) : "0.0"
  const totalBreakSeconds = filteredAttendance.reduce((sum, a) => sum + (Number(a.breakDurationSeconds) || 0), 0)
  const totalBreakMinutes = Math.round(totalBreakSeconds / 60)

  // Label for active filter
  const activePeriodLabel = useMemo(() => {
    if (selectedDate) {
      if (selectedDate === todayStr) return `${selectedDate} (Today)`
      if (selectedDate === yesterdayStr) return `${selectedDate} (Yesterday)`
      return selectedDate
    }
    if (selectedMonth !== "all") {
      const match = availableMonths.find(m => m.key === selectedMonth)
      return match ? match.label : selectedMonth
    }
    return null
  }, [selectedDate, selectedMonth, todayStr, yesterdayStr, availableMonths])

  const clearDateFilters = () => {
    setSelectedDate("")
    setSelectedMonth("all")
  }

  const handleExportCSV = () => {
    if (filteredAttendance.length === 0) {
      toast.error("No attendance records to export with current filters.")
      return
    }

    const headers = [
      "Employee ID",
      "Employee Name",
      "Department",
      "Date",
      "Day",
      "Check In",
      "Check Out",
      "Break Time",
      "Break Minutes",
      "Net Hours",
      "Status",
    ]

    const rows = filteredAttendance.map(r => [
      `"${r.employeeId}"`,
      `"${r.employeeName}"`,
      `"${r.department}"`,
      `"${r.date}"`,
      `"${r.dayOfWeek}"`,
      `"${r.checkIn || '-'}"`,
      `"${r.checkOut || '-'}"`,
      `"${r.breakDuration || '0 mins'}"`,
      Math.round((Number(r.breakDurationSeconds) || 0) / 60),
      Number(r.netHoursWorked || 0).toFixed(1),
      `"${r.status}"`,
    ])

    const csvContent = [headers.join(","), ...rows.map(row => row.join(","))].join("\n")
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    const fileSuffix = selectedDate || (selectedMonth !== "all" ? selectedMonth : "all-time")
    link.setAttribute("download", `worktrack-attendance-${fileSuffix}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    toast.success(`Exported ${filteredAttendance.length} attendance records to CSV.`)
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
            <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              Workforce Attendance & Time Logs
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Standard schedule: Monday through Saturday (6-day baseline, 48h/week). Daily check-in timestamps, break telemetry, and historical periods.
          </p>
        </div>

        {/* Dynamic Metric Badges */}
        <div className="flex items-center gap-2.5 text-xs flex-wrap">
          <div className="px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
            <strong>{presentCount}</strong> / {filteredAttendance.length} Present
          </div>
          <div className="px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
            <strong>{totalHours.toFixed(1)}h</strong> Total Hours
          </div>
          <div className="px-3 py-1.5 rounded-lg bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
            <span className="flex items-center gap-1">
              <Coffee className="w-3.5 h-3.5 text-amber-500" />
              <strong>{totalBreakMinutes}m</strong> Break Time
            </span>
          </div>
          <div className="px-3 py-1.5 rounded-lg bg-slate-50 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
            <strong>{avgHours}h</strong> Avg Shift
          </div>
        </div>
      </div>

      {/* Date & Period Filtering Control Panel */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
        {/* Quick Period Shortcut Buttons */}
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 mr-1 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-indigo-500" />
              Quick Periods:
            </span>
            <Button
              type="button"
              variant={!selectedDate && selectedMonth === "all" ? "default" : "outline"}
              size="sm"
              onClick={clearDateFilters}
              className={`h-8 px-2.5 text-xs font-medium ${
                !selectedDate && selectedMonth === "all"
                  ? "bg-indigo-600 hover:bg-indigo-700 text-white"
                  : "text-slate-600 dark:text-slate-300"
              }`}
            >
              All Records
            </Button>
            <Button
              type="button"
              variant={selectedDate === todayStr ? "default" : "outline"}
              size="sm"
              onClick={() => {
                setSelectedDate(selectedDate === todayStr ? "" : todayStr)
                setSelectedMonth("all")
              }}
              className={`h-8 px-2.5 text-xs font-medium ${
                selectedDate === todayStr
                  ? "bg-indigo-600 hover:bg-indigo-700 text-white"
                  : "text-slate-600 dark:text-slate-300"
              }`}
            >
              Today
            </Button>
            <Button
              type="button"
              variant={selectedDate === yesterdayStr ? "default" : "outline"}
              size="sm"
              onClick={() => {
                setSelectedDate(selectedDate === yesterdayStr ? "" : yesterdayStr)
                setSelectedMonth("all")
              }}
              className={`h-8 px-2.5 text-xs font-medium ${
                selectedDate === yesterdayStr
                  ? "bg-indigo-600 hover:bg-indigo-700 text-white"
                  : "text-slate-600 dark:text-slate-300"
              }`}
            >
              Previous Day (Yesterday)
            </Button>
            <Button
              type="button"
              variant={!selectedDate && selectedMonth === currentMonthKey ? "default" : "outline"}
              size="sm"
              onClick={() => {
                setSelectedMonth(selectedMonth === currentMonthKey ? "all" : currentMonthKey)
                setSelectedDate("")
              }}
              className={`h-8 px-2.5 text-xs font-medium ${
                !selectedDate && selectedMonth === currentMonthKey
                  ? "bg-indigo-600 hover:bg-indigo-700 text-white"
                  : "text-slate-600 dark:text-slate-300"
              }`}
            >
              This Month
            </Button>
            <Button
              type="button"
              variant={!selectedDate && selectedMonth === previousMonthKey ? "default" : "outline"}
              size="sm"
              onClick={() => {
                setSelectedMonth(selectedMonth === previousMonthKey ? "all" : previousMonthKey)
                setSelectedDate("")
              }}
              className={`h-8 px-2.5 text-xs font-medium ${
                !selectedDate && selectedMonth === previousMonthKey
                  ? "bg-indigo-600 hover:bg-indigo-700 text-white"
                  : "text-slate-600 dark:text-slate-300"
              }`}
            >
              Previous Month
            </Button>
          </div>

          {(selectedDate || selectedMonth !== "all") && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={clearDateFilters}
              className="h-8 px-2 text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center gap-1"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Date Filter</span>
            </Button>
          )}
        </div>

        {/* Secondary Filters Bar: Search, Calendar Picker, Month Dropdown, Department, Status, Export */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-2.5 pt-2 border-t border-slate-100 dark:border-slate-800">
          <div className="flex flex-1 items-center gap-2 max-w-sm relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
            <Input
              placeholder="Search by employee name or ID..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="pl-9 h-9 text-xs"
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Calendar Date Picker */}
            <div className="relative flex items-center">
              <Calendar className="w-3.5 h-3.5 text-indigo-500 absolute left-2.5 pointer-events-none" />
              <Input
                type="date"
                value={selectedDate}
                onChange={e => {
                  setSelectedDate(e.target.value)
                  if (e.target.value) setSelectedMonth("all")
                }}
                className="pl-8 pr-7 h-9 text-xs w-36 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 cursor-pointer font-mono"
                title="Select a specific date from calendar"
              />
              {selectedDate && (
                <button
                  type="button"
                  onClick={() => setSelectedDate("")}
                  className="absolute right-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs font-bold leading-none p-0.5"
                  title="Clear specific date"
                >
                  &times;
                </button>
              )}
            </div>

            {/* Monthly Attendance Dropdown (Current & Previous Months) */}
            <div className="w-44">
              <Select
                value={selectedMonth}
                onValueChange={val => {
                  setSelectedMonth(val)
                  if (val !== "all") setSelectedDate("")
                }}
              >
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue placeholder="Monthly Attendance" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Months</SelectItem>
                  {availableMonths.map(m => (
                    <SelectItem key={m.key} value={m.key}>
                      {m.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Department Filter */}
            <div className="w-40">
              <Select value={selectedDept} onValueChange={setSelectedDept}>
                <SelectTrigger className="h-9 text-xs">
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

            {/* Status Filter */}
            <div className="w-32">
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="working">Working</SelectItem>
                  <SelectItem value="present">Present</SelectItem>
                  <SelectItem value="on-break">On Break</SelectItem>
                  <SelectItem value="logged-out">Logged Out</SelectItem>
                  <SelectItem value="absent">Absent</SelectItem>
                  <SelectItem value="on-leave">On Leave</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Export CSV */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportCSV}
              className="h-9 px-3 text-xs flex items-center gap-1.5 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              <Download className="w-3.5 h-3.5 text-indigo-500" />
              <span>Export CSV</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Active Filter Banner */}
      {activePeriodLabel && (
        <div className="flex items-center justify-between p-3 rounded-xl bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 text-xs text-indigo-900 dark:text-indigo-200">
          <div className="flex items-center gap-2 flex-wrap">
            <Calendar className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
            <span>
              Showing attendance logs for:{" "}
              <strong className="font-mono bg-white dark:bg-slate-900 px-2 py-0.5 rounded border border-indigo-200 dark:border-indigo-800">
                {activePeriodLabel}
              </strong>{" "}
              &bull; Found <strong>{filteredAttendance.length}</strong> record{filteredAttendance.length === 1 ? "" : "s"} &bull; Total Net Work: <strong>{totalHours.toFixed(1)}h</strong> &bull; Total Break: <strong>{totalBreakMinutes} mins</strong>
            </span>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={clearDateFilters}
            className="h-7 px-2 text-xs text-indigo-700 dark:text-indigo-300 hover:text-rose-600 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 gap-1"
          >
            <X className="w-3.5 h-3.5" />
            <span>Clear Filter</span>
          </Button>
        </div>
      )}

      {/* Attendance Table */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50/75 dark:bg-slate-800/50">
              <TableRow className="border-b border-slate-200 dark:border-slate-800">
                <TableHead className="text-xs font-semibold">Employee</TableHead>
                <TableHead className="text-xs font-semibold">Department</TableHead>
                <TableHead className="text-xs font-semibold">Date & Day</TableHead>
                <TableHead className="text-xs font-semibold">Status</TableHead>
                <TableHead className="text-xs font-semibold">Check In</TableHead>
                <TableHead className="text-xs font-semibold">Check Out</TableHead>
                <TableHead className="text-xs font-semibold">Break Time</TableHead>
                <TableHead className="text-xs font-semibold">Net Hours</TableHead>
                <TableHead className="text-xs font-semibold text-right">Profile</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAttendance.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-12 text-xs text-slate-500">
                    <div className="space-y-2">
                      <p className="font-semibold text-slate-700 dark:text-slate-300">
                        {activePeriodLabel
                          ? `No attendance records recorded for ${activePeriodLabel}.`
                          : "No attendance records match your search criteria."}
                      </p>
                      {activePeriodLabel && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={clearDateFilters}
                          className="h-7 text-xs text-indigo-600 border-indigo-200 dark:text-indigo-400 dark:border-indigo-800"
                        >
                          View All Dates
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                displayedAttendance.map(record => (
                  <TableRow
                    key={record.id}
                    className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 border-b border-slate-100 dark:border-slate-800/60"
                  >
                    {/* Employee Profile */}
                    <TableCell className="py-3">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={record.employeeAvatar}
                          alt={record.employeeName}
                          className="w-7 h-7 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                        />
                        <div>
                          <p className="text-xs font-bold text-slate-900 dark:text-slate-100">
                            {record.employeeName}
                          </p>
                          <p className="text-[10px] font-mono text-slate-400">
                            {record.employeeId}
                          </p>
                        </div>
                      </div>
                    </TableCell>

                    {/* Department */}
                    <TableCell className="py-3 text-xs text-slate-600 dark:text-slate-400">
                      {record.department}
                    </TableCell>

                    {/* Date & Day */}
                    <TableCell className="py-3 text-xs">
                      <span className="font-medium text-slate-800 dark:text-slate-200">
                        {record.date}
                      </span>
                      <span className="text-[11px] text-slate-400 block font-normal">
                        {record.dayOfWeek}
                      </span>
                    </TableCell>

                    {/* Status */}
                    <TableCell className="py-3">
                      <Badge
                        variant="outline"
                        className={`text-[10px] uppercase font-semibold ${
                          record.status === "present" || record.status === "working"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800"
                            : record.status === "on-break"
                            ? "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800"
                            : record.status === "on-leave"
                            ? "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-800"
                            : "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800"
                        }`}
                      >
                        {record.status}
                      </Badge>
                    </TableCell>

                    {/* Check In */}
                    <TableCell className="py-3 text-xs font-mono text-slate-700 dark:text-slate-300">
                      {record.checkIn || "—"}
                    </TableCell>

                    {/* Check Out */}
                    <TableCell className="py-3 text-xs font-mono text-slate-700 dark:text-slate-300">
                      {record.checkOut || "—"}
                    </TableCell>

                    {/* Break Time (Highlight recorded break time e.g. 21 mins) */}
                    <TableCell className="py-3 text-xs">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md font-mono text-[11px] ${
                          record.breakDuration && record.breakDuration !== "0 mins" && record.breakDuration !== "0m"
                            ? "bg-amber-50 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800 font-semibold"
                            : "text-slate-500"
                        }`}
                      >
                        <Coffee className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                        <span>{record.breakDuration || "0 mins"}</span>
                      </span>
                    </TableCell>

                    {/* Net Hours Worked */}
                    <TableCell className="py-3 text-xs font-mono font-bold text-slate-900 dark:text-slate-100">
                      {record.netHoursWorked > 0 ? `${record.netHoursWorked.toFixed(1)}h` : "—"}
                    </TableCell>

                    {/* Profile Action */}
                    <TableCell className="py-3 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate(`/admin/employees/${record.employeeId}`)}
                        className="h-7 w-7 p-0 text-slate-400 hover:text-indigo-600"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination Footer with 10 / 20 / 30 selector */}
        {filteredAttendance.length > 0 && (
          <DataPagination
            currentPage={safeCurrentPage}
            totalPages={totalPages}
            totalItems={filteredAttendance.length}
            pageSize={pageSize}
            pageSizeOptions={[10, 20, 30]}
            itemName="time log entries"
            onPageChange={setCurrentPage}
            onPageSizeChange={setPageSize}
          />
        )}
      </div>
    </div>
  )
}
