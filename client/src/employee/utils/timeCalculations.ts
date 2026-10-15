/**
 * Utility functions for calculating gross shift spans, lunch break deductions,
 * and exact net worked hours.
 *
 * Formula:
 * Net Worked Hours = (Log Out Time - Log In Time) - Break Duration
 */

/**
 * Parses a standard formatted time string ("08:55 AM", "5:28 PM", "17:28", "8:30")
 * into total minutes from start of day (0 to 1439).
 */
export function parseTimeToMinutes(timeStr?: string): number | null {
  if (!timeStr) return null
  const cleaned = timeStr.trim()
  const match = cleaned.match(/(\d{1,2}):(\d{2})(?:\s*([AP]M))?/i)
  if (!match) return null

  let hours = parseInt(match[1], 10)
  const minutes = parseInt(match[2], 10)
  const meridiem = match[3]?.toUpperCase()

  if (meridiem === "PM" && hours < 12) {
    hours += 12
  } else if (meridiem === "AM" && hours === 12) {
    hours = 0
  }

  return hours * 60 + minutes
}

/**
 * Parses break duration strings ("45m", "1h", "1h 15m", "30 mins", "45") into total minutes.
 */
export function parseBreakToMinutes(breakStr?: string): number {
  if (!breakStr) return 0
  const cleaned = breakStr.trim().toLowerCase()

  let totalMinutes = 0

  // Check for hours e.g. "1h" or "1 hour"
  const hourMatch = cleaned.match(/(\d+)\s*(?:h|hr|hour)/)
  if (hourMatch) {
    totalMinutes += parseInt(hourMatch[1], 10) * 60
  }

  // Check for minutes e.g. "45m" or "45 mins"
  const minuteMatch = cleaned.match(/(\d+)\s*(?:m|min)/)
  if (minuteMatch) {
    totalMinutes += parseInt(minuteMatch[1], 10)
  }

  // Fallback to pure integer if no unit was matched
  if (!hourMatch && !minuteMatch) {
    const fallbackNum = parseInt(cleaned, 10)
    if (!isNaN(fallbackNum)) {
      totalMinutes = fallbackNum
    }
  }

  return totalMinutes
}

/**
 * Formats total minutes into human-readable "8h 30m" format.
 */
export function formatMinutesToHoursMinutes(totalMinutes: number): string {
  const safeMinutes = Math.max(0, Math.round(totalMinutes))
  const hours = Math.floor(safeMinutes / 60)
  const mins = safeMinutes % 60
  return `${hours}h ${mins.toString().padStart(2, "0")}m`
}

export interface ShiftTimeCalculation {
  grossMinutes: number
  grossFormatted: string
  breakMinutes: number
  breakFormatted: string
  netMinutes: number
  netHoursFormatted: string
  netHoursDecimal: number
  formulaExplanation: string
}

/**
 * Calculates net worked hours by strictly deducting the lunch break from gross duration:
 * Gross Time = (Log Out Time - Log In Time)
 * Net Worked Hours = Gross Time - Break Duration
 */
export function calculateNetShiftHours(
  checkInStr?: string,
  checkOutStr?: string,
  breakStr?: string,
  fallbackLoggedHours?: string | number
): ShiftTimeCalculation {
  const inMins = parseTimeToMinutes(checkInStr)
  const isLive = !checkOutStr || checkOutStr.toLowerCase().includes("live") || checkOutStr.toLowerCase().includes("progress")
  const outMins = isLive ? null : parseTimeToMinutes(checkOutStr)
  const breakMinutes = parseBreakToMinutes(breakStr || "45m")

  // If both check-in and check-out are valid static timestamps
  if (inMins !== null && outMins !== null) {
    let grossMinutes = outMins - inMins
    if (grossMinutes < 0) grossMinutes += 24 * 60 // Handles crossing midnight

    const netMinutes = Math.max(0, grossMinutes - breakMinutes)
    const grossFormatted = formatMinutesToHoursMinutes(grossMinutes)
    const netHoursFormatted = formatMinutesToHoursMinutes(netMinutes)
    const netHoursDecimal = Number((netMinutes / 60).toFixed(2))

    return {
      grossMinutes,
      grossFormatted,
      breakMinutes,
      breakFormatted: `${breakMinutes}m`,
      netMinutes,
      netHoursFormatted,
      netHoursDecimal,
      formulaExplanation: `${grossFormatted} gross − ${breakMinutes}m break = ${netHoursFormatted} net worked`,
    }
  }

  // Fallback if live or only elapsed hours provided
  let netMinutes = 0
  if (typeof fallbackLoggedHours === "number") {
    netMinutes = Math.round(fallbackLoggedHours * 60)
  } else if (typeof fallbackLoggedHours === "string") {
    const match = fallbackLoggedHours.match(/(\d+)h\s*(\d+)?m?/)
    if (match) {
      const h = parseInt(match[1], 10)
      const m = match[2] ? parseInt(match[2], 10) : 0
      netMinutes = h * 60 + m
    } else {
      const parsedFloat = parseFloat(fallbackLoggedHours)
      if (!isNaN(parsedFloat)) {
        netMinutes = Math.round(parsedFloat * 60)
      }
    }
  }

  const netHoursFormatted = formatMinutesToHoursMinutes(netMinutes)
  const netHoursDecimal = Number((netMinutes / 60).toFixed(2))
  const grossMinutes = netMinutes + breakMinutes
  const grossFormatted = formatMinutesToHoursMinutes(grossMinutes)

  return {
    grossMinutes,
    grossFormatted,
    breakMinutes,
    breakFormatted: `${breakMinutes}m`,
    netMinutes,
    netHoursFormatted,
    netHoursDecimal,
    formulaExplanation: isLive
      ? `Active shift timer (pauses automatically during break)`
      : `${grossFormatted} gross − ${breakMinutes}m break = ${netHoursFormatted} net worked`,
  }
}
