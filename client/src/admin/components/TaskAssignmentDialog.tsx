import React, { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "../../components/ui/dialog"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Label } from "../../components/ui/label"
import { Textarea } from "../../components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select"
import { useAdmin } from "../context/AdminContext"
import { useProjects } from "../../context/ProjectContext"
import { CreateAdminTaskInput } from "../types/admin"
import { CheckSquare, Users, Calendar, AlertCircle, FolderKanban } from "lucide-react"

interface TaskAssignmentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  defaultEmployeeId?: string
  defaultProjectId?: string
  defaultProjectName?: string
}

export const TaskAssignmentDialog: React.FC<TaskAssignmentDialogProps> = ({
  open,
  onOpenChange,
  defaultEmployeeId,
  defaultProjectId,
  defaultProjectName: _defaultProjectName,
}) => {
  const { employees, createTask } = useAdmin()
  const { projects } = useProjects()

  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [category, setCategory] = useState("Feature Development")
  const [priority, setPriority] = useState<"low" | "medium" | "high" | "urgent">("medium")

  // Project association
  const [selectedProjectId, setSelectedProjectId] = useState<string>(defaultProjectId || "none")
  const [selectedPartId, setSelectedPartId] = useState<string>("none")

  // Default deadline: 3 days from now at 18:00
  const getDefaultDeadline = () => {
    const d = new Date()
    d.setDate(d.getDate() + 3)
    d.setHours(18, 0, 0, 0)
    return d.toISOString().slice(0, 16)
  }

  const [deadline, setDeadline] = useState(getDefaultDeadline)
  const [selectedAssignees, setSelectedAssignees] = useState<string[]>(
    defaultEmployeeId ? [defaultEmployeeId] : []
  )
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (defaultProjectId) {
      setSelectedProjectId(defaultProjectId)
    }
    if (defaultEmployeeId) {
      setSelectedAssignees([defaultEmployeeId])
    }
  }, [defaultProjectId, defaultEmployeeId, open])

  // Get active project parts
  const activeProject = projects.find(p => p.id === selectedProjectId)

  const toggleAssignee = (empId: string) => {
    setSelectedAssignees(prev =>
      prev.includes(empId) ? prev.filter(id => id !== empId) : [...prev, empId]
    )
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) {
      setError("Task title is required")
      return
    }
    if (!deadline) {
      setError("Task deadline is required")
      return
    }
    if (selectedAssignees.length === 0) {
      setError("Please select at least one assignee for this task")
      return
    }

    const partMatch = activeProject?.parts.find(p => p.id === selectedPartId)

    const input: CreateAdminTaskInput = {
      title: title.trim(),
      description: description.trim() || undefined,
      category,
      deadline: new Date(deadline).toISOString(),
      assignedTo: selectedAssignees,
      priority,
      projectId: selectedProjectId !== "none" ? selectedProjectId : undefined,
      projectName: selectedProjectId !== "none" ? activeProject?.name : undefined,
      projectPartId: selectedPartId !== "none" ? selectedPartId : undefined,
      projectPartName: partMatch?.name,
    }

    createTask(input)
    // Reset and close
    setTitle("")
    setDescription("")
    setSelectedAssignees([])
    setSelectedProjectId("none")
    setSelectedPartId("none")
    setError(null)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[620px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <CheckSquare className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold text-slate-900 dark:text-slate-100">
                Assign New Task
              </DialogTitle>
              <DialogDescription className="text-sm text-slate-500 dark:text-slate-400">
                Dispatch an initiative to one or multiple team members with a concrete deadline.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          {error && (
            <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-600 dark:text-rose-400 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="taskTitle" className="text-xs font-semibold">
              Task Title <span className="text-rose-500">*</span>
            </Label>
            <Input
              id="taskTitle"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. Implement OAuth 2.0 Security Flow"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="taskCategory" className="text-xs font-semibold">
                Category
              </Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger id="taskCategory">
                  <SelectValue placeholder="Select Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Feature Development">Feature Development</SelectItem>
                  <SelectItem value="Bug Fix & Remediation">Bug Fix & Remediation</SelectItem>
                  <SelectItem value="System Architecture">System Architecture</SelectItem>
                  <SelectItem value="Performance & Optimization">Performance & Optimization</SelectItem>
                  <SelectItem value="Design & UX Polish">Design & UX Polish</SelectItem>
                  <SelectItem value="Documentation & Auditing">Documentation & Auditing</SelectItem>
                  <SelectItem value="Security Hardening">Security Hardening</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="priority" className="text-xs font-semibold">
                Priority
              </Label>
              <Select
                value={priority}
                onValueChange={val => setPriority(val as "low" | "medium" | "high" | "urgent")}
              >
                <SelectTrigger id="priority">
                  <SelectValue placeholder="Select Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="deadline" className="text-xs font-semibold flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-indigo-500" />
              Target Deadline <span className="text-rose-500">*</span>
            </Label>
            <Input
              id="deadline"
              type="datetime-local"
              value={deadline}
              onChange={e => setDeadline(e.target.value)}
            />
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              WorkTrack operates strictly on milestone deadlines. Track progress by status updates and actual completion time.
            </p>
          </div>

          {/* Project & Work Package Association */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold flex items-center gap-1.5">
                <FolderKanban className="w-3.5 h-3.5 text-indigo-500" />
                Associated Project (Optional)
              </Label>
              <Select
                value={selectedProjectId}
                onValueChange={val => {
                  setSelectedProjectId(val)
                  setSelectedPartId("none")
                }}
              >
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue placeholder="Select Project" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Independent Task (No Project)</SelectItem>
                  {projects.map(proj => (
                    <SelectItem key={proj.id} value={proj.id}>
                      {proj.name} ({proj.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">
                Project Part / Work Package
              </Label>
              <Select
                value={selectedPartId}
                onValueChange={setSelectedPartId}
                disabled={selectedProjectId === "none"}
              >
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue placeholder="Select Part" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">General Project Scope</SelectItem>
                  {activeProject?.parts.map(part => (
                    <SelectItem key={part.id} value={part.id}>
                      {part.name} ({part.weight}%)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Multi-Employee Assignees Selector */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-semibold flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-indigo-500" />
                Assign To ({selectedAssignees.length} selected) <span className="text-rose-500">*</span>
              </Label>
              {selectedAssignees.length > 0 && (
                <button
                  type="button"
                  onClick={() => setSelectedAssignees([])}
                  className="text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 underline"
                >
                  Clear Selection
                </button>
              )}
            </div>

            <div className="border border-slate-200 dark:border-slate-800 rounded-lg p-2.5 max-h-48 overflow-y-auto space-y-2 bg-slate-50/50 dark:bg-slate-900/50">
              {employees.map(emp => {
                const isSelected = selectedAssignees.includes(emp.id)
                return (
                  <label
                    key={emp.id}
                    className={`flex items-center justify-between p-2 rounded-md cursor-pointer transition-colors ${
                      isSelected
                        ? "bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800"
                        : "hover:bg-slate-100 dark:hover:bg-slate-800"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleAssignee(emp.id)}
                        className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <img
                        src={emp.avatar}
                        alt={emp.name}
                        className="w-6 h-6 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                      />
                      <div>
                        <p className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                          {emp.name}
                        </p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                          {emp.designation} &bull; {emp.department}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                        emp.accountStatus === "active"
                          ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                          : "bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-400"
                      }`}
                    >
                      {emp.id}
                    </span>
                  </label>
                )
              })}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="description" className="text-xs font-semibold">
              Task Description & Acceptance Criteria
            </Label>
            <Textarea
              id="description"
              rows={3}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Provide context, acceptance criteria, or key dependencies..."
            />
          </div>

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white">
              Dispatch Task
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
