import React, { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAdmin } from "../context/AdminContext"
import { formatDashboardDate, getGreeting } from "../../employee/utils/date"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/ThemeToggle"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import {
  Bell,
  Menu,
  Settings,
  Calendar,
  ShieldCheck,
  ArrowRightLeft,
  CheckCheck,
  Plus,
  Briefcase,
  LogOut,
} from "lucide-react"
import { useAuth } from "../../auth/context/AuthContext"


interface AdminHeaderProps {
  onMobileMenuToggle: () => void
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({ onMobileMenuToggle }) => {
  const navigate = useNavigate()
  const { isSuperAdmin } = useAdmin()
  const { user, logout } = useAuth()
  const [currentDate] = useState(() => new Date())
  const [notifications, setNotifications] = useState([
    {
      id: "an-1",
      title: "Leave Request Submitted",
      message: "Alex Morgan applied for Annual Leave (Nov 10 – Nov 14). Awaiting Super Admin review.",
      time: "20m ago",
      isRead: false,
    },
    {
      id: "an-2",
      title: "Task Overdue Alert",
      message: "Task TSK-202 assigned to Alex Morgan passed its deadline. Delay note recorded.",
      time: "2h ago",
      isRead: false,
    },
    {
      id: "an-3",
      title: "EOD Shift Report Submitted",
      message: "Sophia Patel completed today's shift (8h 00m) and logged 1 completed task.",
      time: "4h ago",
      isRead: true,
    },
  ])

  const unreadCount = notifications.filter(n => !n.isRead).length

  const markAllRead = () => {
    setNotifications([])
  }

  const markRead = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }

