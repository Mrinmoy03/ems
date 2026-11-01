import React, { useState, useEffect } from "react"
import { useAdmin } from "../context/AdminContext"
import { useProjects } from "../../context/ProjectContext"
import { Project, ProjectPart, ProjectPartStatus } from "../../types/project"
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
import { Layers, Calendar, Percent, Users, Building2, AlertTriangle, CheckCircle2 } from "lucide-react"
import { toast } from "sonner"

interface ProjectPartDialogProps {
  project: Project
  partToEdit?: ProjectPart | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export const ProjectPartDialog: React.FC<ProjectPartDialogProps> = ({
  project,
  partToEdit,
  open,
  onOpenChange,
  onSuccess,
}) => {
  const { employees, departments } = useAdmin()
  const { addProjectPart, updateProjectPart } = useProjects()

  const isEdit = Boolean(partToEdit)

  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [weight, setWeight] = useState<number>(25)
  const [assignedDepartmentId, setAssignedDepartmentId] = useState<string>("none")
  const [assignedEmployeeIds, setAssignedEmployeeIds] = useState<string[]>([])
  const [startDate, setStartDate] = useState("")
  const [deadline, setDeadline] = useState("")
  const [status, setStatus] = useState<ProjectPartStatus>("planning")
  const [notes, setNotes] = useState("")

  useEffect(() => {
    if (partToEdit) {
      setName(partToEdit.name)
      setDescription(partToEdit.description || "")
      setWeight(partToEdit.weight)
      setAssignedDepartmentId(partToEdit.assignedDepartmentId || "none")
      setAssignedEmployeeIds(partToEdit.assignedEmployeeIds || [])
      setStartDate(partToEdit.startDate || "")
      setDeadline(partToEdit.deadline || "")
      setStatus(partToEdit.status)
      setNotes(partToEdit.notes || "")
    } else {
      const today = new Date().toISOString().slice(0, 10)
      const otherPartsWeight = project.parts.reduce((sum, p) => sum + (Number(p.weight) || 0), 0)
      const remainingWeight = Math.max(0, 100 - otherPartsWeight)

      setName("")
      setDescription("")
      setWeight(remainingWeight > 0 ? remainingWeight : 20)
      setAssignedDepartmentId(project.assignedDepartmentIds[0] || "none")
      setAssignedEmployeeIds([])
      setStartDate(today)
      setDeadline(project.deadline || today)
      setStatus("planning")
      setNotes("")
    }
  }, [partToEdit, open, project])

  // Weight simulation
  const currentOtherWeight = project.parts
    .filter(p => !partToEdit || p.id !== partToEdit.id)
    .reduce((sum, p) => sum + (Number(p.weight) || 0), 0)
  const projectedTotalWeight = currentOtherWeight + (Number(weight) || 0)
  const isWeightBalanced = Math.abs(100 - projectedTotalWeight) < 0.01

  const toggleEmployee = (empId: string) => {
    setAssignedEmployeeIds(prev =>
      prev.includes(empId) ? prev.filter(id => id !== empId) : [...prev, empId]
    )
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!name.trim()) {
      toast.error("Work package name is required")
      return
    }
    if (weight <= 0 || weight > 100) {
      toast.error("Contribution weight must be between 1% and 100%")
      return
    }
    if (!deadline) {
      toast.error("Work package deadline is required")
      return
    }

    const deptMatch = departments.find(d => d.id === assignedDepartmentId)
    const empNames = employees
      .filter(e => assignedEmployeeIds.includes(e.id))
      .map(e => `${e.firstName} ${e.lastName}`)

    if (isEdit && partToEdit) {
      updateProjectPart(project.id, partToEdit.id, {
        name: name.trim(),
        description: description.trim(),
        weight: Number(weight),
        assignedDepartmentId: assignedDepartmentId === "none" ? undefined : assignedDepartmentId,
        assignedDepartmentName: deptMatch?.name,
        assignedEmployeeIds,
        assignedEmployeeNames: empNames,
        startDate: startDate || undefined,
        deadline,
        status,
        notes: notes.trim() || undefined,
      })
      onOpenChange(false)
      if (onSuccess) onSuccess()
    } else {
      addProjectPart({
        projectId: project.id,
        name: name.trim(),
        description: description.trim(),
        weight: Number(weight),
        assignedDepartmentId: assignedDepartmentId === "none" ? undefined : assignedDepartmentId,
        assignedEmployeeIds,
        startDate: startDate || undefined,
        deadline,
        notes: notes.trim() || undefined,
      })
      onOpenChange(false)
      if (onSuccess) onSuccess()
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold text-slate-900 dark:text-slate-100">
                {isEdit ? "Edit Work Package / Part" : "Define Project Part / Work Package"}
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500">
                Partition {project.name} into weighted milestone packages contributing to total completion.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2 text-xs">
          {/* Row 1: Name and Weight */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2 space-y-1">
              <Label className="text-xs font-semibold">
                Part / Work Package Name <span className="text-rose-500">*</span>
              </Label>
              <Input
                placeholder="e.g. Frontend Architecture & Telemetry"
                value={name}
                onChange={e => setName(e.target.value)}
                className="h-9 text-xs"
                required
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-semibold flex items-center gap-1">
                <Percent className="w-3 h-3 text-indigo-500" />
                Weight (%) <span className="text-rose-500">*</span>
              </Label>
              <Input
                type="number"
                min={1}
                max={100}
                value={weight}
                onChange={e => setWeight(Number(e.target.value))}
                className="h-9 text-xs font-mono font-bold"
                required
              />
            </div>
          </div>

          {/* Weight Balance Meter */}
          <div
            className={`p-2.5 rounded-lg border text-xs flex items-center justify-between transition-colors ${
              isWeightBalanced
                ? "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300"
                : "bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300"
            }`}
          >
            <div className="flex items-center gap-2">
              {isWeightBalanced ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              )}
              <span>
                Projected Total Project Weight: <strong>{projectedTotalWeight}%</strong> / 100%
              </span>
            </div>
            <span className="text-[10px] font-mono">
              {isWeightBalanced ? "Balanced (100%)" : `${100 - projectedTotalWeight}% remainder`}
            </span>
          </div>

          {/* Row 2: Department and Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs font-semibold flex items-center gap-1">
                <Building2 className="w-3 h-3 text-slate-400" />
                Assigned Department
              </Label>
              <Select value={assignedDepartmentId} onValueChange={setAssignedDepartmentId}>
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue placeholder="Select Department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Independent / Cross-Department</SelectItem>
                  {departments.map(dept => (
                    <SelectItem key={dept.id} value={dept.id}>
                      {dept.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-semibold">Part Status</Label>
              <Select value={status} onValueChange={(val: ProjectPartStatus) => setStatus(val)}>
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="planning">Planning</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="on-hold">On Hold</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Row 3: Timelines */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs font-semibold flex items-center gap-1">
                <Calendar className="w-3 h-3 text-slate-400" />
                Start Date
              </Label>
              <Input
                type="date"
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
                className="h-9 text-xs"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-semibold flex items-center gap-1">
                <Calendar className="w-3 h-3 text-indigo-500" />
                Work Package Deadline <span className="text-rose-500">*</span>
              </Label>
              <Input
                type="date"
                value={deadline}
                onChange={e => setDeadline(e.target.value)}
                className="h-9 text-xs"
                required
              />
            </div>
          </div>

          {/* Row 4: Assigned Employees */}
          <div className="space-y-1.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
            <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-indigo-500" />
              Assign Responsible Employees ({assignedEmployeeIds.length})
            </span>
            <div className="max-h-28 overflow-y-auto space-y-1 pr-1">
              {employees.map(emp => {
                const isChecked = assignedEmployeeIds.includes(emp.id)
                return (
                  <label
                    key={emp.id}
                    className={`flex items-center gap-2 p-1.5 rounded cursor-pointer text-xs transition-colors ${
                      isChecked
                        ? "bg-indigo-50 text-indigo-900 dark:bg-indigo-950/60 dark:text-indigo-200 font-medium"
                        : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggleEmployee(emp.id)}
                      className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 h-3.5 w-3.5"
                    />
                    <span className="truncate">
                      {emp.firstName} {emp.lastName} — {emp.designation}
                    </span>
                  </label>
                )
              })}
            </div>
          </div>

          {/* Description & Notes */}
          <div className="space-y-1">
            <Label className="text-xs font-semibold">Scope & Engineering Notes</Label>
            <Textarea
              placeholder="Technical dependencies, acceptance criteria, or work breakdown notes..."
              value={notes}
              onChange={e => setNotes(e.target.value)}
              className="min-h-[60px] text-xs resize-none"
            />
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs"
            >
              {isEdit ? "Save Work Package" : "Add Work Package"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

