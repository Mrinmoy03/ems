import React, { useState } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { useEmployee } from "../context/EmployeeContext"
import { LeaveRequest } from "../types/leave"
import { Calendar, Plus, Clock, CheckCircle2, XCircle, ChevronRight } from "lucide-react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { differenceInCalendarDays, parseISO } from "date-fns"
import { LeaveDetailsModal } from "./LeaveDetailsModal"

const applyLeaveSchema = z
  .object({
    leaveType: z.enum([
      "Casual Leave",
      "Sick Leave",
      "Paid Leave",
      "Annual Leave",
      "Unpaid Leave",
    ] as const),
    startDate: z.string().min(1, "Start date is required"),
    endDate: z.string().min(1, "End date is required"),
    reason: z.string().min(5, "Please provide a reason of at least 5 characters"),
  })
  .refine(
    data => {
      if (!data.startDate || !data.endDate) return true
      return new Date(data.endDate) >= new Date(data.startDate)
    },
    {
      message: "End date must be on or after start date",
      path: ["endDate"],
    }
  )
  .refine(
    data => {
      if (!data.startDate) return true
      return new Date(data.startDate).getFullYear() >= new Date().getFullYear()
    },
    {
      message: "Cannot apply for leave in a past calendar year (previous years are closed)",
      path: ["startDate"],
    }
  )

type ApplyLeaveFormData = z.infer<typeof applyLeaveSchema>

interface LeaveRequestSummaryProps {
  selectedYear?: string
}

