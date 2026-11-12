import React, { createContext, useContext, useState, useMemo, useCallback, useEffect } from "react"
import {
  AdminEmployee,
  Department,
  AdminTask,
  AdminAttendanceDay,
  AdminSuperAdminComment,
  DeadlineChangeRecord,
  CreateEmployeeInput,
  CreateDepartmentInput,
  CreateAdminTaskInput,
  TodayAttendanceStatus,
} from "../types/admin"
import {
  initialDepartments,
  initialAdminEmployees,
  initialAdminTasks,
  initialAdminAttendance,
  initialSuperAdminComments,
  initialDeadlineHistory,
  initialAdminLeaveRequests,
} from "../data/mockAdminData"
import { AdminLeaveRecord } from "../types/admin"
import { deriveTaskStatus } from "../../employee/utils/taskStatus"
import { TaskProgress } from "../../employee/types/task"
import { api } from "../../services/api"
import { toast } from "sonner"

interface AdminContextValue {
  employees: AdminEmployee[]
  departments: Department[]
  tasks: AdminTask[]
  attendance: AdminAttendanceDay[]
  leaveRequests: AdminLeaveRecord[]
  deadlineHistory: DeadlineChangeRecord[]
  adminComments: AdminSuperAdminComment[]

  // Derived KPI metrics
  kpis: {
    totalEmployees: number
    presentToday: number
    workingNow: number
    onBreakNow: number
    loggedOutToday: number
    absentToday: number
    onLeaveToday: number
    tasksDueToday: number
    tasksInProgress: number
    tasksCompleted: number
    tasksOverdue: number
  }

  // Employee Management
  createEmployee: (input: CreateEmployeeInput) => AdminEmployee
  updateEmployee: (id: string, updates: Partial<AdminEmployee>) => void
  updateEmployeePassword: (id: string, newPassword: string) => { success: boolean; error?: string }
  deactivateEmployee: (id: string) => void
  deleteEmployee: (id: string) => { success: boolean; error?: string }

  // Department Management
  createDepartment: (input: CreateDepartmentInput) => { success: boolean; error?: string }
  updateDepartment: (id: string, updates: Partial<Department>) => { success: boolean; error?: string }
  archiveDepartment: (id: string) => { success: boolean; error?: string }
  restoreDepartment: (id: string) => { success: boolean; error?: string }
  deleteDepartment: (id: string) => { success: boolean; error?: string }

  // Task Management
  createTask: (input: CreateAdminTaskInput) => AdminTask
  updateTaskDeadline: (taskId: string, newDeadline: string, reason: string) => { success: boolean; error?: string }

  // Role Authority
  currentRole: "admin" | "super-admin"
  isSuperAdmin: boolean
  setRole: (role: "admin" | "super-admin") => void

  // Database Synchronization
  refreshEmployees: () => Promise<void>
  refreshDepartments: () => Promise<void>
  refreshAttendance: () => Promise<void>
  refreshTasks: () => Promise<void>
  refreshLeaveRequests: () => Promise<void>

  // Super Admin Leave Approvals
  approveLeave: (leaveId: string, remarks?: string) => { success: boolean; error?: string }
  rejectLeave: (leaveId: string, remarks?: string) => { success: boolean; error?: string }

  // Administrative Comments to Super Admin
  addAdminComment: (
    input: Omit<AdminSuperAdminComment, "id" | "createdAt" | "status" | "authorName" | "authorRole">
  ) => AdminSuperAdminComment
}

const AdminContext = createContext<AdminContextValue | undefined>(undefined)

export interface AdminProviderProps {
  children: React.ReactNode
  initialRole?: "admin" | "super-admin"
}

