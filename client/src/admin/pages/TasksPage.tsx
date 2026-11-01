import React, { useState, useMemo, useEffect } from "react"
import { useAdmin } from "../context/AdminContext"
import { AdminTask } from "../types/admin"
import { TaskAssignmentDialog } from "../components/TaskAssignmentDialog"
import { DeadlineChangeDialog } from "../components/DeadlineChangeDialog"
import { DataPagination } from "@/components/common/DataPagination"
import { TaskStatusBadge } from "../../employee/components/TaskStatusBadge"
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
  CheckSquare,
  Search,
  Plus,
  CalendarClock,
  Clock,
  UserCheck,
  ShieldCheck,
  AlertCircle,
  FolderKanban,
} from "lucide-react"
import { useProjects } from "../../context/ProjectContext"

export const TasksPage: React.FC = () => {
  const { tasks, employees } = useAdmin()
  const { projects } = useProjects()

  const [searchTerm, setSearchTerm] = useState("")
  const [selectedStatus, setSelectedStatus] = useState<string>("all")
  const [selectedPriority, setSelectedPriority] = useState<string>("all")
  const [selectedProject, setSelectedProject] = useState<string>("all")
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [pageSize, setPageSize] = useState<number>(10)

  // Modals state
  const [isAssignOpen, setIsAssignOpen] = useState(false)
  const [taskForDeadline, setTaskForDeadline] = useState<AdminTask | null>(null)

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, selectedStatus, selectedPriority, selectedProject])

  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      const matchSearch =
        task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (task.category || "").toLowerCase().includes(searchTerm.toLowerCase())

      const matchStatus = selectedStatus === "all" || task.status === selectedStatus
      const matchPriority = selectedPriority === "all" || task.priority === selectedPriority
      const matchProject =
        selectedProject === "all" ||
        (selectedProject === "independent" && !task.projectId) ||
        task.projectId === selectedProject

      return matchSearch && matchStatus && matchPriority && matchProject
    })
  }, [tasks, searchTerm, selectedStatus, selectedPriority, selectedProject])

  // Pagination calculations
  const totalPages = Math.max(1, Math.ceil(filteredTasks.length / pageSize))
  const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages)
  const displayedTasks = useMemo(() => {
    const startIndex = (safeCurrentPage - 1) * pageSize
    return filteredTasks.slice(startIndex, startIndex + pageSize)
  }, [filteredTasks, safeCurrentPage, pageSize])


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

  // Helper to get employee info from ID
  const getEmployee = (id: string) => employees.find(e => e.id === id)

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <CheckSquare className="w-4 h-4" />
            </div>
            <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              Task & Milestone Orchestration
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Organization-wide initiative governance: multi-assignee tracking, milestone deadlines, and audited extensions.
          </p>
        </div>

        <Button
          onClick={() => setIsAssignOpen(true)}
          className="text-xs h-9 bg-indigo-600 hover:bg-indigo-700 text-white font-medium flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>Assign New Task</span>
        </Button>
      </div>

      {/* Toolbar Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex flex-1 items-center gap-2 max-w-md relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
          <Input
            placeholder="Search tasks by title or category..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="pl-9 h-9 text-xs"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="w-36">
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="h-9 text-xs">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="w-32">
            <Select value={selectedPriority} onValueChange={setSelectedPriority}>
              <SelectTrigger className="h-9 text-xs">
                <SelectValue placeholder="All Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priority</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="w-44">
            <Select value={selectedProject} onValueChange={setSelectedProject}>
              <SelectTrigger className="h-9 text-xs">
                <SelectValue placeholder="All Projects" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Projects & Scope</SelectItem>
                <SelectItem value="independent">Independent Tasks Only</SelectItem>
                {projects.map(p => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Tasks Table */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50/75 dark:bg-slate-800/50">
              <TableRow className="border-b border-slate-200 dark:border-slate-800">
                <TableHead className="text-xs font-semibold">Initiative / Task</TableHead>
                <TableHead className="text-xs font-semibold">Category</TableHead>
                <TableHead className="text-xs font-semibold">Assigned Team</TableHead>
                <TableHead className="text-xs font-semibold">Priority</TableHead>
                <TableHead className="text-xs font-semibold">Current Status</TableHead>
                <TableHead className="text-xs font-semibold">Scheduled Deadline</TableHead>
                <TableHead className="text-xs font-semibold text-right">Deadline Audit</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTasks.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-10 text-xs text-slate-500">
                    No tasks found matching current filters.
                  </TableCell>
                </TableRow>
              ) : (
                displayedTasks.map(task => (
                  <TableRow
                    key={task.id}
                    className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 border-b border-slate-100 dark:border-slate-800/60"
                  >
                    {/* Task Title & Description */}
                    <TableCell className="py-3 max-w-xs">
                      <div className="flex items-center gap-1.5 flex-wrap mb-1">
                        <p className="text-xs font-bold text-slate-900 dark:text-slate-100">
                          {task.title}
                        </p>
                        {/* Assignment origin badge */}
                        {(task.isSelfCreated || task.assignedBy === 'Alex Morgan' || task.assignedBy === 'self' || task.assignedBy === 'Employee') ? (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                            <UserCheck className="w-2.5 h-2.5" />
                            Self-Assigned
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                            <ShieldCheck className="w-2.5 h-2.5" />
                            Admin Assigned
                          </span>
                        )}

                        {/* Project Association badge */}
                        {task.projectName && (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                            <FolderKanban className="w-2.5 h-2.5 text-indigo-500" />
                            {task.projectName}
                          </span>
                        )}
                      </div>
                      {task.description && (
                        <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                          {task.description}
                        </p>
                      )}
                      {(task.delayReason || task.comment) && (
                        <div className="mt-1.5 flex items-start gap-1 p-1.5 rounded bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-amber-800 dark:text-amber-300 text-[10px]">
                          <AlertCircle className="w-3 h-3 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                          <div>
                            <span className="font-semibold">Delay Note: </span>
                            <span>{task.delayReason || task.comment}</span>
                          </div>
                        </div>
                      )}
                    </TableCell>

                    {/* Category */}
                    <TableCell className="py-3 text-xs text-slate-600 dark:text-slate-400">
                      {task.category}
                    </TableCell>

                    {/* Multi-Assignees */}
                    <TableCell className="py-3">
                      <div className="flex items-center -space-x-1.5 overflow-hidden">
                        {task.assignedTo.map(empId => {
                          const emp = getEmployee(empId)
                          return emp ? (
                            <img
                              key={empId}
                              src={emp.avatar}
                              alt={emp.name}
                              title={`${emp.name} (${emp.designation})`}
                              className="inline-block h-6 w-6 rounded-full ring-2 ring-white dark:ring-slate-900 object-cover"
                            />
                          ) : (
                            <span
                              key={empId}
                              className="h-6 w-6 rounded-full bg-slate-200 dark:bg-slate-700 text-[10px] flex items-center justify-center font-bold ring-2 ring-white dark:ring-slate-900"
                            >
                              ?
                            </span>
                          )
                        })}
                        {task.assignedTo.length > 1 && (
                          <span className="text-[10px] text-slate-400 pl-2">
                            ({task.assignedTo.length})
                          </span>
                        )}
                      </div>
                    </TableCell>

                    {/* Priority */}
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

                    {/* Status & Milestone Progress */}
                    <TableCell className="py-3">
                      <div className="space-y-1.5">
                        <TaskStatusBadge status={task.status} />
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-300 ${
                                task.status === 'completed'
                                  ? 'bg-emerald-500'
                                  : task.status === 'overdue'
                                  ? 'bg-rose-500'
                                  : 'bg-indigo-600'
                              }`}
                              style={{ width: `${task.progress ?? (task.status === 'completed' ? 100 : task.status === 'in-progress' ? 50 : 0)}%` }}
                            />
                          </div>
                          <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400">
                            {task.progress ?? (task.status === 'completed' ? 100 : task.status === 'in-progress' ? 50 : 0)}%
                          </span>
                        </div>
                      </div>
                    </TableCell>

                    {/* Target Deadline */}
                    <TableCell className="py-3 text-xs font-mono text-slate-700 dark:text-slate-300">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                        <span>{formatDeadline(task.deadline)}</span>
                      </div>
                    </TableCell>

                    {/* Action */}
                    <TableCell className="py-3 text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setTaskForDeadline(task)}
                        className="h-7 px-2.5 text-[11px] text-amber-700 border-amber-300 hover:bg-amber-50 dark:text-amber-400 dark:border-amber-700 dark:hover:bg-amber-950/40 flex items-center gap-1.5 ml-auto"
                      >
                        <CalendarClock className="w-3.5 h-3.5" />
                        Modify Deadline
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination Footer with 10 / 20 / 30 selector */}
        {filteredTasks.length > 0 && (
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
        )}
      </div>

      {/* Dialogs */}
      <TaskAssignmentDialog
        open={isAssignOpen}
        onOpenChange={setIsAssignOpen}
      />

      <DeadlineChangeDialog
        open={Boolean(taskForDeadline)}
        onOpenChange={open => {
          if (!open) setTaskForDeadline(null)
        }}
        task={taskForDeadline}
      />
    </div>
  )
}
