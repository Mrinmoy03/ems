import React, { useState } from "react"
import { Outlet } from "react-router-dom"
import { AdminProvider } from "../context/AdminContext"
import { AdminSidebar } from "../components/AdminSidebar"
import { AdminHeader } from "../components/AdminHeader"

interface AdminLayoutProps {
  initialRole?: "admin" | "super-admin"
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ initialRole }) => {
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  return (
    <AdminProvider initialRole={initialRole}>
      <div className="flex h-screen w-screen overflow-hidden bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans antialiased">
        {/* Navy Admin Sidebar */}
        <AdminSidebar
          isMobileOpen={isMobileOpen}
          onMobileClose={() => setIsMobileOpen(false)}
        />

        {/* Main Content Area */}
        <div className="flex flex-col flex-1 min-w-0 h-full overflow-hidden">
          {/* Header */}
          <AdminHeader onMobileMenuToggle={() => setIsMobileOpen(!isMobileOpen)} />

          {/* Page Body */}
          <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 bg-slate-50/50 dark:bg-slate-950/50">
            <Outlet />
          </main>
        </div>
      </div>
    </AdminProvider>
  )
}
