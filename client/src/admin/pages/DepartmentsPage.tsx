import React, { useState } from "react"
import { useAdmin } from "../context/AdminContext"
import { Department } from "../types/admin"
import { DepartmentDialog } from "../components/DepartmentDialog"
import { Button } from "../../components/ui/button"
import { Badge } from "../../components/ui/badge"
import {
  Building2,
  Plus,
  Users,
  CheckSquare,
  Edit,
  Archive,
  UserCheck,
} from "lucide-react"


export const DepartmentsPage: React.FC = () => {
  const { departments, archiveDepartment } = useAdmin()

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [departmentToEdit, setDepartmentToEdit] = useState<Department | null>(null)

  const activeDepartments = departments.filter(d => !d.isArchived)
  const archivedDepartments = departments.filter(d => d.isArchived)

  const handleEdit = (dept: Department) => {
    setDepartmentToEdit(dept)
    setIsDialogOpen(true)
  }

  const handleArchive = (deptId: string) => {
    archiveDepartment(deptId)
  }

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

      {/* Active Departments Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {activeDepartments.map(dept => (
          <div
            key={dept.id}
            className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm hover:shadow-md transition-shadow space-y-4 flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                      {dept.name}
                    </h3>
                    <span className="font-mono text-xs px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 font-bold">
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
                    {dept.employeeCount}
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

            {/* Actions Toolbar */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleEdit(dept)}
                className="text-xs h-8 flex-1"
              >
                <Edit className="w-3.5 h-3.5 mr-1 text-slate-500" />
                Edit
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleArchive(dept.id)}
                className="text-xs h-8 text-amber-600 hover:text-amber-700 hover:bg-amber-50 dark:hover:bg-amber-950/40"
              >
                <Archive className="w-3.5 h-3.5 mr-1" />
                Archive
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Archived Departments Section (if any) */}
      {archivedDepartments.length > 0 && (
        <div className="space-y-3 pt-6 border-t border-slate-200 dark:border-slate-800">
          <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
            <Archive className="w-4 h-4 text-slate-400" />
            Archived Departments ({archivedDepartments.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {archivedDepartments.map(dept => (
              <div
                key={dept.id}
                className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-700 opacity-70 flex items-center justify-between"
              >
                <div>
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-300">{dept.name}</p>
                  <p className="text-[11px] text-slate-400 font-mono">{dept.code}</p>
                </div>
                <Badge variant="secondary" className="text-[10px]">
                  Archived
                </Badge>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Department Dialog */}
      <DepartmentDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        departmentToEdit={departmentToEdit}
      />
    </div>
  )
}
