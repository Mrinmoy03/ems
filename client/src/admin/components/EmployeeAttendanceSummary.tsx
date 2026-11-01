import React from "react"
import { useAdmin } from "../context/AdminContext"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table"
import { Badge } from "../../components/ui/badge"
import { Coffee } from "lucide-react"


interface EmployeeAttendanceSummaryProps {
  employeeId: string
  employeeName: string
}

export const EmployeeAttendanceSummary: React.FC<EmployeeAttendanceSummaryProps> = ({
  employeeId,
  employeeName,
}) => {
  const { attendance } = useAdmin()

  // Filter attendance records for this employee
  const employeeRecords = attendance.filter(a => a.employeeId === employeeId)

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
          Attendance History & Work Logs ({employeeRecords.length} days logged)
        </h3>
        <p className="text-xs text-slate-500">
          Daily clock-ins, break compliance, and net working duration based on the standard Monday–Saturday schedule.
        </p>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        <Table>
          <TableHeader className="bg-slate-50/75 dark:bg-slate-800/50">
            <TableRow className="border-b border-slate-200 dark:border-slate-800">
              <TableHead className="text-xs font-semibold">Date & Day</TableHead>
              <TableHead className="text-xs font-semibold">Status</TableHead>
              <TableHead className="text-xs font-semibold">Check-In</TableHead>
              <TableHead className="text-xs font-semibold">Check-Out</TableHead>
              <TableHead className="text-xs font-semibold">Break Duration</TableHead>
              <TableHead className="text-xs font-semibold text-right">Net Hours</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {employeeRecords.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-xs text-slate-500">
                  No attendance records logged yet for {employeeName}.
                </TableCell>
              </TableRow>
            ) : (
              employeeRecords.map(record => (
                <TableRow
                  key={record.id}
                  className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 border-b border-slate-100 dark:border-slate-800/60"
                >
                  <TableCell className="py-3 text-xs font-medium text-slate-900 dark:text-slate-100">
                    <div>{record.date}</div>
                    <div className="text-[11px] text-slate-400">{record.dayOfWeek}</div>
                  </TableCell>

                  <TableCell className="py-3">
                    <Badge
                      variant="outline"
                      className={`text-[10px] uppercase font-semibold ${
                        record.status === "present" || record.status === "working"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800"
                          : record.status === "on-break"
                          ? "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800"
                          : record.status === "on-leave"
                          ? "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-800"
                          : "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800"
                      }`}
                    >
                      {record.status}
                    </Badge>
                  </TableCell>

                  <TableCell className="py-3 text-xs font-mono text-slate-700 dark:text-slate-300">
                    {record.checkIn || "—"}
                  </TableCell>

                  <TableCell className="py-3 text-xs font-mono text-slate-700 dark:text-slate-300">
                    {record.checkOut || "—"}
                  </TableCell>

                  <TableCell className="py-3 text-xs text-slate-600 dark:text-slate-400">
                    <div className="flex items-center gap-1.5">
                      <Coffee className="w-3.5 h-3.5 text-amber-500" />
                      <span>{record.breakDuration || "0m"}</span>
                    </div>
                  </TableCell>

                  <TableCell className="py-3 text-xs font-mono font-bold text-slate-900 dark:text-slate-100 text-right">
                    {record.netHoursWorked > 0 ? `${record.netHoursWorked.toFixed(1)}h` : "—"}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
