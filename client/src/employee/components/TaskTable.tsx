import React, { useState, useMemo, useEffect } from "react"
import { cn } from "@/lib/utils"
import { EmployeeTask, TaskProgress as TaskProgressType, TaskFilterType } from "../types/task"
import { useEmployee } from "../context/EmployeeContext"
import { deriveTaskStatus, isTaskCompletedLate } from "../utils/taskStatus"
import { formatDeadline } from "../utils/date"
import { TaskStatusBadge } from "./TaskStatusBadge"
import { TaskProgress } from "./TaskProgress"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Search,
  Plus,
  MoreVertical,
  CheckCircle,
  Clock,
  AlertTriangle,
  Info,
  Calendar,
  Layers,
  FileText,
  ChevronLeft,
  ChevronRight,
  Edit3,
  Save,
  FileEdit,
  ArrowRightCircle,
} from "lucide-react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"

// Schema for adding a task
const addTaskSchema = z.object({
  title: z.string().min(3, "Task title must be at least 3 characters").max(100),
  category: z.string().min(2, "Category is required"),
  deadline: z.string().min(1, "Deadline is required"),
  description: z.string().optional(),
})

type AddTaskFormData = z.infer<typeof addTaskSchema>

export interface TaskTableProps {
  className?: string
  style?: React.CSSProperties
  enablePagination?: boolean
  pageSize?: number
}

