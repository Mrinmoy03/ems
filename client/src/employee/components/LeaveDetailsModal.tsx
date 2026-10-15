import React, { useState, useEffect, useMemo } from "react"
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { LeaveRequest, LeaveType } from "../types/leave"
import { useEmployee } from "../context/EmployeeContext"
import {
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  FileText,
  Pencil,
  CalendarDays,
  ShieldAlert,
  ShieldCheck,
  AlertCircle,
  Undo2,
  Save,
  FolderArchive,
} from "lucide-react"
import { differenceInCalendarDays, parseISO } from "date-fns"
import { toast } from "sonner"

interface LeaveDetailsModalProps {
  request: LeaveRequest | null
  isOpen: boolean
  onClose: () => void
}

const leaveTypeOptions: LeaveType[] = [
  "Casual Leave",
  "Sick Leave",
  "Paid Leave",
  "Annual Leave",
  "Unpaid Leave",
]

export const LeaveDetailsModal: React.FC<LeaveDetailsModalProps> = ({
  request,
  isOpen,
  onClose,
}) => {
  const { updateLeaveRequest } = useEmployee()
  const [isEditing, setIsEditing] = useState(false)

  // Edit form state
  const [editType, setEditType] = useState<LeaveType>("Casual Leave")
  const [editStartDate, setEditStartDate] = useState("")
  const [editEndDate, setEditEndDate] = useState("")
  const [editReason, setEditReason] = useState("")
  const [errorMsg, setErrorMsg] = useState("")

  // Reset form when request changes or modal opens
  useEffect(() => {
    if (request) {
      setEditType(request.leaveType)
      setEditStartDate(request.startDate)
      setEditEndDate(request.endDate)
      setEditReason(request.reason)
      setIsEditing(false)
      setErrorMsg("")
    }
  }, [request, isOpen])

  // Calculate live days count during editing
  const calculatedDays = useMemo(() => {
    if (!editStartDate || !editEndDate) return 1
    try {
      const diff = differenceInCalendarDays(
        parseISO(editEndDate),
        parseISO(editStartDate)
      )
      return Math.max(1, diff + 1)
    } catch {
      return 1
    }
  }, [editStartDate, editEndDate])

  if (!request) return null

  const currentCalendarYear = new Date().getFullYear()
  const isPastYear = Boolean(request && new Date(request.startDate).getFullYear() < currentCalendarYear)
  const isPending = request.status === "pending" && !isPastYear
  const isApproved = request.status === "approved"
  const isRejected = request.status === "rejected"

  const handleStartEditing = () => {
    if (isPastYear) {
      toast.error("Cannot edit: This leave request belongs to a closed past calendar year.")
      return
    }
    if (!isPending) {
      toast.error(`Cannot edit: This leave request has already been ${request.status}.`)
      return
    }
    setErrorMsg("")
    setIsEditing(true)
  }

  const handleCancelEditing = () => {
    if (request) {
      setEditType(request.leaveType)
      setEditStartDate(request.startDate)
      setEditEndDate(request.endDate)
      setEditReason(request.reason)
    }
    setErrorMsg("")
    setIsEditing(false)
  }

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg("")

    if (!editStartDate) {
      setErrorMsg("Please select a start date.")
      return
    }
    if (!editEndDate) {
      setErrorMsg("Please select an end date.")
      return
    }
    if (new Date(editEndDate) < new Date(editStartDate)) {
      setErrorMsg("End date cannot be earlier than start date.")
      return
    }
    if (!editReason.trim() || editReason.trim().length < 5) {
      setErrorMsg("Please provide a reason of at least 5 characters.")
      return
    }

    const success = updateLeaveRequest({
      id: request.id,
      leaveType: editType,
      startDate: editStartDate,
      endDate: editEndDate,
      daysCount: calculatedDays,
      reason: editReason,
    })

    if (success) {
      setIsEditing(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={open => !open && onClose()}>
      <DialogContent className="sm:max-w-lg p-0 overflow-hidden bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
        {/* Header Strip */}
        <div className="p-5 pr-14 border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 relative">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-slate-200/80 dark:bg-slate-700/80 text-slate-700 dark:text-slate-300">
                {request.id}
              </span>
              <span className="text-xs text-slate-400 dark:text-slate-500">•</span>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Applied on {new Date(request.appliedAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
            </div>

            {/* Status Badge safely positioned inside header with generous right clearance from X button */}
            <div>
              {isApproved && (
                <Badge variant="success" className="gap-1.5 px-2.5 py-1 text-xs">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Approved
                </Badge>
              )}
              {isRejected && (
                <Badge variant="destructive" className="gap-1.5 px-2.5 py-1 text-xs">
                  <XCircle className="h-3.5 w-3.5" /> Rejected
                </Badge>
              )}
              {isPending && (
                <Badge variant="warning" className="gap-1.5 px-2.5 py-1 text-xs">
                  <Clock className="h-3.5 w-3.5" /> Pending Review
                </Badge>
              )}
            </div>
          </div>

          <DialogTitle className="text-lg font-bold text-slate-900 dark:text-slate-100 mt-2 flex items-center gap-2">
            <CalendarDays className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            {isEditing ? `Edit: ${request.leaveType}` : request.leaveType}
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {isEditing
              ? "Update your pending leave details before Super Admin review"
              : "Complete leave application details and review status"}
          </DialogDescription>
        </div>

        {/* Modal Body: View Mode or Edit Mode */}
        {!isEditing ? (
          <div className="p-5 space-y-4">
            {/* Shift & Duration Stats Grid */}
            <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800">
              <div>
                <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block uppercase tracking-wider">
                  Requested Duration
                </span>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-xl font-bold text-slate-900 dark:text-slate-100">
                    {request.daysCount}
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    {request.daysCount === 1 ? "Calendar Day" : "Calendar Days"}
                  </span>
                </div>
              </div>

              <div>
                <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block uppercase tracking-wider">
                  Dates
                </span>
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 mt-1">
                  {request.startDate === request.endDate
                    ? request.startDate
                    : `${request.startDate} to ${request.endDate}`}
                </p>
              </div>
            </div>

            {/* Full Reason Box (No truncation) */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <FileText className="h-3.5 w-3.5 text-slate-500" />
                Reason for Application
              </Label>
              <div className="p-3.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/60 text-xs text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-wrap">
                {request.reason}
              </div>
            </div>

            {/* Admin Comment (if exists) */}
            {request.adminComment && (
              <div className="p-3 rounded-lg border border-blue-200 dark:border-blue-900 bg-blue-50/70 dark:bg-blue-950/40 text-xs text-blue-900 dark:text-blue-200">
                <div className="flex items-center gap-1.5 font-semibold text-blue-800 dark:text-blue-300 mb-1">
                  <ShieldCheck className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                  Super Admin Remarks
                </div>
                <p className="italic text-[11px] leading-relaxed">
                  "{request.adminComment}"
                </p>
              </div>
            )}

            {/* Policy & Editability Notice Banner */}
            {isPastYear && (
              <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-100/70 dark:bg-slate-800/40 flex items-start gap-2.5 text-xs text-slate-700 dark:text-slate-300">
                <FolderArchive className="h-4 w-4 text-slate-500 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold">Closed Period Archive: </span>
                  This request belongs to a previous closed calendar year. Archived historical records are permanently locked for compliance audits and cannot be edited.
                </div>
              </div>
            )}

            {!isPastYear && isPending && (
              <div className="p-3 rounded-lg border border-amber-200 dark:border-amber-900/60 bg-amber-50/60 dark:bg-amber-950/30 flex items-start gap-2.5 text-xs text-amber-800 dark:text-amber-300">
                <Clock className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold">Editable Status: </span>
                  This request is awaiting Super Admin evaluation. You may freely modify dates and reasons until a review decision is reached.
                </div>
              </div>
            )}

            {isApproved && (
              <div className="p-3 rounded-lg border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/60 dark:bg-emerald-950/30 flex items-start gap-2.5 text-xs text-emerald-800 dark:text-emerald-300">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold">Locked (Approved): </span>
                  This leave has been officially sanctioned by the Super Admin. Approved leave records are permanent and cannot be modified or deleted.
                </div>
              </div>
            )}

            {isRejected && (
              <div className="p-3 rounded-lg border border-red-200 dark:border-red-900/60 bg-red-50/60 dark:bg-red-950/30 flex items-start gap-2.5 text-xs text-red-800 dark:text-red-300">
                <AlertCircle className="h-4 w-4 text-red-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold">Locked (Rejected): </span>
                  This application was reviewed and rejected by the Super Admin. Rejected leave requests cannot be edited. If needed, please submit a fresh application.
                </div>
              </div>
            )}

            {/* Actions Footer */}
            <div className="pt-2 flex items-center justify-between border-t border-slate-100 dark:border-slate-800">
              <Button
                variant="outline"
                size="sm"
                onClick={onClose}
                className="text-xs font-medium border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shadow-none"
              >
                Close
              </Button>

              {isPending ? (
                <Button
                  size="sm"
                  onClick={handleStartEditing}
                  className="text-xs gap-1.5 bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Pencil className="h-3.5 w-3.5" />
                  Edit Request
                </Button>
              ) : (
                <div className="text-[11px] text-slate-400 dark:text-slate-500 flex items-center gap-1">
                  <ShieldAlert className="h-3.5 w-3.5" />
                  Application Locked ({request.status})
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Edit Form */
          <form onSubmit={handleSaveEdit} className="p-5 space-y-4">
            {errorMsg && (
              <div className="p-2.5 rounded-lg bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 text-xs text-red-600 dark:text-red-400 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="editType" className="text-xs font-semibold">
                Leave Type *
              </Label>
              <Select
                value={editType}
                onValueChange={(val: LeaveType) => setEditType(val)}
              >
                <SelectTrigger id="editType" className="h-9 text-xs">
                  <SelectValue placeholder="Select leave category" />
                </SelectTrigger>
                <SelectContent>
                  {leaveTypeOptions.map(t => (
                    <SelectItem key={t} value={t} className="text-xs">
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="editStartDate" className="text-xs font-semibold">
                  Start Date *
                </Label>
                <Input
                  id="editStartDate"
                  type="date"
                  value={editStartDate}
                  onChange={e => setEditStartDate(e.target.value)}
                  className="h-9 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="editEndDate" className="text-xs font-semibold">
                  End Date *
                </Label>
                <Input
                  id="editEndDate"
                  type="date"
                  value={editEndDate}
                  onChange={e => setEditEndDate(e.target.value)}
                  className="h-9 text-xs"
                />
              </div>
            </div>

            {/* Calculated Days Preview */}
            <div className="p-2.5 rounded-lg bg-blue-50/60 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-900/60 flex items-center justify-between text-xs text-blue-900 dark:text-blue-300">
              <span className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                Calculated Duration:
              </span>
              <span className="font-bold">
                {calculatedDays} {calculatedDays === 1 ? "day" : "days"}
              </span>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="editReason" className="text-xs font-semibold">
                Reason for Leave *
              </Label>
              <Textarea
                id="editReason"
                rows={4}
                value={editReason}
                onChange={e => setEditReason(e.target.value)}
                placeholder="State the purpose and circumstances for your requested leave..."
                className="text-xs resize-none"
              />
              <span className="text-[10px] text-slate-400 dark:text-slate-500">
                Minimum 5 characters. Be descriptive to assist Super Admin evaluation.
              </span>
            </div>

            {/* Edit Action Buttons */}
            <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleCancelEditing}
                className="text-xs gap-1"
              >
                <Undo2 className="h-3.5 w-3.5" />
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                className="text-xs gap-1.5 bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Save className="h-3.5 w-3.5" />
                Save Changes
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
