import { LeaveRequest } from "../types/leave"

export const initialMockLeaveRequests: LeaveRequest[] = []

export interface AnnualBalanceConfig {
  casual: { available: number; total: number }
  sick: { available: number; total: number }
  annual: { available: number; total: number }
  unpaid: { available: string; total: string }
}

export const defaultAnnualLeaveBalance: AnnualBalanceConfig = {
  casual: { available: 12, total: 12 },
  sick: { available: 10, total: 10 },
  annual: { available: 20, total: 20 },
  unpaid: { available: "—", total: "Flexible" },
}

export const mockAnnualLeaveBalances: Record<string, AnnualBalanceConfig> = {
  "2026": {
    casual: { available: 12, total: 12 },
    sick: { available: 10, total: 10 },
    annual: { available: 20, total: 20 },
    unpaid: { available: "—", total: "Flexible" },
  },
}

/**
 * Returns available years for the leave system.
 * Dynamically anchors to current calendar year (new Date().getFullYear()).
 * In a fresh deployment, only the current active year is present.
 * Previous years appear only when historical records exist in the system.
 * Future/upcoming years never appear until that calendar year arrives.
 */
export function getAvailableLeaveYears(
  requests: LeaveRequest[],
  currentYear: number = new Date().getFullYear()
): string[] {
  const yearsSet = new Set<string>()
  yearsSet.add(currentYear.toString())

  requests.forEach(r => {
    if (r.startDate) {
      const yr = r.startDate.slice(0, 4)
      const yrNum = parseInt(yr, 10)
      if (!isNaN(yrNum) && yrNum <= currentYear) {
        yearsSet.add(yr)
      }
    }
  })

  return Array.from(yearsSet).sort((a, b) => parseInt(b, 10) - parseInt(a, 10))
}
