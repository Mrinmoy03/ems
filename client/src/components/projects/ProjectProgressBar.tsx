import React from "react"

interface ProjectProgressBarProps {
  progress: number
  size?: "sm" | "md" | "lg"
  showLabel?: boolean
  className?: string
}

export const ProjectProgressBar: React.FC<ProjectProgressBarProps> = ({
  progress,
  size = "md",
  showLabel = true,
  className = "",
}) => {
  const clamped = Math.min(100, Math.max(0, Math.round(progress)))

  const heightClass =
    size === "sm" ? "h-1.5" : size === "lg" ? "h-3" : "h-2"

  const colorClass =
    clamped >= 100
      ? "bg-emerald-500"
      : clamped >= 75
      ? "bg-indigo-600"
      : clamped >= 35
      ? "bg-sky-500"
      : clamped > 0
      ? "bg-amber-500"
      : "bg-slate-300 dark:bg-slate-700"

  return (
    <div className={`space-y-1 ${className}`}>
      {showLabel && (
        <div className="flex items-center justify-between text-[11px]">
          <span className="text-slate-500 dark:text-slate-400 font-medium">Weighted Progress</span>
          <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
            {clamped}%
          </span>
        </div>
      )}
      <div className={`w-full ${heightClass} rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden ring-1 ring-inset ring-slate-200/50 dark:ring-slate-800/50`}>
        <div
          className={`h-full rounded-full transition-all duration-500 ${colorClass}`}
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  )
}