export const LeaveRequestSummary: React.FC<LeaveRequestSummaryProps> = ({ selectedYear }) => {
  const { leaveRequests, applyForLeave } = useEmployee()
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false)
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null)

  const currentCalendarYear = React.useMemo(() => new Date().getFullYear(), [])
  const isPastYear = Boolean(selectedYear && Number(selectedYear) < currentCalendarYear)

  // Filter requests strictly for the active or selected year (if specified)
  const yearFilteredRequests = React.useMemo(() => {
    if (!selectedYear) return leaveRequests
    return leaveRequests.filter(req => req.startDate.startsWith(selectedYear))
  }, [leaveRequests, selectedYear])

  const selectedRequest = React.useMemo(() => {
    return leaveRequests.find(r => r.id === selectedRequestId) || null
  }, [leaveRequests, selectedRequestId])

  const todayDate = React.useMemo(() => new Date().toISOString().slice(0, 10), [])

  const {
    control,
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ApplyLeaveFormData>({
    resolver: zodResolver(applyLeaveSchema),
    defaultValues: {
      leaveType: "Casual Leave",
      startDate: todayDate,
      endDate: todayDate,
      reason: "",
    },
  })

  // Synchronize form default dates when apply modal opens
  React.useEffect(() => {
    if (isApplyModalOpen) {
      reset({
        leaveType: "Casual Leave",
        startDate: todayDate,
        endDate: todayDate,
        reason: "",
      })
    }
  }, [isApplyModalOpen, todayDate, reset])

  const watchStartDate = watch("startDate")
  const watchEndDate = watch("endDate")

  const calculatedDays = React.useMemo(() => {
    if (!watchStartDate || !watchEndDate) return 1
    try {
      const diff = differenceInCalendarDays(
        parseISO(watchEndDate),
        parseISO(watchStartDate)
      )
      return Math.max(1, diff + 1)
    } catch {
      return 1
    }
  }, [watchStartDate, watchEndDate])

  const onSubmit = (data: ApplyLeaveFormData) => {
    applyForLeave({
      leaveType: data.leaveType,
      startDate: data.startDate,
      endDate: data.endDate,
      daysCount: calculatedDays,
      reason: data.reason,
    })
    reset()
    setIsApplyModalOpen(false)
  }

  const getStatusBadge = (status: LeaveRequest["status"]) => {
    switch (status) {
      case "approved":
        return (
          <Badge variant="success" className="text-[11px] gap-1 font-medium">
            <CheckCircle2 className="h-3 w-3" /> Approved
          </Badge>
        )
      case "rejected":
        return (
          <Badge variant="destructive" className="text-[11px] gap-1 font-medium">
            <XCircle className="h-3 w-3" /> Rejected
          </Badge>
        )
      case "pending":
      default:
        return (
          <Badge variant="warning" className="text-[11px] gap-1 font-medium">
            <Clock className="h-3 w-3" /> Pending Review
          </Badge>
        )
    }
  }

  return (
    <>
      <Card className="border-slate-200/90 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900">
        <CardHeader className="p-4 pb-2 border-b border-slate-100 dark:border-slate-800 flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 rounded-lg">
              <Calendar className="h-4 w-4" />
            </div>
            <CardTitle className="text-sm font-semibold text-slate-800 dark:text-slate-100">
              Leave Requests
            </CardTitle>
          </div>
          {isPastYear ? (
            <span className="text-[10px] px-2 py-0.5 rounded font-mono font-medium bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
              Closed Period (Read-Only)
            </span>
          ) : (
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsApplyModalOpen(true)}
              className="h-7 text-xs gap-1 border-blue-200 dark:border-blue-900 text-blue-700 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 bg-transparent"
            >
              <Plus className="h-3 w-3" />
              Apply Leave
            </Button>
          )}
        </CardHeader>

        <CardContent className="p-4">
          <div className="space-y-2.5">
            {yearFilteredRequests.length === 0 ? (
              isPastYear ? (
                <div className="py-7 px-4 text-center rounded-lg border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20">
                  <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                    No Archived Records for {selectedYear}
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 max-w-xs mx-auto leading-relaxed">
                    This calendar year has concluded. Previous years are archived and cannot accept new leave applications.
                  </p>
                </div>
              ) : (
                <div className="py-7 px-4 text-center rounded-lg border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20">
                  <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                    No Leave Records for {selectedYear || "this year"}
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 max-w-xs mx-auto leading-relaxed">
                    Clean year slate. Zero days consumed; fresh annual leave quotas are 100% available.
                  </p>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setIsApplyModalOpen(true)}
                    className="mt-3.5 h-7 text-xs border-blue-200 dark:border-blue-900 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40"
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Apply for {selectedYear || "Leave"}
                  </Button>
                </div>
              )
            ) : (
              yearFilteredRequests.slice(0, 3).map(req => (
                <div
                  key={req.id}
                  onClick={() => setSelectedRequestId(req.id)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={e => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault()
                      setSelectedRequestId(req.id)
                    }
                  }}
                  className="group p-3 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 hover:bg-blue-50/40 dark:hover:bg-slate-800 hover:border-blue-300 dark:hover:border-blue-700/80 transition-all cursor-pointer text-xs flex flex-col gap-1.5 shadow-none hover:shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-800 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {req.leaveType}
                      </span>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-700 px-1.5 py-0.2 rounded border border-slate-200 dark:border-slate-600">
                        {req.daysCount} {req.daysCount === 1 ? "day" : "days"}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {getStatusBadge(req.status)}
                      <ChevronRight className="h-3.5 w-3.5 text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-transform group-hover:translate-x-0.5" />
                    </div>
                  </div>

                  <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between gap-2">
                    <span className="shrink-0 font-medium">
                      {req.startDate} {req.startDate !== req.endDate ? `to ${req.endDate}` : ""}
                    </span>
                    <span className="text-slate-600 dark:text-slate-300 italic line-clamp-1 text-right">
                      {req.reason}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Leave Details & Edit Modal */}
      <LeaveDetailsModal
        request={selectedRequest}
        isOpen={!!selectedRequest}
        onClose={() => setSelectedRequestId(null)}
      />

      {/* Apply for Leave Modal */}
      <Dialog open={isApplyModalOpen} onOpenChange={setIsApplyModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Calendar className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              Apply for Leave
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500 dark:text-slate-400">
              Submit your leave application for Super Admin review and approval.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5 py-1">
            <div className="space-y-1">
              <Label htmlFor="leaveType">Leave Type *</Label>
              <Controller
                control={control}
                name="leaveType"
                render={({ field }) => (
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <SelectTrigger className="text-xs">
                      <SelectValue placeholder="Select type of leave" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Casual Leave">Casual Leave</SelectItem>
                      <SelectItem value="Sick Leave">Sick Leave</SelectItem>
                      <SelectItem value="Paid Leave">Paid Leave</SelectItem>
                      <SelectItem value="Annual Leave">Annual Leave</SelectItem>
                      <SelectItem value="Unpaid Leave">Unpaid Leave</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.leaveType && (
                <p className="text-[11px] text-red-600">{errors.leaveType.message}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="startDate">Start Date *</Label>
                <Input
                  id="startDate"
                  type="date"
                  {...register("startDate")}
                  className="text-xs"
                />
                {errors.startDate && (
                  <p className="text-[11px] text-red-600">{errors.startDate.message}</p>
                )}
              </div>

              <div className="space-y-1">
                <Label htmlFor="endDate">End Date *</Label>
                <Input
                  id="endDate"
                  type="date"
                  {...register("endDate")}
                  className="text-xs"
                />
                {errors.endDate && (
                  <p className="text-[11px] text-red-600">{errors.endDate.message}</p>
                )}
              </div>
            </div>

            <div className="p-2.5 bg-blue-50/70 dark:bg-blue-950/40 rounded-md border border-blue-100 dark:border-blue-800 flex items-center justify-between text-xs text-blue-900 dark:text-blue-200">
              <span>Calculated Leave Duration:</span>
              <strong className="font-bold">
                {calculatedDays} {calculatedDays === 1 ? "Calendar Day" : "Calendar Days"}
              </strong>
            </div>

            <div className="space-y-1">
              <Label htmlFor="reason">Reason for Absence *</Label>
              <Textarea
                id="reason"
                placeholder="Describe your reason for leave..."
                {...register("reason")}
                className="text-xs min-h-[70px]"
              />
              {errors.reason && (
                <p className="text-[11px] text-red-600">{errors.reason.message}</p>
              )}
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsApplyModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={isSubmitting}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Submit Application
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
