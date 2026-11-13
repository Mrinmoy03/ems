import { createBrowserRouter, Navigate } from "react-router-dom"
import { LoginPage } from "../auth/pages/LoginPage"
import { ProtectedRoute } from "../auth/components/ProtectedRoute"

// Employee Portal Imports
import { EmployeeLayout } from "../employee/layouts/EmployeeLayout"
import { DashboardPage } from "../employee/pages/DashboardPage"
import { MyTasksPage } from "../employee/pages/MyTasksPage"
import { AddTaskPage } from "../employee/pages/AddTaskPage"
import { TimesheetPage } from "../employee/pages/TimesheetPage"
import { LeaveRequestPage } from "../employee/pages/LeaveRequestPage"
import { ReportsPage as EmployeeReportsPage } from "../employee/pages/ReportsPage"
import { ProfilePage } from "../employee/pages/ProfilePage"
import { SettingsPage } from "../employee/pages/SettingsPage"

// Admin Portal Imports
import { AdminLayout } from "../admin/layouts/AdminLayout"
import { AdminDashboardPage } from "../admin/pages/AdminDashboardPage"
import { EmployeesPage } from "../admin/pages/EmployeesPage"
import { EmployeeDetailsPage } from "../admin/pages/EmployeeDetailsPage"
import { DepartmentsPage } from "../admin/pages/DepartmentsPage"
import { DepartmentDetailsPage } from "../admin/pages/DepartmentDetailsPage"
import { ProjectsPage } from "../admin/pages/ProjectsPage"
import { ProjectDetailsPage } from "../admin/pages/ProjectDetailsPage"
import { TasksPage } from "../admin/pages/TasksPage"
import { AttendancePage } from "../admin/pages/AttendancePage"
import { ReportsPage as AdminReportsPage } from "../admin/pages/ReportsPage"
import { LeaveManagementPage } from "../admin/pages/LeaveManagementPage"
import { AdminSettingsPage } from "../admin/pages/AdminSettingsPage"

export const router = createBrowserRouter([
  // Public Login Route
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/",
    element: <Navigate to="/login" replace />,
  },
  {
    path: "/dashboard",
    element: <Navigate to="/login" replace />,
  },

  // Protected Employee Portal Routes (accessible by employee role)
  {
    path: "/employee",
    element: (
      <ProtectedRoute allowedRoles={["employee"]}>
        <EmployeeLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <DashboardPage />,
      },
      {
        path: "tasks",
        element: <MyTasksPage />,
      },
      {
        path: "add-task",
        element: <AddTaskPage />,
      },
      {
        path: "timesheet",
        element: <TimesheetPage />,
      },
      {
        path: "leave",
        element: <LeaveRequestPage />,
      },
      {
        path: "reports",
        element: <EmployeeReportsPage />,
      },
      {
        path: "profile",
        element: <ProfilePage />,
      },
      {
        path: "settings",
        element: <SettingsPage />,
      },
    ],
  },

  // Protected Admin Portal Routes (accessible by admin & super-admin)
  {
    path: "/admin",
    element: (
      <ProtectedRoute allowedRoles={["admin", "super-admin"]}>
        <AdminLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <AdminDashboardPage />,
      },
      {
        path: "employees",
        element: <EmployeesPage />,
      },
      {
        path: "employees/:employeeId",
        element: <EmployeeDetailsPage />,
      },
      {
        path: "departments",
        element: <DepartmentsPage />,
      },
      {
        path: "departments/:departmentId",
        element: <DepartmentDetailsPage />,
      },
      {
        path: "projects",
        element: <ProjectsPage />,
      },
      {
        path: "projects/:projectId",
        element: <ProjectDetailsPage />,
      },
      {
        path: "tasks",
        element: <TasksPage />,
      },
      {
        path: "attendance",
        element: <AttendancePage />,
      },
      {
        path: "reports",
        element: <AdminReportsPage />,
      },
      {
        path: "leave",
        element: <LeaveManagementPage />,
      },
      {
        path: "settings",
        element: <AdminSettingsPage />,
      },
    ],
  },

  // Protected Super Admin Portal Routes (exclusive Super Admin authority)
  {
    path: "/super-admin",
    element: (
      <ProtectedRoute allowedRoles={["super-admin"]}>
        <AdminLayout initialRole="super-admin" />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <AdminDashboardPage />,
      },
      {
        path: "employees",
        element: <EmployeesPage />,
      },
      {
        path: "employees/:employeeId",
        element: <EmployeeDetailsPage />,
      },
      {
        path: "departments",
        element: <DepartmentsPage />,
      },
      {
        path: "departments/:departmentId",
        element: <DepartmentDetailsPage />,
      },
      {
        path: "projects",
        element: <ProjectsPage />,
      },
      {
        path: "projects/:projectId",
        element: <ProjectDetailsPage />,
      },
      {
        path: "tasks",
        element: <TasksPage />,
      },
      {
        path: "attendance",
        element: <AttendancePage />,
      },
      {
        path: "reports",
        element: <AdminReportsPage />,
      },
      {
        path: "leave",
        element: <LeaveManagementPage />,
      },
      {
        path: "settings",
        element: <AdminSettingsPage />,
      },
    ],
  },

  // Fallback Wildcard
  {
    path: "*",
    element: <Navigate to="/login" replace />,
  },
])
