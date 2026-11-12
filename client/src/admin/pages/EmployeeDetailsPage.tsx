import React, { useState, useMemo, useEffect, useCallback } from "react"
import { useParams, useNavigate, Link } from "react-router-dom"
import { useAdmin } from "../context/AdminContext"
import { api } from "../../services/api"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../../components/ui/tabs"
import { Button } from "../../components/ui/button"
import { Badge } from "../../components/ui/badge"
import { Input } from "../../components/ui/input"
import { EmployeeFormDialog } from "../components/EmployeeFormDialog"
import { TaskAssignmentDialog } from "../components/TaskAssignmentDialog"
import { AdminCommentDialog } from "../components/AdminCommentDialog"
import { UpdatePasswordDialog } from "../components/UpdatePasswordDialog"
import { EmployeeTaskOverview } from "../components/EmployeeTaskOverview"
import { EmployeeAttendanceSummary } from "../components/EmployeeAttendanceSummary"
import { EmployeeLeaveSummary } from "../components/EmployeeLeaveSummary"
import { EmployeePerformanceSummary } from "../components/EmployeePerformanceSummary"
import { AdminSuperAdminCommentsList } from "../components/AdminSuperAdminCommentsList"
import { getCurrentMonthKey, getMonthData } from "../../employee/data/mockReports"
import { YearMonthPicker } from "../../employee/components/YearMonthPicker"
import { EodReportCard } from "../../employee/components/reports/EodReportCard"
import { DownloadMonthlyEodButton } from "../../employee/components/reports/DownloadMonthlyEodButton"
import { downloadDailyEodPDF } from "../../employee/utils/exportEodReport"
import { DataPagination } from "@/components/common/DataPagination"
import { DailyEodReport } from "../../employee/types/report"
import { toast } from "sonner"
import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  CheckCircle2,
  Edit,
  UserX,
  UserCheck,
  Plus,
  MessageSquarePlus,
  FileText,
  KeyRound,
  ChevronsUpDown,
  Search,
  FolderKanban,
} from "lucide-react"
import { useProjects } from "../../context/ProjectContext"

