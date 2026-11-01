import React from "react"
import { Badge } from "../ui/badge"
import { ProjectStatus, ProjectPartStatus } from "../../types/project"
import { Sparkles, PlayCircle, PauseCircle, CheckCircle2, Archive, AlertCircle } from "lucide-react"

interface ProjectStatusBadgeProps {
  status: ProjectStatus | ProjectPartStatus
  className?: string
}

export const ProjectStatusBadge: React.FC<ProjectStatusBadgeProps> = ({ status, className = "" }) => {
  switch (status) {
    case "completed":
      return (
        <Badge
          variant="outline"
          className={`bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800 text-[10px] font-semibold gap-1 ${className}`}
        >
          <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
          <span>Completed</span>
        </Badge>
      )
    case "in-progress":
      return (
        <Badge
          variant="outline"
          className={`bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-800 text-[10px] font-semibold gap-1 ${className}`}
        >
          <PlayCircle className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />
          <span>In Progress</span>
        </Badge>
      )
    case "on-hold":
      return (
        <Badge
          variant="outline"
          className={`bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800 text-[10px] font-semibold gap-1 ${className}`}
        >
          <PauseCircle className="w-3 h-3 text-amber-600 dark:text-amber-400" />
          <span>On Hold</span>
        </Badge>
      )
    case "archived":
      return (
        <Badge
          variant="outline"
          className={`bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700 text-[10px] font-semibold gap-1 ${className}`}
        >
          <Archive className="w-3 h-3 text-slate-500" />
          <span>Archived</span>
        </Badge>
      )
    case "overdue":
      return (
        <Badge
          variant="outline"
          className={`bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800 text-[10px] font-semibold gap-1 ${className}`}
        >
          <AlertCircle className="w-3 h-3 text-rose-600" />
          <span>Overdue</span>
        </Badge>
      )
    case "planning":
    default:
      return (
        <Badge
          variant="outline"
          className={`bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/40 dark:text-sky-300 dark:border-sky-800 text-[10px] font-semibold gap-1 ${className}`}
        >
          <Sparkles className="w-3 h-3 text-sky-600 dark:text-sky-400" />
          <span>Planning</span>
        </Badge>
      )
  }
}

