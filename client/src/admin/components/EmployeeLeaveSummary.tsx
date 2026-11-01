import React, { useState } from "react"
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
import { Button } from "../../components/ui/button"
import { AdminCommentDialog } from "./AdminCommentDialog"
import { AdminLeaveDetailsDialog } from "./AdminLeaveDetailsDialog"
import { AdminLeaveRecord } from "../types/admin"
import { Shield, MessageSquarePlus, Calendar, Eye, HeartPulse, Coffee, Plane } from "lucide-react"

interface EmployeeLeaveSummaryProps {
  employeeId: string
  employeeName: string
}

export const EmployeeLeaveSummary: React.FC<EmployeeLeaveSummaryProps> = ({
  employeeId,
  employeeName,
}) => {
  const { leaveRequests } = useAdmin()

  const [commentDialogOpen, setCommentDialogOpen] = useState(false)
  const [selectedLeaveForComment, setSelectedLeaveForComment] = useState<AdminLeaveRecord | null>(null)

  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false)
  const [selectedLeaveForDetails, setSelectedLeaveForDetails] = useState<AdminLeaveRecord | null>(null)

  // In our mock data, Alex Morgan is EMP-1042 or emp-1
  const employeeLeaves = leaveRequests.filter(
    l => l.employeeId === employeeId || (employeeId === "EMP-1042" && l.employeeId === "EMP-1042")
  )

  const handleOpenComment = (leave: AdminLeaveRecord) => {
    setSelectedLeaveForComment(leave)
    setCommentDialogOpen(true)
  }

  const getStatusBadge = (status: AdminLeaveRecord["status"]) => {
    switch (status) {
      case "approved":
        return (
          <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
            Approved (Super Admin)
          </Badge>
        )
      case "rejected":
        return (
          <Badge className="bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300">
            Rejected (Super Admin)
          </Badge>
        )
      case "pending":
      default:
        return (
          <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
            Pending Super Admin
          </Badge>
        )
    }
  }

  return (
    <div className="space-y-4">
      {/* Super Admin View-Only Notice Banner */}
      <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200 flex items-start gap-3">
        <Shield className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
        <div className="space-y-1 text-xs">
          <p className="font-semibold">Super Admin Exclusive Authority Notice</p>
          <p className="text-amber-700 dark:text-amber-300">
            Leave approval and rejection is strictly governed by the Super Admin role. System Admins have view-only access to leave applications and can append operational comments or team-capacity observations for the Super Admin to review.
          </p>
        </div>
      </div>

      {/* Leave Entitlement Quota Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
            <Coffee className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Casual Leave</span>
            <p className="text-sm font-bold text-slate-900 dark:text-slate-100">8 / 12 Days</p>
            <span className="text-[10px] text-slate-500">4 days utilized this fiscal yr</span>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400">
            <HeartPulse className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Sick Leave</span>
            <p className="text-sm font-bold text-slate-900 dark:text-slate-100">5 / 8 Days</p>
            <span className="text-[10px] text-slate-500">3 days utilized this fiscal yr</span>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400">
            <Plane className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Annual Leave</span>
            <p className="text-sm font-bold text-slate-900 dark:text-slate-100">14 / 18 Days</p>
            <span className="text-[10px] text-slate-500">4 days utilized this fiscal yr</span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
          Leave Applications & Entitlement History ({employeeLeaves.length})
        </h3>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        <Table>
          <TableHeader className="bg-slate-50/75 dark:bg-slate-800/50">
            <TableRow className="border-b border-slate-200 dark:border-slate-800">
              <TableHead className="text-xs font-semibold">Leave Type</TableHead>
              <TableHead className="text-xs font-semibold">Duration / Dates</TableHead>
              <TableHead className="text-xs font-semibold">Total Days</TableHead>
              <TableHead className="text-xs font-semibold">Reason</TableHead>
              <TableHead className="text-xs font-semibold">Super Admin Status</TableHead>
              <TableHead className="text-xs font-semibold text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {employeeLeaves.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-xs text-slate-500">
                  No leave requests recorded for {employeeName}.
                </TableCell>
              </TableRow>
            ) : (
              employeeLeaves.map(leave => (
                <TableRow
                  key={leave.id}
                  className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 border-b border-slate-100 dark:border-slate-800/60"
                >
                  <TableCell className="py-3">
                    <p className="text-xs font-semibold capitalize text-slate-900 dark:text-slate-100">
                      {leave.leaveType.replace("-", " ")}
                    </p>
                    <p className="text-[11px] text-slate-400">
                      Applied: {new Date(leave.appliedDate).toLocaleDateString()}
                    </p>
                  </TableCell>

                  <TableCell className="py-3 text-xs text-slate-700 dark:text-slate-300">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                      <span>
                        {leave.startDate} &rarr; {leave.endDate}
                      </span>
                    </div>
                  </TableCell>

                  <TableCell className="py-3 text-xs font-semibold text-slate-900 dark:text-slate-100">
                    {leave.totalDays} {leave.totalDays === 1 ? "day" : "days"}
                  </TableCell>

                  <TableCell className="py-3 text-xs text-slate-600 dark:text-slate-400 max-w-xs truncate">
                    {leave.reason}
                  </TableCell>

                  <TableCell className="py-3">
                    {getStatusBadge(leave.status)}
                  </TableCell>

                  <TableCell className="py-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedLeaveForDetails(leave)
                          setDetailsDialogOpen(true)
                        }}
                        className="h-7 px-2 text-[11px] text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-1"
                      >
                        <Eye className="w-3 h-3" />
                        View
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenComment(leave)}
                        className="h-7 px-2 text-[11px] text-indigo-600 border-indigo-200 hover:bg-indigo-50 dark:text-indigo-400 dark:border-indigo-800 dark:hover:bg-indigo-950/40 flex items-center gap-1"
                      >
                        <MessageSquarePlus className="w-3 h-3" />
                        Add Note
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <AdminLeaveDetailsDialog
        leave={selectedLeaveForDetails}
        open={detailsDialogOpen}
        onOpenChange={setDetailsDialogOpen}
        onAddComment={(l) => {
          setSelectedLeaveForComment(l)
          setCommentDialogOpen(true)
        }}
      />

      {selectedLeaveForComment && (
        <AdminCommentDialog
          open={commentDialogOpen}
          onOpenChange={setCommentDialogOpen}
          defaultTargetType="leave"
          defaultTargetId={selectedLeaveForComment.id}
          defaultTargetTitle={`Leave Request: ${employeeName} (${selectedLeaveForComment.leaveType})`}
        />
      )}
    </div>
  )
}
