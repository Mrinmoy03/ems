import React, { useState, useMemo } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../../components/ui/dialog"
import { Button } from "../../components/ui/button"
import { Badge } from "../../components/ui/badge"
import { Input } from "../../components/ui/input"
import { AdminEmployee, AdminTask } from "../types/admin"
import { useAdmin } from "../context/AdminContext"
import { TaskStatusBadge } from "../../employee/components/TaskStatusBadge"
import { DeadlineChangeDialog } from "./DeadlineChangeDialog"
import { TaskAssignmentDialog } from "./TaskAssignmentDialog"
import { DataPagination } from "@/components/common/DataPagination"
import {
  CheckSquare,
  Clock,
  CalendarClock,
  UserCheck,
  ShieldCheck,
  Search,
  Plus,
  AlertCircle,
} from "lucide-react"

interface EmployeeDedicatedTasksDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  employee: AdminEmployee | null
}

export const EmployeeDedicatedTasksDialog: React.FC<EmployeeDedicatedTasksDialogProps> = ({
  open,
  onOpenChange,
  employee,
}) => {
  const { tasks } = useAdmin()

  const [searchQuery, setSearchQuery] = useState("")
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>("all")
  const [selectedTaskForDeadline, setSelectedTaskForDeadline] = useState<AdminTask | null>(null)
  const [isAssignTaskOpen, setIsAssignTaskOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [pageSize, setPageSize] = useState<number>(10)

  // Reset page when filters change
  React.useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, selectedStatusFilter, employee?.id])

  // Get all tasks dedicated to this employee
  const employeeTasks = useMemo(() => {
    if (!employee) return []
    return tasks.filter(t => t.assignedTo && t.assignedTo.includes(employee.id))
  }, [tasks, employee])

  // Filter tasks by search and status
  const filteredTasks = useMemo(() => {
    return employeeTasks.filter(task => {
      const matchSearch =
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (task.category || "").toLowerCase().includes(searchQuery.toLowerCase())

      const matchStatus =
        selectedStatusFilter === "all" || task.status === selectedStatusFilter

      return matchSearch && matchStatus
    })
  }, [employeeTasks, searchQuery, selectedStatusFilter])

  // Pagination calculations
  const totalPages = Math.max(1, Math.ceil(filteredTasks.length / pageSize))
  const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages)
  const displayedTasks = useMemo(() => {
    const startIndex = (safeCurrentPage - 1) * pageSize
    return filteredTasks.slice(startIndex, startIndex + pageSize)
  }, [filteredTasks, safeCurrentPage, pageSize])

  if (!employee) return null

  const isSelfAssigned = (task: AdminTask) => {
    if (task.isSelfCreated) return true
    if (!task.assignedBy) return false
    const assignedByLower = task.assignedBy.toLowerCase()
    return (
      assignedByLower === "self" ||
      task.assignedBy === employee.id ||
      assignedByLower === employee.name.toLowerCase() ||
      assignedByLower.includes("self")
    )
  }

  const formatDeadline = (dStr: string) => {
    const d = new Date(dStr)
    return isNaN(d.getTime())
      ? dStr
      : d.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
          hour: "numeric",
          minute: "2-digit",
        })
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[760px] max-h-[90vh] overflow-y-auto p-6">
          <DialogHeader className="space-y-3 pb-2 border-b border-slate-100 dark:border-slate-800">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <img
                  src={employee.avatar}
                  alt={employee.name}
                  className="w-12 h-12 rounded-xl object-cover border-2 border-indigo-100 dark:border-indigo-950 shadow-sm shrink-0"
                />
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <DialogTitle className="text-lg font-bold text-slate-900 dark:text-slate-100">
                      Dedicated Tasks: {employee.name}
                    </DialogTitle>
                    <span className="font-mono text-xs px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium">
                      {employee.id}
                    </span>
                  </div>
                  <DialogDescription className="text-xs text-slate-500 mt-0.5">
                    {employee.designation} &bull; {employee.department} &bull;{" "}
                    <strong className="text-slate-700 dark:text-slate-300">
                      {employeeTasks.length} total tasks
                    </strong>
                  </DialogDescription>
                </div>
              </div>

              <Button
                size="sm"
                onClick={() => setIsAssignTaskOpen(true)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs h-8 flex items-center gap-1.5 shrink-0 self-start sm:self-auto"
              >
                <Plus className="w-3.5 h-3.5" />
                Assign Task
              </Button>
            </div>

            {/* Filter toolbar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 pt-2">
              <div className="relative flex-1 max-w-xs">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5 pointer-events-none" />
                <Input
                  placeholder="Filter tasks by title or category..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="pl-8 h-8 text-xs bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800"
                />
              </div>

              {/* Status filter pills */}
              <div className="flex items-center gap-1 flex-wrap">
                {(["all", "in-progress", "pending", "completed", "overdue"] as const).map(status => {
                  const isSelected = selectedStatusFilter === status
                  const count =
                    status === "all"
                      ? employeeTasks.length
                      : employeeTasks.filter(t => t.status === status).length

                  return (
                    <button
                      key={status}
                      type="button"
                      onClick={() => setSelectedStatusFilter(status)}
                      className={`text-xs px-2.5 py-1 rounded-md font-medium transition-colors capitalize ${
                        isSelected
                          ? "bg-indigo-600 text-white shadow-2xs"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                      }`}
                    >
                      {status.replace("-", " ")} ({count})
                    </button>
                  )
                })}
              </div>
            </div>
          </DialogHeader>

          {/* Task List */}
          <div className="space-y-3 py-2">
            {filteredTasks.length === 0 ? (
              <div className="py-12 text-center text-slate-400 space-y-2">
                <CheckSquare className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-700" />
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  No tasks found
                </p>
                <p className="text-xs text-slate-400">
                  {searchQuery || selectedStatusFilter !== "all"
                    ? "No tasks match your active filter."
                    : `No tasks are currently dedicated to ${employee.name}.`}
                </p>
              </div>
            ) : (
              displayedTasks.map(task => {
                const selfAssigned = isSelfAssigned(task)

                return (
                  <div
                    key={task.id}
                    className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs hover:border-indigo-200 dark:hover:border-indigo-900/60 transition-all space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2.5">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                            {task.title}
                          </h4>
                          <span className="font-mono text-[10px] text-slate-400">
                            ({task.id})
                          </span>

                          {/* Self-assigned vs Admin-assigned Indicator */}
                          {selfAssigned ? (
                            <Badge className="bg-purple-100 text-purple-700 dark:bg-purple-950/80 dark:text-purple-300 border border-purple-200 dark:border-purple-800 text-[10px] font-semibold flex items-center gap-1">
                              <UserCheck className="w-3 h-3 text-purple-600 dark:text-purple-400" />
                              Self-Assigned by Employee
                            </Badge>
                          ) : (
                            <Badge
                              variant="outline"
                              className="text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 text-[10px] font-medium flex items-center gap-1"
                            >
                              <ShieldCheck className="w-3 h-3 text-indigo-500" />
                              Assigned by {task.assignedBy || "Admin"}
                            </Badge>
                          )}
                        </div>

                        {task.description && (
                          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                            {task.description}
                          </p>
                        )}

                        {(task.delayReason || task.comment) && (
                          <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-800 text-[11px] text-amber-800 dark:text-amber-300 flex items-start gap-1.5 mt-1.5">
                            <AlertCircle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                            <span>
                              <strong>Employee Delay Explanation:</strong> {task.delayReason || task.comment}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2 self-start shrink-0">
                        <TaskStatusBadge status={task.status} />
                        <Badge
                          variant="outline"
                          className={`text-[10px] uppercase font-semibold ${
                            task.priority === "urgent"
                              ? "border-rose-300 text-rose-600 bg-rose-50 dark:bg-rose-950/40"
                              : task.priority === "high"
                              ? "border-amber-300 text-amber-600 bg-amber-50 dark:bg-amber-950/40"
                              : "border-slate-200 text-slate-600 dark:text-slate-400"
                          }`}
                        >
                          {task.priority || "medium"}
                        </Badge>
                      </div>
                    </div>

                    {/* Deadline & Modify Action Bar */}
                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                      <div className="flex items-center gap-3 text-xs text-slate-500">
                        <div className="flex items-center gap-1.5 font-mono">
                          <Clock className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                          <span>Deadline:</span>
                          <strong className="text-slate-800 dark:text-slate-200">
                            {formatDeadline(task.deadline)}
                          </strong>
                        </div>

                        {task.category && (
                          <span className="text-[11px] px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                            {task.category}
                          </span>
                        )}

                        {task.progress !== undefined && (
                          <span className="text-[11px] text-slate-500">
                            Progress: <strong>{task.progress}%</strong>
                          </span>
                        )}
                      </div>

                      {/* Modify Deadline Button */}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedTaskForDeadline(task)}
                        className="h-7 px-2.5 text-xs font-medium text-amber-700 border-amber-300 hover:bg-amber-50 dark:text-amber-400 dark:border-amber-700 dark:hover:bg-amber-950/40 flex items-center gap-1.5 self-end sm:self-auto shrink-0 shadow-2xs"
                      >
                        <CalendarClock className="w-3.5 h-3.5" />
                        Modify Deadline
                      </Button>
                    </div>

                    {/* Deadline history badge if modified previously */}
                    {task.deadlineHistory && task.deadlineHistory.length > 0 && (
                      <div className="text-[11px] text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 p-2 rounded-lg border border-amber-200/80 dark:border-amber-800 flex items-center justify-between">
                        <span className="flex items-center gap-1">
                          <CalendarClock className="w-3 h-3" />
                          Deadline adjusted {task.deadlineHistory.length}{" "}
                          {task.deadlineHistory.length === 1 ? "time" : "times"}.
                        </span>
                        <span className="italic truncate max-w-xs">
                          Latest reason: &ldquo;{task.deadlineHistory[task.deadlineHistory.length - 1].reason}&rdquo;
                        </span>
                      </div>
                    )}
                  </div>
                )
              })
            )}
          </div>

          {/* Pagination Footer with 10 / 20 / 30 selector */}
          {filteredTasks.length > 0 && (
            <div className="border-t border-slate-100 dark:border-slate-800 -mx-6 -mb-6 bg-slate-50/60 dark:bg-slate-900/60">
              <DataPagination
                currentPage={safeCurrentPage}
                totalPages={totalPages}
                totalItems={filteredTasks.length}
                pageSize={pageSize}
                pageSizeOptions={[10, 20, 30]}
                itemName="tasks"
                onPageChange={setCurrentPage}
                onPageSizeChange={setPageSize}
              />
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Deadline Modification Modal */}
      <DeadlineChangeDialog
        open={Boolean(selectedTaskForDeadline)}
        onOpenChange={open => {
          if (!open) setSelectedTaskForDeadline(null)
        }}
        task={selectedTaskForDeadline}
      />

      {/* Assign Task Modal */}
      <TaskAssignmentDialog
        open={isAssignTaskOpen}
        onOpenChange={setIsAssignTaskOpen}
        defaultEmployeeId={employee.id}
      />
    </>
  )
}