export const EmployeeDetailsPage: React.FC = () => {
  const { employeeId } = useParams<{ employeeId: string }>()
  const navigate = useNavigate()
  const { employees, deactivateEmployee, updateEmployee } = useAdmin()
  const { projects } = useProjects()

  const [activeTab, setActiveTab] = useState("overview")
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isAssignTaskOpen, setIsAssignTaskOpen] = useState(false)
  const [isCommentOpen, setIsCommentOpen] = useState(false)
  const [isUpdatePasswordOpen, setIsUpdatePasswordOpen] = useState(false)

  const cleanParamId = employeeId ? decodeURIComponent(employeeId).trim().toLowerCase().replace(/[\s-_]+/g, "") : ""
  const employee = employees.find(e => {
    const normId = (e.id || "").toLowerCase().replace(/[\s-_]+/g, "")
    const normCode = (e.employeeId || "").toLowerCase().replace(/[\s-_]+/g, "")
    return normId === cleanParamId || normCode === cleanParamId || e.id === employeeId || e.employeeId === employeeId
  })

  if (!employee) {
    return (
      <div className="max-w-4xl mx-auto py-16 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">
          Employee Not Found
        </h2>
        <p className="text-xs text-slate-500">
          No profile matched the identifier &ldquo;{employeeId}&rdquo;.
        </p>
        <Button onClick={() => navigate("/admin/employees")} variant="outline" size="sm">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Directory
        </Button>
      </div>
    )
  }

  const [selectedMonthKey, setSelectedMonthKey] = useState<string>(() => getCurrentMonthKey())
  const [reportSearchQuery, setReportSearchQuery] = useState<string>("")
  const [expandedCardIds, setExpandedCardIds] = useState<Set<string>>(() => new Set())
  const [reportPage, setReportPage] = useState<number>(1)
  const [reportPageSize, setReportPageSize] = useState<number>(10)
  const [backendReports, setBackendReports] = useState<any[]>([])

  const fetchBackendReports = useCallback(async () => {
    const targetId = employee?.id || employee?.employeeId || employeeId
    if (!targetId) return
    try {
      const res = await api.reports.getEod({ employeeId: targetId, limit: "100" })
      if (res && res.success && Array.isArray(res.reports)) {
        const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
        const mapped = res.reports.map((row: any) => {
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
            checkIn: row.check_in_time ? new Date(row.check_in_time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "09:00 AM",
            checkOut: row.check_out_time ? new Date(row.check_out_time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : (row.punch_out ? new Date(row.punch_out).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "06:00 PM"),
            breakDuration: "45m",
            hoursLogged: `${Number(row.hours_worked || 8).toFixed(1)}h`,
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
  }, [employee, employeeId])

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

  // Reset page when month or search changes
  useEffect(() => {
    setReportPage(1)
  }, [selectedMonthKey, reportSearchQuery])

  const currentMonthData = getMonthData(selectedMonthKey)
  const { monthName, year, eodReports } = currentMonthData

  // Filter EOD reports for this employee (preferring real backend records)
  const effectiveReports = backendReports.length > 0 ? backendReports : eodReports

  const filteredEmployeeReports = useMemo(() => {
    return effectiveReports.filter((rep: any) => {
      if (selectedMonthKey) {
        const isIsoMatch = typeof rep.date === "string" && rep.date.startsWith(selectedMonthKey)
        const isMonthNameMatch = typeof rep.date === "string" && (rep.date.includes(monthName) || rep.date.includes(monthName.slice(0, 3)))
        if (!isIsoMatch && !isMonthNameMatch) {
          return false
        }
      }
      if (reportSearchQuery.trim()) {
        const q = reportSearchQuery.toLowerCase()
        const matchDate =
          rep.date.toLowerCase().includes(q) ||
          (rep.dayOfWeek && rep.dayOfWeek.toLowerCase().includes(q))
        const matchSummary = (rep.summary || "").toLowerCase().includes(q)
        const matchTasks = (rep.completedTasks || []).some(
          (t: any) =>
            t.title.toLowerCase().includes(q) ||
            t.id.toLowerCase().includes(q) ||
            (t.category && t.category.toLowerCase().includes(q))
        )
        return matchDate || matchSummary || matchTasks
      }
      return true
    })
  }, [effectiveReports, selectedMonthKey, monthName, reportSearchQuery])

  const employeePickerDays = useMemo(() => {
    const dates = new Set(filteredEmployeeReports.map((r: any) => r.date))
    return dates.size || currentMonthData.summary.daysPresent
  }, [filteredEmployeeReports, currentMonthData.summary.daysPresent])

  const employeePickerTasks = useMemo(() => {
    const total = filteredEmployeeReports.reduce((acc: number, r: any) => acc + (r.completedTasks?.length || 0), 0)
    return total || currentMonthData.summary.tasksCompleted
  }, [filteredEmployeeReports, currentMonthData.summary.tasksCompleted])

  // Pagination for employee reports
  const totalReportPages = Math.max(1, Math.ceil(filteredEmployeeReports.length / reportPageSize))
  const safeReportPage = Math.min(Math.max(1, reportPage), totalReportPages)
  const displayedEmployeeReports = useMemo(() => {
    const startIndex = (safeReportPage - 1) * reportPageSize
    return filteredEmployeeReports.slice(startIndex, startIndex + reportPageSize)
  }, [filteredEmployeeReports, safeReportPage, reportPageSize])

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

  const allExpanded =
    filteredEmployeeReports.length > 0 &&
    filteredEmployeeReports.every(rep => expandedCardIds.has(rep.id))

  const toggleAllCards = () => {
    if (allExpanded) {
      setExpandedCardIds(new Set())
    } else {
      setExpandedCardIds(new Set(filteredEmployeeReports.map(rep => rep.id)))
    }
  }

  const handleDownloadReport = (date: string, reportItem?: any) => {
    const report = reportItem || filteredEmployeeReports.find(r => r.date === date)
    if (report) {
      downloadDailyEodPDF(report, employee.id)
    } else {
      toast.success(`Exporting audited EOD report for ${date} (PDF)`)
    }
  }


  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Back button */}
      <div>
        <Link
          to="/admin/employees"
          className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-indigo-600 transition-colors gap-1.5"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Workforce Directory</span>
        </Link>
      </div>

      {/* Profile Header Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <img
              src={employee.avatar}
              alt={employee.name}
              className="w-20 h-20 rounded-2xl object-cover border-2 border-indigo-100 dark:border-indigo-950 shadow-md shrink-0"
            />
            <div className="space-y-1.5">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                  {employee.name}
                </h1>
                <span className="font-mono text-xs px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium">
                  {employee.id}
                </span>
                <Badge
                  className={`text-[10px] uppercase font-semibold ${
                    employee.accountStatus === "active"
                      ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                      : "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300"
                  }`}
                >
                  {employee.accountStatus}
                </Badge>
              </div>

              <p className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">
                {employee.designation} &bull; {employee.department}
              </p>

              <div className="flex items-center gap-4 text-xs text-slate-500 flex-wrap pt-1">
                <span className="flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  {employee.email}
                </span>
                <span className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  {employee.phone || "+1 (555) 000-0000"}
                </span>
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  {employee.location || "Remote"}
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 flex-wrap self-stretch md:self-auto justify-end">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsEditOpen(true)}
              className="text-xs h-9"
            >
              <Edit className="w-3.5 h-3.5 mr-1.5 text-slate-500" />
              Edit Profile
            </Button>

            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsUpdatePasswordOpen(true)}
              className="text-xs h-9 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800 hover:bg-amber-50 dark:hover:bg-amber-950/40"
            >
              <KeyRound className="w-3.5 h-3.5 mr-1.5 text-amber-500" />
              Update Password
            </Button>

            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsCommentOpen(true)}
              className="text-xs h-9 text-indigo-600 border-indigo-200 dark:border-indigo-800"
            >
              <MessageSquarePlus className="w-3.5 h-3.5 mr-1.5" />
              Note for Super Admin
            </Button>

            <Button
              size="sm"
              onClick={() => setIsAssignTaskOpen(true)}
              className="text-xs h-9 bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              <Plus className="w-3.5 h-3.5 mr-1.5" />
              Assign Task
            </Button>

            {employee.accountStatus === "active" ? (
              <Button
                size="sm"
                variant="destructive"
                onClick={() => deactivateEmployee(employee.id)}
                className="text-xs h-9 bg-rose-600 hover:bg-rose-700"
              >
                <UserX className="w-3.5 h-3.5 mr-1.5" />
                Deactivate
              </Button>
            ) : (
              <Button
                size="sm"
                variant="default"
                onClick={() => updateEmployee(employee.id, { accountStatus: "active" })}
                className="text-xs h-9 bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                <UserCheck className="w-3.5 h-3.5 mr-1.5" />
                Reactivate
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-slate-100 dark:bg-slate-800 p-1 rounded-xl h-auto flex flex-wrap gap-1">
          <TabsTrigger value="overview" className="text-xs font-semibold py-2 px-3">
            Overview
          </TabsTrigger>
          <TabsTrigger value="tasks" className="text-xs font-semibold py-2 px-3">
            Assigned Tasks ({employee.activeTasksCount})
          </TabsTrigger>
          <TabsTrigger value="attendance" className="text-xs font-semibold py-2 px-3">
            Attendance Logs
          </TabsTrigger>
          <TabsTrigger value="reports" className="text-xs font-semibold py-2 px-3">
            EOD Reports
          </TabsTrigger>
          <TabsTrigger value="leave" className="text-xs font-semibold py-2 px-3">
            Leave History (View Only)
          </TabsTrigger>
          <TabsTrigger value="performance" className="text-xs font-semibold py-2 px-3">
            Performance & Adherence
          </TabsTrigger>
          <TabsTrigger value="notes" className="text-xs font-semibold py-2 px-3">
            Admin Observations
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Overview */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-6">
              {/* Profile Details Card */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-4">
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  Employment Details & System Access
                </h3>

                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div className="space-y-1">
                    <span className="text-slate-400">Department</span>
                    <p className="font-semibold text-slate-800 dark:text-slate-200">
                      {employee.department}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-slate-400">Role Designation</span>
                    <p className="font-semibold text-slate-800 dark:text-slate-200">
                      {employee.designation}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-slate-400">Corporate Email</span>
                    <p className="font-semibold text-slate-800 dark:text-slate-200 font-mono">
                      {employee.email}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-slate-400">Direct Contact</span>
                    <p className="font-semibold text-slate-800 dark:text-slate-200 font-mono">
                      {employee.phone}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-slate-400">Physical / Remote Base</span>
                    <p className="font-semibold text-slate-800 dark:text-slate-200">
                      {employee.location}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-slate-400">Standard Work Schedule</span>
                    <p className="font-semibold text-slate-800 dark:text-slate-200">
                      Mon–Sat (48 hrs / week)
                    </p>
                  </div>
                </div>
              </div>

              {/* Security & Access Policies Card */}
              <div className="bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-slate-100">
                  <KeyRound className="w-4 h-4 text-indigo-500" />
                  <span>Credential Provisioning & Governance</span>
                </div>
                <p className="text-xs text-slate-500">
                  Employee authentication is managed strictly by System Administrators. Employees do not have self-service password modification permissions. To reset this employee&apos;s access password, administrators must generate and distribute a new key.
                </p>
                <div className="pt-2 flex items-center justify-between flex-wrap gap-2">
                  <span className="text-[11px] px-2.5 py-1 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-medium inline-flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Authentication Provisioned & Active
                  </span>
                  <Button
                    size="sm"
                    onClick={() => setIsUpdatePasswordOpen(true)}
                    className="text-xs h-7 gap-1.5 bg-amber-600 hover:bg-amber-700 text-white"
                  >
                    <KeyRound className="w-3.5 h-3.5" />
                    Update Password
                  </Button>
                </div>
              </div>
            </div>

            {/* Sidebar quick status */}
            <div className="space-y-6">
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-4">
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  Live Status Today
                </h3>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">Attendance:</span>
                    <span className="font-bold capitalize text-slate-900 dark:text-slate-100">
                      {employee.attendanceToday}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">Clock In:</span>
                    <span className="font-mono font-medium text-slate-900 dark:text-slate-100">
                      {employee.checkInToday || "—"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">Hours Logged:</span>
                    <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
                      {employee.hoursLoggedToday ? `${employee.hoursLoggedToday.toFixed(1)}h` : "—"}
                    </span>
                  </div>
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Active Tasks:</span>
                    <span className="font-bold text-slate-900 dark:text-slate-100">
                      {employee.activeTasksCount}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Completed Tasks:</span>
                    <span className="font-bold text-slate-900 dark:text-slate-100">
                      {employee.completedTasksCount}
                    </span>
                  </div>
                </div>
              </div>

              {/* Assigned Projects */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                    <FolderKanban className="w-4 h-4 text-indigo-500" />
                    Project Involvements
                  </h3>
                </div>

                {(() => {
                  const involvedProjects = projects.filter(
                    p => p.assignedEmployeeIds && p.assignedEmployeeIds.includes(employee.id)
                  )
                  if (involvedProjects.length === 0) {
                    return (
                      <p className="text-xs text-slate-400 italic">No assigned projects yet.</p>
                    )
                  }
                  return (
                    <div className="space-y-2">
                      {involvedProjects.map(proj => (
                        <div
                          key={proj.id}
                          onClick={() => navigate(`/admin/projects/${proj.id}`)}
                          className="p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer text-xs space-y-1"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-slate-900 dark:text-slate-100 truncate max-w-[150px]">
                              {proj.name}
                            </span>
                            <span className="font-mono text-[10px] text-indigo-600 dark:text-indigo-400 font-bold">
                              {proj.code}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-[11px] text-slate-500">
                            <span className="capitalize">Status: {proj.status}</span>
                            <span className="font-mono">{proj.deadline}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )
                })()}
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Tab 2: Tasks */}
        <TabsContent value="tasks">
          <EmployeeTaskOverview employeeId={employee.id} employeeName={employee.name} />
        </TabsContent>

        {/* Tab 3: Attendance */}
        <TabsContent value="attendance">
          <EmployeeAttendanceSummary employeeId={employee.id} employeeName={employee.name} />
        </TabsContent>

        {/* Tab 4: EOD Reports */}
        <TabsContent value="reports" className="space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  End-of-Day Shift Reports ({filteredEmployeeReports.length})
                </h3>
                <Badge variant="outline" className="text-[10px] font-mono">
                  {monthName} {year}
                </Badge>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Audited daily shift deliverables, attendance punch timestamps, and blockers.
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap self-stretch sm:self-auto">
              <YearMonthPicker
                selectedMonthKey={selectedMonthKey}
                onMonthChange={setSelectedMonthKey}
                variant="compact"
                monthStats={{
                  [selectedMonthKey]: {
                    daysCount: employeePickerDays,
                    taskCount: employeePickerTasks,
                  },
                }}
              />

              <DownloadMonthlyEodButton
                monthName={monthName}
                year={year}
                reports={filteredEmployeeReports}
                employeeName={employee.name}
              />

              {filteredEmployeeReports.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={toggleAllCards}
                  className="h-8 px-2.5 text-xs font-medium gap-1.5 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 shadow-2xs"
                >
                  <ChevronsUpDown className="h-3.5 w-3.5 text-slate-500" />
                  {allExpanded ? "Collapse All" : "Expand All"}
                </Button>
              )}
            </div>
          </div>

          {/* Search bar */}
          <div className="relative max-w-sm">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
            <Input
              placeholder="Search reports by date, deliverables, or keywords..."
              value={reportSearchQuery}
              onChange={e => setReportSearchQuery(e.target.value)}
              className="pl-8 h-8 text-xs bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
            />
          </div>

          {/* EOD Report Cards List */}
          <div className="space-y-3">
            {filteredEmployeeReports.length === 0 ? (
              <div className="py-12 text-center text-slate-400 space-y-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                <FileText className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-700" />
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  No EOD reports found
                </p>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  {reportSearchQuery
                    ? "No shift reports match your search query."
                    : `No reports logged for ${monthName} ${year}.`}
                </p>
                {reportSearchQuery && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setReportSearchQuery("")}
                    className="mt-2 text-xs"
                  >
                    Clear Search
                  </Button>
                )}
              </div>
            ) : (
              displayedEmployeeReports.map(rep => (
                <EodReportCard
                  key={rep.id}
                  report={rep as DailyEodReport}
                  isExpanded={expandedCardIds.has(rep.id)}
                  onToggle={() => toggleCard(rep.id)}
                  onDownload={handleDownloadReport}
                />
              ))
            )}
          </div>

          {/* Pagination Footer with 10 / 20 / 30 selector */}
          {filteredEmployeeReports.length > 0 && (
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-2xs mt-4">
              <DataPagination
                currentPage={safeReportPage}
                totalPages={totalReportPages}
                totalItems={filteredEmployeeReports.length}
                pageSize={reportPageSize}
                pageSizeOptions={[10, 20, 30]}
                itemName="EOD reports"
                onPageChange={setReportPage}
                onPageSizeChange={setReportPageSize}
              />
            </div>
          )}
        </TabsContent>

        {/* Tab 5: Leave History */}
        <TabsContent value="leave">
          <EmployeeLeaveSummary employeeId={employee.id} employeeName={employee.name} />
        </TabsContent>

        {/* Tab 6: Performance */}
        <TabsContent value="performance">
          <EmployeePerformanceSummary employee={employee} />
        </TabsContent>

        {/* Tab 7: Admin Notes */}
        <TabsContent value="notes">
          <AdminSuperAdminCommentsList
            targetEmployeeId={employee.id}
            targetEmployeeName={employee.name}
          />
        </TabsContent>
      </Tabs>

      {/* Modals */}
      <EmployeeFormDialog
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        employeeToEdit={employee}
      />

      <TaskAssignmentDialog
        open={isAssignTaskOpen}
        onOpenChange={setIsAssignTaskOpen}
        defaultEmployeeId={employee.id}
      />

      <AdminCommentDialog
        open={isCommentOpen}
        onOpenChange={setIsCommentOpen}
        defaultTargetType="employee"
        defaultTargetId={employee.id}
        defaultTargetTitle={`Employee: ${employee.name} (${employee.id})`}
      />

      <UpdatePasswordDialog
        open={isUpdatePasswordOpen}
        onOpenChange={setIsUpdatePasswordOpen}
        employee={employee}
      />
    </div>
  )
}
