import React, { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useEmployee } from "../context/EmployeeContext"
import { getGreeting, formatDashboardDate, formatRelativeTime } from "../utils/date"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
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
  User,
  Settings,
  Clock,
  LogOut,
  Calendar,
  CheckCheck,
} from "lucide-react"

interface DashboardHeaderProps {
  onMobileMenuToggle: () => void
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({ onMobileMenuToggle }) => {
  const {
    employee,
    notifications,
    unreadNotificationCount,
    markNotificationRead,
    markAllNotificationsRead,
    timer,
  } = useEmployee()

  const navigate = useNavigate()
  const [currentDate] = useState(() => new Date())

  return (
    <header className="h-16 border-b border-slate-200/90 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md sticky top-0 z-30 px-4 sm:px-6 flex items-center justify-between shadow-[0_1px_2px_rgba(0,0,0,0.03)] transition-colors">
      {/* Left: Hamburger + Greeting */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMobileMenuToggle}
          className="lg:hidden p-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none"
          aria-label="Toggle navigation menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div>
          <h1 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100 leading-tight">
            {getGreeting(currentDate)}, {employee.firstName} 👋
          </h1>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium hidden sm:block">
            {employee.designation} · {employee.department}
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
              aria-label="View notifications"
            >
              <Bell className="h-4 w-4" />
              {unreadNotificationCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-blue-600 text-[10px] font-bold text-white ring-2 ring-white dark:ring-slate-900">
                  {unreadNotificationCount}
                </span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80 p-0 shadow-xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">
            <div className="p-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-800/50">
              <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                Notifications
              </span>
              {unreadNotificationCount > 0 && (
                <button
                  onClick={markAllNotificationsRead}
                  className="text-[11px] text-blue-600 dark:text-blue-400 hover:text-blue-700 font-medium flex items-center gap-1"
                >
                  <CheckCheck className="h-3 w-3" />
                  Mark all read
                </button>
              )}
            </div>
            <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
              {notifications.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-400">
                  No notifications
                </div>
              ) : (
                notifications.map(n => (
                  <div
                    key={n.id}
                    onClick={() => markNotificationRead(n.id)}
                    className={`p-3 text-xs cursor-pointer transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/60 flex items-start gap-2.5 ${
                      !n.isRead ? "bg-blue-50/40 dark:bg-blue-950/30" : ""
                    }`}
                  >
                    <div
                      className={`h-2 w-2 rounded-full mt-1.5 shrink-0 ${
                        !n.isRead ? "bg-blue-600 dark:bg-blue-400" : "bg-transparent"
                      }`}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-800 dark:text-slate-200 text-xs">
                        {n.title}
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
                        {n.message}
                      </p>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">
                        {formatRelativeTime(n.timestamp)}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Profile Avatar Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="flex items-center gap-2 p-1 rounded-full hover:ring-2 hover:ring-blue-200 dark:hover:ring-blue-900 transition-all focus:outline-none"
              aria-label="Employee profile menu"
            >
              <Avatar className="h-9 w-9 ring-1 ring-slate-200 dark:ring-slate-700">
                <AvatarImage src={employee.avatarUrl} alt={`${employee.firstName} ${employee.lastName}`} />
                <AvatarFallback>{employee.firstName[0]}{employee.lastName[0]}</AvatarFallback>
              </Avatar>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 p-1 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
            <DropdownMenuLabel className="p-2">
              <p className="font-bold text-slate-900 dark:text-slate-100 text-xs">
                {employee.firstName} {employee.lastName}
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-normal truncate">
                {employee.email}
              </p>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="dark:bg-slate-800" />
            <DropdownMenuItem onClick={() => navigate("/employee/profile")} className="cursor-pointer text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800">
              <User className="h-3.5 w-3.5 mr-2 text-slate-500 dark:text-slate-400" />
              <span>View Profile</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate("/employee/timesheet")} className="cursor-pointer text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800">
              <Clock className="h-3.5 w-3.5 mr-2 text-slate-500 dark:text-slate-400" />
              <span>Timesheet</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate("/employee/settings")} className="cursor-pointer text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800">
              <Settings className="h-3.5 w-3.5 mr-2 text-slate-500 dark:text-slate-400" />
              <span>Settings</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="dark:bg-slate-800" />
            <DropdownMenuItem
              onClick={() => timer.logout()}
              className="text-red-600 dark:text-red-400 focus:text-red-700 dark:focus:text-red-300 focus:bg-red-50 dark:focus:bg-red-950/40"
            >
              <LogOut className="h-3.5 w-3.5 mr-2" />
              End Shift & Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
