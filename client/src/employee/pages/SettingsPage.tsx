import React, { useState } from "react"
import { useTheme } from "@/app/theme-provider"
import { useEmployee } from "../context/EmployeeContext"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Bell, Lock, Check, Sun, Moon, Laptop, Palette, ShieldAlert, ShieldCheck } from "lucide-react"
import { toast } from "sonner"

export const SettingsPage: React.FC = () => {
  const { theme, setTheme } = useTheme()
  const { employee, notificationPreferences, updateNotificationPreferences } = useEmployee()
  const [taskDeadlineApproaching, setTaskDeadlineApproaching] = useState(
    notificationPreferences.taskDeadlineApproaching
  )
  const [lunchBreakReminder, setLunchBreakReminder] = useState(
    notificationPreferences.lunchBreakReminder
  )
  const [eodAutoDigest, setEodAutoDigest] = useState(
    notificationPreferences.eodAutoDigest
  )

  // Synchronize state when preferences change
  React.useEffect(() => {
    setTaskDeadlineApproaching(notificationPreferences.taskDeadlineApproaching)
    setLunchBreakReminder(notificationPreferences.lunchBreakReminder)
    setEodAutoDigest(notificationPreferences.eodAutoDigest)
  }, [notificationPreferences])

  const handleSavePreferences = (e: React.FormEvent) => {
    e.preventDefault()
    updateNotificationPreferences({
      taskDeadlineApproaching,
      lunchBreakReminder,
      eodAutoDigest,
    })
    toast.success("Preferences updated and saved successfully")
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
          System & Account Settings
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Configure appearance, theme modes, notification alerts, and security preferences
        </p>
      </div>

      <form onSubmit={handleSavePreferences} className="space-y-6">
        {/* Appearance & Universal Theme Mode */}
        <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <CardHeader>
            <CardTitle className="text-sm font-semibold flex items-center gap-2 text-slate-900 dark:text-slate-100">
              <Palette className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              Appearance & Universal Theme
            </CardTitle>
            <CardDescription className="text-xs text-slate-500 dark:text-slate-400">
              Customize the look and feel of your WorkTrack workspace. Changes take effect across all dashboard modules.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setTheme("light")}
                className={`flex flex-col items-center justify-center p-4 rounded-xl border text-xs font-semibold transition-all ${
                  theme === "light"
                    ? "border-blue-600 bg-blue-50/70 text-blue-700 ring-2 ring-blue-500/20 shadow-sm"
                    : "border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                <Sun className="h-6 w-6 text-amber-500 mb-2" />
                <span>Light Mode</span>
                <span className="text-[10px] text-slate-400 mt-0.5 font-normal">Clean cool-gray</span>
              </button>

              <button
                type="button"
                onClick={() => setTheme("dark")}
                className={`flex flex-col items-center justify-center p-4 rounded-xl border text-xs font-semibold transition-all ${
                  theme === "dark"
                    ? "border-blue-500 bg-blue-950/40 text-blue-400 ring-2 ring-blue-500/30 shadow-sm"
                    : "border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                <Moon className="h-6 w-6 text-blue-400 mb-2" />
                <span>Dark Mode</span>
                <span className="text-[10px] text-slate-400 mt-0.5 font-normal">Sleek deep navy</span>
              </button>

              <button
                type="button"
                onClick={() => setTheme("system")}
                className={`flex flex-col items-center justify-center p-4 rounded-xl border text-xs font-semibold transition-all ${
                  theme === "system"
                    ? "border-blue-600 dark:border-blue-500 bg-blue-50/70 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 ring-2 ring-blue-500/20 shadow-sm"
                    : "border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                <Laptop className="h-6 w-6 text-slate-400 mb-2" />
                <span>System Sync</span>
                <span className="text-[10px] text-slate-400 mt-0.5 font-normal">Follow OS theme</span>
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Notifications & Reminders */}
        <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <CardHeader>
            <CardTitle className="text-sm font-semibold flex items-center gap-2 text-slate-900 dark:text-slate-100">
              <Bell className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              Notifications & Reminders
            </CardTitle>
            <CardDescription className="text-xs text-slate-500 dark:text-slate-400">
              Manage when and how you receive alerts regarding assignments and deadlines.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
              <div>
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">Task Deadline Approaching</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Receive in-app notification 30 minutes before task deadline</p>
              </div>
              <input
                type="checkbox"
                checked={taskDeadlineApproaching}
                onChange={e => setTaskDeadlineApproaching(e.target.checked)}
                className="h-4 w-4 text-blue-600 rounded border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
              <div>
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">Lunch Break Active Reminder</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Alert if lunch break exceeds 60 minutes without resumption</p>
              </div>
              <input
                type="checkbox"
                checked={lunchBreakReminder}
                onChange={e => setLunchBreakReminder(e.target.checked)}
                className="h-4 w-4 text-blue-600 rounded border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
              <div>
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">Daily EOD Auto-Digest</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Display summary of completed assignments at workday wrap-up</p>
              </div>
              <input
                type="checkbox"
                checked={eodAutoDigest}
                onChange={e => setEodAutoDigest(e.target.checked)}
                className="h-4 w-4 text-blue-600 rounded border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-blue-500"
              />
            </div>
          </CardContent>
        </Card>

        {/* Security & Login Credentials (Admin-Managed Policy) */}
        <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold flex items-center gap-2 text-slate-900 dark:text-slate-100">
                <Lock className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                Security & Login Credentials
              </CardTitle>
              <span className="text-[10px] font-semibold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <ShieldCheck className="h-3 w-3" />
                Admin Managed
              </span>
            </div>
            <CardDescription className="text-xs text-slate-500 dark:text-slate-400">
              Corporate authentication and account credential policy
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Policy Notice Box */}
            <div className="p-3.5 rounded-lg bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800/60 text-xs flex items-start gap-3">
              <ShieldAlert className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-semibold text-amber-900 dark:text-amber-200">
                  Login Credentials Cannot Be Changed by Employees
                </p>
                <p className="text-[11px] text-amber-800/90 dark:text-amber-300/80 leading-relaxed">
                  Employees cannot change or reset login credentials. All user login identifiers, passwords, and system access permissions are centrally provisioned and managed by Organization Administrators and Corporate IT.
                </p>
              </div>
            </div>

            {/* Read-Only Account Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 text-xs">
              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 space-y-1">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">
                  Login Identifier / Email
                </span>
                <span className="font-semibold text-slate-800 dark:text-slate-200 text-xs">
                  {employee.email}
                </span>
              </div>

              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 space-y-1">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">
                  Password Status
                </span>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs text-slate-500 dark:text-slate-400 tracking-widest">
                    ••••••••••••••••
                  </span>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium flex items-center gap-1">
                    <Lock className="h-2.5 w-2.5" /> Locked
                  </span>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 space-y-1">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">
                  Authentication Type
                </span>
                <span className="font-semibold text-slate-800 dark:text-slate-200 text-xs">
                  Enterprise SSO / WorkTrack Auth
                </span>
              </div>

              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 space-y-1">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">
                  Credential Assistance
                </span>
                <span className="text-[11px] text-blue-600 dark:text-blue-400 font-medium">
                  Contact IT Administrator or HR
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-2">
          <Button
            type="submit"
            size="sm"
            className="bg-blue-600 hover:bg-blue-700 text-white gap-1.5 text-xs shadow-sm"
          >
            <Check className="h-3.5 w-3.5" />
            Save Preferences
          </Button>
        </div>
      </form>
    </div>
  )
}
