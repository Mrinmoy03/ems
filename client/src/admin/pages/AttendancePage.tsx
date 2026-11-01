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
} from "lucide-react"


export const AttendancePage: React.FC = () => {
  const navigate = useNavigate()
  const { attendance, departments } = useAdmin()

  const [searchTerm, setSearchTerm] = useState("")
  const [selectedDept, setSelectedDept] = useState("all")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [pageSize, setPageSize] = useState<number>(10)

  // Reset page when filters change
  React.useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, selectedDept, selectedStatus])

  const filteredAttendance = useMemo(() => {
    return attendance.filter(record => {
      const matchSearch =
        record.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.employeeId.toLowerCase().includes(searchTerm.toLowerCase())

      const matchDept = selectedDept === "all" || record.department === selectedDept
      const matchStatus = selectedStatus === "all" || record.status === selectedStatus

      return matchSearch && matchDept && matchStatus
    })
  }, [attendance, searchTerm, selectedDept, selectedStatus])

  // Pagination calculations
  const totalPages = Math.max(1, Math.ceil(filteredAttendance.length / pageSize))
  const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages)
  const displayedAttendance = useMemo(() => {
    const startIndex = (safeCurrentPage - 1) * pageSize
    return filteredAttendance.slice(startIndex, startIndex + pageSize)
  }, [filteredAttendance, safeCurrentPage, pageSize])

  // Summary Metrics
  const presentCount = attendance.filter(a => a.status === "present" || a.status === "working").length
  const totalHours = attendance.reduce((sum, a) => sum + a.netHoursWorked, 0)
  const avgHours = attendance.length > 0 ? (totalHours / attendance.length).toFixed(1) : "8.0"

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
      "Check In",
      "Check Out",
      "Break Minutes",
      "Net Hours",
      "Status",
    ]

    const rows = filteredAttendance.map(r => [
      `"${r.employeeId}"`,
      `"${r.employeeName}"`,
      `"${r.department}"`,
      `"${r.date}"`,
      `"${r.checkIn || '-'}"`,
      `"${r.checkOut || '-'}"`,
      `"${r.breakDuration || '-'}"`,
      r.netHoursWorked.toFixed(1),
      `"${r.status}"`,
    ])

    const csvContent = [headers.join(","), ...rows.map(row => row.join(","))].join("\n")
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.setAttribute("download", `worktrack-attendance-logs-${new Date().toISOString().slice(0, 10)}.csv`)
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
            Standard schedule: Monday through Saturday (6-day baseline, 48h/week). Daily check-in timestamps and break telemetry.
          </p>
        </div>

        <div className="flex items-center gap-4 text-xs">
          <div className="px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
            <strong>{presentCount}</strong> / {attendance.length} Clocked Today
          </div>
          <div className="px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
            <strong>{avgHours}h</strong> Avg Duration
          </div>
        </div>
      </div>

      {/* Toolbar Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex flex-1 items-center gap-2 max-w-md relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
          <Input
            placeholder="Search by employee name or ID..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="pl-9 h-9 text-xs"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="w-44">
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

          <div className="w-36">
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="h-9 text-xs">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="working">Working</SelectItem>
                <SelectItem value="present">Present</SelectItem>
                <SelectItem value="on-break">On Break</SelectItem>
                <SelectItem value="absent">Absent</SelectItem>
                <SelectItem value="on-leave">On Leave</SelectItem>
              </SelectContent>
            </Select>
          </div>

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
                  <TableCell colSpan={9} className="text-center py-10 text-xs text-slate-500">
                    No attendance records match your search criteria.
                  </TableCell>
                </TableRow>
              ) : (
                displayedAttendance.map(record => (
                  <TableRow
                    key={record.id}
                    className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 border-b border-slate-100 dark:border-slate-800/60"
                  >
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

                    <TableCell className="py-3 text-xs text-slate-600 dark:text-slate-400">
                      {record.department}
                    </TableCell>

                    <TableCell className="py-3 text-xs">
                      <span className="font-medium text-slate-800 dark:text-slate-200">
                        {record.date}
                      </span>
                      <span className="text-[11px] text-slate-400 block font-normal">
                        {record.dayOfWeek}
                      </span>
                    </TableCell>

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

                    <TableCell className="py-3 text-xs font-mono text-slate-700 dark:text-slate-300">
                      {record.checkIn || "—"}
                    </TableCell>

                    <TableCell className="py-3 text-xs font-mono text-slate-700 dark:text-slate-300">
                      {record.checkOut || "—"}
                    </TableCell>

                    <TableCell className="py-3 text-xs text-slate-600 dark:text-slate-400">
                      <div className="flex items-center gap-1.5">
                        <Coffee className="w-3.5 h-3.5 text-amber-500" />
                        <span>{record.breakDuration || "0m"}</span>
                      </div>
                    </TableCell>

                    <TableCell className="py-3 text-xs font-mono font-bold text-slate-900 dark:text-slate-100">
                      {record.netHoursWorked > 0 ? `${record.netHoursWorked.toFixed(1)}h` : "—"}
                    </TableCell>

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
