import React, { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAdmin } from "../context/AdminContext"
import { Department } from "../types/admin"
import { DepartmentDialog } from "../components/DepartmentDialog"
import { Button } from "../../components/ui/button"
import { Badge } from "../../components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "../../components/ui/dialog"
import {
  Building2,
  Plus,
  Users,
  CheckSquare,
  Edit,
  Archive,
  UserCheck,
  Trash2,
  RotateCcw,
  AlertTriangle,
  ShieldCheck,
  FolderSync,
  ExternalLink,
} from "lucide-react"

export const DepartmentsPage: React.FC = () => {
  const navigate = useNavigate()
  const { departments, employees, archiveDepartment, restoreDepartment, deleteDepartment } = useAdmin()

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [departmentToEdit, setDepartmentToEdit] = useState<Department | null>(null)

  // Delete Confirmation Modal State
  const [deptToDelete, setDeptToDelete] = useState<Department | null>(null)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)

  const activeDepartments = departments.filter(d => !d.isArchived)
  const archivedDepartments = departments.filter(d => d.isArchived)

  const handleEdit = (dept: Department) => {
    setDepartmentToEdit(dept)
    setIsDialogOpen(true)
  }

  const handleArchive = (deptId: string) => {
    archiveDepartment(deptId)
  }

  const handleRestore = (deptId: string) => {
    restoreDepartment(deptId)
  }

  const handleRestoreAll = () => {
    archivedDepartments.forEach(dept => {
      restoreDepartment(dept.id)
    })
  }

  const handleDeleteClick = (dept: Department) => {
    setDeptToDelete(dept)
    setDeleteConfirmOpen(true)
  }

  const handleConfirmDelete = () => {
    if (!deptToDelete) return
    const res = deleteDepartment(deptToDelete.id)
    if (res.success) {
      setDeleteConfirmOpen(false)
      setDeptToDelete(null)
    }
  }

  // Count active employees in department to be deleted
  const assignedEmployeesCount = deptToDelete
    ? employees.filter(e => e.department && e.department.toLowerCase() === deptToDelete.name.toLowerCase()).length
    : 0

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Building2 className="w-4 h-4" />
            </div>
            <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              Department Architecture
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Organize functional units, appoint department leads, and manage group-level task allocations.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {archivedDepartments.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleRestoreAll}
              className="text-xs h-9 border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 flex items-center gap-1.5"
            >
              <FolderSync className="w-3.5 h-3.5" />
              <span>Restore All ({archivedDepartments.length})</span>
            </Button>
          )}

          <Button
            onClick={() => {
              setDepartmentToEdit(null)
              setIsDialogOpen(true)
            }}
            className="text-xs h-9 bg-indigo-600 hover:bg-indigo-700 text-white font-medium flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Add Department</span>
          </Button>
        </div>
      </div>

      {/* Role Authority Indicator */}
      <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 flex items-center gap-2.5 text-xs text-slate-600 dark:text-slate-400">
        <ShieldCheck className="w-4 h-4 text-indigo-500 shrink-0" />
        <span>
          <strong>Authority:</strong> Both <strong>Admin</strong> and <strong>Super Admin</strong> have full permission to edit, archive, restore, and permanently delete departments.
        </span>
      </div>

      {/* Active Departments Section */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
            <span>Active Departments</span>
            <Badge variant="secondary" className="text-[10px]">
              {activeDepartments.length}
            </Badge>
          </h2>
        </div>

        {activeDepartments.length === 0 ? (
          <div className="p-10 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-3">
            <Building2 className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto" />
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              No active departments
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              All departments are currently archived, or none have been created yet. You can restore archived departments below or create a new one.
            </p>
            {archivedDepartments.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleRestoreAll}
                className="text-xs text-indigo-600 border-indigo-200 dark:border-indigo-800"
              >
                <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
                Restore All Archived Departments
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {activeDepartments.map(dept => {
              const liveMembers = employees.filter(e =>
                (e.departmentId && e.departmentId === dept.id) ||
                (e.department && (e.department.toLowerCase() === dept.name.toLowerCase() || e.department.toLowerCase() === dept.code.toLowerCase()))
              ).length
              const displayMemberCount = Math.max(liveMembers, dept.employeeCount || 0)

              return (
              <div
                key={dept.id}
                onClick={e => {
                  if ((e.target as HTMLElement).closest("button")) return
                  navigate(`/admin/departments/${dept.id}`)
                }}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm hover:shadow-md hover:border-indigo-300 dark:hover:border-indigo-700/60 transition-all cursor-pointer space-y-4 flex flex-col justify-between group"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors flex items-center gap-1.5">
                          {dept.name}
                          <ExternalLink className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-indigo-500" />
                        </h3>
                        <span className="font-mono text-xs px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 font-bold border border-indigo-200 dark:border-indigo-800">
                          {dept.code}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                        {dept.description || "Core organizational team."}
                      </p>
                    </div>
                  </div>

                  {/* Department Head */}
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                    <span className="text-slate-500 flex items-center gap-1.5">
                      <UserCheck className="w-3.5 h-3.5 text-indigo-500" />
                      Department Head:
                    </span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {dept.headEmployeeName || "Unassigned"}
                    </span>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800/60 text-center">
                      <div className="flex items-center justify-center gap-1.5 text-xs text-slate-500 mb-0.5">
                        <Users className="w-3.5 h-3.5 text-indigo-500" />
                        <span>Members</span>
                      </div>
                      <p className="text-lg font-bold text-slate-900 dark:text-slate-100">
                        {displayMemberCount}
                      </p>
                    </div>

                    <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800/60 text-center">
                      <div className="flex items-center justify-center gap-1.5 text-xs text-slate-500 mb-0.5">
                        <CheckSquare className="w-3.5 h-3.5 text-emerald-500" />
                        <span>Active Tasks</span>
                      </div>
                      <p className="text-lg font-bold text-slate-900 dark:text-slate-100">
                        {dept.activeTasksCount}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Actions Toolbar: View Department, Edit, Archive, and Delete */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-1.5">
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => navigate(`/admin/departments/${dept.id}`)}
                    className="text-xs h-8 bg-indigo-600 hover:bg-indigo-700 text-white flex-1 flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>View Department</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={e => {
                      e.stopPropagation()
                      handleEdit(dept)
                    }}
                    className="text-xs h-8 px-2.5 text-slate-700 dark:text-slate-300"
                    title="Edit Department"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={e => {
                      e.stopPropagation()
                      handleArchive(dept.id)
                    }}
                    className="text-xs h-8 px-2 text-amber-600 hover:text-amber-700 hover:bg-amber-50 dark:hover:bg-amber-950/40"
                    title="Move to Archive"
                  >
                    <Archive className="w-3.5 h-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={e => {
                      e.stopPropagation()
                      handleDeleteClick(dept)
                    }}
                    className="text-xs h-8 px-2 text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                    title="Permanently Delete Department"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            )})}
          </div>
        )}
      </div>

      {/* Archived Departments Section */}
      {archivedDepartments.length > 0 && (
        <div className="space-y-4 pt-6 border-t border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
              <Archive className="w-4 h-4 text-slate-400" />
              <span>Archived Departments ({archivedDepartments.length})</span>
            </h3>
            <span className="text-xs text-slate-500">
              Archived units can be restored anytime or deleted permanently.
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {archivedDepartments.map(dept => (
              <div
                key={dept.id}
                className="p-4 rounded-xl bg-slate-50/80 dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-700 flex flex-col justify-between gap-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{dept.name}</p>
                      <span className="text-[10px] text-slate-400 font-mono bg-slate-200/60 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                        {dept.code}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1 line-clamp-1">
                      {dept.description || "Archived department."}
                    </p>
                  </div>
                  <Badge variant="secondary" className="text-[10px] shrink-0">
                    Archived
                  </Badge>
                </div>

                {/* Actions: Restore & Delete */}
                <div className="pt-2 border-t border-slate-200/80 dark:border-slate-800 flex items-center justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleRestore(dept.id)}
                    className="h-7 px-2.5 text-xs text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 flex items-center gap-1"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Restore</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteClick(dept)}
                    className="h-7 px-2.5 text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 flex items-center gap-1"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Delete</span>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Department Edit/Create Dialog */}
      <DepartmentDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        departmentToEdit={departmentToEdit}
      />

      {/* Department Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent className="sm:max-w-[460px]">
          <DialogHeader>
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <DialogTitle className="text-lg font-bold text-slate-900 dark:text-slate-100">
                  Delete Department
                </DialogTitle>
                <DialogDescription className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Permanent removal of organizational unit.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {deptToDelete && (
            <div className="space-y-4 py-2">
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">Department:</span>
                  <span className="font-bold text-slate-900 dark:text-slate-100">
                    {deptToDelete.name}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">Department Code:</span>
                  <span className="font-mono font-semibold text-indigo-600 dark:text-indigo-400">
                    {deptToDelete.code}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">Status:</span>
                  <Badge variant="outline" className="text-[10px]">
                    {deptToDelete.isArchived ? "Archived" : "Active"}
                  </Badge>
                </div>
              </div>

              {assignedEmployeesCount > 0 ? (
                <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200 text-xs space-y-1">
                  <p className="font-semibold flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    Cannot Delete Active Department
                  </p>
                  <p className="text-[11px] leading-relaxed text-amber-800 dark:text-amber-300">
                    There are currently <strong>{assignedEmployeesCount} active employee(s)</strong> assigned to {deptToDelete.name}. You must reassign or remove them before this department can be deleted.
                  </p>
                </div>
              ) : (
                <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-900 dark:text-rose-200 text-xs">
                  <p className="text-[11px] leading-relaxed text-rose-800 dark:text-rose-300">
                    Are you sure you want to permanently delete <strong>{deptToDelete.name}</strong>? This action cannot be undone and will remove it from both active and archived registries.
                  </p>
                </div>
              )}
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setDeleteConfirmOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              disabled={assignedEmployeesCount > 0}
              onClick={handleConfirmDelete}
              className="bg-rose-600 hover:bg-rose-700 text-white"
            >
              Delete Permanently
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
