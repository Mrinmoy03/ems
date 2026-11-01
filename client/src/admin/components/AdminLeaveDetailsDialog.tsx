import React, { useState } from "react"
import { AdminLeaveRecord } from "../types/admin"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "../../components/ui/dialog"
import { Button } from "../../components/ui/button"
import { Badge } from "../../components/ui/badge"
import { Input } from "../../components/ui/input"
import {
  Calendar,
  User,
  FileText,
  ShieldAlert,
  ShieldCheck,
  MessageSquarePlus,
  Clock,
  CheckCircle2,
  XCircle,
} from "lucide-react"

interface AdminLeaveDetailsDialogProps {
  leave: AdminLeaveRecord | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onAddComment?: (leave: AdminLeaveRecord) => void
  isSuperAdmin?: boolean
  onApprove?: (leave: AdminLeaveRecord, remarks?: string) => void
  onReject?: (leave: AdminLeaveRecord, remarks?: string) => void
}

export const AdminLeaveDetailsDialog: React.FC<AdminLeaveDetailsDialogProps> = ({
  leave,
  open,
  onOpenChange,
  onAddComment,
  isSuperAdmin = false,
  onApprove,
  onReject,
}) => {
  const [remarks, setRemarks] = useState("")

  if (!leave) return null

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
            Pending Super Admin Review
          </Badge>
        )
    }
  }

  const handleApprove = () => {
    if (onApprove) {
      onApprove(leave, remarks)
      setRemarks("")
      onOpenChange(false)
    }
  }

  const handleReject = () => {
    if (onReject) {
      onReject(leave, remarks)
      setRemarks("")
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between pr-4">
            <DialogTitle className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-indigo-500" />
              Leave Application Details
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs text-slate-500">
            Full record of employee leave request submitted for executive governance.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2 text-xs">
          {/* Employee & Status */}
          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 flex items-center justify-center font-bold text-xs">
                <User className="w-4 h-4" />
              </div>
              <div>
                <p className="font-semibold text-slate-900 dark:text-slate-100">{leave.employeeName}</p>
                <p className="text-[10px] font-mono text-slate-400">{leave.employeeId}</p>
              </div>
            </div>
            <div>{getStatusBadge(leave.status)}</div>
          </div>

          {/* Leave Metadata */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
              <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Leave Type</span>
              <p className="font-semibold text-slate-900 dark:text-slate-100 mt-0.5">{leave.leaveType}</p>
            </div>
            <div className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
              <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Total Duration</span>
              <p className="font-semibold text-slate-900 dark:text-slate-100 mt-0.5">{leave.totalDays ?? leave.daysCount} Day(s)</p>
            </div>
            <div className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 col-span-2">
              <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Leave Period</span>
              <div className="flex items-center gap-1.5 font-mono text-slate-800 dark:text-slate-200 mt-0.5">
                <Clock className="w-3.5 h-3.5 text-indigo-500" />
                <span>{leave.startDate} &rarr; {leave.endDate}</span>
              </div>
            </div>
          </div>

          {/* Reason */}
          <div className="space-y-1.5">
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider flex items-center gap-1">
              <FileText className="w-3 h-3 text-slate-400" />
              Employee's Submitted Reason
            </span>
            <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 text-slate-700 dark:text-slate-300 leading-relaxed text-xs">
              {leave.reason || "No detailed explanation provided."}
            </div>
          </div>

          {/* Super Admin Decision Notice / Controls */}
          {isSuperAdmin ? (
            <div className="p-3 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 text-purple-900 dark:text-purple-200 space-y-2">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0" />
                <p className="font-semibold text-[11px]">Super Admin Decision Authority</p>
              </div>
              <p className="text-[11px] text-purple-800 dark:text-purple-300 leading-relaxed">
                As Super Admin, you can officially approve or reject this leave application. Your decision is final and will update the employee's attendance lifecycle records.
              </p>
              {leave.status === "pending" && (
                <div className="pt-2 border-t border-purple-200/80 dark:border-purple-800/80 space-y-1">
                  <span className="text-[10px] text-purple-700 dark:text-purple-300 font-semibold uppercase tracking-wider block">
                    Decision Remarks / Condition (Optional):
                  </span>
                  <Input
                    placeholder="e.g. Approved. Alex will cover project milestones."
                    value={remarks}
                    onChange={e => setRemarks(e.target.value)}
                    className="h-8 text-xs bg-white dark:bg-slate-900 border-purple-200 dark:border-purple-800"
                  />
                </div>
              )}
            </div>
          ) : (
            <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200 flex items-start gap-2.5">
              <ShieldAlert className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div className="text-[11px] leading-relaxed">
                <p className="font-semibold">Super Admin Exclusive Decision Policy</p>
                <p className="text-amber-700 dark:text-amber-300 mt-0.5">
                  Leave approval and rejection is managed exclusively by the Super Admin. As an Administrator, you may submit advisory notes or project coverage remarks to assist the Super Admin.
                </p>
              </div>
            </div>
          )}

          {/* Admin Recommendation note if exists */}
          {leave.adminComment && (
            <div className="space-y-1">
              <span className="text-[10px] text-indigo-600 dark:text-indigo-400 uppercase font-bold tracking-wider">
                Audited Decision / Advisory Note
              </span>
              <div className="p-2.5 rounded-lg border border-indigo-100 dark:border-indigo-900 bg-indigo-50/50 dark:bg-indigo-950/30 text-indigo-900 dark:text-indigo-200 text-xs">
                {leave.adminComment}
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="flex sm:justify-between items-center gap-2 pt-2 flex-wrap">
          {isSuperAdmin && leave.status === "pending" ? (
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Button
                type="button"
                size="sm"
                onClick={handleApprove}
                className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1.5 shadow-xs"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Approve Leave</span>
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleReject}
                className="text-xs text-rose-600 border-rose-300 hover:bg-rose-50 dark:text-rose-400 dark:border-rose-800 dark:hover:bg-rose-950/40 flex items-center gap-1.5"
              >
                <XCircle className="w-3.5 h-3.5" />
                <span>Reject Leave</span>
              </Button>
            </div>
          ) : !isSuperAdmin && onAddComment ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                onOpenChange(false)
                onAddComment(leave)
              }}
              className="text-xs text-indigo-600 border-indigo-200 hover:bg-indigo-50 dark:text-indigo-400 dark:border-indigo-800 flex items-center gap-1.5"
            >
              <MessageSquarePlus className="w-3.5 h-3.5" />
              <span>Send Note to Super Admin</span>
            </Button>
          ) : (
            <div />
          )}

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="text-xs ml-auto"
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

