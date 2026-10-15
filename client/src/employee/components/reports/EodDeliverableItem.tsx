import React from "react"
import { CheckCircle2, AlertTriangle, AlertCircle, Layers } from "lucide-react"
import { CompletedTaskSummary } from "../../types/report"
import { cn } from "@/lib/utils"

interface EodDeliverableItemProps {
  task: CompletedTaskSummary
}

/**
 * Individual deliverable card rendered within an EOD shift report.
 * Highlights on-time vs late status and displays late delay reason audit notes.
 */
export const EodDeliverableItem: React.FC<EodDeliverableItemProps> = ({ task }) => {
  return (
    <div
      className={cn(
        "p-2.5 rounded-lg border text-xs flex flex-col justify-between gap-1.5 shadow-2xs transition-colors",
        task.isCompletedLate
          ? "bg-amber-50/40 dark:bg-amber-950/20 border-amber-200/80 dark:border-amber-900/60"
          : "bg-white dark:bg-slate-900 border-slate-200/70 dark:border-slate-800"
      )}
    >
      <div className="space-y-1">
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

          {task.isCompletedLate ? (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700 shrink-0">
              <AlertTriangle className="h-2.5 w-2.5 text-amber-600 dark:text-amber-400" />
              Completed (Late)
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium text-emerald-600 dark:text-emerald-400 shrink-0">
              <CheckCircle2 className="h-3 w-3" />
              On Time
            </span>
          )}
        </div>

        <p className="font-semibold text-slate-800 dark:text-slate-200 text-xs leading-snug">
          {task.title}
        </p>
      </div>

      {/* Delay Reason Note if completed late */}
      {task.isCompletedLate && task.delayReason && (
        <div className="mt-1 pt-1.5 border-t border-amber-200/60 dark:border-amber-900/50 text-[11px] text-amber-900 dark:text-amber-300/90 bg-amber-50/70 dark:bg-amber-950/40 p-2 rounded-md flex items-start gap-1.5">
          <AlertCircle className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div className="min-w-0 flex-1 leading-relaxed">
            <span className="font-bold text-amber-900 dark:text-amber-200">Delay Reason: </span>
            <span className="italic">{task.delayReason}</span>
          </div>
        </div>
      )}
    </div>
  )
}
