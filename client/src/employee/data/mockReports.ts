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
    tasksCompleted: 0,
    daysPresent: 0,
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
      daysPresent: 0,
      totalHoursWorked: 0,
      tasksCompleted: 0,
      completionRate: 100,
      averageCompletionHours: 0,
    },
    workingDays: [],
    eodReports: [],
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
