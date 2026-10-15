import { LeaveRequest } from "../types/leave"

export const initialMockLeaveRequests: LeaveRequest[] = [
  {
    id: "LV-301",
    leaveType: "Sick Leave",
    startDate: "2026-10-02",
    endDate: "2026-10-03",
    daysCount: 2,
    reason: "Severe viral fever and medical recovery.",
    status: "approved",
    appliedAt: "2026-10-01T08:30:00.000Z",
    adminComment: "Approved. Please rest well and submit medical certificate upon return.",
  },
  {
    id: "LV-302",
    leaveType: "Casual Leave",
    startDate: "2026-10-24",
    endDate: "2026-10-24",
    daysCount: 1,
    reason: "Personal family obligation and banking errands.",
    status: "pending",
    appliedAt: "2026-10-12T14:15:00.000Z",
  },
  {
    id: "LV-303",
    leaveType: "Annual Leave",
    startDate: "2026-11-10",
    endDate: "2026-11-14",
    daysCount: 5,
    reason: "Pre-planned autumn family vacation.",
    status: "pending",
    appliedAt: "2026-10-14T09:00:00.000Z",
  },
  {
    id: "LV-299",
    leaveType: "Casual Leave",
    startDate: "2026-09-18",
    endDate: "2026-09-19",
    daysCount: 2,
    reason: "Short trip to attend out-of-town wedding celebration.",
    status: "rejected",
    appliedAt: "2026-09-12T11:20:00.000Z",
    adminComment: "Declined due to concurrent departmental sprint deployment and quarterly client milestone delivery.",
  },

  // 2025 Historical Archived Records (Previous Year)
  {
    id: "LV-210",
    leaveType: "Annual Leave",
    startDate: "2025-12-22",
    endDate: "2025-12-26",
    daysCount: 5,
    reason: "Year-end winter family holiday trip.",
    status: "approved",
    appliedAt: "2025-12-10T10:00:00.000Z",
    adminComment: "Approved. Enjoy your year-end break.",
  },
  {
    id: "LV-205",
    leaveType: "Sick Leave",
    startDate: "2025-08-14",
    endDate: "2025-08-15",
    daysCount: 2,
    reason: "Severe viral seasonal infection under prescription medication.",
    status: "approved",
    appliedAt: "2025-08-13T09:15:00.000Z",
    adminComment: "Approved. Submit medical receipt on resumption.",
  },
  {
    id: "LV-201",
    leaveType: "Casual Leave",
    startDate: "2025-05-12",
    endDate: "2025-05-13",
    daysCount: 2,
    reason: "Domestic home relocation and utility setup.",
    status: "approved",
    appliedAt: "2025-05-08T11:30:00.000Z",
    adminComment: "Approved.",
  },
  {
    id: "LV-198",
    leaveType: "Casual Leave",
    startDate: "2025-03-04",
    endDate: "2025-03-05",
    daysCount: 2,
    reason: "Outstation personal leisure trip.",
    status: "rejected",
    appliedAt: "2025-03-01T15:20:00.000Z",
    adminComment: "Rejected due to critical Q1 product launch milestone.",
  },
]

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
    casual: { available: 7, total: 12 },
    sick: { available: 8, total: 10 },
    annual: { available: 15, total: 20 },
    unpaid: { available: "—", total: "Flexible" },
  },
  "2025": {
    casual: { available: 1, total: 12 },
    sick: { available: 3, total: 10 },
    annual: { available: 2, total: 20 },
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
      // Only include recorded years that are <= current active year (never future years)
      if (!isNaN(yrNum) && yrNum <= currentYear) {
        yearsSet.add(yr)
      }
    }
  })

  // Return sorted descending (e.g. 2026, 2025...)
  return Array.from(yearsSet).sort((a, b) => parseInt(b, 10) - parseInt(a, 10))
}
