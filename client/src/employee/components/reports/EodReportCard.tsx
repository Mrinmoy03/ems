import React from "react"
import {
  Calendar,
  Clock,
  CheckCircle2,
  ArrowRightCircle,
  AlertTriangle,
  Coffee,
  CheckCheck,
  ChevronDown,
  ChevronUp,
  Download,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { DailyEodReport } from "../../types/report"
import { WorkSessionState } from "../../types/timer"
import { calculateNetShiftHours } from "../../utils/timeCalculations"
import { ShiftAttendanceGrid } from "./ShiftAttendanceGrid"
import { EodDeliverableItem } from "./EodDeliverableItem"
import { EodCarriedTaskItem } from "./EodCarriedTaskItem"
import { isFormattedDateToday } from "../../utils/date"
import { cn } from "@/lib/utils"

interface EodReportCardProps {
  report: DailyEodReport
  isExpanded: boolean
  onToggle: () => void
  onDownload: (date: string) => void
  timerSessionState?: WorkSessionState
}

/**
 * Collapsible End-of-Day (EOD) Shift Report Card.
 * Supports compact collapsed summary mode and full expanded audit view.
 */
export const EodReportCard: React.FC<EodReportCardProps> = ({
  report,
  isExpanded,
  onToggle,
  onDownload,
  timerSessionState,
}) => {
  const isToday = isFormattedDateToday(report.date)
  const isLiveSession = isToday && (
    timerSessionState === "working" ||
    timerSessionState === "on-break" ||
    report.checkOut?.includes("Live")
  )

  const timing = calculateNetShiftHours(
    report.checkIn,
    report.checkOut,
    report.breakDuration,
    report.hoursWorked || report.hoursLogged
  )

  const displayLoggedHours = isLiveSession
    ? report.hoursLogged
    : timing.netHoursFormatted

  const completedLateCount = report.tasksCompletedLate ?? report.completedTasks.filter(t => t.isCompletedLate).length

  return (
    <div
      className={cn(
        "rounded-xl border transition-all text-xs overflow-hidden shadow-2xs",
        isExpanded
          ? "p-4 border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/60"
          : "p-3 sm:p-3.5 border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900 hover:bg-slate-50/80 dark:hover:bg-slate-800/50"
      )}
    >
      {/* Card Header Strip: Date, Badges (Left) + Actions (Right) */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        {/* Clickable Header Area */}
        <div
          onClick={onToggle}
          className="flex flex-wrap items-center gap-2 cursor-pointer select-none flex-1 min-w-0"
        >
          <span className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5 text-xs sm:text-sm">
            <Calendar className="h-3.5 w-3.5 text-slate-400" />
            {report.date}
            {report.dayOfWeek && (
              <span className="text-xs font-normal text-slate-400">({report.dayOfWeek})</span>
            )}
          </span>

          {/* Live Shift Status Tag for Today's Active Shift */}
          {isToday && (
            <>
              {timerSessionState === "working" && (
                <span className="bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800 flex items-center gap-1.5 animate-pulse">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping" />
                  Live Shift Session
                </span>
              )}
              {timerSessionState === "on-break" && (
                <span className="bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 text-[10px] font-semibold px-2.5 py-0.5 rounded-full border border-amber-200 dark:border-amber-800 flex items-center gap-1">
                  <Coffee className="h-3 w-3 text-amber-500" />
                  On Lunch Break
                </span>
              )}
              {timerSessionState === "logged-out" && (
                <span className="bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 text-[10px] font-semibold px-2.5 py-0.5 rounded-full border border-blue-200 dark:border-blue-800 flex items-center gap-1 shadow-2xs">
                  <CheckCheck className="h-3 w-3 text-blue-500" />
                  Shift Ended & Submitted
                </span>
              )}
            </>
          )}

          <span className="bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-blue-200 dark:border-blue-800 flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {displayLoggedHours}
          </span>

          <span className="bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-[10px] font-semibold px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3" />
            {report.tasksCompleted} Completed
          </span>

          {/* In-Progress / Carried-forward badge */}
          {report.inProgressTasks && report.inProgressTasks.length > 0 && (
            <span className="bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 text-[10px] font-semibold px-2 py-0.5 rounded-full border border-amber-200 dark:border-amber-800 flex items-center gap-1">
              <ArrowRightCircle className="h-3 w-3 text-amber-500" />
              {report.inProgressTasks.length} In Progress / Carried
            </span>
          )}

          {/* Indicator for tasks completed late */}
          {completedLateCount > 0 && (
            <span className="bg-amber-50 dark:bg-amber-950/80 text-amber-700 dark:text-amber-400 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-amber-300 dark:border-amber-800 flex items-center gap-1 shadow-2xs">
              <AlertTriangle className="h-3 w-3 text-amber-500" />
              {completedLateCount} Completed Late
            </span>
          )}

          {(!report.inProgressTasks || report.inProgressTasks.length === 0) && report.tasksPending > 0 && (
            <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[10px] font-medium px-2 py-0.5 rounded-full">
              {report.tasksPending} Pending
            </span>
          )}

          {/* In collapsed state: compact punch in/out pill */}
          {!isExpanded && (
            <span className="text-[10px] text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded font-mono hidden md:inline-flex items-center gap-1 ml-auto lg:ml-0">
              <span>{report.checkIn || "08:45 AM"}</span>
              <span>→</span>
              <span>{report.checkOut || "06:00 PM"}</span>
              <span className="text-slate-400">({timing.breakFormatted} break)</span>
            </span>
          )}
        </div>

        {/* Actions: Expand/Collapse Button & Download Action */}
        <div className="flex items-center gap-2 shrink-0 self-end lg:self-center">
          <Button
            variant="outline"
            size="sm"
            onClick={onToggle}
            className="h-7 px-2.5 text-xs border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 gap-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 shadow-2xs font-medium"
            title={isExpanded ? "Collapse shift card" : "Expand shift card"}
          >
            {isExpanded ? (
              <>
                <ChevronUp className="h-3.5 w-3.5 text-slate-400" />
                <span>Collapse</span>
              </>
            ) : (
              <>
                <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
                <span>Expand</span>
              </>
            )}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => onDownload(report.date)}
            className="h-7 px-2.5 text-xs border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 gap-1 shadow-2xs"
          >
            <Download className="h-3 w-3" />
            PDF
          </Button>
        </div>
      </div>

      {/* Collapsible Card Body */}
      {isExpanded && (
        <div className="space-y-3 mt-3 pt-3 border-t border-slate-200/60 dark:border-slate-700/60 animate-in fade-in-50 duration-200">
          {/* Shift Punch Times & Total Hours Worked Card */}
          <ShiftAttendanceGrid
            checkIn={report.checkIn}
            checkOut={report.checkOut}
            breakDuration={report.breakDuration}
            fallbackLoggedHours={report.hoursWorked || report.hoursLogged}
            isLiveSession={isLiveSession}
          />

          {/* Summary Notes */}
          <p className="text-slate-600 dark:text-slate-300 text-xs leading-relaxed">
            {report.summary}
          </p>

          {/* Section 1: Completed Tasks Detailed Section for this day */}
          {report.completedTasks && report.completedTasks.length > 0 && (
            <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700/60">
              <div className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                  <span>Completed Deliverables ({report.completedTasks.length}):</span>
                </div>
                {completedLateCount > 0 && (
                  <span className="text-[10px] text-amber-600 dark:text-amber-400 font-medium">
                    Includes late deliverable audit notes
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {report.completedTasks.map(task => (
                  <EodDeliverableItem key={task.id} task={task} />
                ))}
              </div>
            </div>
          )}

          {/* Section 2: In-Progress / Carried-Forward Tasks Detailed Section for this day */}
          {report.inProgressTasks && report.inProgressTasks.length > 0 && (
            <div className="pt-2.5 border-t border-slate-200/60 dark:border-slate-700/60">
              <div className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5">
                  <ArrowRightCircle className="h-3.5 w-3.5 text-blue-500" />
                  <span>In Progress / Carried Forward ({report.inProgressTasks.length}):</span>
                </div>
                <span className="text-[10px] text-blue-600 dark:text-blue-400 font-medium">
                  Active assignments continuing into next shift
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {report.inProgressTasks.map(task => (
                  <EodCarriedTaskItem key={task.id} task={task} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
