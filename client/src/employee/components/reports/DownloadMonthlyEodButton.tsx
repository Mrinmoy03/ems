import React from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { Download, FileSpreadsheet, FileText, ChevronDown } from "lucide-react"
import { DailyEodReport } from "../../types/report"
import {
  downloadMonthlyEodCSV,
  exportMonthlyEodPDF,
} from "../../utils/exportEodReport"
import { cn } from "@/lib/utils"

export interface DownloadMonthlyEodButtonProps {
  monthName: string
  year: number
  reports: (DailyEodReport & {
    employeeId?: string
    employeeName?: string
    employeeDepartment?: string
    employeeDesignation?: string
  })[]
  employeeName?: string
  className?: string
  variant?: "outline" | "default" | "secondary"
  size?: "default" | "sm" | "lg"
  label?: string
}

export const DownloadMonthlyEodButton: React.FC<DownloadMonthlyEodButtonProps> = ({
  monthName,
  year,
  reports,
  employeeName,
  className,
  variant = "outline",
  size = "sm",
  label = "Download Monthly EOD",
}) => {
  const handleCSV = () => {
    downloadMonthlyEodCSV({
      monthName,
      year,
      reports,
      employeeName,
    })
  }

  const handlePDF = () => {
    exportMonthlyEodPDF(monthName, year, reports.length)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant={variant}
          size={size}
          className={cn(
            "h-8 px-2.5 text-xs font-semibold gap-1.5 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-50 dark:hover:bg-slate-800 shadow-2xs transition-colors",
            className
          )}
        >
          <Download className="h-3.5 w-3.5 text-indigo-500 dark:text-indigo-400" />
          <span>{label}</span>
          <ChevronDown className="h-3 w-3 opacity-60 ml-0.5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-56 p-1 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-lg text-slate-900 dark:text-slate-100"
      >
        <DropdownMenuLabel className="px-2 py-1.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
          Monthly EOD &bull; {monthName} {year}
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="dark:bg-slate-800" />
        <DropdownMenuItem
          onClick={handleCSV}
          className="cursor-pointer gap-2.5 text-xs py-2 px-2.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md focus:bg-slate-100 dark:focus:bg-slate-800"
        >
          <div className="p-1.5 rounded bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
            <FileSpreadsheet className="w-3.5 h-3.5" />
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              Download CSV Spreadsheet
            </span>
            <span className="text-[10px] text-slate-400">
              All {reports.length} shift logs & deliverables
            </span>
          </div>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={handlePDF}
          className="cursor-pointer gap-2.5 text-xs py-2 px-2.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md focus:bg-slate-100 dark:focus:bg-slate-800"
        >
          <div className="p-1.5 rounded bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400">
            <FileText className="w-3.5 h-3.5" />
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              Export PDF Audit Report
            </span>
            <span className="text-[10px] text-slate-400">
              Printable shift summary ledger
            </span>
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
