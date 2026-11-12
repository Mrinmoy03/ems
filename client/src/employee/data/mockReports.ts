import { MonthData, MonthlyReport, RecentActivityItem } from "../types/report"

export const initialWeeklyHoursData = [
  { day: "Mon", hours: 0, target: 8.0 },
  { day: "Tue", hours: 0, target: 8.0 },
  { day: "Wed", hours: 0, target: 8.0 },
  { day: "Thu", hours: 0, target: 8.0 },
  { day: "Fri", hours: 0, target: 8.0 },
  { day: "Sat", hours: 0, target: 8.0 },
]

export const initialMonthlyTrendData: { month: string; completionRate: number; tasks: number; avgHours: number }[] = []

export const initialRecentActivities: RecentActivityItem[] = []

// ==========================================
// MULTI-YEAR & MULTI-MONTH PERFORMANCE & EOD DATA
// ==========================================

export interface MonthOption {
  key: string
  label: string
  monthName: string
  year: number
  tasksCompleted?: number
  daysPresent?: number
}

const currentYear = new Date().getFullYear()
const currentMonthNum = new Date().getMonth() + 1
const currentMonthStr = String(currentMonthNum).padStart(2, "0")
const currentMonthName = new Date().toLocaleString("en-US", { month: "long" })
const currentMonthKey = `${currentYear}-${currentMonthStr}`

export const availableMonths: MonthOption[] = [
  {
    key: currentMonthKey,
    label: `${currentMonthName} ${currentYear} (Current)`,
    monthName: currentMonthName,
    year: currentYear,
    tasksCompleted: 1,
    daysPresent: 2,
  },
]

export const getAvailableYears = (yr: number = new Date().getFullYear()): number[] => {
  const years = new Set<number>()
  years.add(yr)
  availableMonths.forEach(m => {
    if (m.year <= yr) {
      years.add(m.year)
    }
  })
  return Array.from(years).sort((a, b) => b - a)
}

export const getMonthsForYear = (year: number): MonthOption[] => {
  return availableMonths.filter(m => m.year === year)
}

export const getYearAndMonthFromKey = (monthKey: string): { year: number; monthKey: string } => {
  const found = availableMonths.find(m => m.key === monthKey)
  if (found) {
    return { year: found.year, monthKey }
  }
  const parts = monthKey.split("-")
  const parsedYear = parseInt(parts[0], 10) || new Date().getFullYear()
  return { year: parsedYear, monthKey }
}

export const getLatestMonthForYear = (year: number): string => {
  const months = getMonthsForYear(year)
  return months[0]?.key || `${year}-12`
}

export const getCurrentMonthKey = (): string => {
  return currentMonthKey
}

export const mockMonthsData: Record<string, MonthData> = {
  [currentMonthKey]: {
    monthKey: currentMonthKey,
    monthName: currentMonthName,
    year: currentYear,
    summary: {
      month: currentMonthName,
      year: currentYear,
      workingDays: 26,
      daysPresent: 2,
      totalHoursWorked: 6.7,
      tasksCompleted: 1,
      completionRate: 100,
      averageCompletionHours: 4.5,
    },
    workingDays: [
      {
        date: "Nov 12, 2026",
        dayOfWeek: "Thursday",
        hoursLogged: 2.2,
        hoursFormatted: "2h 15m",
        checkIn: "11:53 AM",
        checkOut: "Active Session",
        status: "present",
        tasksCompletedCount: 0,
        completedTasks: [],
        summary: "Live shift session in progress.",
      },
      {
        date: "Nov 9, 2026",
        dayOfWeek: "Monday",
        hoursLogged: 4.5,
        hoursFormatted: "4h 29m",
        checkIn: "02:35 PM",
        checkOut: "07:04 PM",
        status: "present",
        tasksCompletedCount: 1,
        completedTasks: [
          { id: "tsk-mw9397qj-dgypt", title: "Build Landing Page", category: "Web Development" }
        ],
        summary: "Shift concluded. Delivered 1 deliverable(s): Build Landing Page. Logged 4.49h shift duration.",
      },
    ],
    eodReports: [
      {
        id: "eod-mw91cgky-4wrp1",
        date: "2026-11-09",
        dayOfWeek: "Monday",
        hoursLogged: "4h 29m",
        hoursWorked: 4.49,
        tasksCompleted: 1,
        tasksPending: 0,
        completedTasks: [
          { id: "tsk-mw9397qj-dgypt", title: "Build Landing Page", category: "Web Development" }
        ],
        summary: "Shift concluded. Delivered 1 deliverable(s): Build Landing Page. Logged 4.49h shift duration.",
        submittedAt: "2026-11-09T19:04:20Z",
      },
    ],
  },
}

export const getMonthData = (monthKey?: string): MonthData => {
  const key = monthKey || getCurrentMonthKey()
  if (mockMonthsData[key]) {
    return mockMonthsData[key]
  }
  const [yrStr, moStr] = key.split("-")
  const yr = parseInt(yrStr, 10) || new Date().getFullYear()
  const moNum = parseInt(moStr, 10) || (new Date().getMonth() + 1)
  const monthName = new Date(yr, moNum - 1, 1).toLocaleString("en-US", { month: "long" })
  return {
    monthKey: key,
    monthName,
    year: yr,
    summary: {
      month: monthName,
      year: yr,
      workingDays: 26,
      daysPresent: 0,
      totalHoursWorked: 0,
      tasksCompleted: 0,
      completionRate: 100,
      averageCompletionHours: 0,
    },
    workingDays: [],
    eodReports: [],
  }
}

export const initialMonthlySummary: MonthlyReport = getMonthData().summary
