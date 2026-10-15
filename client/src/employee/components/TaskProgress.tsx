import React from "react"
import { TaskProgress as TaskProgressType, TaskStatus } from "../types/task"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"

interface TaskProgressProps {
  progress: TaskProgressType
  status?: TaskStatus
  showLabel?: boolean
  className?: string
}

export const TaskProgress: React.FC<TaskProgressProps> = ({
  progress,
  status,
  showLabel = true,
  className,
}) => {
  const getIndicatorColor = () => {
    if (progress === 100 || status === "completed") return "bg-emerald-500"
    if (status === "overdue") return "bg-red-500"
    if (progress > 50) return "bg-blue-600"
    return "bg-amber-500"
  }

  return (
    <div className={cn("flex items-center gap-3 w-full", className)}>
      <div className="flex-1">
        <Progress
          value={progress}
          className="h-2 bg-slate-100"
          indicatorClassName={getIndicatorColor()}
        />
      </div>
      {showLabel && (
        <span className="text-xs font-semibold text-slate-600 min-w-[36px] text-right tabular-nums">
          {progress}%
        </span>
      )}
    </div>
  )
}
