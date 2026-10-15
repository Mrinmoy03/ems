import React, { useState } from "react"
import { TaskTable } from "../components/TaskTable"
import { TaskHistoryView } from "../components/TaskHistoryView"
import { useEmployee } from "../context/EmployeeContext"
import { Card, CardContent } from "@/components/ui/card"
import { CheckSquare, AlertTriangle, Clock, Layers, History, ListTodo } from "lucide-react"
import { cn } from "@/lib/utils"

export const MyTasksPage: React.FC = () => {
  const { taskCounts } = useEmployee()
  const [activeTab, setActiveTab] = useState<"tasks" | "history">("tasks")

  return (
    <div className="space-y-6">
      {/* Top Header & Tab Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
            My Tasks Manager
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Comprehensive overview of your daily assignments, task backlog, and day-by-day work history
          </p>
        </div>

        {/* View Switcher Tabs: Active Tasks vs Day-by-Day History */}
        <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl self-start sm:self-auto border border-slate-200/80 dark:border-slate-700/80">
          <button
            onClick={() => setActiveTab("tasks")}
            className={cn(
              "px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-2",
              activeTab === "tasks"
                ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
            )}
          >
            <ListTodo className="h-4 w-4" />
            <span>Active Tasks</span>
            <span className="text-[10px] bg-slate-200/80 dark:bg-slate-800 px-1.5 py-0.2 rounded-full font-mono">
              {taskCounts.all}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("history")}
            className={cn(
              "px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-2",
              activeTab === "history"
                ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
            )}
          >
            <History className="h-4 w-4" />
            <span>Task & Work History</span>
            <span className="text-[10px] bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 px-1.5 py-0.2 rounded-full font-mono font-bold">
              Day-by-Day
            </span>
          </button>
        </div>
      </div>

      {/* Quick Status Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2.5 bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 rounded-lg">
              <Layers className="h-4 w-4" />
            </div>
            <div>
              <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase">Assigned</p>
              <p className="text-xl font-bold text-slate-900 dark:text-slate-100">{taskCounts.all}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2.5 bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400 rounded-lg">
              <Clock className="h-4 w-4" />
            </div>
            <div>
              <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase">In Progress</p>
              <p className="text-xl font-bold text-amber-600 dark:text-amber-400">{taskCounts.inProgress}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 rounded-lg">
              <CheckSquare className="h-4 w-4" />
            </div>
            <div>
              <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase">Completed</p>
              <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">{taskCounts.completed}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2.5 bg-red-50 dark:bg-red-950 text-red-600 dark:text-red-400 rounded-lg">
              <AlertTriangle className="h-4 w-4" />
            </div>
            <div>
              <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase">Overdue</p>
              <p className="text-xl font-bold text-red-600 dark:text-red-400">{taskCounts.overdue}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tab 1: Active Tasks with 10-Item Pagination */}
      {activeTab === "tasks" && (
        <TaskTable enablePagination pageSize={10} />
      )}

      {/* Tab 2: Day-by-Day Task & Work History */}
      {activeTab === "history" && (
        <TaskHistoryView />
      )}
    </div>
  )
}
