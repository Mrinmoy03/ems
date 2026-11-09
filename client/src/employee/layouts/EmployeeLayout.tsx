import React, { useState } from "react"
import { Outlet } from "react-router-dom"
import { AppSidebar } from "../components/AppSidebar"
import { DashboardHeader } from "../components/DashboardHeader"

export const EmployeeLayout: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
    try {
      return localStorage.getItem("worktrack_sidebar_collapsed") === "true"
    } catch {
      return false
    }
  })

  const toggleSidebarCollapse = () => {
    setIsCollapsed(prev => {
      const next = !prev
      try {
        localStorage.setItem("worktrack_sidebar_collapsed", String(next))
      } catch {}
      return next
    })
  }

  return (
    <div className="flex h-screen w-full bg-[#f4f6f9] dark:bg-slate-950 text-slate-900 dark:text-slate-100 overflow-hidden transition-colors">
      {/* Dark Navy Sidebar */}
      <AppSidebar
        isMobileOpen={isMobileMenuOpen}
        setIsMobileOpen={setIsMobileMenuOpen}
        isCollapsed={isCollapsed}
        onToggleCollapse={toggleSidebarCollapse}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden transition-all duration-300">
        {/* Top Header */}
        <DashboardHeader
          onMobileMenuToggle={() => setIsMobileMenuOpen(prev => !prev)}
          isSidebarCollapsed={isCollapsed}
          onToggleSidebar={toggleSidebarCollapse}
        />

        {/* Scrollable Page Outlet */}
        <main className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 scrollbar-thin">
          <div className="max-w-7xl mx-auto space-y-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
