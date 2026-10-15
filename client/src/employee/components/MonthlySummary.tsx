import React, { useState } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { getCurrentMonthKey, getMonthData } from "../data/mockReports"
import { YearMonthPicker } from "./YearMonthPicker"
import {
  CalendarRange,
  Briefcase,
  Clock,
  CheckCircle2,
  Timer,
  ExternalLink,
} from "lucide-react"
import { WorkingDaysModal } from "./WorkingDaysModal"
import { useEmployee } from "../context/EmployeeContext"

export interface MonthlySummaryProps {
  monthKey?: string
  onMonthChange?: (key: string) => void
}

export const MonthlySummary: React.FC<MonthlySummaryProps> = ({
  monthKey,
  onMonthChange,
}) => {
  const { tasks, timer } = useEmployee()
  const [internalMonthKey, setInternalMonthKey] = useState(() => getCurrentMonthKey())
  const [isWorkingDaysModalOpen, setIsWorkingDaysModalOpen] = useState(false)

  const activeMonthKey = monthKey || internalMonthKey
  const handleSelectMonth = (key: string) => {
    if (onMonthChange) {
      onMonthChange(key)
    } else {
      setInternalMonthKey(key)
    }
  }

  const monthData = getMonthData(activeMonthKey)
  const summary = monthData.summary

  // If active period is current month, dynamically incorporate live completed tasks and timer hours
  const isCurrentActiveMonth = activeMonthKey === getCurrentMonthKey()
  const liveCompletedCount = tasks.filter(t => t.progress === 100 || t.status === "completed").length
  const dynamicTasksCompleted = isCurrentActiveMonth ? summary.tasksCompleted + liveCompletedCount : summary.tasksCompleted
  const todayHours = Number((timer.elapsedSeconds / 3600).toFixed(1))
  const dynamicTotalHours = isCurrentActiveMonth ? (summary.totalHoursWorked + todayHours).toFixed(1) : `${summary.totalHoursWorked}`

  const metrics = [
    {
      title: "Working Days",
      value: `${summary.daysPresent}/${summary.workingDays}`,
      sub: "Present vs Total Scheduled",
      icon: Briefcase,
      color: "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950",
      clickable: true,
      hint: "Click to view all days",
    },
    {
      title: "Hours Logged",
      value: `${dynamicTotalHours}h`,
      sub: isCurrentActiveMonth ? "Monthly Work Hours (Live)" : "Monthly Work Hours",
      icon: Clock,
      color: "text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950",
      clickable: false,
    },
    {
      title: "Tasks Completed",
      value: dynamicTasksCompleted,
      sub: `${summary.completionRate}% completion rate`,
      icon: CheckCircle2,
      color: "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950",
      clickable: false,
    },
    {
      title: "Avg Completion Time",
      value: `${summary.averageCompletionHours}h`,
      sub: "Per Completed Assignment",
      icon: Timer,
      color: "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950",
      clickable: false,
    },
  ]

  return (
    <>
      <Card className="border-slate-200/90 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900">
        <CardHeader className="p-4 pb-2 border-b border-slate-100 dark:border-slate-800 flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 rounded-lg">
              <CalendarRange className="h-4 w-4" />
            </div>
            <CardTitle className="text-sm font-semibold text-slate-800 dark:text-slate-100">
              Monthly Performance Summary ({summary.month} {summary.year})
            </CardTitle>
          </div>

          <div className="flex items-center gap-2">
            {/* Year & Month Picker */}
            <YearMonthPicker
              selectedMonthKey={activeMonthKey}
              onMonthChange={handleSelectMonth}
              variant="compact"
            />

            <span className="text-[11px] text-slate-400 hidden sm:inline">Auto-compiled</span>
          </div>
        </CardHeader>

        <CardContent className="p-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {metrics.map(m => {
              const Icon = m.icon
              const isClickable = Boolean(m.clickable)

              return (
                <div
                  key={m.title}
                  onClick={() => {
                    if (isClickable) setIsWorkingDaysModalOpen(true)
                  }}
                  className={`p-3.5 rounded-xl border relative transition-all ${
                    isClickable
                      ? "cursor-pointer border-blue-200/80 dark:border-blue-900/60 bg-blue-50/20 dark:bg-blue-950/20 hover:border-blue-400 dark:hover:border-blue-600 hover:shadow-md hover:bg-blue-50/40 dark:hover:bg-blue-950/40 active:scale-[0.99] group"
                      : "border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/60 hover:bg-slate-50 dark:hover:bg-slate-800/80"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg shrink-0 ${m.color}`}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                            {m.title}
                          </p>
                        </div>
                        <p className="text-xl font-bold text-slate-900 dark:text-slate-100 tabular-nums mt-0.5">
                          {m.value}
                        </p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{m.sub}</p>
                      </div>
                    </div>

                    {isClickable && (
                      <span className="text-blue-600 dark:text-blue-400 opacity-60 group-hover:opacity-100 transition-opacity">
                        <ExternalLink className="h-3.5 w-3.5" />
                      </span>
                    )}
                  </div>

                  {isClickable && (
                    <div className="mt-2 pt-1.5 border-t border-blue-100 dark:border-blue-900/40 flex items-center justify-between text-[10px] text-blue-600 dark:text-blue-400 font-medium">
                      <span>{m.hint}</span>
                      <span className="font-semibold underline underline-offset-2">View &rarr;</span>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Interactive Working Days Modal */}
      <WorkingDaysModal
        isOpen={isWorkingDaysModalOpen}
        onClose={() => setIsWorkingDaysModalOpen(false)}
        initialMonthKey={activeMonthKey}
      />
    </>
  )
}
