import React from "react"
import { EmployeeTable } from "../components/EmployeeTable"
import { Users, ShieldAlert } from "lucide-react"

export const EmployeesPage: React.FC = () => {
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <Users className="w-4 h-4" />
          </div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Workforce Directory & Access Management
          </h1>
        </div>
        <p className="text-xs text-slate-500 mt-1">
          Full roster management: provision initial login credentials, adjust roles, monitor real-time clock-in statuses, or deactivate accounts.
        </p>
      </div>

      <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 flex items-center gap-3 text-xs text-slate-600 dark:text-slate-400">
        <ShieldAlert className="w-4 h-4 text-indigo-500 shrink-0" />
        <span>
          <strong>Security Policy Reminder:</strong> In accordance with corporate governance, employees are restricted from altering their primary login credentials. Admins hold authoritative credential provisioning and reset controls.
        </span>
      </div>

      <EmployeeTable />
    </div>
  )
}
