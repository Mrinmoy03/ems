import React, { useRef, useState, useEffect } from "react"
import { useEmployee } from "../context/EmployeeContext"
import { formatDurationToHuman } from "../utils/formatDuration"
import { StatCard } from "../components/StatCard"
import { WorkingTimer } from "../components/WorkingTimer"
import { TaskTable } from "../components/TaskTable"
import { ScheduleTimeline } from "../components/ScheduleTimeline"
import { TaskOverviewChart } from "../components/charts/TaskOverviewChart"
import { HoursWorkedChart } from "../components/charts/HoursWorkedChart"
import { PerformanceChart } from "../components/charts/PerformanceChart"
import { RecentActivity } from "../components/RecentActivity"
import { LeaveRequestSummary } from "../components/LeaveRequestSummary"
import { MonthlySummary } from "../components/MonthlySummary"
import {
  Clock,
  CheckCircle2,
  ListTodo,
  AlertOctagon,
  Timer,
} from "lucide-react"

export const DashboardPage: React.FC = () => {
  const { taskCounts, timer } = useEmployee()
  const rightColumnRef = useRef<HTMLDivElement>(null)
  const [rightHeight, setRightHeight] = useState<number | undefined>(undefined)

  useEffect(() => {
    const el = rightColumnRef.current
    if (!el) return

    const updateHeight = () => {
      if (window.innerWidth >= 1024) {
        setRightHeight(el.offsetHeight)
      } else {
        setRightHeight(undefined)
      }
    }

    updateHeight()

    const observer = new ResizeObserver(() => {
      updateHeight()
    })
    observer.observe(el)
    window.addEventListener("resize", updateHeight)

    return () => {
      observer.disconnect()
      window.removeEventListener("resize", updateHeight)
    }
  }, [])

  return (
    <div className="space-y-6 pb-8">
      {/* 1. Statistics Cards Row */}
      <section aria-label="Key Performance Statistics">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5 sm:gap-4">
          <StatCard
            title="Hours Worked"
            value={formatDurationToHuman(timer.elapsedSeconds)}
            subValue="Today's active session"
            icon={Clock}
            iconColor="text-blue-600"
            iconBg="bg-blue-50"
            accentColor="bg-blue-100 text-blue-800"
            badgeText={timer.sessionState === "working" ? "Live" : timer.sessionState === "on-break" ? "Paused" : "Shift End"}
          />
          <StatCard
            title="Total Tasks"
            value={taskCounts.all}
            subValue="Today's workload"
            icon={ListTodo}
            iconColor="text-slate-700"
            iconBg="bg-slate-100"
          />
          <StatCard
            title="Completed"
            value={taskCounts.completed}
            subValue={`${taskCounts.all > 0 ? Math.round((taskCounts.completed / taskCounts.all) * 100) : 0}% of assignments`}
            icon={CheckCircle2}
            iconColor="text-emerald-600"
            iconBg="bg-emerald-50"
            accentColor="bg-emerald-100 text-emerald-800"
            badgeText="Success"
          />
          <StatCard
            title="In Progress"
            value={taskCounts.inProgress}
            subValue="Active assignments"
            icon={Timer}
            iconColor="text-amber-600"
            iconBg="bg-amber-50"
            accentColor="bg-amber-100 text-amber-800"
            badgeText="In flight"
          />
          <StatCard
            title="Overdue"
            value={taskCounts.overdue}
            subValue={taskCounts.overdue > 0 ? "Requires attention" : "All on schedule"}
            icon={AlertOctagon}
            iconColor="text-red-600"
            iconBg="bg-red-50"
            accentColor={taskCounts.overdue > 0 ? "bg-red-100 text-red-800" : "bg-slate-100 text-slate-600"}
            badgeText={taskCounts.overdue > 0 ? "Action needed" : "Clean"}
          />
        </div>
      </section>

      {/* 2. Main Dashboard Section: Task Table & Right Side Controls */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Dominant Left: Task Table (8 columns) - Height strictly matched to right 2 boxes */}
        <div
          className="lg:col-span-8 flex flex-col min-h-0"
          style={rightHeight ? { height: `${rightHeight}px` } : undefined}
        >
          <TaskTable className="h-full" />
        </div>

        {/* Right Panel: Working Timer & Today's Schedule (4 columns) */}
        <div ref={rightColumnRef} className="lg:col-span-4 flex flex-col gap-6">
          <WorkingTimer />
          <ScheduleTimeline />
        </div>
      </section>

      {/* 3. Analytics Charts Section (3 Columns) */}
      <section aria-label="Analytics & Productivity Trends" className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            Performance & Time Analytics
          </h2>
          <span className="text-xs text-slate-500 dark:text-slate-400">Live derived metrics</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <TaskOverviewChart />
          <HoursWorkedChart />
          <PerformanceChart />
        </div>
      </section>

      {/* 4. Activity & Leave Summary (2 Columns) */}
      <section aria-label="Operations and Activity Feed" className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <LeaveRequestSummary />
        <RecentActivity />
      </section>

      {/* 5. Monthly Summary Banner */}
      <section aria-label="Monthly Aggregated Summary">
        <MonthlySummary />
      </section>
    </div>
  )
}
