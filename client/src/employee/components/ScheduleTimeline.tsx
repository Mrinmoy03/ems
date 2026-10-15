import React from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { initialMockSchedule } from "../data/mockSchedule"
import { ScheduleItem } from "../types/schedule"
import { CalendarClock, CheckCircle2, Clock, Coffee, Users, FileCheck } from "lucide-react"

export const ScheduleTimeline: React.FC = () => {
  const getIcon = (type: string, completed: boolean) => {
    if (completed) return <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
    switch (type) {
      case "lunch":
        return <Coffee className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
      case "meeting":
        return <Users className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
      case "review":
        return <FileCheck className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
      default:
        return <Clock className="h-3.5 w-3.5 text-slate-500 dark:text-slate-400" />
    }
  }

  return (
    <Card className="border-slate-200/90 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900">
      <CardHeader className="p-4 pb-2 border-b border-slate-100 dark:border-slate-800 flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 rounded-lg">
            <CalendarClock className="h-4 w-4" />
          </div>
          <CardTitle className="text-sm font-semibold text-slate-800 dark:text-slate-100">
            Today's Schedule
          </CardTitle>
        </div>
        <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Demo Agenda</span>
      </CardHeader>

      <CardContent className="p-4">
        <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-[2px] before:bg-slate-100 dark:before:bg-slate-800">
          {initialMockSchedule.map((item: ScheduleItem) => (
            <div key={item.id} className="relative group text-xs">
              {/* Dot / Icon */}
              <div
                className={`absolute -left-6 top-0.5 h-5 w-5 rounded-full flex items-center justify-center border transition-all ${
                  item.completed
                    ? "bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800"
                    : item.isCurrent
                    ? "bg-blue-50 dark:bg-blue-950/60 border-blue-400 ring-2 ring-blue-100 dark:ring-blue-900"
                    : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                }`}
              >
                {getIcon(item.type, item.completed)}
              </div>

              {/* Content */}
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p
                    className={`font-semibold ${
                      item.completed
                        ? "text-slate-400 dark:text-slate-500 line-through"
                        : item.isCurrent
                        ? "text-blue-700 dark:text-blue-400 font-bold"
                        : "text-slate-800 dark:text-slate-200"
                    }`}
                  >
                    {item.title}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5 text-slate-400 dark:text-slate-500 text-[11px]">
                    <span className="font-medium text-slate-500 dark:text-slate-400">{item.time}</span>
                    {item.duration && <span>· {item.duration}</span>}
                  </div>
                </div>

                {item.isCurrent && (
                  <span className="text-[10px] font-bold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950 px-2 py-0.5 rounded-full border border-blue-200 dark:border-blue-800 shrink-0">
                    Now
                  </span>
                )}
                {item.completed && (
                  <span className="text-[10px] font-medium text-slate-400 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded shrink-0">
                    Done
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
