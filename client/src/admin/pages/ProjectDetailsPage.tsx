import React, { useState, useMemo } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useProjects } from "../../context/ProjectContext"
import { useAdmin } from "../context/AdminContext"
import { ProjectPart } from "../../types/project"
import { ProjectFormDialog } from "../components/ProjectFormDialog"
import { ProjectPartDialog } from "../components/ProjectPartDialog"
import { TaskAssignmentDialog } from "../components/TaskAssignmentDialog"
import { ProjectStatusBadge } from "../../components/projects/ProjectStatusBadge"
import { ProjectProgressBar } from "../../components/projects/ProjectProgressBar"
import { ProjectWeightBar } from "../../components/projects/ProjectWeightBar"
import { ProjectLinksList } from "../../components/projects/ProjectLinksList"
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs"
import { Button } from "../../components/ui/button"
import { Badge } from "../../components/ui/badge"
import { Input } from "../../components/ui/input"
import { Label } from "../../components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "../../components/ui/dialog"
import {
  ArrowLeft,
  Edit,
  Plus,
  Layers,
  Users,
  CheckSquare,
  History,
  Link as LinkIcon,
  Building2,
  Trash2,
  AlertTriangle,
  Clock,
  Sparkles,
} from "lucide-react"
import { toast } from "sonner"

