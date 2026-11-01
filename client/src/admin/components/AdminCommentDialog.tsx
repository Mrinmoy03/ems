import React, { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "../../components/ui/dialog"
import { Button } from "../../components/ui/button"
import { Label } from "../../components/ui/label"
import { Textarea } from "../../components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select"
import { useAdmin } from "../context/AdminContext"
import { MessageSquarePlus, Shield, Info } from "lucide-react"

interface AdminCommentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  defaultTargetType?: "employee" | "task" | "leave" | "attendance" | "general"
  defaultTargetId?: string
  defaultTargetTitle?: string
}

export const AdminCommentDialog: React.FC<AdminCommentDialogProps> = ({
  open,
  onOpenChange,
  defaultTargetType = "general",
  defaultTargetId,
  defaultTargetTitle,
}) => {
  const { addAdminComment } = useAdmin()

  const [targetType, setTargetType] = useState<"employee" | "task" | "leave" | "attendance" | "general">(
    defaultTargetType
  )
  const [comment, setComment] = useState("")
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!comment.trim()) {
      setError("Please write an observation or recommendation.")
      return
    }

    addAdminComment({
      targetType,
      targetId: defaultTargetId,
      targetTitle: defaultTargetTitle || (targetType === "leave" ? "Leave Review Notice" : undefined),
      comment: comment.trim(),
    })

    setComment("")
    setError(null)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <MessageSquarePlus className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold text-slate-900 dark:text-slate-100">
                Administrative Observation
              </DialogTitle>
              <DialogDescription className="text-sm text-slate-500 dark:text-slate-400">
                Log a recommendation or operational observation for Super Admin review.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          {defaultTargetTitle && (
            <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs space-y-1">
              <div className="flex items-center gap-1.5 text-slate-500">
                <Info className="w-3.5 h-3.5" />
                <span>Referencing Subject:</span>
              </div>
              <p className="font-semibold text-slate-800 dark:text-slate-200">
                {defaultTargetTitle} {defaultTargetId ? `(${defaultTargetId})` : ""}
              </p>
            </div>
          )}

          {!defaultTargetTitle && (
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Observation Domain</Label>
              <Select
                value={targetType}
                onValueChange={val =>
                  setTargetType(val as "employee" | "task" | "leave" | "attendance" | "general")
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">General Administrative Note</SelectItem>
                  <SelectItem value="leave">Leave Request Context / Recommendation</SelectItem>
                  <SelectItem value="employee">Employee Performance Note</SelectItem>
                  <SelectItem value="task">Project / Milestone Blockers</SelectItem>
                  <SelectItem value="attendance">Attendance Discrepancy Note</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="comment" className="text-xs font-semibold">
              Admin Comment & Context <span className="text-rose-500">*</span>
            </Label>
            <Textarea
              id="comment"
              rows={4}
              value={comment}
              onChange={e => setComment(e.target.value)}
              placeholder="e.g. Employee has coordinated task handovers ahead of time. Team coverage is sufficient for this duration."
              className={error ? "border-rose-500" : ""}
            />
            {error && <p className="text-xs text-rose-500">{error}</p>}
          </div>

          <div className="p-2.5 rounded-md bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-[11px] text-amber-800 dark:text-amber-300 flex items-start gap-2">
            <Shield className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
            <span>
              Admins cannot approve/reject leave applications directly. Observations submitted here are prominently visible to the Super Admin when making final approval decisions.
            </span>
          </div>

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white">
              Submit to Super Admin
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