export const TaskTable: React.FC<TaskTableProps> = ({
  className,
  style,
  enablePagination = false,
  pageSize = 10,
}) => {
  const { tasks, taskCounts, updateTaskProgress, updateTaskComment, markTaskComplete, addTask } = useEmployee()

  // Filter & Search states
  const [activeFilter, setActiveFilter] = useState<TaskFilterType>("all")
  const [searchQuery, setSearchQuery] = useState("")

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)

  // Reset to page 1 whenever active filter or search query changes
  useEffect(() => {
    setCurrentPage(1)
  }, [activeFilter, searchQuery])

  // Dialog states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<EmployeeTask | null>(null)
  const [selectedProgress, setSelectedProgress] = useState<TaskProgressType>(0)
  const [progressComment, setProgressComment] = useState("")
  const [commentError, setCommentError] = useState("")
  const [viewingTask, setViewingTask] = useState<EmployeeTask | null>(null)
  const [isEditingNote, setIsEditingNote] = useState(false)
  const [editedNoteText, setEditedNoteText] = useState("")

  // React Hook Form for Add Task
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AddTaskFormData>({
    resolver: zodResolver(addTaskSchema),
    defaultValues: {
      category: "Feature Work",
      deadline: new Date(Date.now() + 4 * 3600 * 1000).toISOString().slice(0, 16),
    },
  })

  // Filter tasks dynamically using centralized derivation
  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      const currentStatus = deriveTaskStatus(task)
      const matchesFilter =
        activeFilter === "all" ||
        (activeFilter === "pending" && currentStatus === "pending") ||
        (activeFilter === "in-progress" && currentStatus === "in-progress") ||
        (activeFilter === "completed" && currentStatus === "completed") ||
        (activeFilter === "overdue" && currentStatus === "overdue")

      const matchesSearch =
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (task.category && task.category.toLowerCase().includes(searchQuery.toLowerCase()))

      return matchesFilter && matchesSearch
    })
  }, [tasks, activeFilter, searchQuery])

  // Pagination calculations
  const totalPages = Math.max(1, Math.ceil(filteredTasks.length / pageSize))
  const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages)

  const displayedTasks = useMemo(() => {
    if (!enablePagination) return filteredTasks
    const startIndex = (safeCurrentPage - 1) * pageSize
    return filteredTasks.slice(startIndex, startIndex + pageSize)
  }, [filteredTasks, enablePagination, safeCurrentPage, pageSize])

  // Open progress update modal
  const handleOpenProgressModal = (task: EmployeeTask) => {
    setEditingTask(task)
    setSelectedProgress(task.progress)
    setProgressComment(task.comment || "")
    setCommentError("")
  }

  // Handle progress submission
  const handleSaveProgress = () => {
    if (!editingTask) return

    const currentStatus = deriveTaskStatus(editingTask)
    // Rule: When an overdue task is updated, require a reason/comment in the UI
    if (currentStatus === "overdue" && selectedProgress < 100 && !progressComment.trim()) {
      setCommentError("An explanation comment is mandatory when updating an overdue task.")
      return
    }

    updateTaskProgress(editingTask.id, selectedProgress, progressComment)
    setEditingTask(null)
  }

  // Add Task submit
  const onAddTaskSubmit = (data: AddTaskFormData) => {
    addTask({
      title: data.title,
      category: data.category,
      deadline: new Date(data.deadline).toISOString(),
      description: data.description,
      isSelfCreated: true,
    })
    reset()
    setIsAddModalOpen(false)
  }

  const filterTabs: { id: TaskFilterType; label: string; count: number; color?: string }[] = [
    { id: "all", label: "All Tasks", count: taskCounts.all },
    { id: "pending", label: "Pending", count: taskCounts.pending },
    { id: "in-progress", label: "In Progress", count: taskCounts.inProgress, color: "text-amber-600" },
    { id: "completed", label: "Completed", count: taskCounts.completed, color: "text-emerald-600" },
    { id: "overdue", label: "Overdue", count: taskCounts.overdue, color: "text-red-600" },
  ]

  return (
    <Card
      style={style}
      className={cn(
        "border-slate-200/90 dark:border-slate-800 shadow-sm overflow-hidden bg-white dark:bg-slate-900 flex flex-col",
        className
      )}
    >
      {/* Header with Title and Add Task */}
      <CardHeader className="p-5 pb-4 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 shrink-0">
        <div>
          <CardTitle className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            Today's Tasks
            <span className="text-xs font-normal text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
              {tasks.length} total
            </span>
          </CardTitle>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Manage your daily assignments, update progress, and log status
          </p>
        </div>

        <Button
          onClick={() => setIsAddModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium h-9 gap-1.5 shadow-sm self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          Add Task
        </Button>
      </CardHeader>

      <CardContent className="p-0 flex-1 min-h-0 flex flex-col overflow-hidden">
        {/* Filters and Search Bar */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/60 flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between shrink-0">
          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            {filterTabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveFilter(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1.5 border ${
                  activeFilter === tab.id
                    ? "bg-white dark:bg-slate-800 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800 shadow-sm font-semibold"
                    : "bg-transparent text-slate-600 dark:text-slate-400 border-transparent hover:bg-slate-200/60 dark:hover:bg-slate-800/60"
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`text-[11px] px-1.5 py-0.2 rounded-full ${
                    activeFilter === tab.id
                      ? "bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 font-bold"
                      : "bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-medium"
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative w-full md:w-64 shrink-0">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              type="text"
              placeholder="Search tasks or categories..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-8 h-9 text-xs bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100"
            />
          </div>
        </div>

        {/* Task Table (CRITICAL: NO Time Allotted column!) */}
        <div className="flex-1 min-h-0 overflow-y-auto overflow-x-auto scrollbar-thin">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 z-10 bg-slate-50/95 dark:bg-slate-900/95 backdrop-blur-sm border-b border-slate-200 dark:border-slate-800 shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
              <tr className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-4 w-10 text-center">#</th>
                <th className="py-3 px-4">Task Details</th>
                <th className="py-3 px-4 hidden sm:table-cell">Category</th>
                <th className="py-3 px-4">Deadline</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 w-40">Progress</th>
                <th className="py-3 px-4 text-right w-16">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
              {displayedTasks.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-400">
                        <FileText className="h-6 w-6" />
                      </div>
                      <p className="font-medium text-slate-600 dark:text-slate-300 text-sm">No tasks found</p>
                      <p className="text-xs text-slate-400 max-w-xs">
                        {searchQuery
                          ? `No tasks matching "${searchQuery}" in ${activeFilter} filter.`
                          : `There are currently no tasks in the ${activeFilter} category.`}
                      </p>
                      {activeFilter !== "all" && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setActiveFilter("all")
                            setSearchQuery("")
                          }}
                          className="mt-2 text-xs"
                        >
                          Clear Filters
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                displayedTasks.map((task, idx) => {
                  const currentStatus = deriveTaskStatus(task)
                  const isCompleted = currentStatus === "completed"
                  const displayIndex = enablePagination
                    ? (safeCurrentPage - 1) * pageSize + idx + 1
                    : idx + 1

                  return (
                    <tr
                      key={task.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors group"
                    >
                      {/* Row index / indicator */}
                      <td className="py-3 px-4 text-center font-mono text-[11px] text-slate-400">
                        {displayIndex}
                      </td>

                      {/* Task Title & Meta */}
                      <td className="py-3 px-4">
                        <div className="flex flex-col">
                          <span
                            className={`font-semibold text-slate-800 dark:text-slate-200 ${
                              isCompleted ? "line-through text-slate-400 dark:text-slate-500" : ""
                            }`}
                          >
                            {task.title}
                          </span>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[11px] text-slate-400 font-mono">
                              {task.id}
                            </span>
                            {task.isSelfCreated && (
                              <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-1.5 py-0.2 rounded font-medium">
                                Self-added
                              </span>
                            )}
                            {task.comment && (
                              <span className="text-[10px] text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 px-1.5 py-0.2 rounded border border-amber-200 dark:border-amber-800 flex items-center gap-1">
                                <AlertTriangle className="h-2.5 w-2.5" /> Note
                              </span>
                            )}
                            {task.carriedOverFrom && (
                              <span className="text-[10px] text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/70 px-1.5 py-0.2 rounded border border-blue-200 dark:border-blue-800 flex items-center gap-1 font-medium">
                                <ArrowRightCircle className="h-2.5 w-2.5 text-blue-500" /> Carried over from {task.carriedOverFrom}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3 px-4 hidden sm:table-cell">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[11px] font-medium">
                          <Layers className="h-3 w-3 text-slate-400" />
                          {task.category || "General"}
                        </span>
                      </td>

                      {/* Deadline (CRITICAL: Required, but NO allocated time!) */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300 font-medium text-xs">
                          <Calendar className="h-3.5 w-3.5 text-slate-400" />
                          <span>{formatDeadline(task.deadline)}</span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <TaskStatusBadge status={currentStatus} isLate={isTaskCompletedLate(task)} />
                      </td>

                      {/* Progress */}
                      <td className="py-3 px-4">
                        <TaskProgress progress={task.progress} status={currentStatus} />
                      </td>

                      {/* Actions Menu */}
                      <td className="py-3 px-4 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                              aria-label={`Actions for ${task.title}`}
                            >
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-44 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100">
                            <DropdownMenuItem
                              onClick={() => {
                                setViewingTask(task)
                                setIsEditingNote(false)
                              }}
                            >
                              <Info className="h-3.5 w-3.5 mr-2 text-slate-500" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                setViewingTask(task)
                                setEditedNoteText(task.comment || "")
                                setIsEditingNote(true)
                              }}
                            >
                              <FileEdit className="h-3.5 w-3.5 mr-2 text-amber-600" />
                              {task.comment ? "Edit Delay Note" : "Add Delay Note"}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleOpenProgressModal(task)}>
                              <Clock className="h-3.5 w-3.5 mr-2 text-blue-600" />
                              Update Progress
                            </DropdownMenuItem>
                            {!isCompleted && (
                              <DropdownMenuItem
                                onClick={() => markTaskComplete(task.id)}
                                className="text-emerald-700 focus:text-emerald-800"
                              >
                                <CheckCircle className="h-3.5 w-3.5 mr-2 text-emerald-600" />
                                Mark Completed
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        {enablePagination && filteredTasks.length > 0 && (
          <div className="p-3 sm:px-5 sm:py-3.5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/70 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400 shrink-0">
            <div className="text-[11px] sm:text-xs">
              Showing{" "}
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                {(safeCurrentPage - 1) * pageSize + 1}
              </span>{" "}
              to{" "}
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                {Math.min(safeCurrentPage * pageSize, filteredTasks.length)}
              </span>{" "}
              of{" "}
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                {filteredTasks.length}
              </span>{" "}
              tasks
            </div>

            <div className="flex items-center gap-1.5">
              <Button
                variant="outline"
                size="sm"
                disabled={safeCurrentPage <= 1}
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                className="h-8 px-2.5 text-xs border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 disabled:opacity-40"
              >
                <ChevronLeft className="h-3.5 w-3.5 mr-1" />
                Previous
              </Button>

              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={cn(
                      "h-8 min-w-[32px] px-2 rounded-md font-medium transition-colors text-xs border",
                      safeCurrentPage === page
                        ? "bg-blue-600 border-blue-600 text-white font-bold shadow-sm"
                        : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                    )}
                  >
                    {page}
                  </button>
                ))}
              </div>

              <Button
                variant="outline"
                size="sm"
                disabled={safeCurrentPage >= totalPages}
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                className="h-8 px-2.5 text-xs border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 disabled:opacity-40"
              >
                Next
                <ChevronRight className="h-3.5 w-3.5 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>

      {/* Progress Update Dialog */}
      <Dialog
        open={Boolean(editingTask)}
        onOpenChange={open => !open && setEditingTask(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-slate-900 flex items-center gap-2">
              <Clock className="h-4 w-4 text-blue-600" />
              Update Task Progress
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Update progress milestones (0%, 25%, 50%, 75%, 100%) for:
              <br />
              <strong className="text-slate-800 font-semibold">{editingTask?.title}</strong>
            </DialogDescription>
          </DialogHeader>

          {editingTask && (
            <div className="space-y-4 py-2">
              {/* Overdue Alert banner if task is overdue */}
              {deriveTaskStatus(editingTask) === "overdue" && (
                <div className="flex items-start gap-2.5 p-3 rounded-lg bg-red-50 border border-red-200 text-red-800 text-xs">
                  <AlertTriangle className="h-4 w-4 shrink-0 text-red-600 mt-0.5" />
                  <div>
                    <p className="font-semibold">This task is past its deadline (Overdue)</p>
                    <p className="text-[11px] mt-0.5 text-red-700">
                      An explanation comment is required to record the cause of delay.
                    </p>
                  </div>
                </div>
              )}

              {/* Progress Milestones: 0%, 25%, 50%, 75%, 100% */}
              <div className="space-y-2">
                <Label>Select Completion Progress</Label>
                <div className="grid grid-cols-5 gap-2">
                  {([0, 25, 50, 75, 100] as TaskProgressType[]).map(val => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => {
                        setSelectedProgress(val)
                        if (val === 100) setCommentError("")
                      }}
                      className={`py-2 px-1 text-xs font-bold rounded-lg border transition-all text-center ${
                        selectedProgress === val
                          ? "bg-blue-600 text-white border-blue-600 shadow-sm scale-102"
                          : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/60"
                      }`}
                    >
                      {val}%
                    </button>
                  ))}
                </div>
              </div>

              {/* Progress preview */}
              <div className="space-y-1 bg-slate-50 dark:bg-slate-800/60 p-3 rounded-lg border border-slate-100 dark:border-slate-800">
                <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400 mb-1">
                  <span>Selected Value:</span>
                  <span className="font-bold text-slate-900 dark:text-slate-100">{selectedProgress}%</span>
                </div>
                <TaskProgress progress={selectedProgress} showLabel={false} />
              </div>

              {/* Comment / Delay Reason field */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <Label htmlFor="progress-comment">
                    {deriveTaskStatus(editingTask) === "overdue"
                      ? "Explanation / Reason for Delay *"
                      : "Progress Note / Comment (Optional)"}
                  </Label>
                  {deriveTaskStatus(editingTask) === "overdue" && (
                    <span className="text-[11px] text-red-600 dark:text-red-400 font-medium">Required</span>
                  )}
                </div>
                <Textarea
                  id="progress-comment"
                  placeholder={
                    deriveTaskStatus(editingTask) === "overdue"
                      ? "Explain why the task took extra time or what blocker was encountered..."
                      : "Optional updates or notes..."
                  }
                  value={progressComment}
                  onChange={e => {
                    setProgressComment(e.target.value)
                    if (commentError) setCommentError("")
                  }}
                  className="text-xs min-h-[75px]"
                />
                {commentError && (
                  <p className="text-[11px] text-red-600 dark:text-red-400 font-medium">{commentError}</p>
                )}
              </div>
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setEditingTask(null)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handleSaveProgress}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Save Progress
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Task Details Dialog */}
      <Dialog
        open={Boolean(viewingTask)}
        onOpenChange={open => !open && setViewingTask(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded">
                {viewingTask?.id}
              </span>
              {viewingTask && (
                <TaskStatusBadge
                  status={deriveTaskStatus(viewingTask)}
                  isLate={isTaskCompletedLate(viewingTask)}
                />
              )}
            </div>
            <DialogTitle className="text-slate-900 dark:text-slate-100 text-base">{viewingTask?.title}</DialogTitle>
            <DialogDescription className="text-xs text-slate-500 dark:text-slate-400">
              {viewingTask?.category || "General"}
            </DialogDescription>
          </DialogHeader>

          {viewingTask && (
            <div className="space-y-4 text-xs py-2">
              {viewingTask.description && (
                <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-lg border border-slate-100 dark:border-slate-800 text-slate-700 dark:text-slate-300">
                  <p className="font-semibold text-slate-800 dark:text-slate-200 mb-1">Description:</p>
                  <p className="leading-relaxed">{viewingTask.description}</p>
                </div>
              )}

              {/* Carried-over Task Context */}
              {viewingTask.carriedOverFrom && (
                <div className="p-2.5 bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200/90 dark:border-blue-800/80 rounded-lg text-xs flex items-start gap-2 text-blue-800 dark:text-blue-300">
                  <ArrowRightCircle className="h-4 w-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                  <div className="space-y-0.5">
                    <p className="font-semibold text-blue-900 dark:text-blue-200">
                      Carried Over from {viewingTask.carriedOverFrom}
                    </p>
                    <p className="text-[11px] text-blue-700/90 dark:text-blue-300/80 leading-relaxed">
                      {viewingTask.carriedOverNotes || `This task was in progress on ${viewingTask.carriedOverFrom} and carried forward into today's shift. Once completed, today's EOD will record it as a completed deliverable.`}
                    </p>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-lg border border-slate-100 dark:border-slate-800">
                <div>
                  <span className="text-slate-400 dark:text-slate-500 block text-[11px]">Deadline</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {formatDeadline(viewingTask.deadline)}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 dark:text-slate-500 block text-[11px]">Current Progress</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{viewingTask.progress}%</span>
                </div>
                <div>
                  <span className="text-slate-400 dark:text-slate-500 block text-[11px]">Created By</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {viewingTask.isSelfCreated ? "Employee (Self-Added)" : "Admin Assigned"}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 dark:text-slate-500 block text-[11px]">Completed At</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 flex-wrap">
                    <span>
                      {viewingTask.completedAt
                        ? formatDeadline(viewingTask.completedAt)
                        : "Not yet completed"}
                    </span>
                    {isTaskCompletedLate(viewingTask) && (
                      <span className="text-[10px] font-semibold text-amber-700 dark:text-amber-300 bg-amber-100/80 dark:bg-amber-950/80 px-1.5 py-0.2 rounded border border-amber-300 dark:border-amber-800">
                        Completed Late
                      </span>
                    )}
                  </span>
                </div>
              </div>

              {/* Progress Note / Delay Reason Area with Edit Functionality */}
              {(deriveTaskStatus(viewingTask) === "overdue" || viewingTask.comment || isTaskCompletedLate(viewingTask) || isEditingNote) && (
                <div className="p-3 bg-amber-50/80 dark:bg-amber-950/40 rounded-lg border border-amber-200/90 dark:border-amber-800/70 text-amber-900 dark:text-amber-200 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-semibold flex items-center gap-1.5 text-amber-800 dark:text-amber-300">
                      <AlertTriangle className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
                      <span>
                        {isTaskCompletedLate(viewingTask)
                          ? "Completion Delay Reason / Progress Note:"
                          : "Latest Progress Note / Delay Reason:"}
                      </span>
                    </p>
                    {!isEditingNote && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setEditedNoteText(viewingTask.comment || "")
                          setIsEditingNote(true)
                        }}
                        className="h-6 px-2 text-[11px] font-semibold text-amber-800 dark:text-amber-300 hover:text-amber-950 dark:hover:text-amber-100 hover:bg-amber-100/80 dark:hover:bg-amber-900/60 gap-1 rounded"
                      >
                        <Edit3 className="h-3 w-3" />
                        {viewingTask.comment ? "Edit Note" : "+ Add Note"}
                      </Button>
                    )}
                  </div>

                  {isEditingNote ? (
                    <div className="space-y-2 pt-1">
                      <Textarea
                        value={editedNoteText}
                        onChange={(e) => setEditedNoteText(e.target.value)}
                        placeholder="Explain the cause of delay, resolution progress, or notes..."
                        className="text-xs min-h-[75px] bg-white dark:bg-slate-900 border-amber-300 dark:border-amber-800 focus:ring-amber-500 text-slate-800 dark:text-slate-100"
                      />
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setIsEditingNote(false)}
                          className="h-7 text-xs px-2.5"
                        >
                          Cancel
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          onClick={() => {
                            updateTaskComment(viewingTask.id, editedNoteText)
                            setViewingTask(prev => prev ? { ...prev, comment: editedNoteText.trim() } : null)
                            setIsEditingNote(false)
                          }}
                          className="h-7 text-xs px-2.5 bg-amber-600 hover:bg-amber-700 text-white gap-1"
                        >
                          <Save className="h-3 w-3" />
                          Save Note
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs italic leading-relaxed">
                      {viewingTask.comment || (
                        <span className="text-amber-700/80 dark:text-amber-400/80 not-italic">
                          No delay reason recorded yet. Click "Edit Note" above to provide an explanation note.
                        </span>
                      )}
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setViewingTask(null)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Task Modal with Zod Validation */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Plus className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              Add Self-Assigned Task
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500 dark:text-slate-400">
              Log ad-hoc or self-directed work directly into your daily task list.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(onAddTaskSubmit)} className="space-y-3.5 py-1">
            <div className="space-y-1">
              <Label htmlFor="task-title">Task Title *</Label>
              <Input
                id="task-title"
                placeholder="e.g. Audit accessibility tags and ARIA attributes"
                {...register("title")}
                className="text-xs"
              />
              {errors.title && (
                <p className="text-[11px] text-red-600">{errors.title.message}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="task-category">Category *</Label>
                <Input
                  id="task-category"
                  placeholder="e.g. Frontend, Design, Bug"
                  {...register("category")}
                  className="text-xs"
                />
                {errors.category && (
                  <p className="text-[11px] text-red-600">{errors.category.message}</p>
                )}
              </div>

              {/* Deadline only - NO allocated duration */}
              <div className="space-y-1">
                <Label htmlFor="task-deadline">Deadline *</Label>
                <Input
                  id="task-deadline"
                  type="datetime-local"
                  {...register("deadline")}
                  className="text-xs"
                />
                {errors.deadline && (
                  <p className="text-[11px] text-red-600">{errors.deadline.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="task-description">Description (Optional)</Label>
              <Textarea
                id="task-description"
                placeholder="Key scope, objectives, or testing details..."
                {...register("description")}
                className="text-xs min-h-[60px]"
              />
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsAddModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={isSubmitting}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Create Task
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
