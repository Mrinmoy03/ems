import React from "react"
import { TaskStatus } from "../types/task"
import { getStatusBadgeConfig } from "../utils/taskStatus"
import { cn } from "@/lib/utils"

interface TaskStatusBadgeProps {
  status: TaskStatus
  isLate?: boolean
  className?: string
}

export const TaskStatusBadge: React.FC<TaskStatusBadgeProps> = ({ status, isLate = false, className }) => {
  const config = getStatusBadgeConfig(status, isLate)

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border transition-colors",
        config.colorClass,
        className
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", config.dotColor)} />
      {config.label}
    </span>
  )
}
