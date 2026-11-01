import React, { useState, useMemo } from "react"
import { Link, useNavigate } from "react-router-dom"
import { AdminEmployee } from "../types/admin"
import { useAdmin } from "../context/AdminContext"
import { DataPagination } from "@/components/common/DataPagination"
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
  DropdownMenuLabel,
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
import { EmployeeFormDialog } from "./EmployeeFormDialog"
import { EmployeeDedicatedTasksDialog } from "./EmployeeDedicatedTasksDialog"
import { UpdatePasswordDialog } from "./UpdatePasswordDialog"
import {
  Search,
  MoreVertical,
  Eye,
  Edit,
  UserX,
  UserCheck,
  Trash2,
  UserPlus,
  Clock,
  Coffee,
  XCircle,
  Calendar,
  CheckSquare,
  KeyRound,
} from "lucide-react"

export const EmployeeTable: React.FC = () => {
  const navigate = useNavigate()
  const { employees, departments, deactivateEmployee, deleteEmployee, updateEmployee } = useAdmin()

  const [searchTerm, setSearchTerm] = useState("")
  const [selectedDepartment, setSelectedDepartment] = useState<string>("all")
  const [selectedStatus, setSelectedStatus] = useState<string>("all")
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [pageSize, setPageSize] = useState<number>(10)

  // Reset page when filters change
  React.useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, selectedDepartment, selectedStatus])

  // Modals state
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [employeeToEdit, setEmployeeToEdit] = useState<AdminEmployee | null>(null)
  const [employeeToDelete, setEmployeeToDelete] = useState<AdminEmployee | null>(null)
  const [selectedEmployeeForTasks, setSelectedEmployeeForTasks] = useState<AdminEmployee | null>(null)
  const [selectedEmployeeForPassword, setSelectedEmployeeForPassword] = useState<AdminEmployee | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)


  // Filtering
  const filteredEmployees = useMemo(() => {
    return employees.filter(emp => {
      const matchSearch =
        emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.designation.toLowerCase().includes(searchTerm.toLowerCase())

      const matchDept =
        selectedDepartment === "all" || emp.department === selectedDepartment

      const matchStatus =
        selectedStatus === "all" || emp.accountStatus === selectedStatus

      return matchSearch && matchDept && matchStatus
    })
  }, [employees, searchTerm, selectedDepartment, selectedStatus])

  // Pagination calculations
  const totalPages = Math.max(1, Math.ceil(filteredEmployees.length / pageSize))
  const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages)
  const displayedEmployees = useMemo(() => {
    const startIndex = (safeCurrentPage - 1) * pageSize
    return filteredEmployees.slice(startIndex, startIndex + pageSize)
  }, [filteredEmployees, safeCurrentPage, pageSize])

  const handleDeleteConfirm = () => {
    if (!employeeToDelete) return
    const res = deleteEmployee(employeeToDelete.id)
    if (!res.success) {
      setDeleteError(res.error || "Cannot delete employee")
    } else {
      setEmployeeToDelete(null)
      setDeleteError(null)
    }
  }

  const renderAttendanceBadge = (status: AdminEmployee["attendanceToday"], checkIn?: string) => {
    switch (status) {
      case "working":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Working {checkIn ? `(${checkIn})` : ""}
          </span>
        )
      case "on-break":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
            <Coffee className="w-3 h-3 text-amber-500" />
            On Break
          </span>
        )
      case "logged-out":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
            <Clock className="w-3 h-3 text-slate-400" />
            Logged Out
          </span>
        )
      case "on-leave":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
            <Calendar className="w-3 h-3 text-purple-500" />
            On Leave
          </span>
        )
      case "absent":
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
            <XCircle className="w-3 h-3 text-rose-400" />
            Absent
          </span>
        )
    }
  }

  return (
    <div className="space-y-4">
      {/* Search & Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex flex-1 items-center gap-2 max-w-md relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
          <Input
            placeholder="Search by name, ID, email, or role..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="pl-9 h-9 text-xs"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="w-44">
            <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
              <SelectTrigger className="h-9 text-xs">
                <SelectValue placeholder="All Departments" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {departments.map(dept => (
                  <SelectItem key={dept.id} value={dept.name}>
                    {dept.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="w-36">
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="h-9 text-xs">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="deactivated">Deactivated</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button
            onClick={() => setCreateDialogOpen(true)}
            className="h-9 px-3 text-xs bg-indigo-600 hover:bg-indigo-700 text-white font-medium flex items-center gap-1.5 shrink-0"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Add Employee</span>
          </Button>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50/75 dark:bg-slate-800/50">
              <TableRow className="border-b border-slate-200 dark:border-slate-800">
                <TableHead className="text-xs font-semibold text-slate-600 dark:text-slate-300">Employee</TableHead>
                <TableHead className="text-xs font-semibold text-slate-600 dark:text-slate-300">Department & Role</TableHead>
                <TableHead className="text-xs font-semibold text-slate-600 dark:text-slate-300">Account Status</TableHead>
                <TableHead className="text-xs font-semibold text-slate-600 dark:text-slate-300">Today's Attendance</TableHead>
                <TableHead className="text-xs font-semibold text-slate-600 dark:text-slate-300 text-center">Active Tasks</TableHead>
                <TableHead className="text-xs font-semibold text-slate-600 dark:text-slate-300 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEmployees.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-10 text-slate-500">
                    No employees found matching the filters.
                  </TableCell>
                </TableRow>
              ) : (
                displayedEmployees.map(emp => (
                  <TableRow
                    key={emp.id}
                    className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800/60 transition-colors"
                  >
                    {/* Employee Identity */}
                    <TableCell className="py-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={emp.avatar}
                          alt={emp.name}
                          className="w-9 h-9 rounded-full object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                        />
                        <div>
                          <Link
                            to={`/admin/employees/${emp.id}`}
                            className="text-xs font-bold text-slate-900 dark:text-slate-100 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors flex items-center gap-1.5"
                          >
                            <span>{emp.name}</span>
                            <span className="font-mono text-[10px] text-slate-400 font-normal">
                              ({emp.id})
                            </span>
                          </Link>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400">
                            {emp.email}
                          </p>
                        </div>
                      </div>
                    </TableCell>

                    {/* Department & Role */}
                    <TableCell className="py-3">
                      <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                        {emp.designation}
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        {emp.department}
                      </p>
                    </TableCell>

                    {/* Account Status */}
                    <TableCell className="py-3">
                      <Badge
                        variant="secondary"
                        className={`text-[10px] uppercase font-semibold tracking-wider ${
                          emp.accountStatus === "active"
                            ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                            : emp.accountStatus === "inactive"
                            ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                            : "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300"
                        }`}
                      >
                        {emp.accountStatus}
                      </Badge>
                    </TableCell>

                    {/* Today's Attendance */}
                    <TableCell className="py-3">
                      {renderAttendanceBadge(emp.attendanceToday, emp.checkInToday)}
                    </TableCell>

                    {/* Active Tasks */}
                    <TableCell className="py-3 text-center">
                      <button
                        type="button"
                        onClick={() => setSelectedEmployeeForTasks(emp)}
                        title={`Click to check dedicated tasks for ${emp.name}`}
                        className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:hover:bg-indigo-900/80 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 transition-all cursor-pointer shadow-2xs hover:scale-105"
                      >
                        <span>{emp.activeTasksCount}</span>
                        <CheckSquare className="w-3 h-3 opacity-70" />
                      </button>
                    </TableCell>

                    {/* Actions Menu */}
                    <TableCell className="py-3 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreVertical className="w-4 h-4 text-slate-500" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-52">
                          <DropdownMenuLabel className="text-xs">Employee Actions</DropdownMenuLabel>
                          <DropdownMenuItem
                            onClick={() => setSelectedEmployeeForTasks(emp)}
                            className="text-xs cursor-pointer font-semibold text-indigo-600 dark:text-indigo-400 focus:text-indigo-700 dark:focus:text-indigo-300 focus:bg-indigo-50 dark:focus:bg-indigo-950/50"
                          >
                            <CheckSquare className="w-3.5 h-3.5 mr-2 text-indigo-600 dark:text-indigo-400" />
                            Check Dedicated Tasks
                          </DropdownMenuItem>

                          <DropdownMenuItem
                            onClick={() => navigate(`/admin/employees/${emp.id}`)}
                            className="text-xs cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5 mr-2 text-slate-500" />
                            View Full Profile
                          </DropdownMenuItem>


                          <DropdownMenuItem
                            onClick={() => setEmployeeToEdit(emp)}
                            className="text-xs cursor-pointer"
                          >
                            <Edit className="w-3.5 h-3.5 mr-2 text-slate-500" />
                            Edit Profile
                          </DropdownMenuItem>

                          <DropdownMenuItem
                            onClick={() => setSelectedEmployeeForPassword(emp)}
                            className="text-xs cursor-pointer text-amber-700 dark:text-amber-400 focus:bg-amber-50 dark:focus:bg-amber-950/40"
                          >
                            <KeyRound className="w-3.5 h-3.5 mr-2 text-amber-500" />
                            Update Password
                          </DropdownMenuItem>

                          <DropdownMenuSeparator />

                          {emp.accountStatus === "active" ? (
                            <DropdownMenuItem
                              onClick={() => deactivateEmployee(emp.id)}
                              className="text-xs text-amber-600 cursor-pointer"
                            >
                              <UserX className="w-3.5 h-3.5 mr-2" />
                              Deactivate Access
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem
                              onClick={() => updateEmployee(emp.id, { accountStatus: "active" })}
                              className="text-xs text-emerald-600 cursor-pointer"
                            >
                              <UserCheck className="w-3.5 h-3.5 mr-2" />
                              Reactivate Account
                            </DropdownMenuItem>
                          )}

                          <DropdownMenuItem
                            onClick={() => {
                              setEmployeeToDelete(emp)
                              setDeleteError(null)
                            }}
                            className="text-xs text-rose-600 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5 mr-2" />
                            Delete Employee
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination Footer with 10 / 20 / 30 selector */}
        {filteredEmployees.length > 0 && (
          <DataPagination
            currentPage={safeCurrentPage}
            totalPages={totalPages}
            totalItems={filteredEmployees.length}
            pageSize={pageSize}
            pageSizeOptions={[10, 20, 30]}
            itemName="employees"
            onPageChange={setCurrentPage}
            onPageSizeChange={setPageSize}
          />
        )}
      </div>

      {/* Modals */}
      <EmployeeFormDialog
        open={createDialogOpen || Boolean(employeeToEdit)}
        onOpenChange={open => {
          if (!open) {
            setCreateDialogOpen(false)
            setEmployeeToEdit(null)
          }
        }}
        employeeToEdit={employeeToEdit}
      />

      {/* Dedicated Tasks Modal for Selected Employee */}
      <EmployeeDedicatedTasksDialog
        open={Boolean(selectedEmployeeForTasks)}
        onOpenChange={open => {
          if (!open) setSelectedEmployeeForTasks(null)
        }}
        employee={selectedEmployeeForTasks}
      />

      {/* Admin Update Password Modal */}
      <UpdatePasswordDialog
        open={Boolean(selectedEmployeeForPassword)}
        onOpenChange={open => {
          if (!open) setSelectedEmployeeForPassword(null)
        }}
        employee={selectedEmployeeForPassword}
      />


      {/* Delete Confirmation Dialog */}
      <Dialog
        open={Boolean(employeeToDelete)}
        onOpenChange={open => {
          if (!open) {
            setEmployeeToDelete(null)
            setDeleteError(null)
          }
        }}
      >
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Trash2 className="w-5 h-5 text-rose-500" />
              Delete Employee Record
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Are you sure you want to delete <strong>{employeeToDelete?.name}</strong> ({employeeToDelete?.id})?
              This will remove access credentials and audit history.
            </DialogDescription>
          </DialogHeader>

          {deleteError && (
            <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-600 dark:text-rose-400">
              {deleteError}
            </div>
          )}

          <DialogFooter className="pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setEmployeeToDelete(null)
                setDeleteError(null)
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDeleteConfirm}
              className="bg-rose-600 hover:bg-rose-700"
            >
              Confirm Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
