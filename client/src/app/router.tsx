import { createBrowserRouter, Navigate } from "react-router-dom"
import { EmployeeLayout } from "../employee/layouts/EmployeeLayout"
import { DashboardPage } from "../employee/pages/DashboardPage"
import { MyTasksPage } from "../employee/pages/MyTasksPage"
import { AddTaskPage } from "../employee/pages/AddTaskPage"
import { TimesheetPage } from "../employee/pages/TimesheetPage"
import { LeaveRequestPage } from "../employee/pages/LeaveRequestPage"
import { ReportsPage } from "../employee/pages/ReportsPage"
import { ProfilePage } from "../employee/pages/ProfilePage"
import { SettingsPage } from "../employee/pages/SettingsPage"

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Navigate to="/employee" replace />,
  },
  {
    path: "/employee",
    element: <EmployeeLayout />,
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
        element: <ReportsPage />,
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
  {
    path: "*",
    element: <Navigate to="/employee" replace />,
  },
])
