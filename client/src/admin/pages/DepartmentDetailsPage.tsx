import React, { useState, useMemo } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useAdmin } from "../context/AdminContext"
import { useProjects } from "../../context/ProjectContext"
import { DepartmentDialog } from "../components/DepartmentDialog"
import { TaskAssignmentDialog } from "../components/TaskAssignmentDialog"
import { TaskStatusBadge } from "../../employee/components/TaskStatusBadge"
import { isTaskCompletedLate } from "../../employee/utils/taskStatus"
import { DataPagination } from "@/components/common/DataPagination"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select"
import {
  Building2,
  ArrowLeft,
  Users,
  CheckSquare,
  Clock,
  CheckCircle2,
  AlertCircle,
  FolderKanban,
  Plus,
  Edit,
  UserCheck,
  Mail,
  Phone,
  MapPin,
  Search,
  Layers,
  ExternalLink,
  ShieldCheck,
} from "lucide-react"

export const DepartmentDetailsPage: React.FC = () => {
  const { departmentId } = useParams<{ departmentId: string }>()
  const navigate = useNavigate()
  const { departments, employees, tasks } = useAdmin()
  const { projects } = useProjects()

  const [activeTab, setActiveTab] = useState<string>("tasks")
  const [taskFilter, setTaskFilter] = useState<"all" | "current" | "past">("all")
  const [taskSearch, setTaskSearch] = useState("")
  const [taskPriority, setTaskPriority] = useState<string>("all")
  const [employeeSearch, setEmployeeSearch] = useState("")
  const [projectPartSearch, setProjectPartSearch] = useState("")

  // Task pagination
  const [taskPage, setTaskPage] = useState<number>(1)
  const [taskPageSize, setTaskPageSize] = useState<number>(10)

  // Dialog states
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isAssignTaskOpen, setIsAssignTaskOpen] = useState(false)

  // Locate department
  const cleanParam = departmentId ? decodeURIComponent(departmentId).trim().toLowerCase() : ""
  const department = useMemo(() => {
    return departments.find(d => {
      const matchId = (d.id || "").toLowerCase() === cleanParam
      const matchCode = (d.code || "").toLowerCase() === cleanParam
      const matchName = (d.name || "").toLowerCase() === cleanParam
      return matchId || matchCode || matchName
    })
  }, [departments, cleanParam])

  // Employees belonging to this department
  const deptEmployees = useMemo(() => {
    if (!department) return []
    return employees.filter(e => {
      if (e.departmentId && department.id && e.departmentId === department.id) return true
      if (!e.department) return false
      const eDept = e.department.toLowerCase().trim()
      const dName = department.name.toLowerCase().trim()
      const dCode = department.code.toLowerCase().trim()
      return eDept === dName || eDept === dCode
    })
  }, [employees, department])

  // Set of employee IDs and codes for quick matching
  const deptEmployeeIdentifiers = useMemo(() => {
    const set = new Set<string>()
    deptEmployees.forEach(e => {
      if (e.id) set.add(e.id)
      if (e.employeeId) set.add(e.employeeId)
      const fullName = `${e.firstName || ""} ${e.lastName || ""}`.trim().toLowerCase()
      if (fullName) set.add(fullName)
    })
    return set
  }, [deptEmployees])

  // Tasks belonging to this department or its employees
  const deptTasks = useMemo(() => {
    if (!department) return []
    const dNameLower = department.name.toLowerCase().trim()
    const dCodeLower = department.code.toLowerCase().trim()

    return tasks.filter(t => {
      // 1. Direct department association
      if (t.department && (t.department.toLowerCase().trim() === dNameLower || t.department.toLowerCase().trim() === dCodeLower)) return true
      if (t.departmentName && (t.departmentName.toLowerCase().trim() === dNameLower || t.departmentName.toLowerCase().trim() === dCodeLower)) return true

      // 2. Task assignee belongs to this department
      if (Array.isArray(t.assignedTo)) {
        for (const assignee of t.assignedTo) {
          if (deptEmployeeIdentifiers.has(assignee)) return true
        }
      }
      if (Array.isArray(t.assignedEmployeeNames)) {
        for (const name of t.assignedEmployeeNames) {
          if (deptEmployeeIdentifiers.has(name.toLowerCase().trim())) return true
        }
      }

      return false
    }).sort((a, b) => {
      const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0
      const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0
      return timeB - timeA
    })
  }, [tasks, department, deptEmployeeIdentifiers])

  // Filtered tasks by sub-filter (All, Current, Past) and search
  const filteredTasks = useMemo(() => {
    return deptTasks.filter(t => {
      const isCompleted = t.status === "completed" || (Number(t.progress) || 0) === 100

      // Sub-filter: all vs current vs past
      if (taskFilter === "current" && isCompleted) return false
      if (taskFilter === "past" && !isCompleted) return false

      // Priority filter
      if (taskPriority !== "all" && t.priority !== taskPriority) return false

      // Search match
      if (taskSearch.trim()) {
        const query = taskSearch.toLowerCase()
        const matchTitle = t.title.toLowerCase().includes(query)
        const matchCat = (t.category || "").toLowerCase().includes(query)
        const matchAssignee = (t.assignedEmployeeNames || []).some(n => n.toLowerCase().includes(query))
        if (!matchTitle && !matchCat && !matchAssignee) return false
      }

      return true
    })
  }, [deptTasks, taskFilter, taskPriority, taskSearch])

  // Paginated tasks
  const totalTaskPages = Math.max(1, Math.ceil(filteredTasks.length / taskPageSize))
  const safeTaskPage = Math.min(Math.max(1, taskPage), totalTaskPages)
  const displayedTasks = useMemo(() => {
    const start = (safeTaskPage - 1) * taskPageSize
    return filteredTasks.slice(start, start + taskPageSize)
  }, [filteredTasks, safeTaskPage, taskPageSize])

  // Counts
  const currentTasksCount = useMemo(() => {
    return deptTasks.filter(t => t.status !== "completed" && (Number(t.progress) || 0) < 100).length
  }, [deptTasks])

  const pastTasksCount = useMemo(() => {
    return deptTasks.filter(t => t.status === "completed" || (Number(t.progress) || 0) === 100).length
  }, [deptTasks])

  // Project Parts assigned to this department or its employees
  const assignedProjectParts = useMemo(() => {
    if (!department) return []
    const dNameLower = department.name.toLowerCase().trim()
    const dCodeLower = department.code.toLowerCase().trim()

    const partsList: Array<{
      partId: string
      partName: string
      description?: string
      projectId: string
      projectName: string
      projectCode: string
      weight: number
      progress: number
      status: string
      deadline: string
      assignedEmployees: string[]
    }> = []

    projects.forEach(proj => {
      if (!Array.isArray(proj.parts)) return
      proj.parts.forEach(part => {
        let isMatch = false

        // Check part department
        if (part.assignedDepartmentId && part.assignedDepartmentId === department.id) isMatch = true
        if (part.assignedDepartmentName && (part.assignedDepartmentName.toLowerCase().trim() === dNameLower || part.assignedDepartmentName.toLowerCase().trim() === dCodeLower)) isMatch = true

        // Check if any assigned employee is in this department
        if (!isMatch && Array.isArray(part.assignedEmployeeIds)) {
          for (const empId of part.assignedEmployeeIds) {
            if (deptEmployeeIdentifiers.has(empId)) {
              isMatch = true
              break
            }
          }
        }

        if (isMatch) {
          partsList.push({
            partId: part.id,
            partName: part.name,
            description: part.description,
            projectId: proj.id,
            projectName: proj.name,
            projectCode: proj.code,
            weight: Number(part.weight) || 0,
            progress: Number(part.progress) || 0,
            status: part.status,
            deadline: part.deadline,
            assignedEmployees: part.assignedEmployeeIds || [],
          })
        }
      })
    })

    return partsList
  }, [projects, department, deptEmployeeIdentifiers])

  // Filtered Project Parts
  const filteredProjectParts = useMemo(() => {
    if (!projectPartSearch.trim()) return assignedProjectParts
    const q = projectPartSearch.toLowerCase()
    return assignedProjectParts.filter(p =>
      p.partName.toLowerCase().includes(q) ||
      p.projectName.toLowerCase().includes(q) ||
      p.projectCode.toLowerCase().includes(q)
    )
  }, [assignedProjectParts, projectPartSearch])

  // Filtered employees by search
  const filteredEmployees = useMemo(() => {
    if (!employeeSearch.trim()) return deptEmployees
    const q = employeeSearch.toLowerCase()
    return deptEmployees.filter(e =>
      `${e.firstName} ${e.lastName}`.toLowerCase().includes(q) ||
      (e.employeeId || "").toLowerCase().includes(q) ||
      (e.designation || "").toLowerCase().includes(q) ||
      (e.email || "").toLowerCase().includes(q)
    )
  }, [deptEmployees, employeeSearch])

  // Helper date formatter
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

  // Get employee avatar and name helpers
  const getEmployeeInfo = (identifier: string) => {
    return employees.find(e => e.id === identifier || e.employeeId === identifier)
  }

  if (!department) {
    return (
      <div className="max-w-4xl mx-auto py-16 text-center space-y-4">
        <div className="w-12 h-12 mx-auto rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
          <Building2 className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">
          Department Not Found
        </h2>
        <p className="text-xs text-slate-500">
          No department matched the identifier &ldquo;{departmentId}&rdquo;.
        </p>
        <Button onClick={() => navigate("/admin/departments")} variant="outline" size="sm">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Departments
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Back Navigation Bar */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/admin/departments")}
          className="text-xs text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 flex items-center gap-1.5"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Departments</span>
        </Button>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsEditDialogOpen(true)}
            className="text-xs h-8 text-slate-700 dark:text-slate-300 flex items-center gap-1.5"
          >
            <Edit className="w-3.5 h-3.5" />
            <span>Edit Department</span>
          </Button>
          <Button
            size="sm"
            onClick={() => setIsAssignTaskOpen(true)}
            className="text-xs h-8 bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Assign Task to Department</span>
          </Button>
        </div>
      </div>

      {/* Department Overview Banner */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 border border-indigo-100 dark:border-indigo-900/40">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                  {department.name}
                </h1>
                <span className="font-mono text-xs px-2.5 py-0.5 rounded-md bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-bold border border-indigo-200 dark:border-indigo-800">
                  {department.code}
                </span>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 font-medium flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  Active Department
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
                {department.description || "Core organizational team unit driving functional delivery and project milestones."}
              </p>
            </div>
          </div>

          {/* Department Head Info */}
          <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 text-xs">
            <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/60 text-indigo-600 dark:text-indigo-300 flex items-center justify-center font-bold">
              <UserCheck className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">Department Head</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                {department.headEmployeeName || "Unassigned"}
              </span>
            </div>
          </div>
        </div>

        {/* 4 Summary Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          <div className="p-3.5 rounded-xl bg-slate-50/70 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800/60 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-indigo-100/70 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[11px] font-medium text-slate-500">Department Members</p>
              <p className="text-lg font-bold text-slate-900 dark:text-slate-100">{deptEmployees.length}</p>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50/70 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800/60 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-amber-100/70 dark:bg-amber-950 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[11px] font-medium text-slate-500">Current Tasks</p>
              <p className="text-lg font-bold text-amber-600 dark:text-amber-400">{currentTasksCount}</p>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50/70 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800/60 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-100/70 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[11px] font-medium text-slate-500">Past Completed</p>
              <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">{pastTasksCount}</p>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50/70 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800/60 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-purple-100/70 dark:bg-purple-950 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
              <FolderKanban className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[11px] font-medium text-slate-500">Assigned Project Parts</p>
              <p className="text-lg font-bold text-purple-600 dark:text-purple-400">{assignedProjectParts.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Tabs Navigation */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-1 rounded-xl">
          <TabsTrigger value="tasks" className="text-xs font-semibold gap-1.5 data-[state=active]:bg-indigo-600 data-[state=active]:text-white">
            <CheckSquare className="w-3.5 h-3.5" />
            <span>Department Tasks ({deptTasks.length})</span>
          </TabsTrigger>
          <TabsTrigger value="employees" className="text-xs font-semibold gap-1.5 data-[state=active]:bg-indigo-600 data-[state=active]:text-white">
            <Users className="w-3.5 h-3.5" />
            <span>Employees ({deptEmployees.length})</span>
          </TabsTrigger>
          <TabsTrigger value="project-parts" className="text-xs font-semibold gap-1.5 data-[state=active]:bg-indigo-600 data-[state=active]:text-white">
            <FolderKanban className="w-3.5 h-3.5" />
            <span>Assigned Project Parts ({assignedProjectParts.length})</span>
          </TabsTrigger>
        </TabsList>

        {/* ========================================================================= */}
        {/* TAB 1: DEPARTMENT TASKS (Current & Past Tasks)                            */}
        {/* ========================================================================= */}
        <TabsContent value="tasks" className="space-y-4">
          {/* Tasks Toolbar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
            {/* Filter buttons: All, Current, Past */}
            <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-lg">
              <button
                type="button"
                onClick={() => { setTaskFilter("all"); setTaskPage(1); }}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                  taskFilter === "all"
                    ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm font-semibold"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                }`}
              >
                All Tasks ({deptTasks.length})
              </button>
              <button
                type="button"
                onClick={() => { setTaskFilter("current"); setTaskPage(1); }}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                  taskFilter === "current"
                    ? "bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-400 shadow-sm font-semibold"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                }`}
              >
                Current Tasks ({currentTasksCount})
              </button>
              <button
                type="button"
                onClick={() => { setTaskFilter("past"); setTaskPage(1); }}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                  taskFilter === "past"
                    ? "bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm font-semibold"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                }`}
              >
                Past Tasks ({pastTasksCount})
              </button>
            </div>

            {/* Search & Priority Selector */}
            <div className="flex items-center gap-2 flex-wrap">
              <div className="relative w-56">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5 pointer-events-none" />
                <Input
                  value={taskSearch}
                  onChange={e => { setTaskSearch(e.target.value); setTaskPage(1); }}
                  placeholder="Search task, employee, category..."
                  className="pl-8 h-8 text-xs"
                />
              </div>

              <div className="w-32">
                <Select value={taskPriority} onValueChange={val => { setTaskPriority(val); setTaskPage(1); }}>
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue placeholder="Priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Priorities</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
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
                    <TableHead className="text-xs font-semibold">Assigned Employee</TableHead>
                    <TableHead className="text-xs font-semibold">Category</TableHead>
                    <TableHead className="text-xs font-semibold">Priority</TableHead>
                    <TableHead className="text-xs font-semibold">Current Status</TableHead>
                    <TableHead className="text-xs font-semibold">Delivery Time (Deadline)</TableHead>
                    <TableHead className="text-xs font-semibold">Completed Time</TableHead>
                    <TableHead className="text-xs font-semibold">Progress</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTasks.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-12 text-xs text-slate-500">
                        No tasks found for {department.name} matching current filters.
                      </TableCell>
                    </TableRow>
                  ) : (
                    displayedTasks.map(task => {
                      const isCompleted = task.status === "completed" || (Number(task.progress) || 0) === 100
                      const isLate = isTaskCompletedLate(task)

                      // Primary assigned employee details
                      const primaryEmpId = task.assignedTo && task.assignedTo.length > 0 ? task.assignedTo[0] : null
                      const empMatch = primaryEmpId ? getEmployeeInfo(primaryEmpId) : null
                      const empDisplayName = empMatch
                        ? `${empMatch.firstName} ${empMatch.lastName}`
                        : (task.assignedEmployeeNames && task.assignedEmployeeNames.length > 0 ? task.assignedEmployeeNames[0] : "Staff Member")

                      return (
                        <TableRow
                          key={task.id}
                          className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 border-b border-slate-100 dark:border-slate-800/60"
                        >
                          {/* Task Details */}
                          <TableCell className="py-3 max-w-xs">
                            <div className="flex items-center gap-1.5 flex-wrap mb-1">
                              <p className="text-xs font-bold text-slate-900 dark:text-slate-100">
                                {task.title}
                              </p>

                              {/* Assignment origin badge */}
                              {Boolean(
                                task.isSelfCreated ||
                                (task.assignedBy && !['admin', 'super admin', 'operations admin'].includes(task.assignedBy.trim().toLowerCase()))
                              ) ? (
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
                              <div className="mt-1 flex items-start gap-1 p-1 rounded bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-amber-800 dark:text-amber-300 text-[10px]">
                                <AlertCircle className="w-3 h-3 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                                <span><strong>Delay Note:</strong> {task.delayReason || task.comment}</span>
                              </div>
                            )}
                          </TableCell>

                          {/* Assigned Employee */}
                          <TableCell className="py-3 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              {empMatch?.avatar ? (
                                <img
                                  src={empMatch.avatar}
                                  alt={empDisplayName}
                                  className="w-6 h-6 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                                />
                              ) : (
                                <div className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 text-[10px] font-bold flex items-center justify-center">
                                  {empDisplayName.slice(0, 1)}
                                </div>
                              )}
                              <div>
                                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                                  {empDisplayName}
                                </p>
                                <p className="text-[10px] text-slate-400">
                                  {empMatch?.designation || "Team Member"}
                                </p>
                              </div>
                            </div>
                          </TableCell>

                          {/* Category */}
                          <TableCell className="py-3 text-xs">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 text-[11px] font-medium border border-indigo-200/60 dark:border-indigo-800/60">
                              <Layers className="w-3 h-3 text-indigo-400" />
                              {task.category || "Feature Work"}
                            </span>
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

                          {/* Current Status */}
                          <TableCell className="py-3">
                            <TaskStatusBadge status={task.status} isLate={isLate} />
                          </TableCell>

                          {/* Delivery Time (Scheduled Deadline) */}
                          <TableCell className="py-3 text-xs font-mono text-slate-700 dark:text-slate-300 whitespace-nowrap">
                            <div className="flex items-center gap-1.5">
                              <Clock className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                              <span>{formatDeadline(task.deadline)}</span>
                            </div>
                          </TableCell>

                          {/* Completed Time */}
                          <TableCell className="py-3 text-xs whitespace-nowrap">
                            {isCompleted && task.completedAt ? (
                              <div className="flex items-center gap-1">
                                <CheckCircle2 className={`w-3.5 h-3.5 shrink-0 ${isLate ? "text-amber-500" : "text-emerald-500"}`} />
                                <span className={`font-mono text-[11px] font-medium ${isLate ? "text-amber-600 dark:text-amber-400" : "text-emerald-600 dark:text-emerald-400"}`}>
                                  {formatDeadline(task.completedAt)}
                                </span>
                                {isLate ? (
                                  <span className="text-[10px] font-semibold px-1 py-0.2 rounded bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 ml-1">
                                    Late
                                  </span>
                                ) : (
                                  <span className="text-[10px] font-semibold px-1 py-0.2 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 ml-1">
                                    On Time
                                  </span>
                                )}
                              </div>
                            ) : (
                              <span className="text-slate-400 font-mono text-xs">-</span>
                            )}
                          </TableCell>

                          {/* Progress */}
                          <TableCell className="py-3">
                            <div className="flex items-center gap-2">
                              <div className="w-16 h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                                <div
                                  className={`h-full rounded-full transition-all duration-300 ${
                                    isCompleted
                                      ? (isLate ? 'bg-amber-500' : 'bg-emerald-500')
                                      : task.status === 'overdue'
                                      ? 'bg-rose-500'
                                      : 'bg-indigo-600'
                                  }`}
                                  style={{ width: `${task.progress ?? (isCompleted ? 100 : task.status === 'in-progress' ? 50 : 0)}%` }}
                                />
                              </div>
                              <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400">
                                {task.progress ?? (isCompleted ? 100 : task.status === 'in-progress' ? 50 : 0)}%
                              </span>
                            </div>
                          </TableCell>
                        </TableRow>
                      )
                    })
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            {filteredTasks.length > 0 && (
              <div className="p-3 border-t border-slate-100 dark:border-slate-800">
                <DataPagination
                  currentPage={safeTaskPage}
                  totalPages={totalTaskPages}
                  totalItems={filteredTasks.length}
                  pageSize={taskPageSize}
                  pageSizeOptions={[10, 20, 30]}
                  itemName="tasks"
                  onPageChange={setTaskPage}
                  onPageSizeChange={size => {
                    setTaskPageSize(size)
                    setTaskPage(1)
                  }}
                />
              </div>
            )}
          </div>
        </TabsContent>

        {/* ========================================================================= */}
        {/* TAB 2: DEPARTMENT EMPLOYEES                                              */}
        {/* ========================================================================= */}
        <TabsContent value="employees" className="space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Department Members ({deptEmployees.length})
              </h3>
              <p className="text-xs text-slate-500">
                Active team members, developers, and personnel assigned to {department.name}.
              </p>
            </div>

            <div className="relative w-72">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5 pointer-events-none" />
              <Input
                value={employeeSearch}
                onChange={e => setEmployeeSearch(e.target.value)}
                placeholder="Search by name, ID, or designation..."
                className="pl-8 h-8 text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredEmployees.length === 0 ? (
              <div className="col-span-full py-12 text-center text-xs text-slate-500 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                No employees found matching &ldquo;{employeeSearch}&rdquo; in this department.
              </div>
            ) : (
              filteredEmployees.map(emp => {
                const activeTasks = deptTasks.filter(t =>
                  t.status !== "completed" &&
                  (Number(t.progress) || 0) < 100 &&
                  (t.assignedTo.includes(emp.id) || (emp.employeeId ? t.assignedTo.includes(emp.employeeId) : false))
                ).length

                return (
                  <div
                    key={emp.id}
                    className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between space-y-4"
                  >
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        {emp.avatar ? (
                          <img
                            src={emp.avatar}
                            alt={`${emp.firstName} ${emp.lastName}`}
                            className="w-11 h-11 rounded-full object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                          />
                        ) : (
                          <div className="w-11 h-11 rounded-full bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 font-bold flex items-center justify-center shrink-0">
                            {emp.firstName?.slice(0, 1)}
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-1">
                            <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">
                              {emp.firstName} {emp.lastName}
                            </h4>
                            <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-semibold shrink-0">
                              {emp.employeeId}
                            </span>
                          </div>
                          <p className="text-xs text-indigo-600 dark:text-indigo-400 font-medium truncate">
                            {emp.designation}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-1.5 pt-1 text-xs text-slate-500 border-t border-slate-100 dark:border-slate-800/80">
                        {emp.email && (
                          <div className="flex items-center gap-2 truncate">
                            <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span className="truncate">{emp.email}</span>
                          </div>
                        )}
                        {emp.phone && (
                          <div className="flex items-center gap-2">
                            <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span>{emp.phone}</span>
                          </div>
                        )}
                        {emp.location && (
                          <div className="flex items-center gap-2">
                            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span>{emp.location}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                      <div className="text-[11px] text-slate-500">
                        Active Tasks: <strong className="text-indigo-600 dark:text-indigo-400">{activeTasks}</strong>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/admin/employees/${emp.id}`)}
                        className="text-xs h-7 px-2.5 text-indigo-600 border-indigo-200 hover:bg-indigo-50 dark:text-indigo-400 dark:border-indigo-800 flex items-center gap-1"
                      >
                        <span>View Profile</span>
                        <ExternalLink className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </TabsContent>

        {/* ========================================================================= */}
        {/* TAB 3: ASSIGNED PROJECT PARTS / WORK PACKAGES                            */}
        {/* ========================================================================= */}
        <TabsContent value="project-parts" className="space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Assigned Project Work Packages ({assignedProjectParts.length})
              </h3>
              <p className="text-xs text-slate-500">
                Work packages and project components allocated to {department.name}.
              </p>
            </div>

            <div className="relative w-72">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5 pointer-events-none" />
              <Input
                value={projectPartSearch}
                onChange={e => setProjectPartSearch(e.target.value)}
                placeholder="Search work package or project..."
                className="pl-8 h-8 text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredProjectParts.length === 0 ? (
              <div className="col-span-full py-12 text-center text-xs text-slate-500 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                No project work packages assigned to {department.name} at this time.
              </div>
            ) : (
              filteredProjectParts.map(part => {
                return (
                  <div
                    key={part.partId}
                    className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-4 flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-base font-bold text-slate-900 dark:text-slate-100">
                              {part.partName}
                            </h4>
                            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                              part.status === "completed"
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300"
                                : part.status === "in-progress"
                                ? "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300"
                                : "bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400"
                            }`}>
                              {part.status}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                            {part.description || "Core project milestone deliverable."}
                          </p>
                        </div>

                        <span className="font-mono text-xs px-2 py-0.5 rounded bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300 font-semibold border border-purple-200 dark:border-purple-800 shrink-0">
                          Weight: {part.weight}%
                        </span>
                      </div>

                      {/* Parent Project info */}
                      <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <FolderKanban className="w-3.5 h-3.5 text-indigo-500" />
                          <span className="font-medium text-slate-700 dark:text-slate-300">
                            {part.projectName} ({part.projectCode})
                          </span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate(`/admin/projects/${part.projectId}`)}
                          className="h-6 px-2 text-[11px] text-indigo-600 hover:text-indigo-700"
                        >
                          View Project &rarr;
                        </Button>
                      </div>

                      {/* Progress bar */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[11px] font-medium text-slate-500">
                          <span>Milestone Progress</span>
                          <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{part.progress}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-300 ${
                              part.progress === 100
                                ? "bg-emerald-500"
                                : part.progress > 0
                                ? "bg-indigo-600"
                                : "bg-slate-300"
                            }`}
                            style={{ width: `${part.progress}%` }}
                          />
                        </div>
                      </div>

                      {/* Target Deadline */}
                      <div className="flex items-center gap-1.5 text-xs text-slate-500">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>Deadline: <strong className="font-mono text-slate-700 dark:text-slate-300">{formatDeadline(part.deadline)}</strong></span>
                      </div>
                    </div>

                    {/* Assigned Team Members from this Department */}
                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[11px] text-slate-400">Assigned Team:</span>
                        <div className="flex items-center -space-x-1.5 overflow-hidden">
                          {part.assignedEmployees.map(empId => {
                            const emp = getEmployeeInfo(empId)
                            return emp ? (
                              <img
                                key={emp.id}
                                src={emp.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${emp.firstName}`}
                                alt={emp.firstName}
                                title={`${emp.firstName} ${emp.lastName}`}
                                className="w-6 h-6 rounded-full ring-2 ring-white dark:ring-slate-900 object-cover"
                              />
                            ) : null
                          })}
                        </div>
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/admin/projects/${part.projectId}`)}
                        className="text-xs h-7 px-2.5 text-indigo-600 border-indigo-200 hover:bg-indigo-50 dark:text-indigo-400 dark:border-indigo-800 flex items-center gap-1"
                      >
                        <span>Project Workspace</span>
                        <ExternalLink className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Edit Department Modal */}
      <DepartmentDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        departmentToEdit={department}
      />

      {/* Task Assignment Modal for this Department */}
      <TaskAssignmentDialog
        open={isAssignTaskOpen}
        onOpenChange={setIsAssignTaskOpen}
        defaultEmployeeId={deptEmployees.length > 0 ? deptEmployees[0].id : undefined}
      />
    </div>
  )
}