export const AdminProvider: React.FC<AdminProviderProps> = ({ children, initialRole }) => {
  const [currentRole, setRoleState] = useState<"admin" | "super-admin">(() => {
    if (initialRole) return initialRole
    if (typeof window !== "undefined" && window.location.pathname.startsWith("/super-admin")) {
      return "super-admin"
    }
    return "admin"
  })

  const isSuperAdmin = currentRole === "super-admin"

  const setRole = useCallback((role: "admin" | "super-admin") => {
    setRoleState(role)
  }, [])

  const [employees, setEmployees] = useState<AdminEmployee[]>(() => {
    try {
      const stored = localStorage.getItem("worktrack_admin_employees")
      return stored ? JSON.parse(stored) : initialAdminEmployees
    } catch {
      return initialAdminEmployees
    }
  })
  const [departments, setDepartments] = useState<Department[]>(initialDepartments)
  const [tasks, setTasks] = useState<AdminTask[]>(() => {
    try {
      const stored = localStorage.getItem("worktrack_admin_tasks")
      return stored ? JSON.parse(stored) : initialAdminTasks
    } catch {
      return initialAdminTasks
    }
  })
  const [attendance, setAttendance] = useState<AdminAttendanceDay[]>(initialAdminAttendance)
  const [leaveRequests, setLeaveRequests] = useState<AdminLeaveRecord[]>(initialAdminLeaveRequests)
  const [deadlineHistory, setDeadlineHistory] = useState<DeadlineChangeRecord[]>(initialDeadlineHistory)
  const [adminComments, setAdminComments] = useState<AdminSuperAdminComment[]>(initialSuperAdminComments)

  useEffect(() => {
    try {
      localStorage.setItem("worktrack_admin_employees", JSON.stringify(employees))
    } catch {}
  }, [employees])

  useEffect(() => {
    try {
      localStorage.setItem("worktrack_admin_departments", JSON.stringify(departments))
    } catch {}
  }, [departments])

  useEffect(() => {
    try {
      localStorage.setItem("worktrack_admin_tasks", JSON.stringify(tasks))
    } catch {}
  }, [tasks])

  // Reusable backend employee synchronizer
  const refreshEmployees = useCallback(async () => {
    try {
      const res = await api.employees.getAll()
      if (res && res.success && Array.isArray(res.employees)) {
        if (res.employees.length > 0) {
          const mapped: AdminEmployee[] = res.employees.map((e: any) => {
            let attendanceToday: TodayAttendanceStatus = "absent"
            if (e.attendance_today) {
              attendanceToday = e.attendance_today as TodayAttendanceStatus
            } else if (e.check_in_today && !e.check_out_today) {
              attendanceToday = "working"
            } else if (e.check_in_today && e.check_out_today) {
              attendanceToday = "logged-out"
            }

            const checkInFormatted = e.check_in_today
              ? new Date(e.check_in_today).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
              : undefined

            const checkOutFormatted = e.check_out_today
              ? new Date(e.check_out_today).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
              : undefined

            return {
              id: e.employee_id || e.id,
              firstName: e.first_name || "",
              lastName: e.last_name || "",
              name: `${e.first_name || ""} ${e.last_name || ""}`.trim() || e.email,
              avatar: e.avatar_url || `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80`,
              email: e.email,
              phone: e.phone || "",
              designation: e.designation || "Staff",
              department: e.department_name || "Unassigned",
              departmentId: e.department_id || undefined,
              departmentCode: e.department_code || undefined,
              avatarUrl: e.avatar_url,
              joinDate: e.join_date ? e.join_date.slice(0, 10) : new Date().toISOString().slice(0, 10),
              location: e.location || "Main HQ",
              accountStatus: e.status || "active",
              attendanceToday,
              checkInToday: checkInFormatted,
              checkOutToday: checkOutFormatted,
              hoursLoggedToday: e.seconds_logged_today ? Number((e.seconds_logged_today / 3600).toFixed(2)) : 0,
              activeTasksCount: Number(e.active_tasks_count) || 0,
              completedTasksCount: Number(e.completed_tasks_count) || 0,
              credentialsProvisioned: true,
            }
          })
          setEmployees(mapped)
        } else {
          setEmployees([])
        }
      }
    } catch (err: any) {
      console.warn("Backend employee sync notice (local state retained):", err.message)
    }
  }, [])

  // Reusable backend department synchronizer
  const refreshDepartments = useCallback(async () => {
    try {
      localStorage.removeItem("worktrack_admin_departments")
      const res = await api.departments.getAll()
      if (res && res.success && Array.isArray(res.departments)) {
        const mapped: Department[] = res.departments.map((d: any) => ({
          id: d.id,
          name: d.name,
          code: d.code,
          description: d.description || "",
          headEmployeeId: d.head_employee_id || undefined,
          headEmployeeName: undefined,
          employeeCount: Number(d.employee_count) || 0,
          activeTasksCount: Number(d.active_tasks_count) || 0,
          isArchived: Boolean(d.is_archived),
          createdAt: d.created_at || new Date().toISOString(),
          updatedAt: d.updated_at || new Date().toISOString(),
        }))
        setDepartments(mapped)
      } else {
        setDepartments([])
      }
    } catch (err: any) {
      console.warn("Backend department sync notice (local state retained):", err.message)
      setDepartments([])
    }
  }, [])

  // Reusable backend attendance synchronizer
  const refreshAttendance = useCallback(async () => {
    try {
      const res = await api.attendance.getAll()
      if (res && res.success && Array.isArray(res.attendance)) {
        const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
        const mapped: AdminAttendanceDay[] = res.attendance.map((a: any) => {
          const dateStr = typeof a.date === "string" ? a.date.split("T")[0] : new Date(a.date).toISOString().split("T")[0]
          const [yr, mo, da] = dateStr.split("-").map(Number)
          const dateObj = yr && mo && da ? new Date(yr, mo - 1, da) : new Date(a.date)
          const dayOfWeek = days[dateObj.getDay()] || "Mon"
          const totalSec = a.total_duration_seconds || 0
          const netHours = Number((totalSec / 3600).toFixed(2))

          let status: AdminAttendanceDay["status"] = "present"
          if (a.punch_in && !a.punch_out) {
            status = "working"
          } else if (a.punch_in && a.punch_out) {
            status = "logged-out"
          } else if (a.status) {
            status = a.status
          }

          const checkIn = a.punch_in
            ? new Date(a.punch_in).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
            : "—"
          const checkOut = a.punch_out
            ? new Date(a.punch_out).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
            : "—"

          return {
            id: a.id,
            employeeId: a.emp_code || a.employee_id,
            employeeName: `${a.first_name || ""} ${a.last_name || ""}`.trim() || a.employee_id,
            employeeAvatar: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80`,
            department: a.department_name || "General",
            date: dateStr,
            dayOfWeek,
            checkIn,
            checkOut,
            breakDuration: "0 mins",
            breakDurationSeconds: 0,
            netHoursWorked: netHours,
            status,
          }
        })
        setAttendance(mapped)
      }
    } catch (err: any) {
      console.warn("Backend attendance sync notice:", err.message)
    }
  }, [])

  // Reusable backend tasks synchronizer
  const refreshTasks = useCallback(async () => {
    try {
      const res = await api.tasks.getAll()
      if (res && res.success && Array.isArray(res.tasks)) {
        const mapped: AdminTask[] = res.tasks.map((row: any) => {
          const deadlineFormatted = row.deadline
            ? (typeof row.deadline === "string"
                ? (row.deadline.includes("T") ? row.deadline : new Date(row.deadline).toISOString())
                : new Date(row.deadline).toISOString())
            : ""
          const startDateFormatted = row.created_at
            ? (typeof row.created_at === "string" ? row.created_at.slice(0, 10) : new Date(row.created_at).toISOString().slice(0, 10))
            : new Date().toISOString().slice(0, 10)

          return {
            id: row.id,
            title: row.title,
            description: row.description || "",
            category: row.department_name || "General",
            deadline: deadlineFormatted,
            startDate: startDateFormatted,
            status: row.status || "pending",
            progress: (Number(row.progress) || 0) as TaskProgress,
            isSelfCreated: false,
            assignedTo: [row.emp_code || row.assigned_to],
            assignedEmployeeNames: [`${row.first_name || ""} ${row.last_name || ""}`.trim() || row.emp_code || "Staff"],
            assignedBy: row.created_by || "Admin",
            priority: row.priority || "medium",
            createdAt: row.created_at || new Date().toISOString(),
            updatedAt: row.updated_at || new Date().toISOString(),
            completedAt: (row.status === "completed" || Number(row.progress) === 100)
              ? (row.completed_at
                  ? (typeof row.completed_at === "string" ? row.completed_at : new Date(row.completed_at).toISOString())
                  : (row.deadline
                      ? (typeof row.deadline === "string" ? row.deadline : new Date(row.deadline).toISOString())
                      : row.created_at || new Date().toISOString()))
              : undefined,
            deadlineHistory: row.delay_reason
              ? [
                  {
                    id: `DL-${row.id}`,
                    taskId: row.id,
                    taskTitle: row.title,
                    oldDeadline: deadlineFormatted,
                    newDeadline: deadlineFormatted,
                    reason: row.delay_reason,
                    changedBy: "Admin",
                    changedAt: row.updated_at || new Date().toISOString(),
                  },
                ]
              : [],
            delayReason: row.delay_reason || undefined,
            projectId: row.project_id || undefined,
            projectName: row.project_name || undefined,
            projectPartId: row.project_part_id || undefined,
          }
        })
        setTasks(mapped)
      }
    } catch (err: any) {
      console.warn("Backend tasks sync notice:", err.message)
    }
  }, [])

  // Reusable backend leave requests synchronizer
  const refreshLeaveRequests = useCallback(async () => {
    try {
      const res = await api.leave.getAll()
      if (res && res.success && Array.isArray(res.leaves)) {
        const mapped: AdminLeaveRecord[] = res.leaves.map((l: any) => {
          const start = new Date(l.start_date)
          const end = new Date(l.end_date)
          const days = Math.max(1, Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1)
          return {
            id: l.id,
            employeeId: l.emp_code || l.employee_id,
            employeeName: `${l.first_name || ""} ${l.last_name || ""}`.trim() || l.emp_code || "Staff",
            leaveType: l.leave_type,
            startDate: typeof l.start_date === "string" ? l.start_date.slice(0, 10) : new Date(l.start_date).toISOString().slice(0, 10),
            endDate: typeof l.end_date === "string" ? l.end_date.slice(0, 10) : new Date(l.end_date).toISOString().slice(0, 10),
            totalDays: days,
            daysCount: days,
            appliedAt: l.created_at || new Date().toISOString(),
            reason: l.reason,
            status: l.status,
            appliedDate: typeof l.created_at === "string" ? l.created_at.slice(0, 10) : new Date(l.created_at).toISOString().slice(0, 10),
            createdAt: l.created_at || new Date().toISOString(),
            adminRemarks: l.admin_remarks || undefined,
            superAdminRemarks: l.super_admin_remarks || undefined,
          }
        })
        setLeaveRequests(mapped)
      }
    } catch (err: any) {
      console.warn("Backend leave sync notice:", err.message)
    }
  }, [])

  // Initial sync on mount and live real-time sync listeners
  useEffect(() => {
    const syncAll = () => {
      refreshEmployees()
      refreshDepartments()
      refreshAttendance()
      refreshTasks()
      refreshLeaveRequests()
    }

    syncAll()

    // 1. Periodic background polling every 15 seconds
    const intervalId = window.setInterval(syncAll, 15000)

    // 2. Immediate refresh when Admin tab gains focus
    window.addEventListener("focus", syncAll)

    // 3. Instant cross-tab broadcast message channels
    let chAttendance: BroadcastChannel | null = null
    let chTasks: BroadcastChannel | null = null
    let chLeave: BroadcastChannel | null = null
    let chEmployees: BroadcastChannel | null = null
    try {
      chAttendance = new BroadcastChannel("worktrack_attendance")
      chAttendance.onmessage = () => {
        refreshEmployees()
        refreshAttendance()
      }
      chTasks = new BroadcastChannel("worktrack_tasks")
      chTasks.onmessage = () => {
        refreshTasks()
        refreshEmployees()
      }
      chLeave = new BroadcastChannel("worktrack_leave")
      chLeave.onmessage = () => {
        refreshLeaveRequests()
      }
      chEmployees = new BroadcastChannel("worktrack_employees")
      chEmployees.onmessage = () => {
        refreshEmployees()
      }
    } catch {}

    return () => {
      window.clearInterval(intervalId)
      window.removeEventListener("focus", syncAll)
      if (chAttendance) chAttendance.close()
      if (chTasks) chTasks.close()
      if (chLeave) chLeave.close()
      if (chEmployees) chEmployees.close()
    }
  }, [refreshEmployees, refreshDepartments, refreshAttendance, refreshTasks, refreshLeaveRequests])



  // Derived Organization-Wide KPIs
  const kpis = useMemo(() => {
    const totalEmployees = employees.length
    let presentToday = 0
    let workingNow = 0
    let onBreakNow = 0
    let loggedOutToday = 0
    let absentToday = 0
    let onLeaveToday = 0

    employees.forEach(emp => {
      switch (emp.attendanceToday) {
        case "working":
          workingNow++
          presentToday++
          break
        case "on-break":
          onBreakNow++
          presentToday++
          break
        case "logged-out":
        case "present":
          loggedOutToday++
          presentToday++
          break
        case "on-leave":
          onLeaveToday++
          break
        case "absent":
        default:
          absentToday++
          break
      }
    })

    const todayYmd = new Date().toISOString().slice(0, 10)
    let tasksDueToday = 0
    let tasksInProgress = 0
    let tasksCompleted = 0
    let tasksOverdue = 0

    tasks.forEach(task => {
      const derived = deriveTaskStatus(task)
      if (task.deadline && task.deadline.slice(0, 10) === todayYmd) {
        tasksDueToday++
      }
      if (derived === "completed") {
        tasksCompleted++
      } else if (derived === "overdue") {
        tasksOverdue++
      } else if (derived === "in-progress") {
        tasksInProgress++
      }
    })

    return {
      totalEmployees,
      presentToday,
      workingNow,
      onBreakNow,
      loggedOutToday,
      absentToday,
      onLeaveToday,
      tasksDueToday,
      tasksInProgress,
      tasksCompleted,
      tasksOverdue,
    }
  }, [employees, tasks])

  // --- EMPLOYEE MANAGEMENT ---
  const createEmployee = useCallback((input: CreateEmployeeInput): AdminEmployee => {
    const newId = input.employeeId?.trim()
      ? input.employeeId.trim().toUpperCase()
      : `EMP-${Math.floor(1000 + Math.random() * 9000)}`

    const setPass = input.password?.trim()
      ? input.password.trim()
      : input.provisionPassword
      ? `WorkTrack#${Math.floor(1000 + Math.random() * 9000)}!`
      : "WorkTrack#2026!"

    const avatarUrl = `https://images.unsplash.com/photo-${1500000000000 + Math.floor(Math.random() * 99999999)}?w=150&auto=format&fit=crop&q=80`

    const newEmp: AdminEmployee = {
      id: newId,
      firstName: input.firstName.trim(),
      lastName: input.lastName.trim(),
      name: `${input.firstName.trim()} ${input.lastName.trim()}`,
      avatar: avatarUrl,
      email: input.email.trim().toLowerCase(),
      designation: input.designation.trim(),
      department: input.department.trim(),
      avatarUrl,
      joinDate: new Date().toISOString().slice(0, 10),
      phone: input.phone.trim() || "+1 (555) 000-0000",
      location: input.location.trim() || "Remote",
      accountStatus: input.accountStatus || "active",
      attendanceToday: "absent",
      activeTasksCount: 0,
      completedTasksCount: 0,
      credentialsProvisioned: true,
      password: setPass,
      tempPassword: setPass,
    }

    setEmployees(prev => [newEmp, ...prev])

    // Update department count
    setDepartments(prev =>
      prev.map(d =>
        d.name.toLowerCase() === input.department.trim().toLowerCase()
          ? { ...d, employeeCount: d.employeeCount + 1 }
          : d
      )
    )

    toast.success(`Employee ${newEmp.firstName} ${newEmp.lastName} (${newId}) created successfully`, {
      description: `Login ID & initial password provisioned by Administrator.`,
    })

    return newEmp
  }, [])

  const updateEmployee = useCallback((id: string, updates: Partial<AdminEmployee>) => {
    // 1. Immediately update local state for responsive UI
    setEmployees(prev => {
      return prev.map(emp => {
        if (emp.id !== id) return emp
        return { ...emp, ...updates }
      })
    })

    // 2. Persist to MariaDB backend
    const deptId = updates.departmentId || updates.department;
    api.employees.update(id, {
      firstName: updates.firstName,
      lastName: updates.lastName,
      email: updates.email,
      phone: updates.phone,
      designation: updates.designation,
      departmentId: deptId,
      location: updates.location,
      accountStatus: updates.accountStatus,
      avatarUrl: updates.avatarUrl || updates.avatar,
    }).then(() => {
      // Re-sync employees and departments to get accurate department_name, department_code, and department employee_count
      refreshEmployees()
      refreshDepartments()
      try {
        const ch = new BroadcastChannel("worktrack_employees")
        ch.postMessage({ type: "EMPLOYEE_UPDATED", id })
        ch.close()
      } catch {}
    }).catch(err => {
      console.warn("Backend employee update notice:", err.message)
    })

    toast.success("Employee profile updated successfully")
  }, [refreshEmployees, refreshDepartments])

  const updateEmployeePassword = useCallback(
    (id: string, newPassword: string): { success: boolean; error?: string } => {
      const clean = newPassword.trim()
      if (!clean || clean.length < 6) {
        const error = "Password must be at least 6 characters long."
        toast.error(error)
        return { success: false, error }
      }
      const target = employees.find(e => e.id === id)
      if (!target) {
        return { success: false, error: "Employee record not found." }
      }

      setEmployees(prev =>
        prev.map(emp => {
          if (emp.id !== id) return emp
          return {
            ...emp,
            password: clean,
            tempPassword: clean,
            credentialsProvisioned: true,
          }
        })
      )

      toast.success(`Password for ${target.name} (${target.id}) updated successfully`, {
        description: "Only administrators are authorized to update workforce access credentials.",
      })
      return { success: true }
    },
    [employees]
  )

  const deactivateEmployee = useCallback((id: string) => {
    setEmployees(prev =>
      prev.map(emp => {
        if (emp.id !== id) return emp
        const newStatus = emp.accountStatus === "deactivated" ? "active" : "deactivated"
        toast.info(
          `Employee ${emp.firstName} ${emp.lastName} account is now ${newStatus}. Historical data preserved.`
        )
        return { ...emp, accountStatus: newStatus }
      })
    )
  }, [])

  const deleteEmployee = useCallback(
    (id: string): { success: boolean; error?: string } => {
      const emp = employees.find(e => e.id === id)
      if (!emp) return { success: false, error: "Employee not found." }

      // Check if employee has active tasks
      const hasActiveTasks = tasks.some(t => t.assignedTo.includes(id) && t.progress < 100)
      if (hasActiveTasks) {
        const error = `Cannot permanently delete ${emp.firstName} ${emp.lastName}: Employee has active assignments. Please reassign tasks or deactivate the account instead.`
        toast.error(error)
        return { success: false, error }
      }

      setEmployees(prev => prev.filter(e => e.id !== id))
      toast.success(`Employee ${emp.firstName} ${emp.lastName} removed from the system.`)
      return { success: true }
    },
    [employees, tasks]
  )

  // --- DEPARTMENT MANAGEMENT ---
  const createDepartment = useCallback(
    (input: CreateDepartmentInput): { success: boolean; error?: string } => {
      const cleanName = input.name.trim()
      const cleanCode = input.code.trim().toUpperCase()

      // Duplicate validation (case-insensitive)
      const isDuplicate = departments.some(
        d => d.name.toLowerCase() === cleanName.toLowerCase() || d.code.toLowerCase() === cleanCode.toLowerCase()
      )

      if (isDuplicate) {
        const error = `Department "${cleanName}" (${cleanCode}) already exists. Duplicate department names are prohibited.`
        toast.error(error)
        return { success: false, error }
      }

      // Use a temporary frontend ID; will be replaced with real DB ID after API response
      const tempId = `DEP-${cleanCode || Math.floor(100 + Math.random() * 900)}`

      const newDept: Department = {
        id: tempId,
        name: cleanName,
        code: cleanCode,
        description: input.description.trim(),
        headEmployeeId: input.headEmployeeId,
        headEmployeeName: input.headEmployeeId
          ? employees.find(e => e.id === input.headEmployeeId)?.firstName + " " + employees.find(e => e.id === input.headEmployeeId)?.lastName
          : undefined,
        employeeCount: 0,
        activeTasksCount: 0,
        isArchived: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      setDepartments(prev => [...prev, newDept])
      toast.success(`Department "${cleanName}" created successfully`)

      // Persist to backend DB and update the department ID with the real DB-assigned ID
      api.departments.create({
        name: cleanName,
        code: cleanCode,
        description: input.description.trim(),
        headEmployeeId: input.headEmployeeId || null,
      }).then(res => {
        if (res && res.departmentId) {
          // Replace tempId with real DB ID in state
          setDepartments(prev =>
            prev.map(d => d.id === tempId ? { ...d, id: res.departmentId } : d)
          )
          console.info(`Department "${cleanName}" synced to DB with ID: ${res.departmentId}`)
        }
      }).catch(err => console.warn("Department create API sync:", err.message))

      return { success: true }
    },
    [departments, employees]
  )

  const updateDepartment = useCallback(
    (id: string, updates: Partial<Department>): { success: boolean; error?: string } => {
      if (updates.name) {
        const cleanName = updates.name.trim()
        const isDuplicate = departments.some(
          d => d.id !== id && d.name.toLowerCase() === cleanName.toLowerCase()
        )
        if (isDuplicate) {
          const error = `Department name "${cleanName}" is already taken.`
          toast.error(error)
          return { success: false, error }
        }
      }

      setDepartments(prev =>
        prev.map(d => {
          if (d.id !== id) return d
          const headName = updates.headEmployeeId
            ? employees.find(e => e.id === updates.headEmployeeId)?.firstName + " " + employees.find(e => e.id === updates.headEmployeeId)?.lastName
            : d.headEmployeeName
          return { ...d, ...updates, headEmployeeName: headName, updatedAt: new Date().toISOString() }
        })
      )
      toast.success("Department details updated successfully")
      return { success: true }
    },
    [departments, employees]
  )

  const archiveDepartment = useCallback(
    (id: string): { success: boolean; error?: string } => {
      const dept = departments.find(d => d.id === id)
      if (!dept) return { success: false, error: "Department not found" }

      // Check if department has active employees
      const assignedEmps = employees.filter(e => e.department && e.department.toLowerCase() === dept.name.toLowerCase())
      if (assignedEmps.length > 0 && !dept.isArchived) {
        const error = `Cannot archive department "${dept.name}": There are currently ${assignedEmps.length} active employee(s) assigned to this department. Please reassign them first.`
        toast.error(error)
        return { success: false, error }
      }

      setDepartments(prev =>
        prev.map(d => (d.id === id ? { ...d, isArchived: true, updatedAt: new Date().toISOString() } : d))
      )
      toast.info(`Department "${dept.name}" moved to archive.`)
      api.departments.archive(id, true).catch(err => console.warn(err.message))
      return { success: true }
    },
    [departments, employees]
  )

  const restoreDepartment = useCallback(
    (id: string): { success: boolean; error?: string } => {
      const dept = departments.find(d => d.id === id)
      if (!dept) return { success: false, error: "Department not found" }

      setDepartments(prev =>
        prev.map(d => (d.id === id ? { ...d, isArchived: false, updatedAt: new Date().toISOString() } : d))
      )
      toast.success(`Department "${dept.name}" restored to active architecture.`)
      api.departments.restore(id).catch(err => console.warn(err.message))
      return { success: true }
    },
    [departments]
  )

  const deleteDepartment = useCallback(
    (id: string): { success: boolean; error?: string } => {
      const dept = departments.find(d => d.id === id)
      if (!dept) return { success: false, error: "Department not found" }

      // Check if department has active employees
      const assignedEmps = employees.filter(e => e.department && e.department.toLowerCase() === dept.name.toLowerCase())
      if (assignedEmps.length > 0) {
        const error = `Cannot delete department "${dept.name}": There are currently ${assignedEmps.length} active employee(s) assigned to this department. Please reassign them to another department first.`
        toast.error(error)
        return { success: false, error }
      }

      setDepartments(prev => prev.filter(d => d.id !== id))
      toast.success(`Department "${dept.name}" (${dept.code}) has been permanently deleted.`)
      api.departments.delete(id).catch(err => console.warn(err.message))
      return { success: true }
    },
    [departments, employees]
  )

  // --- TASK MANAGEMENT (DEADLINE-ONLY MODEL, NO TIME ALLOTTED) ---
  const createTask = useCallback(
    (input: CreateAdminTaskInput): AdminTask => {
      const nowIso = new Date().toISOString()
      const newId = `TSK-${Math.floor(250 + Math.random() * 750)}`

      const assigneeNames = input.assignedTo
        .map(empId => {
          const match = employees.find(e => e.id === empId)
          return match ? `${match.firstName} ${match.lastName}` : empId
        })

      const newTask: AdminTask = {
        id: newId,
        title: input.title.trim(),
        description: input.description?.trim(),
        category: input.category || "General",
        deadline: input.deadline,
        startDate: input.startDate || nowIso.slice(0, 10),
        status: "pending",
        progress: 0,
        isSelfCreated: false,
        assignedTo: input.assignedTo,
        assignedEmployeeNames: assigneeNames,
        assignedBy: "Admin",
        priority: input.priority || "medium",
        createdAt: nowIso,
        updatedAt: nowIso,
        deadlineHistory: [],
        projectId: input.projectId,
        projectName: input.projectName,
        projectPartId: input.projectPartId,
        projectPartName: input.projectPartName,
      }

      setTasks(prev => [newTask, ...prev])

      // Persist to MariaDB backend
      api.tasks.create({
        title: input.title.trim(),
        description: input.description?.trim(),
        assignedTo: input.assignedTo,
        deadline: input.deadline,
        priority: input.priority || "medium",
        projectId: input.projectId,
        projectPartId: input.projectPartId,
        createdBy: "Admin",
      }).then(() => {
        try {
          const ch = new BroadcastChannel("worktrack_tasks")
          ch.postMessage({ type: "TASK_CREATED" })
          ch.close()
        } catch {}
      }).catch(err => {
        console.warn("Backend task creation notice:", err.message)
      })

      // Increment employee active task counts
      setEmployees(prev =>
        prev.map(emp =>
          input.assignedTo.includes(emp.id)
            ? { ...emp, activeTasksCount: emp.activeTasksCount + 1 }
            : emp
        )
      )

      toast.success(`Task "${newTask.title}" assigned to ${assigneeNames.length} employee(s)`)
      return newTask
    },
    [employees]
  )

  // Critical requirement: Admin can change deadline of a task WITH a reason
  const updateTaskDeadline = useCallback(
    (taskId: string, newDeadline: string, reason: string): { success: boolean; error?: string } => {
      if (!reason || !reason.trim()) {
        const error = "A valid justification reason is required when modifying a task deadline."
        toast.error(error)
        return { success: false, error }
      }

      const target = tasks.find(t => t.id === taskId)
      if (!target) {
        return { success: false, error: "Task not found" }
      }

      const nowIso = new Date().toISOString()
      const historyEntry: DeadlineChangeRecord = {
        id: `DL-${Date.now()}`,
        taskId: target.id,
        taskTitle: target.title,
        oldDeadline: target.deadline,
        newDeadline,
        reason: reason.trim(),
        changedBy: "Admin (Sarah Jenkins)",
        changedAt: nowIso,
      }

      setTasks(prev =>
        prev.map(t => {
          if (t.id !== taskId) return t
          const existingHistory = t.deadlineHistory || []
          return {
            ...t,
            deadline: newDeadline,
            updatedAt: nowIso,
            deadlineHistory: [historyEntry, ...existingHistory],
          }
        })
      )

      setDeadlineHistory(prev => [historyEntry, ...prev])

      // Persist deadline change to MariaDB backend
      api.tasks.updateDeadline(taskId, newDeadline, reason.trim())
        .then(() => {
          try {
            const ch = new BroadcastChannel("worktrack_tasks")
            ch.postMessage({ type: "TASK_UPDATED", taskId })
            ch.close()
          } catch {}
        })
        .catch(err => {
          console.warn("Backend task deadline update notice:", err.message)
        })

      toast.success(`Deadline updated for task ${taskId}`, {
        description: `Audit reason recorded: "${reason.trim()}"`,
      })

      return { success: true }
    },
    [tasks]
  )

  // --- ADMINISTRATIVE COMMENTS TO SUPER ADMIN ---
  const addAdminComment = useCallback(
    (
      input: Omit<AdminSuperAdminComment, "id" | "createdAt" | "status" | "authorName" | "authorRole">
    ): AdminSuperAdminComment => {
      const newComment: AdminSuperAdminComment = {
        id: `CMT-${Date.now()}`,
        ...input,
        authorName: "Sarah Jenkins",
        authorRole: "System Admin",
        createdAt: new Date().toISOString(),
        status: "open",
      }

      setAdminComments(prev => [newComment, ...prev])
      toast.success("Observation addressed to Super Admin submitted", {
        description: "Logged to the administrative audit queue.",
      })

      return newComment
    },
    []
  )

  // --- SUPER ADMIN LEAVE APPROVALS ---
  const approveLeave = useCallback((leaveId: string, remarks?: string) => {
    setLeaveRequests(prev =>
      prev.map(l => {
        if (l.id !== leaveId) return l
        return {
          ...l,
          status: "approved" as const,
          adminComment: remarks?.trim() || l.adminComment || "Approved by Super Admin",
        }
      })
    )

    api.leave.decide(leaveId, "approved", remarks)
      .then(() => {
        try {
          const ch = new BroadcastChannel("worktrack_leave")
          ch.postMessage({ type: "LEAVE_DECISION", leaveId, decision: "approved" })
          ch.close()
        } catch {}
      })
      .catch(err => {
        console.warn("Backend leave approval notice:", err.message)
      })

    toast.success("Leave Request Approved", {
      description: `Application #${leaveId} marked Approved with Super Admin executive authority.`,
    })
    return { success: true }
  }, [])

  const rejectLeave = useCallback((leaveId: string, remarks?: string) => {
    setLeaveRequests(prev =>
      prev.map(l => {
        if (l.id !== leaveId) return l
        return {
          ...l,
          status: "rejected" as const,
          adminComment: remarks?.trim() || l.adminComment || "Rejected by Super Admin",
        }
      })
    )

    api.leave.decide(leaveId, "rejected", remarks)
      .then(() => {
        try {
          const ch = new BroadcastChannel("worktrack_leave")
          ch.postMessage({ type: "LEAVE_DECISION", leaveId, decision: "rejected" })
          ch.close()
        } catch {}
      })
      .catch(err => {
        console.warn("Backend leave rejection notice:", err.message)
      })

    toast.error("Leave Request Rejected", {
      description: `Application #${leaveId} marked Rejected by Super Admin.`,
    })
    return { success: true }
  }, [])

  const value = useMemo(
    () => ({
      currentRole,
      isSuperAdmin,
      setRole,
      employees,
      departments,
      tasks,
      attendance,
      leaveRequests,
      deadlineHistory,
      adminComments,
      kpis,
      createEmployee,
      updateEmployee,
      updateEmployeePassword,
      deactivateEmployee,
      deleteEmployee,
      createDepartment,
      updateDepartment,
      archiveDepartment,
      restoreDepartment,
      deleteDepartment,
      createTask,
      updateTaskDeadline,
      addAdminComment,
      approveLeave,
      rejectLeave,
      refreshEmployees,
      refreshDepartments,
      refreshAttendance,
      refreshTasks,
      refreshLeaveRequests,
    }),
    [
      currentRole,
      isSuperAdmin,
      setRole,
      employees,
      departments,
      tasks,
      attendance,
      leaveRequests,
      deadlineHistory,
      adminComments,
      kpis,
      createEmployee,
      updateEmployee,
      updateEmployeePassword,
      deactivateEmployee,
      deleteEmployee,
      createDepartment,
      updateDepartment,
      archiveDepartment,
      restoreDepartment,
      deleteDepartment,
      createTask,
      updateTaskDeadline,
      addAdminComment,
      approveLeave,
      rejectLeave,
      refreshEmployees,
      refreshDepartments,
      refreshAttendance,
      refreshTasks,
      refreshLeaveRequests,
    ]
  )

  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>
}

export function useAdmin() {
  const context = useContext(AdminContext)
  if (!context) {
    throw new Error("useAdmin must be used within an AdminProvider")
  }
  return context
}
