import React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface StatCardProps {
  title: string
  value: string | number
  subValue?: string
  icon: LucideIcon
  iconColor: string
  iconBg: string
  accentColor?: string
  badgeText?: string
  className?: string
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subValue,
  icon: Icon,
  iconColor,
  iconBg,
  accentColor,
  badgeText,
  className,
}) => {
  return (
    <Card className={cn("overflow-hidden hover:shadow-md transition-all duration-200 border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900", className)}>
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">{title}</p>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100 tabular-nums">
                {value}
              </span>
              {badgeText && (
                <span className={cn("text-[11px] font-semibold px-2 py-0.5 rounded-full", accentColor)}>
                  {badgeText}
                </span>
              )}
            </div>
            {subValue && (
              <p className="text-xs text-slate-500 dark:text-slate-400 font-normal pt-0.5">{subValue}</p>
            )}
          </div>
          <div className={cn("p-2.5 rounded-xl flex items-center justify-center shrink-0", iconBg)}>
            <Icon className={cn("h-5 w-5", iconColor)} />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
