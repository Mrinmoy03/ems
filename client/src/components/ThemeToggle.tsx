import React from "react"
import { useTheme } from "@/app/theme-provider"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Sun, Moon, Laptop, Check } from "lucide-react"

export const ThemeToggle: React.FC<{ className?: string }> = ({ className }) => {
  const { theme, setTheme, isDark } = useTheme()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className={`relative h-9 w-9 rounded-lg border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ${className}`}
          aria-label="Toggle theme"
        >
          {isDark ? (
            <Moon className="h-4 w-4 text-blue-400 transition-transform" />
          ) : (
            <Sun className="h-4 w-4 text-amber-500 transition-transform" />
          )}
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 p-1.5 shadow-xl text-xs">
        <DropdownMenuItem
          onClick={() => setTheme("light")}
          className={`flex items-center justify-between cursor-pointer rounded-md px-2.5 py-2 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 ${
            theme === "light" ? "font-bold text-blue-600 dark:text-blue-400 bg-blue-50/70 dark:bg-blue-950/50" : ""
          }`}
        >
          <div className="flex items-center gap-2.5">
            <Sun className="h-4 w-4 text-amber-500 shrink-0" />
            <span className="font-medium">Light</span>
          </div>
          {theme === "light" && <Check className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />}
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => setTheme("dark")}
          className={`flex items-center justify-between cursor-pointer rounded-md px-2.5 py-2 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 ${
            theme === "dark" ? "font-bold text-blue-600 dark:text-blue-400 bg-blue-50/70 dark:bg-blue-950/50" : ""
          }`}
        >
          <div className="flex items-center gap-2.5">
            <Moon className="h-4 w-4 text-blue-400 shrink-0" />
            <span className="font-medium">Dark</span>
          </div>
          {theme === "dark" && <Check className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />}
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => setTheme("system")}
          className={`flex items-center justify-between cursor-pointer rounded-md px-2.5 py-2 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 ${
            theme === "system" ? "font-bold text-blue-600 dark:text-blue-400 bg-blue-50/70 dark:bg-blue-950/50" : ""
          }`}
        >
          <div className="flex items-center gap-2.5">
            <Laptop className="h-4 w-4 text-slate-400 dark:text-slate-300 shrink-0" />
            <span className="font-medium">System</span>
          </div>
          {theme === "system" && <Check className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
