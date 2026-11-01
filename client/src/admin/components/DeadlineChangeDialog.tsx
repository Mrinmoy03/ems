import React, { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "../../components/ui/dialog"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Label } from "../../components/ui/label"
import { Textarea } from "../../components/ui/textarea"
import { useAdmin } from "../context/AdminContext"
import { AdminTask } from "../types/admin"
import { CalendarClock, History, AlertTriangle, ShieldCheck } from "lucide-react"

interface DeadlineChangeDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  task: AdminTask | null
}

export const DeadlineChangeDialog: React.FC<DeadlineChangeDialogProps> = ({
  open,
  onOpenChange,
  task,
}) => {
  const { updateTaskDeadline, deadlineHistory } = useAdmin()

  const [newDeadline, setNewDeadline] = useState("")
  const [reason, setReason] = useState("")
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (task) {
      // Format deadline for datetime-local input
      const d = new Date(task.deadline)
      const formatted = isNaN(d.getTime())
        ? new Date().toISOString().slice(0, 16)
        : d.toISOString().slice(0, 16)
      setNewDeadline(formatted)
      setReason("")
      setError(null)
    }
  }, [task, open])

  if (!task) return null

  // Task-specific deadline audit history
  const taskHistory = deadlineHistory.filter(h => h.taskId === task.id)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newDeadline) {
      setError("Please select a valid new deadline date and time.")
      return
    }
    if (!reason.trim()) {
      setError("Mandatory policy: A documented business reason is required to modify a task deadline.")
      return
    }

    const isoDate = new Date(newDeadline).toISOString()
    const res = updateTaskDeadline(task.id, isoDate, reason.trim())
    if (!res.success) {
      setError(res.error || "Failed to update deadline")
      return
    }

    onOpenChange(false)
  }

  const formatDisplayDate = (dStr: string) => {
    const d = new Date(dStr)
    return isNaN(d.getTime())
      ? dStr
      : d.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
          hour: "numeric",
          minute: "2-digit",
        })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[560px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <CalendarClock className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold text-slate-900 dark:text-slate-100">
                Modify Task Deadline
              </DialogTitle>
              <DialogDescription className="text-sm text-slate-500 dark:text-slate-400">
                Audit-controlled deadline adjustment for &ldquo;{task.title}&rdquo;
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          {error && (
            <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-600 dark:text-rose-400 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Current Status Box */}
          <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1.5">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500">Current Scheduled Deadline:</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                {formatDisplayDate(task.deadline)}
              </span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500">Current Task Status:</span>
              <span className="capitalize font-medium text-indigo-600 dark:text-indigo-400">
                {task.status.replace("-", " ")}
              </span>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="newDeadline" className="text-xs font-semibold">
              New Deadline <span className="text-rose-500">*</span>
            </Label>
            <Input
              id="newDeadline"
              type="datetime-local"
              value={newDeadline}
              onChange={e => setNewDeadline(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="reason" className="text-xs font-semibold flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-indigo-500" />
                Mandatory Reason for Extension/Change <span className="text-rose-500">*</span>
              </Label>
              <span className="text-[11px] text-slate-400">Logged permanently in audit trail</span>
            </div>
            <Textarea
              id="reason"
              rows={3}
              value={reason}
              onChange={e => setReason(e.target.value)}
              placeholder="e.g. Scope expansion requested by stakeholders; blocked on external payment gateway API credentials."
              className="resize-none"
            />
          </div>

          {/* Audit Trail of Previous Changes */}
          {taskHistory.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
                <History className="w-3.5 h-3.5 text-slate-500" />
                <span>Previous Deadline Modification History ({taskHistory.length})</span>
              </div>
              <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
                {taskHistory.map(item => (
                  <div
                    key={item.id}
                    className="p-2.5 rounded-md bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-xs space-y-1"
                  >
                    <div className="flex justify-between items-center text-slate-500">
                      <span>Changed by {item.changedBy}</span>
                      <span>{new Date(item.changedAt).toLocaleDateString()}</span>
                    </div>
                    <div className="text-[11px] font-mono text-slate-700 dark:text-slate-300">
                      {formatDisplayDate(item.oldDeadline)} &rarr;{" "}
                      <span className="text-indigo-600 dark:text-indigo-400 font-bold">
                        {formatDisplayDate(item.newDeadline)}
                      </span>
                    </div>
                    <p className="text-slate-600 dark:text-slate-400 italic bg-white dark:bg-slate-950 p-1.5 rounded border border-slate-100 dark:border-slate-800">
                      &ldquo;{item.reason}&rdquo;
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" className="bg-amber-600 hover:bg-amber-700 text-white font-medium">
              Confirm & Log Deadline Change
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
