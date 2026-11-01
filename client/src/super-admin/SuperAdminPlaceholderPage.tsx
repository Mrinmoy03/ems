import React from "react"
import { useNavigate } from "react-router-dom"
import { ShieldCheck, ArrowRight, LayoutDashboard, UserCheck, Lock, Sparkles } from "lucide-react"
import { Button } from "../components/ui/button"
import { Badge } from "../components/ui/badge"

export const SuperAdminPlaceholderPage: React.FC = () => {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between p-6 md:p-12 font-sans selection:bg-purple-500 selection:text-white">
      {/* Top Header */}
      <div className="flex items-center justify-between max-w-5xl mx-auto w-full">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <span className="font-bold tracking-tight text-white text-lg">WorkTrack</span>
            <span className="text-xs text-purple-400 font-mono block -mt-1 font-semibold">SUPER ADMIN PORTAL</span>
          </div>
        </div>

        <Badge className="bg-purple-950 text-purple-300 border-purple-800 text-xs px-3 py-1 font-mono">
          PHASE 3 ROADMAP
        </Badge>
      </div>

      {/* Hero content */}
      <div className="max-w-3xl mx-auto w-full text-center py-16 space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-900/30 border border-purple-700/40 text-purple-300 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5 text-purple-400" />
          <span>Executive Governance & Exclusive Approvals</span>
        </div>

        <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white leading-tight">
          Super Admin Console <br />
          <span className="bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">
            Executive Control Plane
          </span>
        </h1>

        <p className="text-sm md:text-base text-slate-400 max-w-xl mx-auto leading-relaxed">
          The ultimate administrative tier of WorkTrack. Reserved exclusively for corporate leadership to execute final leave approvals, manage system licensing, and supervise organization-wide administrative teams.
        </p>

        {/* Feature Highlights Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left pt-6">
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-purple-600/20 text-purple-400 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-slate-200">Exclusive Leave Approval</h3>
            <p className="text-xs text-slate-400">
              Direct authority to grant, reject, or adjust employee leave applications with admin notes.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-600/20 text-indigo-400 flex items-center justify-center">
              <UserCheck className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-slate-200">Admin Role Provisioning</h3>
            <p className="text-xs text-slate-400">
              Appoint and supervise System Administrators across all departmental domains.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-600/20 text-emerald-400 flex items-center justify-center">
              <Lock className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-slate-200">Global Audit Purge</h3>
            <p className="text-xs text-slate-400">
              Manage enterprise data retention policies and access encrypted security logs.
            </p>
          </div>
        </div>

        {/* Navigation Action Buttons */}
        <div className="flex items-center justify-center gap-3 pt-6 flex-wrap">
          <Button
            onClick={() => navigate("/admin")}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs h-10 px-5 gap-2"
          >
            <LayoutDashboard className="w-4 h-4" />
            Switch to Admin Panel
          </Button>

          <Button
            onClick={() => navigate("/dashboard")}
            variant="outline"
            className="border-slate-800 text-slate-300 hover:bg-slate-900 text-xs h-10 px-5 gap-2"
          >
            Switch to Employee View
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center text-xs text-slate-600 max-w-5xl mx-auto w-full pt-8 border-t border-slate-900">
        WorkTrack Architecture &bull; Phase 2 Admin Panel active &bull; Phase 3 Super Admin planned
      </div>
    </div>
  )
}
