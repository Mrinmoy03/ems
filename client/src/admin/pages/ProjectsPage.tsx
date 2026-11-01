import React, { useState, useMemo } from "react"
import { useNavigate } from "react-router-dom"
import { useProjects } from "../../context/ProjectContext"
import { useAdmin } from "../context/AdminContext"
import { Project } from "../../types/project"
import { DataPagination } from "@/components/common/DataPagination"
import { ProjectFormDialog } from "../components/ProjectFormDialog"
import { ProjectStatusBadge } from "../../components/projects/ProjectStatusBadge"
import { ProjectProgressBar } from "../../components/projects/ProjectProgressBar"
import { ProjectWeightBar } from "../../components/projects/ProjectWeightBar"
import { ProjectLinksList } from "../../components/projects/ProjectLinksList"
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "../../components/ui/dialog"
import {
  FolderKanban,
  Plus,
  Search,
  MoreVertical,
  Archive,
  Trash2,
  Edit,
  LayoutGrid,
  List,
  Clock,
  AlertTriangle,
} from "lucide-react"

export const ProjectsPage: React.FC = () => {
  const navigate = useNavigate()
  const { projects, archiveProject, deleteProject, getProjectProgress } = useProjects()
  const { departments } = useAdmin()

  const [searchTerm, setSearchTerm] = useState("")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [selectedDept, setSelectedDept] = useState("all")
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid")
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [pageSize, setPageSize] = useState<number>(10)

  // Reset page when search or filters change
  React.useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, selectedStatus, selectedDept])

  // Modals
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [projectToEdit, setProjectToEdit] = useState<Project | null>(null)
  const [deleteConfirmProject, setDeleteConfirmProject] = useState<Project | null>(null)

  // Filtered projects
  const filteredProjects = useMemo(() => {
    return projects.filter(p => {
      const matchSearch =
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.clientName && p.clientName.toLowerCase().includes(searchTerm.toLowerCase()))

      const matchStatus = selectedStatus === "all" || p.status === selectedStatus
      const matchDept =
        selectedDept === "all" || (p.assignedDepartmentIds && p.assignedDepartmentIds.includes(selectedDept))

      return matchSearch && matchStatus && matchDept
    })
  }, [projects, searchTerm, selectedStatus, selectedDept])

  // Pagination calculations
  const totalPages = Math.max(1, Math.ceil(filteredProjects.length / pageSize))
  const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages)
  const displayedProjects = useMemo(() => {
    const startIndex = (safeCurrentPage - 1) * pageSize
    return filteredProjects.slice(startIndex, startIndex + pageSize)
  }, [filteredProjects, safeCurrentPage, pageSize])

  // Summary Metrics
  const totalProjects = projects.length
  const inProgressCount = projects.filter(p => p.status === "in-progress").length
  const planningCount = projects.filter(p => p.status === "planning").length
  const completedCount = projects.filter(p => p.status === "completed").length

  const handleOpenEdit = (project: Project, e?: React.MouseEvent) => {
    if (e) e.stopPropagation()
    setProjectToEdit(project)
    setIsCreateOpen(true)
  }

  const handleDeleteConfirm = () => {
    if (deleteConfirmProject) {
      deleteProject(deleteConfirmProject.id)
      setDeleteConfirmProject(null)
    }
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <FolderKanban className="w-4 h-4" />
            </div>
            <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              Project Portfolio & Work Packages
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Weighted contribution model (&Sigma; Weights = 100%). Multi-team packages, deliverables, and automated progress derivation.
          </p>
        </div>

        <Button
          onClick={() => {
            setProjectToEdit(null)
            setIsCreateOpen(true)
          }}
          className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs h-9 flex items-center gap-1.5 shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>New Project</span>
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Total Portfolio</span>
          <p className="text-xl font-bold text-slate-900 dark:text-slate-100 mt-1">{totalProjects}</p>
          <span className="text-[10px] text-slate-500">Tracked corporate initiatives</span>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-[10px] text-indigo-600 dark:text-indigo-400 uppercase font-bold tracking-wider">In Progress</span>
          <p className="text-xl font-bold text-indigo-600 dark:text-indigo-400 mt-1">{inProgressCount}</p>
          <span className="text-[10px] text-slate-500">Active weighted delivery</span>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-[10px] text-sky-600 dark:text-sky-400 uppercase font-bold tracking-wider">Planning</span>
          <p className="text-xl font-bold text-sky-600 dark:text-sky-400 mt-1">{planningCount}</p>
          <span className="text-[10px] text-slate-500">Work package scoping</span>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 uppercase font-bold tracking-wider">Completed</span>
          <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">{completedCount}</p>
          <span className="text-[10px] text-slate-500">100% milestone sign-off</span>
        </div>
      </div>

      {/* Toolbar Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex flex-1 items-center gap-2 max-w-md relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
          <Input
            placeholder="Search projects by name, code, or client..."
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
                <SelectItem value="planning">Planning</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="on-hold">On Hold</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="w-44">
            <Select value={selectedDept} onValueChange={setSelectedDept}>
              <SelectTrigger className="h-9 text-xs">
                <SelectValue placeholder="All Departments" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {departments.map(dept => (
                  <SelectItem key={dept.id} value={dept.id}>
                    {dept.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* View mode toggle */}
          <div className="flex items-center rounded-lg border border-slate-200 dark:border-slate-800 p-0.5 bg-slate-50 dark:bg-slate-900">
            <Button
              type="button"
              variant={viewMode === "grid" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("grid")}
              className={`h-7 w-7 p-0 ${viewMode === "grid" ? "bg-indigo-600 text-white" : "text-slate-500"}`}
              title="Grid View"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </Button>
            <Button
              type="button"
              variant={viewMode === "table" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("table")}
              className={`h-7 w-7 p-0 ${viewMode === "table" ? "bg-indigo-600 text-white" : "text-slate-500"}`}
              title="Table View"
            >
              <List className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Projects Display */}
      {filteredProjects.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 mx-auto flex items-center justify-center">
            <FolderKanban className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-900 dark:text-slate-100">No projects found</p>
            <p className="text-xs text-slate-500 mt-0.5">
              No project records match your active search terms and filters.
            </p>
          </div>
          <Button
            size="sm"
            onClick={() => {
              setSearchTerm("")
              setSelectedStatus("all")
              setSelectedDept("all")
            }}
            variant="outline"
            className="text-xs"
          >
            Clear Filters
          </Button>
        </div>
      ) : viewMode === "grid" ? (
        /* GRID CARD VIEW */
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {displayedProjects.map(project => {
              const overallProgress = getProjectProgress(project)
              const partsWeightSum = project.parts.reduce((sum, p) => sum + (Number(p.weight) || 0), 0)
              const isWeightValid = Math.abs(100 - partsWeightSum) < 0.01

              return (
              <div
                key={project.id}
                onClick={() => navigate(`/admin/projects/${project.id}`)}
                className="group p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-400/60 dark:hover:border-indigo-500/60 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between space-y-4"
              >
                <div>
                  {/* Card Top: Code & Status */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {project.code}
                      </span>
                      <ProjectStatusBadge status={project.status} />
                      {project.priority === "urgent" && (
                        <Badge variant="outline" className="text-[10px] uppercase font-bold border-rose-300 text-rose-600 bg-rose-50 dark:bg-rose-950/40">
                          Urgent
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-slate-400 hover:text-slate-700">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="text-xs">
                          <DropdownMenuItem onClick={() => navigate(`/admin/projects/${project.id}`)}>
                            <FolderKanban className="w-3.5 h-3.5 mr-2 text-indigo-500" />
                            View Project Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={e => handleOpenEdit(project, e)}>
                            <Edit className="w-3.5 h-3.5 mr-2 text-slate-500" />
                            Edit Project
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => archiveProject(project.id)}>
                            <Archive className="w-3.5 h-3.5 mr-2 text-amber-500" />
                            Archive Project
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => setDeleteConfirmProject(project)}
                            className="text-rose-600 focus:text-rose-600"
                          >
                            <Trash2 className="w-3.5 h-3.5 mr-2" />
                            Delete Project
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>

                  {/* Title & Client */}
                  <div className="mt-3">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      {project.name}
                    </h3>
                    {project.clientName && (
                      <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-0.5">
                        Client: <span className="text-slate-700 dark:text-slate-300">{project.clientName}</span>
                      </p>
                    )}
                    <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 mt-1.5 leading-relaxed">
                      {project.description}
                    </p>
                  </div>
                </div>

                {/* Middle: Progress and Weights */}
                <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800/80">
                  <ProjectProgressBar progress={overallProgress} />

                  {/* Weight allocation bar */}
                  <div>
                    <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                      <span>Work Packages ({project.parts.length} parts)</span>
                      {!isWeightValid && (
                        <span className="text-amber-600 dark:text-amber-400 font-semibold flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" />
                          Weights sum to {partsWeightSum}% (target: 100%)
                        </span>
                      )}
                    </div>
                    <ProjectWeightBar parts={project.parts} />
                  </div>
                </div>

                {/* Footer: Timeline, Links, Team */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
                    <Clock className="w-3.5 h-3.5 text-indigo-500" />
                    <span>Target: <strong>{project.deadline}</strong></span>
                  </div>

                  <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                    <ProjectLinksList links={project.links} compact />
                  </div>
                </div>
              </div>
            )
          })}
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
            <DataPagination
              currentPage={safeCurrentPage}
              totalPages={totalPages}
              totalItems={filteredProjects.length}
              pageSize={pageSize}
              pageSizeOptions={[10, 20, 30]}
              itemName="projects"
              onPageChange={setCurrentPage}
              onPageSizeChange={setPageSize}
            />
          </div>
        </div>
      ) : (
        /* TABLE VIEW */
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-50/75 dark:bg-slate-800/50">
                <TableRow className="border-b border-slate-200 dark:border-slate-800">
                  <TableHead className="text-xs font-semibold">Project Code / Name</TableHead>
                  <TableHead className="text-xs font-semibold">Client</TableHead>
                  <TableHead className="text-xs font-semibold">Status</TableHead>
                  <TableHead className="text-xs font-semibold">Work Packages</TableHead>
                  <TableHead className="text-xs font-semibold">Progress</TableHead>
                  <TableHead className="text-xs font-semibold">Deadline</TableHead>
                  <TableHead className="text-xs font-semibold text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {displayedProjects.map(project => {
                  const overallProgress = getProjectProgress(project)
                  return (
                    <TableRow
                      key={project.id}
                      onClick={() => navigate(`/admin/projects/${project.id}`)}
                      className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 border-b border-slate-100 dark:border-slate-800/60 cursor-pointer"
                    >
                      <TableCell className="py-3">
                        <div>
                          <span className="font-mono text-[10px] font-bold text-indigo-600 dark:text-indigo-400">
                            {project.code}
                          </span>
                          <p className="text-xs font-bold text-slate-900 dark:text-slate-100">
                            {project.name}
                          </p>
                        </div>
                      </TableCell>

                      <TableCell className="py-3 text-xs text-slate-600 dark:text-slate-400">
                        {project.clientName || "-"}
                      </TableCell>

                      <TableCell className="py-3">
                        <ProjectStatusBadge status={project.status} />
                      </TableCell>

                      <TableCell className="py-3 text-xs">
                        <span className="font-semibold text-slate-900 dark:text-slate-100">
                          {project.parts.length}
                        </span>{" "}
                        <span className="text-slate-400">part(s)</span>
                      </TableCell>

                      <TableCell className="py-3 w-40">
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                              {overallProgress}%
                            </span>
                          </div>
                          <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                            <div
                              className="h-full rounded-full bg-indigo-600 transition-all duration-300"
                              style={{ width: `${overallProgress}%` }}
                            />
                          </div>
                        </div>
                      </TableCell>

                      <TableCell className="py-3 text-xs font-mono text-slate-700 dark:text-slate-300">
                        {project.deadline}
                      </TableCell>

                      <TableCell className="py-3 text-right" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate(`/admin/projects/${project.id}`)}
                            className="h-7 px-2 text-[11px] text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40"
                          >
                            Details
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={e => handleOpenEdit(project, e)}
                            className="h-7 w-7 p-0 text-slate-400 hover:text-slate-600"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>

          <DataPagination
            currentPage={safeCurrentPage}
            totalPages={totalPages}
            totalItems={filteredProjects.length}
            pageSize={pageSize}
            pageSizeOptions={[10, 20, 30]}
            itemName="projects"
            onPageChange={setCurrentPage}
            onPageSizeChange={setPageSize}
          />
        </div>
      )}

      {/* Project Form Dialog */}
      <ProjectFormDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        projectToEdit={projectToEdit}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={Boolean(deleteConfirmProject)} onOpenChange={open => !open && setDeleteConfirmProject(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-rose-600 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              Confirm Project Deletion
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Are you sure you want to permanently delete project{" "}
              <strong>{deleteConfirmProject?.name}</strong> ({deleteConfirmProject?.code})? This will also remove its associated work package records.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDeleteConfirmProject(null)}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDeleteConfirm}
              className="text-xs"
            >
              Confirm Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
