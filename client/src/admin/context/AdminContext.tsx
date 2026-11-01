import React, { createContext, useContext, useState, useMemo, useCallback } from "react"
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

  // Task Management
  createTask: (input: CreateAdminTaskInput) => AdminTask
  updateTaskDeadline: (taskId: string, newDeadline: string, reason: string) => { success: boolean; error?: string }

  // Role Authority
  currentRole: "admin" | "super-admin"
  isSuperAdmin: boolean
  setRole: (role: "admin" | "super-admin") => void

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

  const [employees, setEmployees] = useState<AdminEmployee[]>(initialAdminEmployees)
  const [departments, setDepartments] = useState<Department[]>(initialDepartments)
  const [tasks, setTasks] = useState<AdminTask[]>(initialAdminTasks)
  const [attendance] = useState<AdminAttendanceDay[]>(initialAdminAttendance)
  const [leaveRequests, setLeaveRequests] = useState<AdminLeaveRecord[]>(initialAdminLeaveRequests)
  const [deadlineHistory, setDeadlineHistory] = useState<DeadlineChangeRecord[]>(initialDeadlineHistory)
  const [adminComments, setAdminComments] = useState<AdminSuperAdminComment[]>(initialSuperAdminComments)



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
    setEmployees(prev => {
      return prev.map(emp => {
        if (emp.id !== id) return emp
        return { ...emp, ...updates }
      })
    })
    toast.success("Employee profile updated successfully")
  }, [])

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

      const newDept: Department = {
        id: `DEP-${cleanCode || Math.floor(100 + Math.random() * 900)}`,
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
      const assignedEmps = employees.filter(e => e.department.toLowerCase() === dept.name.toLowerCase())
      if (assignedEmps.length > 0 && !dept.isArchived) {
        const error = `Cannot archive department "${dept.name}": There are currently ${assignedEmps.length} active employee(s) assigned to this department. Please reassign them first.`
        toast.error(error)
        return { success: false, error }
      }

      setDepartments(prev =>
        prev.map(d => (d.id === id ? { ...d, isArchived: !d.isArchived, updatedAt: new Date().toISOString() } : d))
      )
      toast.info(dept.isArchived ? `Department "${dept.name}" unarchived.` : `Department "${dept.name}" archived.`)
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
      createTask,
      updateTaskDeadline,
      addAdminComment,
      approveLeave,
      rejectLeave,
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
      createTask,
      updateTaskDeadline,
      addAdminComment,
      approveLeave,
      rejectLeave,
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
