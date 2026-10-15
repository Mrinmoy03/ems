import React from "react"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts"
import { useEmployee } from "../../context/EmployeeContext"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { PieChart as PieIcon } from "lucide-react"

export const TaskOverviewChart: React.FC = () => {
  const { taskCounts } = useEmployee()

  const data = [
    { name: "Completed", value: taskCounts.completed, color: "#10b981" },
    { name: "In Progress", value: taskCounts.inProgress, color: "#f59e0b" },
    { name: "Overdue", value: taskCounts.overdue, color: "#ef4444" },
    { name: "Pending", value: taskCounts.pending, color: "#94a3b8" },
  ].filter(d => d.value > 0)

  const total = taskCounts.all

  return (
    <Card className="border-slate-200/90 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900">
      <CardHeader className="p-4 pb-2 border-b border-slate-100 dark:border-slate-800 flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 rounded-lg">
            <PieIcon className="h-4 w-4" />
          </div>
          <CardTitle className="text-sm font-semibold text-slate-800 dark:text-slate-100">
            Task Overview
          </CardTitle>
        </div>
        <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Status Breakdown</span>
      </CardHeader>

      <CardContent className="p-4">
        {total === 0 ? (
          <div className="h-48 flex items-center justify-center text-xs text-slate-400">
            No task data available
          </div>
        ) : (
          <div>
            <div className="relative h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const item = payload[0]
                        const val = item.value as number
                        const pct = Math.round((val / total) * 100)
                        return (
                          <div className="bg-slate-900 dark:bg-slate-800 text-white text-xs px-2.5 py-1.5 rounded shadow-lg border border-slate-800 dark:border-slate-700">
                            <span className="font-semibold">{item.name}: </span>
                            <span>{val} ({pct}%)</span>
                          </div>
                        )
                      }
                      return null
                    }}
                  />
                  <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={70}
                    paddingAngle={3}
                    dataKey="value"
                    isAnimationActive={true}
                    animationDuration={450}
                    animationEasing="ease-out"
                    stroke="none"
                  >
                    {data.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>

              {/* Centered donut text */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 tabular-nums leading-none">
                  {total}
                </span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider mt-0.5">
                  Tasks
                </span>
              </div>
            </div>

            {/* Custom Legend */}
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-500 shrink-0" />
                <span className="text-slate-600 dark:text-slate-400 truncate">Completed:</span>
                <span className="font-bold text-slate-900 dark:text-slate-100 ml-auto">{taskCounts.completed}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-amber-500 shrink-0" />
                <span className="text-slate-600 dark:text-slate-400 truncate">In Progress:</span>
                <span className="font-bold text-slate-900 dark:text-slate-100 ml-auto">{taskCounts.inProgress}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-red-500 shrink-0" />
                <span className="text-slate-600 dark:text-slate-400 truncate">Overdue:</span>
                <span className="font-bold text-slate-900 dark:text-slate-100 ml-auto">{taskCounts.overdue}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-slate-400 shrink-0" />
                <span className="text-slate-600 dark:text-slate-400 truncate">Pending:</span>
                <span className="font-bold text-slate-900 dark:text-slate-100 ml-auto">{taskCounts.pending}</span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
