import React from "react"
import { NavLink, useNavigate } from "react-router-dom"
import { useAdmin } from "../context/AdminContext"
import { useProjects } from "../../context/ProjectContext"
import { useAuth } from "../../auth/context/AuthContext"
import {
  LayoutDashboard,
  Users,
  Building2,
  FolderKanban,
  CheckSquare,
  Clock,
  BarChart3,
  CalendarDays,
  Settings,
  X,
  LogOut,
} from "lucide-react"

interface AdminSidebarProps {
  isMobileOpen: boolean
  onMobileClose: () => void
  isCollapsed?: boolean
  onToggleCollapse?: () => void
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  isMobileOpen,
  onMobileClose,
  isCollapsed = false,
  onToggleCollapse,
}) => {
  const navigate = useNavigate()
  const { kpis, isSuperAdmin } = useAdmin()
  const { projects } = useProjects()
  const { logout } = useAuth()

  const basePath = isSuperAdmin ? "/super-admin" : "/admin"

  const navItems = [
    {
      to: basePath,
      label: "Dashboard",
      icon: LayoutDashboard,
      end: true,
    },
    {
      to: `${basePath}/employees`,
      label: "Employees",
      icon: Users,
      badge: kpis.totalEmployees,
    },
    {
      to: `${basePath}/departments`,
      label: "Departments",
      icon: Building2,
    },
    {
      to: `${basePath}/projects`,
      label: "Projects",
      icon: FolderKanban,
      badge: projects.filter(p => p.status === "in-progress").length || undefined,
    },
    {
      to: `${basePath}/tasks`,
      label: "Tasks",
      icon: CheckSquare,
      badge: kpis.tasksOverdue > 0 ? `${kpis.tasksOverdue} overdue` : undefined,
      badgeVariant: kpis.tasksOverdue > 0 ? ("destructive" as const) : undefined,
    },
    {
      to: `${basePath}/attendance`,
      label: "Attendance",
      icon: Clock,
      badge: `${kpis.presentToday} Present`,
      badgeVariant: "success" as const,
    },
    {
      to: `${basePath}/reports`,
      label: "Reports",
      icon: BarChart3,
    },
    {
      to: `${basePath}/leave`,
      label: "Leave Management",
      icon: CalendarDays,
      badge: isSuperAdmin ? "Approvals" : "View Only",
      badgeVariant: isSuperAdmin ? ("success" as const) : ("neutral" as const),
    },
    {
      to: `${basePath}/settings`,
      label: "Settings",
      icon: Settings,
    },
  ]

  const sidebarContent = (
    <div className="flex flex-col h-full bg-[#0b132b] text-slate-200 border-r border-slate-800 select-none transition-all duration-300">
      {/* Brand Header */}
      <div
        className={`h-16 border-b border-slate-800/80 flex items-center transition-all duration-300 ${
          isCollapsed ? "lg:justify-center px-3 justify-between" : "justify-between px-5"
        }`}
      >
        {/* Collapsed state brand icon (click to expand on desktop) */}
        {isCollapsed ? (
          <button
            type="button"
            onClick={onToggleCollapse}
            title="Expand navigation sidebar"
            className={`hidden lg:flex h-9 w-9 rounded-xl items-center justify-center text-white shadow-md font-bold text-sm tracking-wider hover:opacity-90 transition-opacity ${
              isSuperAdmin
                ? "bg-gradient-to-br from-purple-500 to-indigo-600 shadow-purple-500/20"
                : "bg-gradient-to-br from-blue-500 to-indigo-600 shadow-blue-500/20"
            }`}
          >
            WT
          </button>
        ) : null}

        {/* Standard Brand (mobile or expanded desktop) */}
        <div className={`flex items-center gap-3 min-w-0 ${isCollapsed ? "lg:hidden" : ""}`}>
          <div
            className={`h-9 w-9 rounded-xl flex items-center justify-center text-white shadow-md font-bold text-base tracking-wider shrink-0 ${
              isSuperAdmin
                ? "bg-gradient-to-br from-purple-500 to-indigo-600 shadow-purple-500/20"
                : "bg-gradient-to-br from-blue-500 to-indigo-600 shadow-blue-500/20"
            }`}
          >
            WT
          </div>
          <div className="truncate">
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-base tracking-tight text-white">WorkTrack</span>
              <span
                className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${
                  isSuperAdmin
                    ? "bg-purple-500/20 text-purple-300 border-purple-500/30"
                    : "bg-blue-500/20 text-blue-400 border-blue-500/30"
                }`}
              >
                {isSuperAdmin ? "SUPER ADMIN" : "ADMIN"}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium truncate">
              {isSuperAdmin ? "Executive Governance" : "Enterprise Management"}
            </p>
          </div>
        </div>

        {/* Mobile close button */}
        <button
          onClick={onMobileClose}
          className="lg:hidden p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 focus:outline-none"
          aria-label="Close menu"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Nav Menu */}
      <div className="flex-1 py-4 px-2.5 space-y-1 overflow-y-auto scrollbar-thin">
        {!isCollapsed && (
          <p className="px-2.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
            Administration
          </p>
        )}
        {navItems.map(item => {
          const Icon = item.icon
          const hasBadge = item.badge !== undefined && item.badge !== null && item.badge !== ""
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={onMobileClose}
              title={hasBadge ? `${item.label} (${item.badge})` : item.label}
              className={({ isActive }) =>
                `relative flex items-center rounded-xl text-xs font-medium transition-all group select-none ${
                  isCollapsed
                    ? "lg:justify-center lg:px-0 lg:py-2.5 px-3 py-2.5 justify-between"
                    : "justify-between px-3 py-2.5"
                } ${
                  isActive
                    ? "bg-blue-600 text-white shadow-sm shadow-blue-600/30"
                    : "text-slate-300 hover:text-white hover:bg-slate-800/60"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div className={`flex items-center gap-2.5 ${isCollapsed ? "lg:gap-0" : ""}`}>
                    <Icon
                      className={`h-4 w-4 shrink-0 transition-colors ${
                        isActive ? "text-white" : "text-slate-400 group-hover:text-white"
                      }`}
                    />
                    <span className={isCollapsed ? "lg:hidden" : ""}>{item.label}</span>
                  </div>

                  {/* Full badge when expanded or on mobile */}
                  {hasBadge && (
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                        isCollapsed ? "lg:hidden" : ""
                      } ${
                        item.badgeVariant === "destructive"
                          ? "bg-red-500/20 text-red-300 border border-red-500/30"
                          : item.badgeVariant === "success"
                          ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                          : "bg-slate-800 text-slate-300 border border-slate-700"
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}

                  {/* Notification dot indicator when collapsed on desktop */}
                  {isCollapsed && hasBadge && (
                    <span
                      className={`hidden lg:block absolute top-1.5 right-1.5 h-2 w-2 rounded-full ring-2 ring-[#0b132b] ${
                        item.badgeVariant === "destructive"
                          ? "bg-red-400"
                          : item.badgeVariant === "success"
                          ? "bg-emerald-400"
                          : "bg-blue-400"
                      }`}
                    />
                  )}
                </>
              )}
            </NavLink>
          )
        })}
      </div>

      {/* Footer / Sign Out */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-950/40 space-y-2">
        <button
          type="button"
          onClick={() => {
            logout()
            onMobileClose()
            navigate("/login", { replace: true })
          }}
          title="Sign Out"
          className={`w-full rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 text-xs font-medium flex items-center border border-red-500/20 transition-colors ${
            isCollapsed
              ? "lg:justify-center lg:py-2.5 px-3 py-2 gap-2"
              : "justify-center py-2 px-3 gap-2"
          }`}
        >
          <LogOut className="w-3.5 h-3.5 shrink-0" />
          <span className={isCollapsed ? "lg:hidden" : ""}>Sign Out</span>
        </button>

        {!isCollapsed && (
          <div className="px-2 py-1 flex items-center justify-between text-[10px] text-slate-400">
            <span>WorkTrack v2.4 Admin</span>
            <span>Mon–Sat Schedule</span>
          </div>
        )}
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop Sidebar (Collapsible) */}
      <aside
        className={`hidden lg:block h-screen sticky top-0 shrink-0 z-40 transition-all duration-300 ease-in-out ${
          isCollapsed ? "w-[72px]" : "w-64"
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Backdrop */}
      {isMobileOpen && (
        <div
          onClick={onMobileClose}
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 lg:hidden"
        />
      )}

      {/* Mobile Drawer */}
      <div
        className={`fixed top-0 bottom-0 left-0 w-72 z-50 transform transition-transform duration-300 ease-in-out lg:hidden ${
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {sidebarContent}
      </div>
    </>
  )
}