export const ProjectDetailsPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>()
  const navigate = useNavigate()
  const { getProject, deleteProjectPart, addProjectLink, getProjectProgress, checkProjectWeights } = useProjects()
  const { employees, departments, tasks } = useAdmin()

  const project = projectId ? getProject(projectId) : undefined

  // Modals state
  const [isEditProjectOpen, setIsEditProjectOpen] = useState(false)
  const [isPartDialogOpen, setIsPartDialogOpen] = useState(false)
  const [partToEdit, setPartToEdit] = useState<ProjectPart | null>(null)
  const [isAssignTaskOpen, setIsAssignTaskOpen] = useState(false)
  const [isAddLinkOpen, setIsAddLinkOpen] = useState(false)

  // New Link inputs
  const [newLinkLabel, setNewLinkLabel] = useState("")
  const [newLinkUrl, setNewLinkUrl] = useState("")
  const [newLinkType, setNewLinkType] = useState<"live" | "staging" | "repository" | "figma" | "docs">("live")

  // Tasks belonging to this project
  const projectTasks = useMemo(() => {
    if (!project) return []
    return tasks.filter(t => t.projectId === project.id || t.projectName === project.name)
  }, [tasks, project])

  // Tasks pagination
  const [taskPage, setTaskPage] = useState<number>(1)
  const [taskPageSize, setTaskPageSize] = useState<number>(10)
  const totalTaskPages = Math.max(1, Math.ceil(projectTasks.length / taskPageSize))
  const safeTaskPage = Math.min(Math.max(1, taskPage), totalTaskPages)
  const displayedProjectTasks = useMemo(() => {
    const startIndex = (safeTaskPage - 1) * taskPageSize
    return projectTasks.slice(startIndex, startIndex + taskPageSize)
  }, [projectTasks, safeTaskPage, taskPageSize])

  // Activities pagination
  const [activityPage, setActivityPage] = useState<number>(1)
  const [activityPageSize, setActivityPageSize] = useState<number>(10)
  const projectActivities = project?.activities || []
  const totalActivityPages = Math.max(1, Math.ceil(projectActivities.length / activityPageSize))
  const safeActivityPage = Math.min(Math.max(1, activityPage), totalActivityPages)
  const displayedActivities = useMemo(() => {
    const startIndex = (safeActivityPage - 1) * activityPageSize
    return projectActivities.slice(startIndex, startIndex + activityPageSize)
  }, [projectActivities, safeActivityPage, activityPageSize])

  if (!project) {
    return (
      <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 max-w-xl mx-auto my-12">
        <div className="w-12 h-12 rounded-full bg-rose-50 dark:bg-rose-950/40 text-rose-600 mx-auto flex items-center justify-center">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">Project Not Found</h2>
          <p className="text-xs text-slate-500 mt-1">
            The project identifier "{projectId}" does not match any active or archived project.
          </p>
        </div>
        <Button
          onClick={() => navigate("/admin/projects")}
          className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs h-8"
        >
          Return to Projects Portfolio
        </Button>
      </div>
    )
  }

  const overallProgress = getProjectProgress(project)
  const weightValidation = checkProjectWeights(project.parts)

  const handleOpenAddPart = () => {
    setPartToEdit(null)
    setIsPartDialogOpen(true)
  }

  const handleOpenEditPart = (part: ProjectPart) => {
    setPartToEdit(part)
    setIsPartDialogOpen(true)
  }

  const handleDeletePart = (partId: string) => {
    if (confirm("Are you sure you want to remove this project part?")) {
      deleteProjectPart(project.id, partId)
    }
  }

  const handleCreateLinkSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newLinkLabel.trim() || !newLinkUrl.trim()) {
      toast.error("Please enter a valid link label and URL")
      return
    }
    addProjectLink(project.id, {
      label: newLinkLabel.trim(),
      url: newLinkUrl.trim(),
      type: newLinkType,
    })
    setNewLinkLabel("")
    setNewLinkUrl("")
    setIsAddLinkOpen(false)
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Back Button & Breadcrumb */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/admin/projects")}
          className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 flex items-center gap-1.5 p-0 h-auto"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Projects Portfolio</span>
        </Button>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsEditProjectOpen(true)}
            className="text-xs h-8 flex items-center gap-1.5"
          >
            <Edit className="w-3.5 h-3.5" />
            <span>Edit Project</span>
          </Button>

          <Button
            size="sm"
            onClick={handleOpenAddPart}
            className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs h-8 flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Work Package</span>
          </Button>
        </div>
      </div>

      {/* Project Master Header Banner */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono text-xs font-bold px-2.5 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                {project.code}
              </span>
              <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                {project.name}
              </h1>
              <ProjectStatusBadge status={project.status} />
              {project.priority === "urgent" && (
                <Badge variant="outline" className="border-rose-300 text-rose-600 bg-rose-50 dark:bg-rose-950/40 text-[10px] uppercase font-bold">
                  Urgent
                </Badge>
              )}
            </div>

            {project.clientName && (
              <p className="text-xs font-medium text-slate-500">
                Client Organization: <strong className="text-slate-800 dark:text-slate-200">{project.clientName}</strong>
              </p>
            )}

            <p className="text-xs text-slate-600 dark:text-slate-400 max-w-3xl leading-relaxed">
              {project.description}
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center gap-4 bg-slate-50 dark:bg-slate-850 p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800 shrink-0">
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Overall Progress</span>
              <p className="text-xl font-mono font-bold text-slate-900 dark:text-slate-100">{overallProgress}%</p>
            </div>
            <div className="h-8 w-px bg-slate-200 dark:bg-slate-700" />
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Target Deadline</span>
              <p className="text-xs font-mono font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1 mt-1">
                <Clock className="w-3.5 h-3.5 text-indigo-500" />
                {project.deadline}
              </p>
            </div>
          </div>
        </div>

        {/* Progress & Stacked Weight Breakdown */}
        <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          <ProjectProgressBar progress={overallProgress} size="lg" />
          <ProjectWeightBar parts={project.parts} />
        </div>

        {/* Weight Allocation Warning Banner if not 100% */}
        {!weightValidation.isValid && (
          <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
              <span>
                <strong>Weight Allocation Notice:</strong> Current work packages sum to{" "}
                <strong>{weightValidation.totalWeight}%</strong>. In accordance with WorkTrack rules, all active project parts must equal exactly 100% (variance: {weightValidation.difference}%).
              </span>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={handleOpenAddPart}
              className="text-xs text-amber-900 dark:text-amber-100 border-amber-300 dark:border-amber-700 shrink-0 ml-2"
            >
              Rebalance Weights
            </Button>
          </div>
        )}
      </div>

      {/* 6 Tabs Suite */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="bg-white dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-800 h-auto flex-wrap">
          <TabsTrigger value="overview" className="text-xs gap-1.5 py-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Overview</span>
          </TabsTrigger>
          <TabsTrigger value="parts" className="text-xs gap-1.5 py-1.5">
            <Layers className="w-3.5 h-3.5" />
            <span>Project Parts ({project.parts.length})</span>
          </TabsTrigger>
          <TabsTrigger value="team" className="text-xs gap-1.5 py-1.5">
            <Users className="w-3.5 h-3.5" />
            <span>Team & Assignments</span>
          </TabsTrigger>
          <TabsTrigger value="tasks" className="text-xs gap-1.5 py-1.5">
            <CheckSquare className="w-3.5 h-3.5" />
            <span>Tasks ({projectTasks.length})</span>
          </TabsTrigger>
          <TabsTrigger value="activity" className="text-xs gap-1.5 py-1.5">
            <History className="w-3.5 h-3.5" />
            <span>Activity History</span>
          </TabsTrigger>
          <TabsTrigger value="links" className="text-xs gap-1.5 py-1.5">
            <LinkIcon className="w-3.5 h-3.5" />
            <span>Links & References ({project.links.length})</span>
          </TabsTrigger>
        </TabsList>

        {/* TAB 1: OVERVIEW */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Left 2 Cols: Timeline & Key Summary */}
            <div className="md:col-span-2 space-y-4">
              <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-indigo-500" />
                  Work Package Delivery Matrix
                </h3>
                <p className="text-xs text-slate-500">
                  Calculated formula: Overall Progress = &Sigma; (Part Weight &times; Part Progress) / 100.
                </p>

                <div className="space-y-2.5 pt-2">
                  {project.parts.map(part => (
                    <div
                      key={part.id}
                      className="p-3 rounded-xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-850/50 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-slate-900 dark:text-slate-100">{part.name}</span>
                          <Badge variant="outline" className="text-[10px] font-mono">
                            {part.weight}% weight
                          </Badge>
                          <ProjectStatusBadge status={part.status} />
                        </div>
                        <p className="text-[11px] text-slate-500 line-clamp-1">{part.description || part.notes || "No description provided."}</p>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <div className="w-24 text-right">
                          <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{part.progress}%</span>
                          <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden mt-0.5">
                            <div className="h-full bg-indigo-600 rounded-full" style={{ width: `${part.progress}%` }} />
                          </div>
                        </div>
                        <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-bold w-12 text-right">
                          +{((part.weight * part.progress) / 100).toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Important Project Links */}
              <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                    <LinkIcon className="w-4 h-4 text-indigo-500" />
                    Project References & Environments
                  </h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsAddLinkOpen(true)}
                    className="text-xs text-indigo-600 hover:text-indigo-700 h-7"
                  >
                    + Add Reference
                  </Button>
                </div>
                <ProjectLinksList links={project.links} />
              </div>
            </div>

            {/* Right Col: Metadata, Team, Lead */}
            <div className="space-y-4">
              <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3 text-xs">
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Project Governance</h3>

                <div className="space-y-2.5 pt-1">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Project Lead</span>
                    <p className="font-semibold text-slate-900 dark:text-slate-100 mt-0.5">{project.projectOwnerName}</p>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Start Date</span>
                    <p className="font-mono text-slate-800 dark:text-slate-200 mt-0.5">{project.startDate || "Not specified"}</p>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Delivery Target</span>
                    <p className="font-mono font-bold text-indigo-600 dark:text-indigo-400 mt-0.5">{project.deadline}</p>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Assigned Departments</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {project.assignedDepartmentNames && project.assignedDepartmentNames.length > 0 ? (
                        project.assignedDepartmentNames.map(dept => (
                          <Badge key={dept} variant="outline" className="text-[10px]">
                            {dept}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-slate-400">None assigned</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Assigned Team */}
              <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3 text-xs">
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center justify-between">
                  <span>Assigned Personnel</span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {project.assignedEmployeeIds ? project.assignedEmployeeIds.length : 0} members
                  </span>
                </h3>

                <div className="space-y-2">
                  {project.assignedEmployeeIds && project.assignedEmployeeIds.length > 0 ? (
                    project.assignedEmployeeIds.map(empId => {
                      const emp = employees.find(e => e.id === empId)
                      return emp ? (
                        <div key={empId} className="flex items-center gap-2.5 p-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50">
                          <img
                            src={emp.avatar}
                            alt={emp.name}
                            className="w-7 h-7 rounded-full object-cover"
                          />
                          <div className="min-w-0">
                            <p className="font-semibold text-slate-900 dark:text-slate-100 truncate">{emp.name}</p>
                            <p className="text-[10px] text-slate-400 truncate">{emp.designation}</p>
                          </div>
                        </div>
                      ) : null
                    })
                  ) : (
                    <span className="text-slate-400 italic">No direct personnel linked.</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* TAB 2: PROJECT PARTS */}
        <TabsContent value="parts" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Configured Work Packages & Contribution Weights
              </h3>
              <p className="text-xs text-slate-500">
                Sum of active weights must equal 100%. Progress is derived from assigned tasks without double-counting.
              </p>
            </div>
            <Button
              size="sm"
              onClick={handleOpenAddPart}
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs h-8 flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Work Package</span>
            </Button>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <Table>
              <TableHeader className="bg-slate-50/75 dark:bg-slate-800/50">
                <TableRow className="border-b border-slate-200 dark:border-slate-800">
                  <TableHead className="text-xs font-semibold">Package / Part</TableHead>
                  <TableHead className="text-xs font-semibold">Weight</TableHead>
                  <TableHead className="text-xs font-semibold">Assigned Team / Dept</TableHead>
                  <TableHead className="text-xs font-semibold">Deadline</TableHead>
                  <TableHead className="text-xs font-semibold">Progress</TableHead>
                  <TableHead className="text-xs font-semibold">Contribution</TableHead>
                  <TableHead className="text-xs font-semibold">Status</TableHead>
                  <TableHead className="text-xs font-semibold text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {project.parts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-10 text-xs text-slate-500">
                      No work packages configured yet. Click "Add Work Package" to begin partitioning.
                    </TableCell>
                  </TableRow>
                ) : (
                  project.parts.map(part => {
                    const contribution = ((part.weight * part.progress) / 100).toFixed(1)
                    return (
                      <TableRow
                        key={part.id}
                        className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 border-b border-slate-100 dark:border-slate-800/60"
                      >
                        <TableCell className="py-3 max-w-xs">
                          <p className="text-xs font-bold text-slate-900 dark:text-slate-100">
                            {part.name}
                          </p>
                          {part.description && (
                            <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                              {part.description}
                            </p>
                          )}
                        </TableCell>

                        <TableCell className="py-3 text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400">
                          {part.weight}%
                        </TableCell>

                        <TableCell className="py-3 text-xs">
                          <p className="font-semibold text-slate-800 dark:text-slate-200">
                            {part.assignedDepartmentName || "Cross-Department"}
                          </p>
                          <p className="text-[10px] text-slate-400">
                            {part.assignedEmployeeNames && part.assignedEmployeeNames.length > 0
                              ? part.assignedEmployeeNames.join(", ")
                              : "No assigned personnel"}
                          </p>
                        </TableCell>

                        <TableCell className="py-3 text-xs font-mono text-slate-700 dark:text-slate-300">
                          {part.deadline}
                        </TableCell>

                        <TableCell className="py-3 w-32">
                          <div className="space-y-1">
                            <span className="text-[11px] font-mono font-bold text-slate-800 dark:text-slate-200">
                              {part.progress}%
                            </span>
                            <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                              <div
                                className="h-full bg-indigo-600 rounded-full"
                                style={{ width: `${part.progress}%` }}
                              />
                            </div>
                          </div>
                        </TableCell>

                        <TableCell className="py-3 text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">
                          +{contribution}%
                        </TableCell>

                        <TableCell className="py-3">
                          <ProjectStatusBadge status={part.status} />
                        </TableCell>

                        <TableCell className="py-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleOpenEditPart(part)}
                              className="h-7 w-7 p-0 text-slate-500 hover:text-slate-800"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeletePart(part.id)}
                              className="h-7 w-7 p-0 text-slate-400 hover:text-rose-600"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        {/* TAB 3: TEAM & ASSIGNMENTS */}
        <TabsContent value="team" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Involved Departments */}
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-indigo-500" />
                Assigned Business Units ({project.assignedDepartmentIds.length})
              </h3>
              <div className="space-y-2">
                {project.assignedDepartmentIds.map(deptId => {
                  const dept = departments.find(d => d.id === deptId)
                  return dept ? (
                    <div key={deptId} className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850/50 flex items-center justify-between text-xs">
                      <div>
                        <p className="font-semibold text-slate-900 dark:text-slate-100">{dept.name}</p>
                        <p className="text-[10px] text-slate-400 font-mono">{dept.code} &bull; Head: {dept.headEmployeeName || "Admin"}</p>
                      </div>
                      <Badge variant="outline" className="text-[10px]">
                        {dept.employeeCount} Members
                      </Badge>
                    </div>
                  ) : null
                })}
              </div>
            </div>

            {/* Individual Employees & Responsible Parts */}
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                <Users className="w-4 h-4 text-emerald-500" />
                Work Package Accountability Roster
              </h3>
              <div className="space-y-2">
                {project.parts.map(part => (
                  <div key={part.id} className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850/50 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 dark:text-slate-100">{part.name}</span>
                      <span className="font-mono text-indigo-600 dark:text-indigo-400 font-semibold">{part.weight}% weight</span>
                    </div>
                    <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
                      <span className="font-medium text-slate-700 dark:text-slate-300">Assignees:</span>
                      <span>{part.assignedEmployeeNames && part.assignedEmployeeNames.length > 0 ? part.assignedEmployeeNames.join(", ") : "Unassigned"}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </TabsContent>

        {/* TAB 4: TASKS */}
        <TabsContent value="tasks" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Project Deliverable Tasks ({projectTasks.length})
              </h3>
              <p className="text-xs text-slate-500">
                Individual employee assignments linked to this project and its work packages.
              </p>
            </div>
            <Button
              size="sm"
              onClick={() => setIsAssignTaskOpen(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs h-8 flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Assign Project Task</span>
            </Button>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <Table>
              <TableHeader className="bg-slate-50/75 dark:bg-slate-800/50">
                <TableRow className="border-b border-slate-200 dark:border-slate-800">
                  <TableHead className="text-xs font-semibold">Deliverable Task</TableHead>
                  <TableHead className="text-xs font-semibold">Work Package</TableHead>
                  <TableHead className="text-xs font-semibold">Assignees</TableHead>
                  <TableHead className="text-xs font-semibold">Deadline</TableHead>
                  <TableHead className="text-xs font-semibold">Progress</TableHead>
                  <TableHead className="text-xs font-semibold">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {projectTasks.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-10 text-xs text-slate-500">
                      No tasks currently linked to this project. Click "Assign Project Task" to dispatch deliverables.
                    </TableCell>
                  </TableRow>
                ) : (
                  displayedProjectTasks.map(task => (
                    <TableRow key={task.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 border-b border-slate-100 dark:border-slate-800/60">
                      <TableCell className="py-3 max-w-xs">
                        <p className="text-xs font-bold text-slate-900 dark:text-slate-100">{task.title}</p>
                        <p className="text-[10px] text-slate-400 font-mono">{task.id}</p>
                      </TableCell>

                      <TableCell className="py-3 text-xs">
                        <Badge variant="outline" className="text-[10px] font-medium bg-slate-50 dark:bg-slate-800">
                          {task.projectPartName || "Independent Scope"}
                        </Badge>
                      </TableCell>

                      <TableCell className="py-3 text-xs">
                        {task.assignedEmployeeNames && task.assignedEmployeeNames.length > 0 ? (
                          <span>{task.assignedEmployeeNames.join(", ")}</span>
                        ) : (
                          <span className="text-slate-400">Unassigned</span>
                        )}
                      </TableCell>

                      <TableCell className="py-3 text-xs font-mono text-slate-700 dark:text-slate-300">
                        {task.deadline}
                      </TableCell>

                      <TableCell className="py-3 w-28">
                        <div className="space-y-1">
                          <span className="text-[11px] font-mono font-bold text-slate-800 dark:text-slate-200">
                            {task.progress}%
                          </span>
                          <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                            <div className="h-full bg-indigo-600 rounded-full" style={{ width: `${task.progress}%` }} />
                          </div>
                        </div>
                      </TableCell>

                      <TableCell className="py-3">
                        <TaskStatusBadge status={task.status} />
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {projectTasks.length > 0 && (
            <DataPagination
              currentPage={safeTaskPage}
              totalPages={totalTaskPages}
              totalItems={projectTasks.length}
              pageSize={taskPageSize}
              pageSizeOptions={[10, 20, 30]}
              itemName="project tasks"
              onPageChange={setTaskPage}
              onPageSizeChange={setTaskPageSize}
            />
          )}
        </TabsContent>

        {/* TAB 5: ACTIVITY & HISTORY */}
        <TabsContent value="activity" className="space-y-4">
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
              <History className="w-4 h-4 text-indigo-500" />
              Chronological Audit Log
            </h3>

            <div className="space-y-3">
              {displayedActivities.map(act => (
                <div key={act.id} className="flex items-start gap-3 p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850/50 text-xs">
                  <div className="w-2 h-2 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                  <div className="space-y-0.5 flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 dark:text-slate-100">{act.action}</span>
                      <span className="text-[10px] font-mono text-slate-400">
                        {new Date(act.timestamp).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-slate-600 dark:text-slate-400">{act.description}</p>
                    <p className="text-[10px] text-slate-400">Recorded by: {act.performedBy}</p>
                  </div>
                </div>
              ))}
            </div>

            {projectActivities.length > 0 && (
              <DataPagination
                currentPage={safeActivityPage}
                totalPages={totalActivityPages}
                totalItems={projectActivities.length}
                pageSize={activityPageSize}
                pageSizeOptions={[10, 20, 30]}
                itemName="audit entries"
                onPageChange={setActivityPage}
                onPageSizeChange={setActivityPageSize}
              />
            )}
          </div>
        </TabsContent>

        {/* TAB 6: LINKS & REFERENCES */}
        <TabsContent value="links" className="space-y-4">
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                  <LinkIcon className="w-4 h-4 text-indigo-500" />
                  Project URL Directory
                </h3>
                <p className="text-xs text-slate-500">
                  Shared environments, Figma design specs, code repositories, and API documentation.
                </p>
              </div>

              <Button
                size="sm"
                onClick={() => setIsAddLinkOpen(true)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs h-8 flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Reference Link</span>
              </Button>
            </div>

            <ProjectLinksList links={project.links} />
          </div>
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <ProjectFormDialog
        open={isEditProjectOpen}
        onOpenChange={setIsEditProjectOpen}
        projectToEdit={project}
      />

      <ProjectPartDialog
        project={project}
        partToEdit={partToEdit}
        open={isPartDialogOpen}
        onOpenChange={setIsPartDialogOpen}
      />

      <TaskAssignmentDialog
        open={isAssignTaskOpen}
        onOpenChange={setIsAssignTaskOpen}
        defaultProjectId={project.id}
        defaultProjectName={project.name}
      />

      {/* Add Link Dialog */}
      <Dialog open={isAddLinkOpen} onOpenChange={setIsAddLinkOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <LinkIcon className="w-4 h-4 text-indigo-500" />
              Add Project Reference Link
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Provide an external URL for team navigation.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateLinkSubmit} className="space-y-3 py-2 text-xs">
            <div className="space-y-1">
              <Label className="text-xs font-semibold">Environment Type</Label>
              <select
                value={newLinkType}
                onChange={e => setNewLinkType(e.target.value as any)}
                className="w-full h-9 rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 text-xs"
              >
                <option value="live">Live Production</option>
                <option value="staging">Staging Testbed</option>
                <option value="repository">GitHub / Source Code</option>
                <option value="figma">Figma Design Spec</option>
                <option value="docs">Documentation / Wiki</option>
              </select>
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-semibold">Label</Label>
              <Input
                placeholder="e.g. Staging Testbed"
                value={newLinkLabel}
                onChange={e => setNewLinkLabel(e.target.value)}
                className="h-9 text-xs"
                required
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-semibold">URL</Label>
              <Input
                placeholder="https://..."
                value={newLinkUrl}
                onChange={e => setNewLinkUrl(e.target.value)}
                className="h-9 text-xs font-mono"
                required
              />
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setIsAddLinkOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white">
                Add Link
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
