import React from "react"
import { AdminEmployee } from "../types/admin"
import { useAdmin } from "../context/AdminContext"
import { isTaskCompletedLate } from "../../employee/utils/taskStatus"
import { Progress } from "../../components/ui/progress"
import { CheckCircle2, AlertTriangle, Clock, Award, Calendar } from "lucide-react"


interface EmployeePerformanceSummaryProps {
  employee: AdminEmployee
}

export const EmployeePerformanceSummary: React.FC<EmployeePerformanceSummaryProps> = ({
  employee,
}) => {
  const { tasks, attendance } = useAdmin()

  // Get tasks assigned to this employee
  const employeeTasks = tasks.filter(t => t.assignedTo.includes(employee.id))
  const completedTasks = employeeTasks.filter(t => t.status === "completed")
  const lateCompleted = completedTasks.filter(t => isTaskCompletedLate(t))
  const onTimeCompleted = completedTasks.length - lateCompleted.length

  const onTimeRate =
    completedTasks.length > 0 ? Math.round((onTimeCompleted / completedTasks.length) * 100) : 100

  // Calculate total hours worked from attendance records
  const empAttendance = attendance.filter(a => a.employeeId === employee.id)
  const totalHoursWorked = empAttendance.reduce((acc, curr) => acc + curr.netHoursWorked, 0)
  const totalDaysLogged = empAttendance.filter(a => a.netHoursWorked > 0).length
  const avgHoursPerDay = totalDaysLogged > 0 ? (totalHoursWorked / totalDaysLogged).toFixed(1) : "8.0"

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
          Operational Performance & Output Metrics
        </h3>
        <p className="text-xs text-slate-500">
          Execution efficiency, milestone adherence, and Monday–Saturday work delivery summary.
        </p>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* On-Time Adherence */}
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500">Milestone On-Time Rate</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            {onTimeRate}%
          </div>
          <Progress value={onTimeRate} className="h-1.5" />
          <p className="text-[11px] text-slate-500">
            {onTimeCompleted} of {completedTasks.length} tasks completed within deadline
          </p>
        </div>

        {/* Task Velocity */}
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500">Total Completed</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            {completedTasks.length}
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span>{employeeTasks.filter(t => t.status === "in-progress").length} in-progress</span>
            <span>&bull;</span>
            <span>{employeeTasks.filter(t => t.status === "pending").length} pending</span>
          </div>
        </div>

        {/* Total Working Hours */}
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500">Logged Net Time</span>
            <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            {totalHoursWorked.toFixed(1)}h
          </div>
          <p className="text-[11px] text-slate-500">
            Average {avgHoursPerDay}h / day across {totalDaysLogged} working days
          </p>
        </div>

        {/* Deadline Overrun Count */}
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500">Late Deliveries</span>
            <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            {lateCompleted.length}
          </div>
          <p className="text-[11px] text-slate-500">
            {lateCompleted.length === 0
              ? "Zero deadline overruns recorded"
              : "Completed post scheduled deadline"}
          </p>
        </div>
      </div>

      {/* Schedule Policy Compliance */}
      <div className="p-4 rounded-xl bg-indigo-50/60 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">
              WorkTrack 6-Day Operational Baseline: Monday to Saturday
            </h4>
            <p className="text-[11px] text-slate-600 dark:text-slate-400">
              Expected commitment: 8.0 hours/day &bull; 48.0 hours/week standard. Sundays designated as non-working rest day.
            </p>
          </div>
        </div>
        <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 shadow-sm shrink-0">
          Compliant
        </span>
      </div>
    </div>
  )
}
