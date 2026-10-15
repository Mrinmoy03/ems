import React from "react"
import { Layers, AlertTriangle, Hourglass, ArrowRightCircle } from "lucide-react"
import { InProgressTaskSummary } from "../../types/report"
import { cn } from "@/lib/utils"

interface EodCarriedTaskItemProps {
  task: InProgressTaskSummary
}

/**
 * Individual in-progress / carried-forward task card rendered within an EOD shift report.
 * Shows completion progress bar, overdue or in-progress status, and next-shift target notes.
 */
export const EodCarriedTaskItem: React.FC<EodCarriedTaskItemProps> = ({ task }) => {
  return (
    <div className="p-2.5 rounded-lg border text-xs flex flex-col justify-between gap-1.5 shadow-2xs transition-colors bg-white dark:bg-slate-900 border-slate-200/70 dark:border-slate-800">
      <div className="space-y-1.5">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="font-mono text-[10px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950 px-1.5 py-0.5 rounded shrink-0">
              {task.id}
            </span>
            {task.category && (
              <span className="inline-flex items-center gap-0.5 text-[10px] text-slate-500 dark:text-slate-400">
                <Layers className="h-2.5 w-2.5 text-slate-400" />
                {task.category}
              </span>
            )}
          </div>

          {task.status === "overdue" ? (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-50 dark:bg-red-950/80 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800 shrink-0">
              <AlertTriangle className="h-2.5 w-2.5 text-red-500" />
              Overdue ({task.progress ?? 0}%)
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 shrink-0">
              <Hourglass className="h-2.5 w-2.5 text-amber-500" />
              In Progress ({task.progress ?? 0}%)
            </span>
          )}
        </div>

        <p className="font-semibold text-slate-800 dark:text-slate-200 text-xs leading-snug">
          {task.title}
        </p>

        {/* Progress bar */}
        <div className="space-y-1 pt-0.5">
          <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div
              className={cn(
                "h-full rounded-full transition-all duration-300",
                task.status === "overdue" ? "bg-red-500" : "bg-amber-500"
              )}
              style={{ width: `${task.progress ?? 0}%` }}
            />
          </div>
        </div>
      </div>

      {/* Carried Forward Target & Notes */}
      <div className="mt-1 pt-1.5 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-1 text-[11px]">
        {task.carriedForwardTo && (
          <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
            <ArrowRightCircle className="h-3 w-3 text-blue-500 shrink-0" />
            <span>Carrying forward to: <strong className="text-slate-700 dark:text-slate-300">{task.carriedForwardTo}</strong></span>
          </div>
        )}
        {task.notes && (
          <p className="text-slate-500 dark:text-slate-400 italic bg-slate-50 dark:bg-slate-800/50 p-1.5 rounded text-[10.5px]">
            "{task.notes}"
          </p>
        )}
      </div>
    </div>
  )
}
