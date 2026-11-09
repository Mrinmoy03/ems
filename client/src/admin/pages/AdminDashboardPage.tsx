import React, { useState, useMemo } from "react"
import { useNavigate } from "react-router-dom"
import { useAdmin } from "../context/AdminContext"
import { StatCard } from "../../employee/components/StatCard"
import { EmployeeFormDialog } from "../components/EmployeeFormDialog"
import { TaskAssignmentDialog } from "../components/TaskAssignmentDialog"
import { DepartmentDialog } from "../components/DepartmentDialog"
import {
  Users,
  UserPlus,
  UserCheck,
  Clock,
  AlertTriangle,
  Building2,
  Calendar,
  Plus,
  TrendingUp,
  History,
  Coffee,
} from "lucide-react"
import { Button } from "../../components/ui/button"
import { Badge } from "../../components/ui/badge"
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from "recharts"

const STATUS_COLORS = {
  completed: "#10b981", // Emerald
  "in-progress": "#6366f1", // Indigo
  pending: "#f59e0b", // Amber
  overdue: "#ef4444", // Rose
}

export const AdminDashboardPage: React.FC = () => {
  const navigate = useNavigate()
  const { employees, tasks, attendance, kpis, deadlineHistory } = useAdmin()


  const [isAddEmployeeOpen, setIsAddEmployeeOpen] = useState(false)
  const [isAssignTaskOpen, setIsAssignTaskOpen] = useState(false)
  const [isAddDeptOpen, setIsAddDeptOpen] = useState(false)

  // Chart 1: Tasks Distribution
  const taskStatusData = [
    { name: "Completed", value: kpis.tasksCompleted, color: STATUS_COLORS.completed },
    { name: "In Progress", value: kpis.tasksInProgress, color: STATUS_COLORS["in-progress"] },
    {
      name: "Pending",
      value: tasks.filter(t => t.status === "pending").length,
      color: STATUS_COLORS.pending,
    },
    { name: "Overdue", value: kpis.tasksOverdue, color: STATUS_COLORS.overdue },
  ].filter(d => d.value > 0)

  // Total work count across all task lifecycle statuses
  const totalWorkCount = taskStatusData.reduce((sum, item) => sum + item.value, 0)

  // Chart 3: Weekly Attendance Trend (Mon–Sat standard schedule)
  const attendanceTrendData = useMemo(() => {
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
    if (employees.length === 0) {
      return days.map(day => ({ day, present: 0, absent: 0 }))
    }

    const nowDay = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][new Date().getDay()]
    return days.map(day => {
      const dayMatches = attendance.filter((a: any) => {
        const d = new Date(a.date)
        const dayName = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][d.getDay()]
        return dayName === day
      })
      const presentCount = dayMatches.filter(
        (a: any) => a.status === "working" || a.status === "logged-out" || a.status === "on-break" || a.status === "present"
      ).length
      const absentCount = dayMatches.filter((a: any) => a.status === "absent" || a.status === "on-leave").length

      if (dayMatches.length === 0 && day === nowDay) {
        return {
          day,
          present: kpis.presentToday,
          absent: kpis.absentToday,
        }
      }

      return {
        day,
        present: presentCount,
        absent: absentCount,
      }
    })
  }, [employees.length, attendance, kpis.presentToday, kpis.absentToday])

  const attendanceComplianceRate = useMemo(() => {
    if (employees.length === 0) return "0% Compliance"
    const totalPresent = attendanceTrendData.reduce((acc: number, d: { present: number; absent: number }) => acc + d.present, 0)
    // Elapsed Mon-Sat workdays in current week (Mon=1, Tue=2, ..., Sat=6)
    const currentDayIndex = new Date().getDay()
    const elapsedWorkdays = currentDayIndex === 0 ? 6 : Math.min(6, currentDayIndex)
    const totalSlots = employees.length * elapsedWorkdays
    if (totalSlots === 0) return "0% Compliance"
    const pct = Math.min(100, Math.round((totalPresent / totalSlots) * 100))
    return `${pct}% Compliance`
  }, [employees.length, attendanceTrendData])

  // Currently Active Employees (Working or On Break)
  const activeNowEmployees = employees.filter(
    e => e.attendanceToday === "working" || e.attendanceToday === "on-break"
  )

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Banner / Actions Toolbar */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              Operations & Org Overview
            </h1>
            <Badge className="bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300 font-mono text-[10px]">
              ADMIN CONSOLE
            </Badge>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Real-time organizational telemetry, workforce status, and task lifecycle tracking (Mon–Sat 48h schedule).
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsAddDeptOpen(true)}
            className="text-xs h-9"
          >
            <Building2 className="w-3.5 h-3.5 mr-1.5 text-indigo-500" />
            New Dept
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsAssignTaskOpen(true)}
            className="text-xs h-9"
          >
            <Plus className="w-3.5 h-3.5 mr-1.5 text-indigo-500" />
            Assign Task
          </Button>
          <Button
            size="sm"
            onClick={() => setIsAddEmployeeOpen(true)}
            className="text-xs h-9 bg-indigo-600 hover:bg-indigo-700 text-white font-medium"
          >
            <UserPlus className="w-3.5 h-3.5 mr-1.5" />
            Add Employee
          </Button>
        </div>
      </div>

      {/* KPI Stat Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          title="Total Workforce"
          value={kpis.totalEmployees}
          subValue={`${employees.filter(e => e.accountStatus === "active").length} active accounts`}
          icon={Users}
          iconColor="text-indigo-600 dark:text-indigo-400"
          iconBg="bg-indigo-100 dark:bg-indigo-950"
        />

        <StatCard
          title="Clocked In Today"
          value={kpis.presentToday}
          subValue={`${kpis.workingNow} active · ${kpis.onBreakNow} on break`}
          icon={UserCheck}
          iconColor="text-emerald-600 dark:text-emerald-400"
          iconBg="bg-emerald-100 dark:bg-emerald-950"
        />

        <StatCard
          title="Tasks In Progress"
          value={kpis.tasksInProgress}
          subValue={`${kpis.tasksDueToday} due today`}
          icon={Clock}
          iconColor="text-blue-600 dark:text-blue-400"
          iconBg="bg-blue-100 dark:bg-blue-950"
        />

        <StatCard
          title="Overdue Milestones"
          value={kpis.tasksOverdue}
          subValue={kpis.tasksOverdue > 0 ? "Requires deadline audit" : "All deliverables on schedule"}
          icon={AlertTriangle}
          iconColor="text-rose-600 dark:text-rose-400"
          iconBg="bg-rose-100 dark:bg-rose-950"
        />
      </div>

      {/* Analytics & Distribution Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Attendance Trend Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-indigo-500" />
                Workforce Attendance Trend (Mon–Sat)
              </h2>
              <p className="text-xs text-slate-500">
                Weekly check-in compliance across all departments
              </p>
            </div>
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
              {attendanceComplianceRate}
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={attendanceTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(156, 163, 175, 0.2)" />
                <XAxis dataKey="day" tickLine={false} axisLine={false} tick={{ fontSize: 11 }} />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 11 }}
                  domain={[0, Math.max(5, employees.length)]}
                  allowDecimals={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(15, 23, 42, 0.9)",
                    border: "none",
                    borderRadius: "8px",
                    color: "#fff",
                    fontSize: "12px",
                  }}
                />
                <Bar dataKey="present" fill="#6366f1" radius={[4, 4, 0, 0]} name="Present" />
                <Bar dataKey="absent" fill="#ef4444" radius={[4, 4, 0, 0]} name="Absent" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Task Health Breakdown */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-indigo-500" />
              Initiative Status Mix
            </h2>
            <p className="text-xs text-slate-500">
              Distribution of all organizational deliverables
            </p>
          </div>

          <div className="relative h-44 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={taskStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={65}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {taskStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(15, 23, 42, 0.9)",
                    border: "none",
                    borderRadius: "8px",
                    color: "#fff",
                    fontSize: "11px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>

            {/* Centered donut text showing total work (Completed + In Progress + Pending + Overdue) */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 tabular-nums leading-none">
                {totalWorkCount}
              </span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium tracking-tight uppercase mt-1">
                Total Work
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            {taskStatusData.map(item => (
              <div key={item.name} className="flex items-center gap-2 text-xs">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                <span className="text-slate-600 dark:text-slate-400 truncate">{item.name}:</span>
                <span className="font-bold text-slate-900 dark:text-slate-100 ml-auto">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Two Columns: Live Working Staff + Audit Trail */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Workforce Today */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                Live On-Duty Staff ({activeNowEmployees.length})
              </h2>
              <p className="text-xs text-slate-500">
                Team members currently clocked in or on authorized break
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/admin/attendance")}
              className="text-xs text-indigo-600 dark:text-indigo-400 h-8"
            >
              Full Log &rarr;
            </Button>
          </div>

          <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
            {activeNowEmployees.map(emp => (
              <div
                key={emp.id}
                onClick={() => navigate(`/admin/employees/${emp.id}`)}
                className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 flex items-center justify-between hover:bg-indigo-50/50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={emp.avatar}
                    alt={emp.name}
                    className="w-8 h-8 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                  />
                  <div>
                    <p className="text-xs font-bold text-slate-900 dark:text-slate-100">
                      {emp.name}
                    </p>
                    <p className="text-[11px] text-slate-500">
                      {emp.designation} &bull; {emp.department}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  {emp.attendanceToday === "working" ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      In at {emp.checkInToday || "09:00 AM"}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-600 dark:text-amber-400">
                      <Coffee className="w-3 h-3" />
                      On Break
                    </span>
                  )}
                  <p className="text-[10px] text-slate-400">
                    {emp.activeTasksCount} active initiatives
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Deadline Adjustments Audit Trail */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <History className="w-4 h-4 text-amber-500" />
                Recent Deadline Modifications
              </h2>
              <p className="text-xs text-slate-500">
                Audited deadline extensions with documented justification
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/admin/tasks")}
              className="text-xs text-indigo-600 dark:text-indigo-400 h-8"
            >
              All Tasks &rarr;
            </Button>
          </div>

          <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
            {deadlineHistory.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-8">
                No deadline adjustments logged yet.
              </p>
            ) : (
              deadlineHistory.slice(0, 5).map(audit => (
                <div
                  key={audit.id}
                  className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-xs space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 dark:text-slate-100">
                      {audit.taskTitle}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {new Date(audit.changedAt).toLocaleDateString()}
                    </span>
                  </div>

                  <p className="text-slate-600 dark:text-slate-400 text-[11px] italic bg-white dark:bg-slate-900 p-2 rounded border border-slate-100 dark:border-slate-800">
                    &ldquo;{audit.reason}&rdquo;
                  </p>

                  <div className="flex justify-between items-center text-[10px] text-slate-500 pt-1">
                    <span>
                      New target:{" "}
                      <strong className="text-indigo-600 dark:text-indigo-400 font-mono">
                        {new Date(audit.newDeadline).toLocaleDateString()}
                      </strong>
                    </span>
                    <span>Admin: {audit.changedBy}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Dialog Modals */}
      <EmployeeFormDialog
        open={isAddEmployeeOpen}
        onOpenChange={setIsAddEmployeeOpen}
      />

      <TaskAssignmentDialog
        open={isAssignTaskOpen}
        onOpenChange={setIsAssignTaskOpen}
      />

      <DepartmentDialog
        open={isAddDeptOpen}
        onOpenChange={setIsAddDeptOpen}
      />
    </div>
  )
}
