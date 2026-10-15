import React, { useState } from "react"
import { Outlet } from "react-router-dom"
import { AppSidebar } from "../components/AppSidebar"
import { DashboardHeader } from "../components/DashboardHeader"

export const EmployeeLayout: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  return (
    <div className="flex h-screen w-full bg-[#f4f6f9] dark:bg-slate-950 text-slate-900 dark:text-slate-100 overflow-hidden transition-colors">
      {/* Dark Navy Sidebar */}
      <AppSidebar
        isMobileOpen={isMobileMenuOpen}
        setIsMobileOpen={setIsMobileMenuOpen}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <DashboardHeader
          onMobileMenuToggle={() => setIsMobileMenuOpen(prev => !prev)}
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
