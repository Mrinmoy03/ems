import React, { useMemo, useState, useEffect } from "react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  ReferenceLine,
} from "recharts"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { BarChart3 } from "lucide-react"
import { useEmployee } from "../../context/EmployeeContext"
import { useAuth } from "../../../auth/context/AuthContext"
import { api } from "../../../services/api"

export const HoursWorkedChart: React.FC = () => {
  const { timer } = useEmployee()
  const { user: authUser } = useAuth()
  const todayHours = Number((timer.elapsedSeconds / 3600).toFixed(1))
  const [weekReports, setWeekReports] = useState<any[]>([])

  useEffect(() => {
    const empId = authUser?.employeeId || authUser?.id
    if (!empId) return
    api.reports.getEod({ employeeId: empId, limit: "30" })
      .then(res => {
        if (res && res.success && Array.isArray(res.reports)) {
          setWeekReports(res.reports)
        }
      })
      .catch(() => {})
  }, [authUser])

  const currentDayOfWeek = new Date().getDay() // 0 = Sun, 1 = Mon, ..., 6 = Sat
  const dayIndexMap: Record<string, number> = {
    Mon: 1,
    Tue: 2,
    Wed: 3,
    Thu: 4,
    Fri: 5,
    Sat: 6,
  }

  const chartData = useMemo(() => {
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

    // Find the start of current week (Monday)
    const now = new Date()
    const currentDay = now.getDay()
    const diffToMonday = (currentDay === 0 ? -6 : 1) - currentDay
    const monday = new Date(now)
    monday.setDate(now.getDate() + diffToMonday)

    return days.map((day, idx) => {
      const isToday = dayIndexMap[day] === currentDayOfWeek
      const targetDate = new Date(monday)
      targetDate.setDate(monday.getDate() + idx)
      const dateStr = targetDate.toISOString().slice(0, 10)

      // Look for a report matching this date
      const matching = weekReports.find(r => {
        const rDate = typeof r.date === "string" ? r.date.slice(0, 10) : ""
        return rDate === dateStr
      })

      const reportedHours = matching ? Number(matching.hours_worked || 0) : 0
      const hours = isToday ? Math.max(reportedHours, todayHours) : reportedHours

      return {
        day,
        hours: Number(hours.toFixed(1)),
        target: 8.0,
      }
    })
  }, [weekReports, todayHours, currentDayOfWeek])

  const weeklyTotal = useMemo(() => {
    const total = chartData.reduce((acc, d) => acc + d.hours, 0)
    return total.toFixed(1)
  }, [chartData])
  return (
    <Card className="border-slate-200/90 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900">
      <CardHeader className="p-4 pb-2 border-b border-slate-100 dark:border-slate-800 flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 rounded-lg">
            <BarChart3 className="h-4 w-4" />
          </div>
          <CardTitle className="text-sm font-semibold text-slate-800 dark:text-slate-100">
            Weekly Hours Worked
          </CardTitle>
        </div>
        <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Target: 8.0h / day (Mon – Sat)</span>
      </CardHeader>

      <CardContent className="p-4">
        <div className="h-44 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="text-slate-100 dark:text-slate-800" />
              <XAxis
                dataKey="day"
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 11, fill: "#94a3b8" }}
              />
              <YAxis
                domain={[0, 10]}
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 11, fill: "#94a3b8" }}
                ticks={[0, 4, 8, 10]}
              />
              <Tooltip
                cursor={{ fill: "rgba(148, 163, 184, 0.1)" }}
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const hrs = payload[0].value as number
                    return (
                      <div className="bg-slate-900 dark:bg-slate-800 text-white text-xs px-2.5 py-1.5 rounded shadow-lg border border-slate-800 dark:border-slate-700">
                        <span className="font-semibold">{label}: </span>
                        <span>{hrs} hours</span>
                      </div>
                    )
                  }
                  return null
                }}
              />
              <ReferenceLine
                y={8}
                stroke="#64748b"
                strokeDasharray="3 3"
                label={{
                  value: "8h standard",
                  position: "insideTopRight",
                  fill: "#94a3b8",
                  fontSize: 10,
                }}
              />
              <Bar
                dataKey="hours"
                fill="#2563eb"
                radius={[4, 4, 0, 0]}
                maxBarSize={32}
                isAnimationActive={true}
                animationDuration={450}
                animationEasing="ease-out"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
          <span>Weekly total: <strong className="text-slate-800 dark:text-slate-200 font-semibold">{weeklyTotal}h</strong></span>
          <span className="text-emerald-600 dark:text-emerald-400 font-medium">
            {Number(weeklyTotal) >= 48 ? "Target completed" : `${(48 - Number(weeklyTotal)).toFixed(1)}h to target`} (48h Standard)
          </span>
        </div>
      </CardContent>
    </Card>
  )
}
