import React, { useState, useEffect } from "react"
import { useAdmin } from "../context/AdminContext"
import { useProjects } from "../../context/ProjectContext"
import { Project, ProjectPriority, ProjectStatus, ProjectLink } from "../../types/project"
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
import {
  FolderKanban,
  Sparkles,
  Link as LinkIcon,
  Plus,
  Trash2,
  Calendar,
  Building2,
  Users,
} from "lucide-react"
import { toast } from "sonner"

interface ProjectFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  projectToEdit?: Project | null
  onSuccess?: (project: Project) => void
}

export const ProjectFormDialog: React.FC<ProjectFormDialogProps> = ({
  open,
  onOpenChange,
  projectToEdit,
  onSuccess,
}) => {
  const { employees, departments } = useAdmin()
  const { createProject, updateProject } = useProjects()

  const isEdit = Boolean(projectToEdit)

  // Form State
  const [name, setName] = useState("")
  const [code, setCode] = useState("")
  const [clientName, setClientName] = useState("")
  const [description, setDescription] = useState("")
  const [status, setStatus] = useState<ProjectStatus>("in-progress")
  const [priority, setPriority] = useState<ProjectPriority>("medium")
  const [startDate, setStartDate] = useState("")
  const [deadline, setDeadline] = useState("")
  const [projectOwnerId, setProjectOwnerId] = useState("")
  const [assignedDepartmentIds, setAssignedDepartmentIds] = useState<string[]>([])
  const [assignedEmployeeIds, setAssignedEmployeeIds] = useState<string[]>([])

  // Links state
  const [links, setLinks] = useState<Omit<ProjectLink, "id">[]>([])
  const [newLinkLabel, setNewLinkLabel] = useState("")
  const [newLinkUrl, setNewLinkUrl] = useState("")
  const [newLinkType, setNewLinkType] = useState<ProjectLink["type"]>("live")

  // Reset/populate form
  useEffect(() => {
    if (projectToEdit) {
      setName(projectToEdit.name)
      setCode(projectToEdit.code)
      setClientName(projectToEdit.clientName || "")
      setDescription(projectToEdit.description)
      setStatus(projectToEdit.status)
      setPriority(projectToEdit.priority)
      setStartDate(projectToEdit.startDate)
      setDeadline(projectToEdit.deadline)
      setProjectOwnerId(projectToEdit.projectOwnerId)
      setAssignedDepartmentIds(projectToEdit.assignedDepartmentIds || [])
      setAssignedEmployeeIds(projectToEdit.assignedEmployeeIds || [])
      setLinks(projectToEdit.links.map(l => ({ label: l.label, url: l.url, type: l.type })))
    } else {
      const today = new Date().toISOString().slice(0, 10)
      const nextMonth = new Date(Date.now() + 60 * 24 * 3600 * 1000).toISOString().slice(0, 10)
      setName("")
      setCode("")
      setClientName("")
      setDescription("")
      setStatus("planning")
      setPriority("medium")
      setStartDate(today)
      setDeadline(nextMonth)
      setProjectOwnerId(employees[0]?.id || "EMP-1001")
      setAssignedDepartmentIds(departments.length > 0 ? [departments[0].id] : [])
      setAssignedEmployeeIds([])
      setLinks([])
    }
  }, [projectToEdit, open, employees, departments])

  const handleGenerateCode = () => {
    if (!name.trim()) {
      toast.error("Please enter a project name first")
      return
    }
    const words = name.trim().split(/\s+/)
    const initials = words.length >= 2
      ? words.slice(0, 3).map(w => w[0].toUpperCase()).join("")
      : words[0].slice(0, 3).toUpperCase()
    const randomNum = Math.floor(100 + Math.random() * 900)
    setCode(`${initials}-${randomNum}`)
  }

  const handleAddLink = () => {
    if (!newLinkLabel.trim() || !newLinkUrl.trim()) {
      toast.error("Link label and valid URL are required")
      return
    }
    if (!newLinkUrl.startsWith("http://") && !newLinkUrl.startsWith("https://")) {
      toast.error("URL must begin with http:// or https://")
      return
    }

    setLinks(prev => [
      ...prev,
      {
        label: newLinkLabel.trim(),
        url: newLinkUrl.trim(),
        type: newLinkType,
      },
    ])
    setNewLinkLabel("")
    setNewLinkUrl("")
  }

  const handleRemoveLink = (index: number) => {
    setLinks(prev => prev.filter((_, i) => i !== index))
  }

  const toggleDepartment = (deptId: string) => {
    setAssignedDepartmentIds(prev =>
      prev.includes(deptId) ? prev.filter(id => id !== deptId) : [...prev, deptId]
    )
  }

  const toggleEmployee = (empId: string) => {
    setAssignedEmployeeIds(prev =>
      prev.includes(empId) ? prev.filter(id => id !== empId) : [...prev, empId]
    )
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!name.trim()) {
      toast.error("Project name is required")
      return
    }
    if (!code.trim()) {
      toast.error("Project code is required")
      return
    }
    if (!deadline) {
      toast.error("Project deadline is required")
      return
    }

    const owner = employees.find(e => e.id === projectOwnerId)
    const ownerName = owner ? `${owner.firstName} ${owner.lastName}` : "Sarah Jenkins"

    const selectedDeptNames = departments
      .filter(d => assignedDepartmentIds.includes(d.id))
      .map(d => d.name)

    const selectedEmpNames = employees
      .filter(e => assignedEmployeeIds.includes(e.id))
      .map(e => `${e.firstName} ${e.lastName}`)

    if (isEdit && projectToEdit) {
      updateProject(projectToEdit.id, {
        name: name.trim(),
        code: code.trim().toUpperCase(),
        clientName: clientName.trim() || undefined,
        description: description.trim(),
        status,
        priority,
        startDate,
        deadline,
        projectOwnerId,
        projectOwnerName: ownerName,
        assignedDepartmentIds,
        assignedDepartmentNames: selectedDeptNames,
        assignedEmployeeIds,
        assignedEmployeeNames: selectedEmpNames,
        links: links.map((l, i) => ({ ...l, id: `lnk-${Date.now()}-${i}` })),
      })
      onOpenChange(false)
      if (onSuccess) onSuccess({ ...projectToEdit, name, code })
    } else {
      const created = createProject({
        name: name.trim(),
        code: code.trim().toUpperCase(),
        clientName: clientName.trim() || undefined,
        description: description.trim(),
        status,
        priority,
        startDate,
        deadline,
        projectOwnerId,
        projectOwnerName: ownerName,
        assignedDepartmentIds,
        assignedEmployeeIds,
        links,
      })
      onOpenChange(false)
      if (onSuccess) onSuccess(created)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <FolderKanban className="w-4 h-4" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold text-slate-900 dark:text-slate-100">
                {isEdit ? "Edit Project Portfolio" : "Provision New Project"}
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500">
                Configure corporate project parameters, milestone timelines, and team allocations.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2 text-xs">
          {/* Row 1: Name and Code */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2 space-y-1">
              <Label className="text-xs font-semibold">
                Project Name <span className="text-rose-500">*</span>
              </Label>
              <Input
                placeholder="e.g. WorkTrack Enterprise Cloud Suite"
                value={name}
                onChange={e => setName(e.target.value)}
                className="h-9 text-xs"
                required
              />
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold">
                  Project Code <span className="text-rose-500">*</span>
                </Label>
                <button
                  type="button"
                  onClick={handleGenerateCode}
                  className="text-[10px] text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-0.5"
                >
                  <Sparkles className="w-2.5 h-2.5" />
                  Auto
                </button>
              </div>
              <Input
                placeholder="e.g. WT-ECS"
                value={code}
                onChange={e => setCode(e.target.value.toUpperCase())}
                className="h-9 text-xs font-mono uppercase"
                required
              />
            </div>
          </div>

          {/* Row 2: Client & Priority */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs font-semibold">Client / Organization (Optional)</Label>
              <Input
                placeholder="e.g. Acme Global Logistics"
                value={clientName}
                onChange={e => setClientName(e.target.value)}
                className="h-9 text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label className="text-xs font-semibold">Status</Label>
                <Select value={status} onValueChange={(val: ProjectStatus) => setStatus(val)}>
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="planning">Planning</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="on-hold">On Hold</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-semibold">Priority</Label>
                <Select value={priority} onValueChange={(val: ProjectPriority) => setPriority(val)}>
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue />
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
          </div>

          {/* Row 3: Timelines & Owner */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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
                Overall Deadline <span className="text-rose-500">*</span>
              </Label>
              <Input
                type="date"
                value={deadline}
                onChange={e => setDeadline(e.target.value)}
                className="h-9 text-xs"
                required
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-semibold">Project Lead / Owner</Label>
              <Select value={projectOwnerId} onValueChange={setProjectOwnerId}>
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue placeholder="Select Owner" />
                </SelectTrigger>
                <SelectContent>
                  {employees.map(emp => (
                    <SelectItem key={emp.id} value={emp.id}>
                      {emp.firstName} {emp.lastName} ({emp.designation})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1">
            <Label className="text-xs font-semibold">Project Scope & Deliverable Brief</Label>
            <Textarea
              placeholder="High-level objectives, architectural scope, and milestone deliverables..."
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="min-h-[70px] text-xs resize-none"
            />
          </div>

          {/* Team Allocations */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
            {/* Departments */}
            <div className="space-y-2">
              <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5 text-indigo-500" />
                Assigned Departments ({assignedDepartmentIds.length})
              </span>
              <div className="max-h-28 overflow-y-auto space-y-1 pr-1">
                {departments.map(dept => {
                  const isChecked = assignedDepartmentIds.includes(dept.id)
                  return (
                    <label
                      key={dept.id}
                      className={`flex items-center gap-2 p-1.5 rounded cursor-pointer text-xs transition-colors ${
                        isChecked
                          ? "bg-indigo-50 text-indigo-900 dark:bg-indigo-950/60 dark:text-indigo-200 font-medium"
                          : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleDepartment(dept.id)}
                        className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 h-3.5 w-3.5"
                      />
                      <span className="truncate">{dept.name}</span>
                    </label>
                  )
                })}
              </div>
            </div>

            {/* Employees */}
            <div className="space-y-2">
              <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-emerald-500" />
                Assigned Core Personnel ({assignedEmployeeIds.length})
              </span>
              <div className="max-h-28 overflow-y-auto space-y-1 pr-1">
                {employees.map(emp => {
                  const isChecked = assignedEmployeeIds.includes(emp.id)
                  return (
                    <label
                      key={emp.id}
                      className={`flex items-center gap-2 p-1.5 rounded cursor-pointer text-xs transition-colors ${
                        isChecked
                          ? "bg-emerald-50 text-emerald-900 dark:bg-emerald-950/60 dark:text-emerald-200 font-medium"
                          : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleEmployee(emp.id)}
                        className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 h-3.5 w-3.5"
                      />
                      <span className="truncate">
                        {emp.firstName} {emp.lastName}
                      </span>
                    </label>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Project Links Section */}
          <div className="space-y-2 border-t border-slate-200 dark:border-slate-800 pt-3">
            <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <LinkIcon className="w-3.5 h-3.5 text-indigo-500" />
              Project References & External URLs ({links.length})
            </span>

            {/* Existing links */}
            {links.length > 0 && (
              <div className="space-y-1.5 max-h-28 overflow-y-auto pr-1">
                {links.map((link, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-1.5 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs"
                  >
                    <div className="flex items-center gap-2 min-w-0 pr-2">
                      <span className="font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[120px]">
                        {link.label}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono truncate max-w-[200px]">
                        {link.url}
                      </span>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveLink(idx)}
                      className="h-6 w-6 p-0 text-slate-400 hover:text-rose-600"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {/* Add link inputs */}
            <div className="flex items-center gap-2">
              <div className="w-28 shrink-0">
                <Select
                  value={newLinkType}
                  onValueChange={(val: ProjectLink["type"]) => setNewLinkType(val)}
                >
                  <SelectTrigger className="h-8 text-[11px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="live">Live Site</SelectItem>
                    <SelectItem value="staging">Staging</SelectItem>
                    <SelectItem value="repository">GitHub/Repo</SelectItem>
                    <SelectItem value="figma">Figma</SelectItem>
                    <SelectItem value="docs">Docs</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Input
                placeholder="Label (e.g. Staging Testbed)"
                value={newLinkLabel}
                onChange={e => setNewLinkLabel(e.target.value)}
                className="h-8 text-[11px] w-36"
              />

              <Input
                placeholder="https://..."
                value={newLinkUrl}
                onChange={e => setNewLinkUrl(e.target.value)}
                className="h-8 text-[11px] flex-1"
              />

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddLink}
                className="h-8 px-2.5 text-[11px] gap-1 shrink-0 text-indigo-600 border-indigo-200 hover:bg-indigo-50 dark:text-indigo-400 dark:border-indigo-800"
              >
                <Plus className="w-3 h-3" />
                Add
              </Button>
            </div>
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
              {isEdit ? "Save Project Changes" : "Provision Project"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

