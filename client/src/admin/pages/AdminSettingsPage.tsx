import React from "react"
import {
  Settings,
  Shield,
  Calendar,
  Lock,
  KeyRound,
  ShieldCheck,
} from "lucide-react"
import { Button } from "../../components/ui/button"

import { Badge } from "../../components/ui/badge"
import { toast } from "sonner"

export const AdminSettingsPage: React.FC = () => {
  const handleSaveNotice = () => {
    toast.success("Organization policies and system preferences updated.")
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Page Header */}
      <div className="flex items-center gap-3 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
          <Settings className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            System Administration & Policy Configuration
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Organization working baselines, credential governance, and role privileges.
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {/* 1. Working Schedule & Shift Baseline */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                <Calendar className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  Standard Operational Schedule Baseline
                </h2>
                <p className="text-xs text-slate-500">
                  Organization-wide working day definition and expected hours per week
                </p>
              </div>
            </div>
            <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
              Active Policy
            </Badge>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-1">
              <span className="text-xs text-slate-500">Working Days</span>
              <p className="text-base font-bold text-slate-900 dark:text-slate-100">
                Monday &ndash; Saturday
              </p>
              <p className="text-[11px] text-slate-400">6 working days per week</p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-1">
              <span className="text-xs text-slate-500">Weekly Hours Standard</span>
              <p className="text-base font-bold text-indigo-600 dark:text-indigo-400">
                48.0 Hours / Week
              </p>
              <p className="text-[11px] text-slate-400">8.0 hours net shift / day</p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-1">
              <span className="text-xs text-slate-500">Designated Rest Day</span>
              <p className="text-base font-bold text-amber-600 dark:text-amber-400">
                Sunday
              </p>
              <p className="text-[11px] text-slate-400">Standard non-working day</p>
            </div>
          </div>
        </div>

        {/* 2. Security & Credentials Governance */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Authentication & Credential Governance
              </h2>
              <p className="text-xs text-slate-500">
                Mandatory policies controlling user credentials and login access
              </p>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
              <div className="space-y-1 text-xs">
                <p className="font-bold text-slate-900 dark:text-slate-100">
                  Strict Admin-Managed Credentials Policy
                </p>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                  Employees do not have self-service login credential modification permissions. System Administrators are authorized to provision initial passwords upon account creation and issue secure manual resets when requested.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 flex items-start gap-3">
              <KeyRound className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div className="space-y-1 text-xs">
                <p className="font-bold text-slate-900 dark:text-slate-100">
                  Task Deadline Modification Audit Requirement
                </p>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                  To ensure deliverable integrity, any modification of a task deadline by an administrator requires a mandatory written justification. This reason is logged permanently in the task audit trail.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 3. Role Hierarchy & Access Boundaries */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                System Role Hierarchy & Entitlements
              </h2>
              <p className="text-xs text-slate-500">
                Cross-tier permissions and separation of duties
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            {/* Employee */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-slate-900 dark:text-slate-100">
                  Employee Role
                </span>
                <Badge variant="secondary" className="text-[10px]">Tier 1</Badge>
              </div>
              <ul className="text-[11px] text-slate-500 space-y-1 list-disc pl-4">
                <li>Clock in / out & break timer</li>
                <li>Execute assigned tasks</li>
                <li>Submit daily EOD reports</li>
                <li>Apply for leaves</li>
                <li>Read-only own metrics</li>
              </ul>
            </div>

            {/* Admin */}
            <div className="p-4 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-indigo-900 dark:text-indigo-200">
                  System Admin (You)
                </span>
                <Badge className="bg-indigo-600 text-white text-[10px]">Tier 2</Badge>
              </div>
              <ul className="text-[11px] text-slate-600 dark:text-slate-400 space-y-1 list-disc pl-4">
                <li>Provision employee logins</li>
                <li>Create & multi-assign tasks</li>
                <li>Modify deadlines (audited)</li>
                <li>Manage department roster</li>
                <li>View-only leave review & notes</li>
              </ul>
            </div>

            {/* Super Admin */}
            <div className="p-4 rounded-xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-purple-900 dark:text-purple-200">
                  Super Admin
                </span>
                <Badge className="bg-purple-600 text-white text-[10px]">Tier 3</Badge>
              </div>
              <ul className="text-[11px] text-slate-600 dark:text-slate-400 space-y-1 list-disc pl-4">
                <li>Exclusive leave approvals</li>
                <li>System-wide billing & licensing</li>
                <li>Global policy overrides</li>
                <li>Admin role assignment</li>
                <li>Audit log purge & archive</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Save confirmation */}
        <div className="flex justify-end pt-2">
          <Button
            onClick={handleSaveNotice}
            className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs h-9 font-medium"
          >
            Save Administrative Preferences
          </Button>
        </div>
      </div>
    </div>
  )
}
