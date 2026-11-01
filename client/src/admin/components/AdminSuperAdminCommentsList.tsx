import React, { useState } from "react"
import { useAdmin } from "../context/AdminContext"
import { Button } from "../../components/ui/button"
import { Badge } from "../../components/ui/badge"
import { AdminCommentDialog } from "./AdminCommentDialog"
import { MessageSquarePlus, User, Clock } from "lucide-react"


interface AdminSuperAdminCommentsListProps {
  targetEmployeeId?: string
  targetEmployeeName?: string
}

export const AdminSuperAdminCommentsList: React.FC<AdminSuperAdminCommentsListProps> = ({
  targetEmployeeId,
  targetEmployeeName,
}) => {
  const { adminComments } = useAdmin()
  const [dialogOpen, setDialogOpen] = useState(false)

  const relevantComments = targetEmployeeId
    ? adminComments.filter(
        c =>
          c.targetId === targetEmployeeId ||
          c.targetTitle?.includes(targetEmployeeName || "") ||
          (c.targetType === "leave" && targetEmployeeId === "EMP-1042")
      )
    : adminComments

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
            Administrative Observations & Notes ({relevantComments.length})
          </h3>
          <p className="text-xs text-slate-500">
            Internal administrative notes and recommendations logged for Super Admin review.
          </p>
        </div>
        <Button
          size="sm"
          onClick={() => setDialogOpen(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs h-8 flex items-center gap-1.5"
        >
          <MessageSquarePlus className="w-3.5 h-3.5" />
          Add Observation
        </Button>
      </div>

      {relevantComments.length === 0 ? (
        <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-xs text-slate-500">
          No administrative observations recorded for this profile yet.
        </div>
      ) : (
        <div className="space-y-3">
          {relevantComments.map(item => (
            <div
              key={item.id}
              className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2.5"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-indigo-500" />
                    {item.authorName}
                  </span>
                  <Badge variant="secondary" className="text-[10px] font-mono">
                    {item.authorRole}
                  </Badge>
                  {item.targetTitle && (
                    <span className="text-xs text-slate-500 font-medium">
                      &bull; Re: {item.targetTitle}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <Badge
                    variant="outline"
                    className={`text-[10px] uppercase font-semibold ${
                      item.status === "open"
                        ? "border-amber-300 text-amber-600 bg-amber-50 dark:bg-amber-950/40"
                        : "border-slate-200 text-slate-600"
                    }`}
                  >
                    {item.status}
                  </Badge>
                  <span className="text-[11px] text-slate-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(item.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300">
                {item.comment}
              </div>
            </div>
          ))}
        </div>
      )}

      <AdminCommentDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        defaultTargetType={targetEmployeeId ? "employee" : "general"}
        defaultTargetId={targetEmployeeId}
        defaultTargetTitle={targetEmployeeName ? `Employee Observation: ${targetEmployeeName}` : undefined}
      />
    </div>
  )
}
