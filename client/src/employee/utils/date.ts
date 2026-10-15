import { format, formatDistanceToNow, isToday, parseISO } from "date-fns"

export function getGreeting(date = new Date()): string {
  const hour = date.getHours()
  if (hour < 12) {
    return "Good morning"
  } else if (hour < 17) {
    return "Good afternoon"
  } else {
    return "Good evening"
  }
}

export function formatDashboardDate(date = new Date()): string {
  return format(date, "EEEE, MMMM d, yyyy")
}

export function formatDeadline(isoString: string): string {
  try {
    const d = parseISO(isoString)
    if (isToday(d)) {
      return `Today, ${format(d, "h:mm a")}`
    }
    return format(d, "MMM d, h:mm a")
  } catch {
    return isoString
  }
}

export function formatRelativeTime(isoString: string): string {
  try {
    const d = parseISO(isoString)
    return formatDistanceToNow(d, { addSuffix: true })
  } catch {
    return isoString
  }
}

/**
 * Formats a date into standard display format e.g. "Oct 15, 2026"
 */
export function formatStandardDate(date: Date = new Date()): string {
  return format(date, "MMM dd, yyyy")
}

/**
 * Returns month key for a date e.g. "2026-10"
 */
export function getMonthKey(date: Date = new Date()): string {
  return format(date, "yyyy-MM")
}

/**
 * Checks whether a formatted date string like "Oct 15, 2026" matches today's date
 */
export function isFormattedDateToday(dateStr?: string): boolean {
  if (!dateStr) return false
  const todayStr = formatStandardDate(new Date())
  if (dateStr === todayStr) return true
  try {
    const d = new Date(dateStr)
    return !isNaN(d.getTime()) && isToday(d)
  } catch {
    return false
  }
}
