import React, { useState } from "react"
import { AdminTask } from "../types/admin"
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
import { DeadlineChangeDialog } from "./DeadlineChangeDialog"
import { TaskAssignmentDialog } from "./TaskAssignmentDialog"
import { TaskStatusBadge } from "../../employee/components/TaskStatusBadge"
import { CalendarClock, Plus, Clock, UserCheck, ShieldCheck } from "lucide-react"



interface EmployeeTaskOverviewProps {
  employeeId: string
  employeeName: string
}

export const EmployeeTaskOverview: React.FC<EmployeeTaskOverviewProps> = ({
  employeeId,
  employeeName,
}) => {
  const { tasks } = useAdmin()
  const [selectedTaskForDeadline, setSelectedTaskForDeadline] = useState<AdminTask | null>(null)
  const [isAssignOpen, setIsAssignOpen] = useState(false)

  // Filter tasks assigned to this employee
  const employeeTasks = tasks.filter(t => t.assignedTo.includes(employeeId))

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
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
            Assigned Work Initiatives & Tasks ({employeeTasks.length})
          </h3>
          <p className="text-xs text-slate-500">
            Milestone deadlines, progress states, and administrative deadline modifications.
          </p>
        </div>
        <Button
          size="sm"
          onClick={() => setIsAssignOpen(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs h-8 flex items-center gap-1.5"
        >
          <Plus className="w-3.5 h-3.5" />
          Assign Task
        </Button>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        <Table>
          <TableHeader className="bg-slate-50/75 dark:bg-slate-800/50">
            <TableRow className="border-b border-slate-200 dark:border-slate-800">
              <TableHead className="text-xs font-semibold">Task Title</TableHead>
              <TableHead className="text-xs font-semibold">Category</TableHead>
              <TableHead className="text-xs font-semibold">Priority</TableHead>
              <TableHead className="text-xs font-semibold">Status</TableHead>
              <TableHead className="text-xs font-semibold">Target Deadline</TableHead>
              <TableHead className="text-xs font-semibold text-right">Deadline Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {employeeTasks.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-xs text-slate-500">
                  No tasks currently assigned to {employeeName}.
                </TableCell>
              </TableRow>
            ) : (
              employeeTasks.map(task => (
                <TableRow
                  key={task.id}
                  className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 border-b border-slate-100 dark:border-slate-800/60"
                >
                  <TableCell className="py-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-xs font-bold text-slate-900 dark:text-slate-100">
                        {task.title}
                      </p>
                      {task.isSelfCreated ||
                      task.assignedBy?.toLowerCase().includes("self") ||
                      task.assignedBy === employeeName ||
                      task.assignedBy === employeeId ? (
                        <Badge className="bg-purple-100 text-purple-700 dark:bg-purple-950/80 dark:text-purple-300 border border-purple-200 dark:border-purple-800 text-[10px] font-semibold flex items-center gap-1">
                          <UserCheck className="w-3 h-3 text-purple-600 dark:text-purple-400" />
                          Self-Assigned
                        </Badge>
                      ) : (
                        <Badge
                          variant="outline"
                          className="text-slate-500 border-slate-200 dark:border-slate-700 text-[10px] font-medium flex items-center gap-1"
                        >
                          <ShieldCheck className="w-3 h-3 text-indigo-500" />
                          Assigned by {task.assignedBy || "Admin"}
                        </Badge>
                      )}
                    </div>
                    {task.description && (
                      <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                        {task.description}
                      </p>
                    )}
                  </TableCell>

                  <TableCell className="py-3 text-xs text-slate-600 dark:text-slate-400">
                    {task.category}
                  </TableCell>

                  <TableCell className="py-3">
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
                  </TableCell>

                  <TableCell className="py-3">
                    <TaskStatusBadge status={task.status} />
                  </TableCell>

                  <TableCell className="py-3 text-xs font-mono text-slate-700 dark:text-slate-300">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                      <span>{formatDeadline(task.deadline)}</span>
                    </div>
                  </TableCell>

                  <TableCell className="py-3 text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedTaskForDeadline(task)}
                      className="h-7 px-2 text-[11px] text-amber-700 border-amber-300 hover:bg-amber-50 dark:text-amber-400 dark:border-amber-700 dark:hover:bg-amber-950/40 flex items-center gap-1 ml-auto"
                    >
                      <CalendarClock className="w-3 h-3" />
                      Modify Deadline
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <DeadlineChangeDialog
        open={Boolean(selectedTaskForDeadline)}
        onOpenChange={open => {
          if (!open) setSelectedTaskForDeadline(null)
        }}
        task={selectedTaskForDeadline}
      />

      <TaskAssignmentDialog
        open={isAssignOpen}
        onOpenChange={setIsAssignOpen}
        defaultEmployeeId={employeeId}
      />
    </div>
  )
}
