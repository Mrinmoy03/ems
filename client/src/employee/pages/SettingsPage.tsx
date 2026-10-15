import React, { useState } from "react"
import { useTheme } from "@/app/theme-provider"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Bell, Lock, Check, Sun, Moon, Laptop, Palette } from "lucide-react"
import { toast } from "sonner"

export const SettingsPage: React.FC = () => {
  const { theme, setTheme } = useTheme()
  const [emailAlerts, setEmailAlerts] = useState(true)
  const [taskReminders, setTaskReminders] = useState(true)
  const [lunchAlerts, setLunchAlerts] = useState(true)

  const handleSavePreferences = (e: React.FormEvent) => {
    e.preventDefault()
    toast.success("Preferences updated successfully")
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
                checked={taskReminders}
                onChange={e => setTaskReminders(e.target.checked)}
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
                checked={lunchAlerts}
                onChange={e => setLunchAlerts(e.target.checked)}
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
                checked={emailAlerts}
                onChange={e => setEmailAlerts(e.target.checked)}
                className="h-4 w-4 text-blue-600 rounded border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-blue-500"
              />
            </div>
          </CardContent>
        </Card>

        {/* Security & Password */}
        <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <CardHeader>
            <CardTitle className="text-sm font-semibold flex items-center gap-2 text-slate-900 dark:text-slate-100">
              <Lock className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              Security & Credentials
            </CardTitle>
            <CardDescription className="text-xs text-slate-500 dark:text-slate-400">
              Manage your login security and credentials
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="curr-pass">Current Password</Label>
                <Input id="curr-pass" type="password" placeholder="••••••••" className="text-xs" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="new-pass">New Password</Label>
                <Input id="new-pass" type="password" placeholder="••••••••" className="text-xs" />
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
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  )
}
