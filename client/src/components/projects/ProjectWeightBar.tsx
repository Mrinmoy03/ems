import React from "react"
import { ProjectPart } from "../../types/project"
import { getPartContribution } from "../../utils/projectProgress"

interface ProjectWeightBarProps {
  parts: ProjectPart[]
  className?: string
}

const PALETTE = [
  "bg-indigo-500",
  "bg-sky-500",
  "bg-emerald-500",
  "bg-amber-500",
  "bg-violet-500",
  "bg-rose-500",
]

export const ProjectWeightBar: React.FC<ProjectWeightBarProps> = ({ parts, className = "" }) => {
  const totalWeight = parts.reduce((sum, p) => sum + (Number(p.weight) || 0), 0)

  if (parts.length === 0) {
    return (
      <div className="text-[11px] text-slate-400 italic py-1">
        No project parts defined yet.
      </div>
    )
  }

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Visual Stacked Progress Bar */}
      <div className="h-3 w-full rounded-md bg-slate-100 dark:bg-slate-800 flex overflow-hidden ring-1 ring-inset ring-slate-200 dark:ring-slate-800">
        {parts.map((part, index) => {
          const color = PALETTE[index % PALETTE.length]
          const widthPercent = totalWeight > 0 ? (part.weight / totalWeight) * 100 : 0
          return (
            <div
              key={part.id}
              className={`${color} relative group transition-all duration-300 hover:opacity-90`}
              style={{ width: `${widthPercent}%` }}
              title={`${part.name}: ${part.weight}% weight (${part.progress}% done)`}
            />
          )
        })}
      </div>

      {/* Part Legend Pills */}
      <div className="flex flex-wrap items-center gap-2 pt-1">
        {parts.map((part, index) => {
          const color = PALETTE[index % PALETTE.length]
          const contribution = getPartContribution(part.weight, part.progress)
          return (
            <div
              key={part.id}
              className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 text-[10px]"
            >
              <span className={`w-2 h-2 rounded-full ${color}`} />
              <span className="font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[120px]">
                {part.name}
              </span>
              <span className="text-slate-400 font-mono">({part.weight}%)</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-mono font-medium">
                +{contribution}%
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