  return (
    <header className="h-16 border-b border-slate-200/90 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md sticky top-0 z-30 px-4 sm:px-6 flex items-center justify-between shadow-[0_1px_2px_rgba(0,0,0,0.03)] transition-colors">
      {/* Left: Mobile hamburger & Admin Identity */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMobileMenuToggle}
          className="lg:hidden p-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none"
          aria-label="Toggle navigation menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100 leading-tight">
              {getGreeting(currentDate)}, {user?.name || (isSuperAdmin ? "Super Admin" : "Operations Admin")} 👋
            </h1>
            {isSuperAdmin ? (
              <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-semibold text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800 px-2 py-0.5 rounded-full">
                <ShieldCheck className="h-3 w-3 text-purple-500" /> Super Admin
              </span>
            ) : (
              <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-semibold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 px-2 py-0.5 rounded-full">
                <ShieldCheck className="h-3 w-3 text-blue-500" /> System Admin
              </span>
            )}
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium hidden sm:block">
            {isSuperAdmin
              ? "Executive Governance & Organization Oversight"
              : "Operations & Workforce Management Portal"}
          </p>
        </div>
      </div>

      {/* Right: Date, ThemeToggle, Notifications & Profile Avatar */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Current Date Badge */}
        <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300 font-medium">
          <Calendar className="h-3.5 w-3.5 text-slate-400" />
          <span>{formatDashboardDate(currentDate)}</span>
        </div>

        {/* Universal Theme Mode Toggle */}
        <ThemeToggle />

        {/* Notifications Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="relative h-9 w-9 rounded-lg border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800"
              aria-label="View admin notifications"
            >
              <Bell className="h-4 w-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-blue-600 text-[10px] font-bold text-white ring-2 ring-white dark:ring-slate-900">
                  {unreadCount}
                </span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80 p-0 shadow-xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">
            <div className="p-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-800/50">
              <span className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                <Bell className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                Admin Notifications
                {notifications.length > 0 && (
                  <span className="text-[10px] px-1.5 py-0.2 bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-semibold rounded-full">
                    {notifications.length}
                  </span>
                )}
              </span>
              {unreadCount > 0 && (
                <button
                  onClick={markAllRead}
                  className="text-[11px] text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium flex items-center gap-1"
                >
                  <CheckCheck className="h-3.5 w-3.5" />
                  Mark all read
                </button>
              )}
            </div>
            <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
              {notifications.length === 0 ? (
                <div className="py-8 px-4 text-center flex flex-col items-center justify-center text-slate-400">
                  <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 rounded-full mb-2">
                    <CheckCheck className="h-5 w-5" />
                  </div>
                  <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                    All caught up!
                  </p>
                  <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                    No active notifications
                  </p>
                </div>
              ) : (
                notifications.map(n => (
                  <div
                    key={n.id}
                    onClick={() => markRead(n.id)}
                    className="p-3 text-xs cursor-pointer transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/60 flex items-start gap-2.5 bg-blue-50/40 dark:bg-blue-950/30"
                  >
                    <div className="h-2 w-2 rounded-full mt-1.5 shrink-0 bg-blue-600 dark:bg-blue-400" />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-800 dark:text-slate-200 text-xs">
                        {n.title}
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
                        {n.message}
                      </p>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">
                        {n.time}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>

            {notifications.length === 0 && (
              <div className="p-2 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex justify-center">
                <button
                  type="button"
                  onClick={() =>
                    setNotifications([
                      {
                        id: `an-${Date.now()}`,
                        title: "Attendance Check-In Alert",
                        message: "David Chen logged into Operations shift at 08:30 AM.",
                        time: "Just now",
                        isRead: false,
                      },
                    ])
                  }
                  className="text-[10px] text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 font-medium flex items-center gap-1 py-0.5 px-2 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <Plus className="h-3 w-3" /> Simulate Notification
                </button>
              </div>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Admin Profile Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="flex items-center gap-2 p-1 rounded-full hover:ring-2 hover:ring-blue-200 dark:hover:ring-blue-900 transition-all focus:outline-none"
              aria-label="Admin profile menu"
            >
              <Avatar className="h-9 w-9 ring-1 ring-slate-200 dark:ring-slate-700">
                <AvatarImage
                  src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80"
                  alt="Sarah Jenkins"
                />
                <AvatarFallback>SJ</AvatarFallback>
              </Avatar>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 p-1 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
            <DropdownMenuLabel className="p-2">
              <p className="font-bold text-slate-900 dark:text-slate-100 text-xs">
                {user?.name || (isSuperAdmin ? "Super Admin" : "Operations Admin")}
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-normal truncate">
                {user?.email || (isSuperAdmin ? "superadmin@vamastudio.com" : "admin@vamastudio.com")}
              </p>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="dark:bg-slate-800" />

            <DropdownMenuItem onClick={() => navigate("/admin/settings")} className="cursor-pointer text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs">
              <Settings className="h-3.5 w-3.5 mr-2 text-slate-500 dark:text-slate-400" />
              <span>Admin Settings</span>
            </DropdownMenuItem>

            <DropdownMenuItem onClick={() => navigate("/admin/departments")} className="cursor-pointer text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs">
              <Briefcase className="h-3.5 w-3.5 mr-2 text-slate-500 dark:text-slate-400" />
              <span>Departments</span>
            </DropdownMenuItem>

            <DropdownMenuSeparator className="dark:bg-slate-800" />

            <DropdownMenuItem onClick={() => navigate("/employee")} className="cursor-pointer text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/50 text-xs font-medium">
              <ArrowRightLeft className="h-3.5 w-3.5 mr-2 text-blue-500" />
              <span>Switch to Employee View</span>
            </DropdownMenuItem>

            <DropdownMenuItem onClick={() => navigate("/super-admin")} className="cursor-pointer text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/50 text-xs font-medium">
              <ArrowRightLeft className="h-3.5 w-3.5 mr-2 text-purple-500" />
              <span>Super Admin (Preview)</span>
            </DropdownMenuItem>

            <DropdownMenuSeparator className="dark:bg-slate-800" />

            <DropdownMenuItem
              onClick={() => {
                logout()
                navigate("/login", { replace: true })
              }}
              className="cursor-pointer text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/50 text-xs font-medium"
            >
              <LogOut className="h-3.5 w-3.5 mr-2" />
              <span>Sign Out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
