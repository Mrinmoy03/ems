import React, { useState, useMemo } from "react"
import { useAdmin } from "../context/AdminContext"
import { AdminLeaveRecord } from "../types/admin"
import { AdminCommentDialog } from "../components/AdminCommentDialog"
import { AdminLeaveDetailsDialog } from "../components/AdminLeaveDetailsDialog"
import { DataPagination } from "@/components/common/DataPagination"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table"
import { Input } from "../../components/ui/input"
import { Button } from "../../components/ui/button"
import { Badge } from "../../components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "../../components/ui/dialog"
import {
  Calendar,
  Shield,
  ShieldCheck,
  MessageSquarePlus,
  Search,
  Lock,
  Eye,
  CheckCircle2,
  XCircle,
} from "lucide-react"

export const LeaveManagementPage: React.FC = () => {
  const { leaveRequests, isSuperAdmin, approveLeave, rejectLeave } = useAdmin()

  const [searchTerm, setSearchTerm] = useState("")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [selectedType, setSelectedType] = useState("all")
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [pageSize, setPageSize] = useState<number>(10)

  // Direct decision state for modal
  const [decisionModal, setDecisionModal] = useState<{
    leave: AdminLeaveRecord
    action: "approve" | "reject"
  } | null>(null)
  const [decisionRemarks, setDecisionRemarks] = useState("")

  // Reset page when filters change
  React.useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, selectedStatus, selectedType])

  // Comment dialog state
  const [isCommentOpen, setIsCommentOpen] = useState(false)
  const [selectedLeave, setSelectedLeave] = useState<AdminLeaveRecord | null>(null)

  // View details dialog state
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [leaveToView, setLeaveToView] = useState<AdminLeaveRecord | null>(null)

  const filteredLeaves = useMemo(() => {
    return leaveRequests.filter(leave => {
      const matchSearch =
        leave.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        leave.reason.toLowerCase().includes(searchTerm.toLowerCase())

      const matchStatus = selectedStatus === "all" || leave.status === selectedStatus
      const matchType = selectedType === "all" || leave.leaveType === selectedType

      return matchSearch && matchStatus && matchType
    })
  }, [leaveRequests, searchTerm, selectedStatus, selectedType])

  // Pagination calculations
  const totalPages = Math.max(1, Math.ceil(filteredLeaves.length / pageSize))
  const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages)
  const displayedLeaves = useMemo(() => {
    const startIndex = (safeCurrentPage - 1) * pageSize
    return filteredLeaves.slice(startIndex, startIndex + pageSize)
  }, [filteredLeaves, safeCurrentPage, pageSize])

  const handleOpenComment = (leave: AdminLeaveRecord) => {
    setSelectedLeave(leave)
    setIsCommentOpen(true)
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

    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Dynamic Super Admin vs Admin Authority Notice */}
      {isSuperAdmin ? (
        <div className="p-4 rounded-2xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 text-purple-900 dark:text-purple-200 shadow-sm space-y-2">
          <div className="flex items-center gap-2.5 font-bold text-sm">
            <ShieldCheck className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            <span>Super Admin Executive Authority Active</span>
            <span className="font-mono text-[10px] bg-purple-200 dark:bg-purple-900 px-2 py-0.5 rounded text-purple-900 dark:text-purple-100 uppercase tracking-wider ml-auto">
              Approval & Rejection Authority
            </span>
          </div>
          <p className="text-xs text-purple-800 dark:text-purple-300 leading-relaxed">
            As <strong>Super Admin</strong>, you hold executive decision authority over all organizational leave requests. You can directly <strong>Approve</strong> or <strong>Reject</strong> applications, review project coverage, and record executive remarks in the audit log.
          </p>
        </div>
      ) : (
        <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200 shadow-sm space-y-2">
          <div className="flex items-center gap-2.5 font-bold text-sm">
            <Shield className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            <span>Super Admin Approval Policy Enforcement</span>
            <span className="font-mono text-[10px] bg-amber-200 dark:bg-amber-900 px-2 py-0.5 rounded text-amber-900 dark:text-amber-100 uppercase tracking-wider ml-auto">
              View-Only for Admin
            </span>
          </div>
          <p className="text-xs text-amber-800 dark:text-amber-300 leading-relaxed">
            In accordance with WorkTrack corporate access control, <strong>decision authority for approving or rejecting leave applications is exclusively reserved for the Super Admin role</strong>. System Admins have observational access to review requests, verify project coverage, and submit advisory notes directly to the Super Admin prior to their decision.
          </p>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
            <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              Leave Applications & Schedule Requests
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {isSuperAdmin
              ? "Review pending applications and execute executive approval or rejection decisions."
              : "Audit team member absences and append capacity feedback to Super Admin review queues."}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {isSuperAdmin ? (
            <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 border-purple-300 text-xs py-1 px-3">
              <ShieldCheck className="w-3.5 h-3.5 mr-1.5 text-purple-600 dark:text-purple-400" />
              Executive Decision Authority
            </Badge>
          ) : (
            <Badge variant="outline" className="text-xs py-1 px-3 border-slate-300 dark:border-slate-700">
              <Lock className="w-3 h-3 mr-1.5 text-slate-400" />
              Decision Controls: Super Admin Only
            </Badge>
          )}
        </div>
      </div>

      {/* Filters Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex flex-1 items-center gap-2 max-w-md relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
          <Input
            placeholder="Search by employee name or reason..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="pl-9 h-9 text-xs"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="w-44">
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="h-9 text-xs">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending Super Admin</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="w-36">
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger className="h-9 text-xs">
                <SelectValue placeholder="All Leave Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="casual">Casual Leave</SelectItem>
                <SelectItem value="sick">Sick Leave</SelectItem>
                <SelectItem value="paid">Paid Leave</SelectItem>
                <SelectItem value="unpaid">Unpaid Leave</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50/75 dark:bg-slate-800/50">
              <TableRow className="border-b border-slate-200 dark:border-slate-800">
                <TableHead className="text-xs font-semibold">Employee</TableHead>
                <TableHead className="text-xs font-semibold">Leave Type</TableHead>
                <TableHead className="text-xs font-semibold">Duration / Dates</TableHead>
                <TableHead className="text-xs font-semibold">Total Days</TableHead>
                <TableHead className="text-xs font-semibold">Application Reason</TableHead>
                <TableHead className="text-xs font-semibold">Super Admin Decision</TableHead>
                <TableHead className="text-xs font-semibold text-right">
                  {isSuperAdmin ? "Executive Decision" : "Admin Observation"}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLeaves.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-10 text-xs text-slate-500">
                    No leave requests match your search filters.
                  </TableCell>
                </TableRow>
              ) : (
                displayedLeaves.map(leave => (
                  <TableRow
                    key={leave.id}
                    className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 border-b border-slate-100 dark:border-slate-800/60"
                  >
                    <TableCell className="py-3">
                      <div>
                        <p className="text-xs font-bold text-slate-900 dark:text-slate-100">
                          {leave.employeeName}
                        </p>
                        <p className="text-[10px] font-mono text-slate-400">
                          {leave.employeeId}
                        </p>
                      </div>
                    </TableCell>

                    <TableCell className="py-3 text-xs font-semibold capitalize text-slate-700 dark:text-slate-300">
                      {leave.leaveType.replace("-", " ")}
                    </TableCell>

                    <TableCell className="py-3 text-xs font-mono text-slate-700 dark:text-slate-300">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                        <span>
                          {leave.startDate} &rarr; {leave.endDate}
                        </span>
                      </div>
                    </TableCell>

                    <TableCell className="py-3 text-xs font-bold text-slate-900 dark:text-slate-100">
                      {leave.totalDays} {leave.totalDays === 1 ? "day" : "days"}
                    </TableCell>

                    <TableCell className="py-3 text-xs text-slate-600 dark:text-slate-400 max-w-xs truncate">
                      {leave.reason}
                    </TableCell>

                    <TableCell className="py-3">
                      {getStatusBadge(leave.status)}
                    </TableCell>

                    <TableCell className="py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5 flex-wrap">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setLeaveToView(leave)
                            setIsDetailsOpen(true)
                          }}
                          className="h-7 px-2 text-[11px] text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-1"
                        >
                          <Eye className="w-3 h-3" />
                          View
                        </Button>

                        {isSuperAdmin ? (
                          leave.status === "pending" ? (
                            <>
                              <Button
                                size="sm"
                                onClick={() => {
                                  setDecisionModal({ leave, action: "approve" })
                                  setDecisionRemarks("")
                                }}
                                className="h-7 px-2.5 text-[11px] bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1 shadow-xs"
                              >
                                <CheckCircle2 className="w-3 h-3" />
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setDecisionModal({ leave, action: "reject" })
                                  setDecisionRemarks("")
                                }}
                                className="h-7 px-2.5 text-[11px] text-rose-600 border-rose-300 hover:bg-rose-50 dark:text-rose-400 dark:border-rose-800 dark:hover:bg-rose-950/40 flex items-center gap-1"
                              >
                                <XCircle className="w-3 h-3" />
                                Reject
                              </Button>
                            </>
                          ) : (
                            <span className="text-[10px] font-mono font-medium text-slate-400 px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800">
                              Decided
                            </span>
                          )
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenComment(leave)}
                            className="h-7 px-2.5 text-[11px] text-indigo-600 border-indigo-200 hover:bg-indigo-50 dark:text-indigo-400 dark:border-indigo-800 dark:hover:bg-indigo-950/40 flex items-center gap-1"
                          >
                            <MessageSquarePlus className="w-3 h-3" />
                            Send Note
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination Footer with 10 / 20 / 30 selector */}
        {filteredLeaves.length > 0 && (
          <DataPagination
            currentPage={safeCurrentPage}
            totalPages={totalPages}
            totalItems={filteredLeaves.length}
            pageSize={pageSize}
            pageSizeOptions={[10, 20, 30]}
            itemName="applications"
            onPageChange={setCurrentPage}
            onPageSizeChange={setPageSize}
          />
        )}
      </div>

      {/* Leave Details Modal (supports Super Admin direct decision) */}
      <AdminLeaveDetailsDialog
        leave={leaveToView}
        open={isDetailsOpen}
        onOpenChange={setIsDetailsOpen}
        isSuperAdmin={isSuperAdmin}
        onApprove={(leave, remarks) => approveLeave(leave.id, remarks)}
        onReject={(leave, remarks) => rejectLeave(leave.id, remarks)}
        onAddComment={(l) => {
          setSelectedLeave(l)
          setIsCommentOpen(true)
        }}
      />

      {/* Super Admin Decision Confirmation Modal */}
      <Dialog open={Boolean(decisionModal)} onOpenChange={open => !open && setDecisionModal(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base font-bold">
              {decisionModal?.action === "approve" ? (
                <>
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <span>Approve Leave Request</span>
                </>
              ) : (
                <>
                  <XCircle className="w-5 h-5 text-rose-600" />
                  <span>Reject Leave Request</span>
                </>
              )}
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              {decisionModal?.action === "approve"
                ? `Confirm executive approval for ${decisionModal.leave.employeeName}'s ${decisionModal.leave.leaveType} (${decisionModal.leave.startDate} to ${decisionModal.leave.endDate}).`
                : `Confirm executive rejection for ${decisionModal?.leave.employeeName}'s ${decisionModal?.leave.leaveType}.`}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2 text-xs">
            <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-500">Employee:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{decisionModal?.leave.employeeName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Duration:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{decisionModal?.leave.totalDays} Day(s)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Reason:</span>
                <span className="text-slate-700 dark:text-slate-300 italic truncate max-w-xs">{decisionModal?.leave.reason}</span>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                Decision Remarks / Audit Note (Optional):
              </label>
              <Input
                placeholder={
                  decisionModal?.action === "approve"
                    ? "e.g. Approved. Project milestone coverage verified."
                    : "e.g. Critical sprint release scheduled on requested dates."
                }
                value={decisionRemarks}
                onChange={e => setDecisionRemarks(e.target.value)}
                className="h-8 text-xs"
              />
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setDecisionModal(null)}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={() => {
                if (!decisionModal) return
                if (decisionModal.action === "approve") {
                  approveLeave(decisionModal.leave.id, decisionRemarks)
                } else {
                  rejectLeave(decisionModal.leave.id, decisionRemarks)
                }
                setDecisionModal(null)
              }}
              className={
                decisionModal?.action === "approve"
                  ? "bg-emerald-600 hover:bg-emerald-700 text-white text-xs"
                  : "bg-rose-600 hover:bg-rose-700 text-white text-xs"
              }
            >
              Confirm {decisionModal?.action === "approve" ? "Approval" : "Rejection"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Observation Dialog */}
      {selectedLeave && (
        <AdminCommentDialog
          open={isCommentOpen}
          onOpenChange={setIsCommentOpen}
          defaultTargetType="leave"
          defaultTargetId={selectedLeave.id}
          defaultTargetTitle={`Leave Application: ${selectedLeave.employeeName} (${selectedLeave.leaveType})`}
        />
      )}
    </div>
  )
}
