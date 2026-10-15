import React from "react"
import { NavLink, useNavigate } from "react-router-dom"
import { useEmployee } from "../context/EmployeeContext"
import {
  LayoutDashboard,
  CheckSquare,
  PlusCircle,
  Clock,
  CalendarDays,
  FileBarChart,
  User,
  Settings,
  LogOut,
  X,
  Briefcase,
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

interface AppSidebarProps {
  isMobileOpen: boolean
  setIsMobileOpen: (open: boolean) => void
}

export const AppSidebar: React.FC<AppSidebarProps> = ({ isMobileOpen, setIsMobileOpen }) => {
  const { taskCounts, leaveRequests, timer } = useEmployee()
  const [isLogoutModalOpen, setIsLogoutModalOpen] = React.useState(false)
  const navigate = useNavigate()

  const pendingLeaves = leaveRequests.filter(l => l.status === "pending").length
  const remainingTasks = (taskCounts.pending || 0) + (taskCounts.inProgress || 0) + (taskCounts.overdue || 0)

  const navItems = [
    {
      to: "/employee",
      label: "Dashboard",
      icon: LayoutDashboard,
      end: true,
    },
    {
      to: "/employee/tasks",
      label: "My Tasks",
      icon: CheckSquare,
      badge: remainingTasks > 0 ? remainingTasks : undefined,
    },
    {
      to: "/employee/add-task",
      label: "Add Task",
      icon: PlusCircle,
    },
    {
      to: "/employee/timesheet",
      label: "Timesheet",
      icon: Clock,
    },
    {
      to: "/employee/leave",
      label: "Leave Request",
      icon: CalendarDays,
      badge: pendingLeaves > 0 ? pendingLeaves : undefined,
    },
    {
      to: "/employee/reports",
      label: "Reports",
      icon: FileBarChart,
    },
    {
      to: "/employee/profile",
      label: "Profile",
      icon: User,
    },
    {
      to: "/employee/settings",
      label: "Settings",
      icon: Settings,
    },
  ]

  const handleLogout = () => {
    timer.logout()
    setIsLogoutModalOpen(false)
    navigate("/employee")
  }

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={() => setIsMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-60 bg-[#0b132b] text-slate-300 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:h-screen lg:shrink-0 ${
          isMobileOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-5 border-b border-slate-800/80">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <Briefcase className="h-4 w-4" />
            </div>
            <div>
              <span className="font-extrabold text-base tracking-tight text-white block leading-tight">
                Work<span className="text-blue-500">Track</span>
              </span>
              <span className="text-[10px] text-slate-400 font-medium tracking-wide uppercase">
                Employee Hub
              </span>
            </div>
          </div>

          {/* Mobile close button */}
          <button
            onClick={() => setIsMobileOpen(false)}
            className="lg:hidden p-1.5 text-slate-400 hover:text-white rounded-md hover:bg-slate-800 focus:outline-none"
            aria-label="Close navigation sidebar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          <div className="px-3 pb-2 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
            Menu
          </div>
          {navItems.map(item => {
            const Icon = item.icon
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                onClick={() => setIsMobileOpen(false)}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all group select-none ${
                    isActive
                      ? "bg-blue-600 text-white font-semibold shadow-sm shadow-blue-600/30"
                      : "text-slate-300 hover:bg-slate-800/70 hover:text-white"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <div className="flex items-center gap-2.5">
                      <Icon
                        className={`h-4 w-4 transition-colors ${
                          isActive ? "text-white" : "text-slate-400 group-hover:text-slate-200"
                        }`}
                      />
                      <span>{item.label}</span>
                    </div>
                    {item.badge !== undefined && (
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
                          isActive
                            ? "bg-white/20 text-white"
                            : "bg-slate-800 text-slate-300 group-hover:bg-slate-700"
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </>
                )}
              </NavLink>
            )
          })}
        </nav>

        {/* Footer / Logout */}
        <div className="p-3 border-t border-slate-800/80">
          <button
            onClick={() => setIsLogoutModalOpen(true)}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors group"
          >
            <LogOut className="h-4 w-4 text-slate-500 group-hover:text-red-400 transition-colors" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Logout Confirmation Dialog */}
      <Dialog open={isLogoutModalOpen} onOpenChange={setIsLogoutModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-slate-900">Confirm Shift Logout?</DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Are you sure you want to end your working shift? Your working timer will stop and
              an End-of-Day summary will be recorded.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsLogoutModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={handleLogout}
            >
              Yes, Log Out
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
