import React, { useMemo } from "react"
import { Calendar, Clock } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  getAvailableYears,
  getMonthsForYear,
  getYearAndMonthFromKey,
  getLatestMonthForYear,
  getMonthData,
  MonthOption,
} from "../data/mockReports"
import { cn } from "@/lib/utils"

export interface YearMonthPickerProps {
  selectedMonthKey: string
  onMonthChange: (monthKey: string) => void
  allowWeekly?: boolean
  isWeeklySelected?: boolean
  onSelectWeekly?: () => void
  weeklyCount?: number
  variant?: "standard" | "compact"
  className?: string
  showBadges?: boolean
}

export const YearMonthPicker: React.FC<YearMonthPickerProps> = ({
  selectedMonthKey,
  onMonthChange,
  allowWeekly = false,
  isWeeklySelected = false,
  onSelectWeekly,
  weeklyCount = 5,
  variant = "standard",
  className,
  showBadges = true,
}) => {
  const availableYears = useMemo(() => getAvailableYears(), [])

  // Current selected year derived from key
  const { year: currentYear } = useMemo(
    () => getYearAndMonthFromKey(selectedMonthKey),
    [selectedMonthKey]
  )

  // Months available specifically for the active year
  const monthsInSelectedYear = useMemo(
    () => getMonthsForYear(currentYear),
    [currentYear]
  )

  // Handle year selection
  const handleYearChange = (newYearStr: string) => {
    const newYear = parseInt(newYearStr, 10)
    if (isNaN(newYear)) return

    if (newYear === currentYear) return

    // Find the latest available month for this chosen year
    const targetMonthKey = getLatestMonthForYear(newYear)
    onMonthChange(targetMonthKey)
  }

  // Handle month selection
  const handleMonthChange = (newMonthKey: string) => {
    if (newMonthKey) {
      onMonthChange(newMonthKey)
    }
  }

  const isCompact = variant === "compact"
  // Consistent fixed height and padding so all boxes match size perfectly
  const triggerStyle = isCompact
    ? "h-[40px] py-1 px-3 text-xs rounded-lg"
    : "h-[46px] py-1.5 px-3.5 text-xs rounded-lg"

  return (
    <div className={cn("inline-flex items-center gap-2 flex-wrap", className)}>
      {/* Optional Weekly toggle button (Used in Timesheet / Attendance) */}
      {allowWeekly && (
        <button
          type="button"
          onClick={() => onSelectWeekly?.()}
          className={cn(
            "font-medium transition-all flex items-center justify-between gap-2.5 border shadow-2xs box-border",
            triggerStyle,
            isWeeklySelected
              ? "bg-blue-600 text-white border-blue-600 shadow-xs font-semibold"
              : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800"
          )}
        >
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 shrink-0 text-blue-500" />
            <div className="flex flex-col text-left">
              <span className="text-xs font-semibold leading-tight">Weekly</span>
              <span className={cn("text-[10px] leading-tight", isWeeklySelected ? "text-blue-100" : "text-slate-400")}>
                Active Week
              </span>
            </div>
          </div>
          {showBadges && (
            <span
              className={cn(
                "text-[10px] px-2 py-0.5 rounded-full font-mono shrink-0 ml-1",
                isWeeklySelected
                  ? "bg-blue-700 text-blue-100"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
              )}
            >
              {weeklyCount}
            </span>
          )}
        </button>
      )}

      {/* Year Selector Dropdown */}
      <div className="relative">
        <Select
          value={currentYear.toString()}
          onValueChange={handleYearChange}
        >
          <SelectTrigger
            className={cn(
              "font-medium border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 gap-2.5 w-auto min-w-[130px] shadow-2xs hover:border-slate-300 dark:hover:border-slate-700 transition-colors box-border",
              triggerStyle,
              !isWeeklySelected && "border-blue-200/80 dark:border-blue-900/60"
            )}
          >
            <Calendar className="h-4 w-4 text-blue-600 dark:text-blue-400 shrink-0" />
            <SelectValue placeholder="Year" />
          </SelectTrigger>
          <SelectContent
            align="end"
            className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 min-w-[160px] z-50 shadow-lg p-1.5"
          >
            <div className="px-2.5 py-1.5 text-[10px] font-semibold tracking-wider uppercase text-slate-400 dark:text-slate-500">
              Select Year
            </div>
            {availableYears.map(yr => {
              const isCurrentCalendarYear = yr === new Date().getFullYear()
              return (
                <SelectItem
                  key={yr}
                  value={yr.toString()}
                  className="text-xs cursor-pointer focus:bg-slate-100 dark:focus:bg-slate-800 text-slate-700 dark:text-slate-200 py-1.5 px-2.5 rounded-md my-0.5"
                >
                  <div className="flex flex-col text-left py-0.5">
                    <span className="font-semibold text-slate-900 dark:text-slate-100">
                      {yr}
                    </span>
                    <span className="text-[10px] text-slate-400 mt-0.5">
                      {isCurrentCalendarYear ? "Current Year" : "Historical Year"}
                    </span>
                  </div>
                </SelectItem>
              )
            })}
          </SelectContent>
        </Select>
      </div>

      {/* Month Selector Dropdown (Populated based on chosen Year) */}
      <div className="relative">
        <Select
          value={selectedMonthKey}
          onValueChange={handleMonthChange}
        >
          <SelectTrigger
            className={cn(
              "font-medium border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 gap-3 w-auto min-w-[190px] shadow-2xs hover:border-slate-300 dark:hover:border-slate-700 transition-colors box-border",
              triggerStyle,
              !isWeeklySelected && "border-blue-200/80 dark:border-blue-900/60"
            )}
          >
            <SelectValue placeholder="Select Month" />
          </SelectTrigger>
          <SelectContent
            align="end"
            className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 min-w-[230px] z-50 shadow-lg p-1.5"
          >
            <div className="px-2.5 py-1.5 text-[10px] font-semibold tracking-wider uppercase text-slate-400 dark:text-slate-500">
              Months in {currentYear}
            </div>
            {monthsInSelectedYear.map((m: MonthOption) => {
              const monthData = getMonthData(m.key)
              const taskCount = monthData?.summary?.tasksCompleted ?? m.tasksCompleted ?? 0
              const daysCount = monthData?.summary?.daysPresent ?? m.daysPresent ?? 0

              return (
                <SelectItem
                  key={m.key}
                  value={m.key}
                  className="text-xs cursor-pointer focus:bg-slate-100 dark:focus:bg-slate-800 text-slate-700 dark:text-slate-200 py-1.5 px-2.5 rounded-md my-0.5"
                >
                  <div className="flex items-center justify-between w-full gap-3.5 py-0.5">
                    <div className="flex flex-col text-left">
                      <span className="font-semibold text-slate-900 dark:text-slate-100">
                        {m.monthName}
                      </span>
                      <span className="text-[10px] text-slate-400 mt-0.5">
                        {daysCount} working days
                      </span>
                    </div>
                    {showBadges && (
                      <span className="text-[10px] bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-semibold px-2 py-0.5 rounded-full font-mono shrink-0 border border-blue-200/50 dark:border-blue-800/50">
                        {taskCount} tasks
                      </span>
                    )}
                  </div>
                </SelectItem>
              )
            })}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
