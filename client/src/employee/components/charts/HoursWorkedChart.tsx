import React, { useMemo } from "react"
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

export const HoursWorkedChart: React.FC = () => {
  const { timer } = useEmployee()
  const todayHours = Number((timer.elapsedSeconds / 3600).toFixed(1))

  const chartData = useMemo(() => [
    { day: "Mon", hours: 8.2, target: 8.0 },
    { day: "Tue", hours: 8.5, target: 8.0 },
    { day: "Wed", hours: 8.5, target: 8.0 },
    { day: "Thu", hours: Math.max(0.1, todayHours), target: 8.0 }, // Today (live from working timer)
    { day: "Fri", hours: 0, target: 8.0 }, // Upcoming tomorrow
  ], [todayHours])

  const weeklyTotal = useMemo(() => {
    return (8.2 + 8.5 + 8.5 + todayHours).toFixed(1)
  }, [todayHours])
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
        <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Target: 8.0h / day</span>
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
            {Number(weeklyTotal) >= 32 ? `+${(Number(weeklyTotal) - 32).toFixed(1)}h vs target` : `${(32 - Number(weeklyTotal)).toFixed(1)}h to target`}
          </span>
        </div>
      </CardContent>
    </Card>
  )
}
