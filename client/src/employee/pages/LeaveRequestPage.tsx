import React, { useState, useMemo } from "react"
import { LeaveRequestSummary } from "../components/LeaveRequestSummary"
import { useEmployee } from "../context/EmployeeContext"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  CalendarDays,
  Info,
  Eye,
  Pencil,
  FolderArchive,
  CalendarCheck2,
  Sparkles,
} from "lucide-react"
import { LeaveDetailsModal } from "../components/LeaveDetailsModal"
import {
  mockAnnualLeaveBalances,
  defaultAnnualLeaveBalance,
  getAvailableLeaveYears,
} from "../data/mockLeaveRequests"

export const LeaveRequestPage: React.FC = () => {
  const { leaveRequests } = useEmployee()
  const currentCalendarYear = useMemo(() => new Date().getFullYear(), [])
  const [selectedYear, setSelectedYear] = useState<string>(() => new Date().getFullYear().toString())
  const [selectedTableRequestId, setSelectedTableRequestId] = useState<string | null>(null)

  const selectedTableRequest = useMemo(() => {
    return leaveRequests.find(r => r.id === selectedTableRequestId) || null
  }, [leaveRequests, selectedTableRequestId])

  // Dynamically derive available years: only current year and recorded past years (never future years)
  const availableYears = useMemo(() => {
    return getAvailableLeaveYears(leaveRequests, currentCalendarYear)
  }, [leaveRequests, currentCalendarYear])

  const isPastYear = Boolean(selectedYear && Number(selectedYear) < currentCalendarYear)

  // Dynamic leave balances matching the selected year's quota allocation & usage
  const activeBalanceConfig =
    mockAnnualLeaveBalances[selectedYear] ||
    mockAnnualLeaveBalances[currentCalendarYear.toString()] ||
    defaultAnnualLeaveBalance

  const leaveBalances = [
    { type: "Casual Leave", available: activeBalanceConfig.casual.available, total: activeBalanceConfig.casual.total, color: "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950" },
    { type: "Sick Leave", available: activeBalanceConfig.sick.available, total: activeBalanceConfig.sick.total, color: "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950" },
    { type: "Annual Leave", available: activeBalanceConfig.annual.available, total: activeBalanceConfig.annual.total, color: "text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950" },
    { type: "Unpaid Leave", available: activeBalanceConfig.unpaid.available, total: activeBalanceConfig.unpaid.total, color: "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950" },
  ]

  // Filter requests strictly for the active or selected year
  const yearFilteredRequests = useMemo(() => {
    return leaveRequests.filter(req => req.startDate.startsWith(selectedYear))
  }, [leaveRequests, selectedYear])

  return (
    <div className="space-y-6">
      {/* Page Header & Year Switcher Dropdown */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            Leave Management
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Check leave balances, submit applications, and review historical closed records
          </p>
        </div>

        {/* Year Dropdown Selector */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <CalendarCheck2 className="h-4 w-4 text-slate-400 shrink-0" />
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Year:</span>
          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger className="w-[210px] h-9 text-xs border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 font-medium">
              <SelectValue placeholder="Select Year" />
            </SelectTrigger>
            <SelectContent>
              {availableYears.map(yr => (
                <SelectItem key={yr} value={yr} className="text-xs">
                  {yr === currentCalendarYear.toString()
                    ? `${yr} (Current Active Year)`
                    : `${yr} (Previous Year Archive)`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Leave Balances Grid (Dynamically updates per selected year) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {leaveBalances.map(bal => (
          <Card key={bal.type} className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase">{bal.type}</p>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-2xl font-bold text-slate-900 dark:text-slate-100">{bal.available}</span>
                  <span className="text-xs text-slate-400 dark:text-slate-500">/ {bal.total}</span>
                </div>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
                  {isPastYear ? "Closed Balance" : "Days Remaining"}
                </p>
              </div>
              <div className={`p-2.5 rounded-xl ${bal.color}`}>
                <CalendarDays className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Contextual Notice Banner based on Active Year */}
      {isPastYear ? (
        <div className="p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg flex items-start gap-2.5 text-xs text-slate-700 dark:text-slate-300">
          <FolderArchive className="h-4 w-4 text-slate-500 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-slate-900 dark:text-slate-100">Historical Year Archive — {selectedYear}:</span>
            <span className="ml-1 text-slate-600 dark:text-slate-400">
              Viewing archived leave records and year-end closed balance history for {selectedYear}. Historical records are preserved for audit compliance.
            </span>
          </div>
        </div>
      ) : (
        <div className="p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg flex items-start gap-2.5 text-xs text-slate-700 dark:text-slate-300">
          <Info className="h-4 w-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-slate-900 dark:text-slate-100">Leave Approval Policy:</span>
            <span className="text-slate-600 dark:text-slate-300 ml-1">
              As specified in the system hierarchy, leave applications are solely evaluated and approved or rejected by the
              <strong className="text-slate-800 dark:text-slate-100"> Super Admin</strong>. Submissions in this prototype are preserved in-memory.
            </span>
          </div>
        </div>
      )}

      {/* Main Leave Component (with Apply Modal) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5">
          <LeaveRequestSummary selectedYear={selectedYear} />
        </div>

        {/* Detailed Leave History Table */}
        <div className="lg:col-span-7">
          <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
            <CardHeader className="p-4 pb-2 border-b border-slate-100 dark:border-slate-800 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                  Application History — {selectedYear}
                </CardTitle>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  {isPastYear
                    ? `Showing archived historical leave applications from ${selectedYear}`
                    : "Click any row to open the complete details modal & edit pending requests"}
                </p>
              </div>
              <span className="text-xs text-slate-400 font-mono bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                {yearFilteredRequests.length} {yearFilteredRequests.length === 1 ? "record" : "records"}
              </span>
            </CardHeader>
            <CardContent className="p-0 overflow-x-auto">
              {yearFilteredRequests.length === 0 ? (
                isPastYear ? (
                  <div className="py-12 px-6 text-center">
                    <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center mx-auto text-slate-500 mb-3">
                      <FolderArchive className="h-6 w-6" />
                    </div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                      Closed Calendar Year Archive — {selectedYear}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto mt-1 leading-relaxed">
                      This calendar year is closed and finalized. Historical leave records are read-only; new leave applications cannot be submitted for past years.
                    </p>
                  </div>
                ) : (
                  <div className="py-12 px-6 text-center">
                    <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200/60 dark:border-blue-900 flex items-center justify-center mx-auto text-blue-600 dark:text-blue-400 mb-3">
                      <Sparkles className="h-6 w-6" />
                    </div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                      No Leave Applications Recorded for {selectedYear}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto mt-1 leading-relaxed">
                      Upon year change, previous years remain archived while the new year begins with a clean, blank slate.
                      All annual leave quotas (Casual: 12, Sick: 10, Annual: 20) are 100% available.
                    </p>
                  </div>
                )
              ) : (
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/60 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                      <th className="p-3 pl-4">Type</th>
                      <th className="p-3">Duration</th>
                      <th className="p-3">Reason</th>
                      <th className="p-3">Status</th>
                      <th className="p-3 pr-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {yearFilteredRequests.map(req => (
                      <tr
                        key={req.id}
                        onClick={() => setSelectedTableRequestId(req.id)}
                        className="hover:bg-blue-50/40 dark:hover:bg-slate-800/60 cursor-pointer transition-colors group"
                      >
                        <td className="p-3 pl-4 font-semibold text-slate-800 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          {req.leaveType}
                          <span className="block text-[10px] text-slate-400 dark:text-slate-500 font-mono">
                            {req.id}
                          </span>
                        </td>
                        <td className="p-3 text-slate-600 dark:text-slate-300">
                          <span className="font-medium text-slate-800 dark:text-slate-200">
                            {req.daysCount} {req.daysCount === 1 ? "day" : "days"}
                          </span>
                          <span className="block text-[11px] text-slate-400 dark:text-slate-500">
                            {req.startDate} {req.startDate !== req.endDate ? `to ${req.endDate}` : ""}
                          </span>
                        </td>
                        <td className="p-3 text-slate-600 dark:text-slate-300 max-w-xs">
                          <p className="line-clamp-2 leading-relaxed text-[11.5px]">{req.reason}</p>
                          {req.adminComment && (
                            <p className="text-[10.5px] text-blue-600 dark:text-blue-400 italic mt-0.5 line-clamp-1">
                              Note: {req.adminComment}
                            </p>
                          )}
                        </td>
                        <td className="p-3">
                          <Badge
                            variant={
                              req.status === "approved"
                                ? "success"
                                : req.status === "rejected"
                                ? "destructive"
                                : "warning"
                            }
                            className="capitalize text-[10px]"
                          >
                            {req.status}
                          </Badge>
                        </td>
                        <td className="p-3 pr-4 text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={e => {
                              e.stopPropagation()
                              setSelectedTableRequestId(req.id)
                            }}
                            className="h-7 px-2 text-xs gap-1 text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 group-hover:bg-white dark:group-hover:bg-slate-700"
                          >
                            {req.status === "pending" && !isPastYear ? (
                              <>
                                <Pencil className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                                <span>Edit</span>
                              </>
                            ) : (
                              <>
                                <Eye className="h-3 w-3 text-slate-500" />
                                <span>View</span>
                              </>
                            )}
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Table Item Details & Edit Modal */}
      <LeaveDetailsModal
        request={selectedTableRequest}
        isOpen={!!selectedTableRequest}
        onClose={() => setSelectedTableRequestId(null)}
      />
    </div>
  )
}
