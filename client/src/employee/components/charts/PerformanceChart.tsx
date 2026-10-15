import React from "react"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { TrendingUp } from "lucide-react"
import { initialMonthlyTrendData } from "../../data/mockReports"

export const PerformanceChart: React.FC = () => {
  return (
    <Card className="border-slate-200/90 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900">
      <CardHeader className="p-4 pb-2 border-b border-slate-100 dark:border-slate-800 flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 rounded-lg">
            <TrendingUp className="h-4 w-4" />
          </div>
          <CardTitle className="text-sm font-semibold text-slate-800 dark:text-slate-100">
            Monthly Performance Trend
          </CardTitle>
        </div>
        <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
          96% Current Rate
        </span>
      </CardHeader>

      <CardContent className="p-4">
        <div className="h-44 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={initialMonthlyTrendData}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <defs>
                <linearGradient id="performanceGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563eb" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#2563eb" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="text-slate-100 dark:text-slate-800" />
              <XAxis
                dataKey="month"
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 11, fill: "#94a3b8" }}
              />
              <YAxis
                domain={[70, 100]}
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 11, fill: "#94a3b8" }}
                unit="%"
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const item = payload[0].payload
                    return (
                      <div className="bg-slate-900 dark:bg-slate-800 text-white text-xs px-2.5 py-1.5 rounded shadow-lg border border-slate-800 dark:border-slate-700 space-y-0.5">
                        <p className="font-semibold">{label}</p>
                        <p className="text-emerald-400">
                          Completion Rate: {item.completionRate}%
                        </p>
                        <p className="text-slate-300">
                          Tasks Completed: {item.tasks}
                        </p>
                      </div>
                    )
                  }
                  return null
                }}
              />
              <Area
                type="monotone"
                dataKey="completionRate"
                stroke="#2563eb"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#performanceGrad)"
                isAnimationActive={true}
                animationDuration={450}
                animationEasing="ease-out"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
          <span>6-Month Average: <strong className="text-slate-800 dark:text-slate-200 font-semibold">93.5%</strong></span>
          <span className="text-slate-400 dark:text-slate-500">Illustrative analytics</span>
        </div>
      </CardContent>
    </Card>
  )
}
