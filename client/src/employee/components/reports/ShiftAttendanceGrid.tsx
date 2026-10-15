import React from "react"
import { LogIn, LogOut, Clock, Coffee } from "lucide-react"
import { calculateNetShiftHours } from "../../utils/timeCalculations"
import { cn } from "@/lib/utils"

interface ShiftAttendanceGridProps {
  checkIn?: string
  checkOut?: string
  breakDuration?: string
  fallbackLoggedHours?: string | number
  isLiveSession?: boolean
}

/**
 * 4-metric grid displaying Shift Attendance:
 * Log In Time, Log Out Time, Net Total Hours Worked (with gross − break formula breakdown),
 * and Break Duration (marked as paused/deducted).
 */
export const ShiftAttendanceGrid: React.FC<ShiftAttendanceGridProps> = ({
  checkIn,
  checkOut,
  breakDuration,
  fallbackLoggedHours,
  isLiveSession = false,
}) => {
  const timing = calculateNetShiftHours(
    checkIn,
    checkOut,
    breakDuration,
    fallbackLoggedHours
  )

  const displayHours = isLiveSession && typeof fallbackLoggedHours === "string"
    ? fallbackLoggedHours
    : timing.netHoursFormatted

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 py-2 px-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-xs shadow-2xs">
      {/* Log In */}
      <div className="flex items-center gap-2">
        <div className="p-1.5 rounded-md bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 shrink-0">
          <LogIn className="h-3.5 w-3.5" />
        </div>
        <div>
          <span className="text-[10px] text-slate-400 dark:text-slate-500 block uppercase font-medium">Log In Time</span>
          <span className="font-bold text-slate-800 dark:text-slate-200 font-mono text-[11px] block">
            {checkIn || "08:45 AM"}
          </span>
          <span className="text-[9px] text-slate-400 dark:text-slate-500 block font-sans">
            Shift Punch-in
          </span>
        </div>
      </div>

      {/* Log Out */}
      <div className="flex items-center gap-2">
        <div className="p-1.5 rounded-md bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 shrink-0">
          <LogOut className="h-3.5 w-3.5" />
        </div>
        <div>
          <span className="text-[10px] text-slate-400 dark:text-slate-500 block uppercase font-medium">Log Out Time</span>
          <span className={cn(
            "font-bold font-mono text-[11px] block",
            isLiveSession ? "text-emerald-600 dark:text-emerald-400" : "text-slate-800 dark:text-slate-200"
          )}>
            {checkOut || "06:00 PM"}
          </span>
          <span className="text-[9px] text-slate-400 dark:text-slate-500 block font-sans">
            {isLiveSession ? "Active shift" : "Shift Punch-out"}
          </span>
        </div>
      </div>

      {/* Total Hours Worked (Net Worked Hours after deducting lunch break) */}
      <div className="flex items-center gap-2">
        <div className="p-1.5 rounded-md bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 shrink-0">
          <Clock className="h-3.5 w-3.5" />
        </div>
        <div>
          <span className="text-[10px] text-slate-400 dark:text-slate-500 block uppercase font-medium">Total Hours Worked</span>
          <span className="font-bold text-emerald-700 dark:text-emerald-300 font-mono text-[11px] block">
            {displayHours}
          </span>
          <span
            className="text-[9px] text-emerald-600/90 dark:text-emerald-400/90 block font-medium"
            title={timing.formulaExplanation}
          >
            {isLiveSession
              ? "Timer active (pauses on break)"
              : `${timing.grossFormatted} gross − ${timing.breakFormatted} break`}
          </span>
        </div>
      </div>

      {/* Break Duration */}
      <div className="flex items-center gap-2">
        <div className="p-1.5 rounded-md bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400 shrink-0">
          <Coffee className="h-3.5 w-3.5" />
        </div>
        <div>
          <span className="text-[10px] text-slate-400 dark:text-slate-500 block uppercase font-medium">Break Duration</span>
          <span className="font-bold text-amber-700 dark:text-amber-300 font-mono text-[11px] block">
            {timing.breakFormatted}
          </span>
          <span className="text-[9px] text-amber-600/90 dark:text-amber-400/90 block font-medium">
            Timer paused (deducted)
          </span>
        </div>
      </div>
    </div>
  )
}
