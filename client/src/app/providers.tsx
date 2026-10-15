import React from "react"
import { ThemeProvider, useTheme } from "./theme-provider"
import { EmployeeProvider } from "../employee/context/EmployeeContext"
import { TooltipProvider } from "@/components/ui/tooltip"
import { Toaster } from "sonner"

const ThemedToaster: React.FC = () => {
  const { isDark } = useTheme()
  return (
    <Toaster
      position="top-right"
      theme={isDark ? "dark" : "light"}
      richColors
      closeButton
    />
  )
}

export const Providers: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <ThemeProvider defaultTheme="light" storageKey="worktrack-theme">
      <EmployeeProvider>
        <TooltipProvider delayDuration={200}>
          {children}
          <ThemedToaster />
        </TooltipProvider>
      </EmployeeProvider>
    </ThemeProvider>
  )
}
