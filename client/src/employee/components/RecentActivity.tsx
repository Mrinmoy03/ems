import React from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { useEmployee } from "../context/EmployeeContext"
import { formatRelativeTime } from "../utils/date"
import { Activity, CheckCircle2, Clock, Coffee, PlusCircle } from "lucide-react"

export const RecentActivity: React.FC = () => {
  const { recentActivities } = useEmployee()

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "task_completed":
        return <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
      case "task_progress":
        return <Clock className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
      case "task_created":
        return <PlusCircle className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
      case "lunch_break":
        return <Coffee className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
      default:
        return <Activity className="h-3.5 w-3.5 text-slate-500 dark:text-slate-400" />
    }
  }

  return (
    <Card className="border-slate-200/90 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900">
      <CardHeader className="p-4 pb-2 border-b border-slate-100 dark:border-slate-800 flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 rounded-lg">
            <Activity className="h-4 w-4" />
          </div>
          <CardTitle className="text-sm font-semibold text-slate-800 dark:text-slate-100">
            Recent Activity
          </CardTitle>
        </div>
        <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Live Feed</span>
      </CardHeader>

      <CardContent className="p-4">
        {recentActivities.length === 0 ? (
          <div className="py-6 text-center text-xs text-slate-400">
            No recent activity recorded
          </div>
        ) : (
          <div className="space-y-3">
            {recentActivities.slice(0, 5).map(activity => (
              <div
                key={activity.id}
                className="flex items-start gap-3 p-2.5 rounded-lg hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors text-xs border border-transparent hover:border-slate-100 dark:hover:border-slate-800"
              >
                <div className="p-1.5 rounded-md bg-slate-100 dark:bg-slate-800 shrink-0 mt-0.5">
                  {getActivityIcon(activity.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline justify-between gap-2">
                    <p className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                      {activity.title}
                    </p>
                    <span className="text-[11px] text-slate-400 dark:text-slate-500 shrink-0">
                      {formatRelativeTime(activity.timestamp)}
                    </span>
                  </div>
                  <p className="text-slate-500 dark:text-slate-400 text-[11px] mt-0.5 line-clamp-2">
                    {activity.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
