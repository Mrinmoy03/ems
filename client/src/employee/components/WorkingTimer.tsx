import React, { useState } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { useEmployee } from "../context/EmployeeContext"
import { formatDurationToHMS, formatDurationToHuman } from "../utils/formatDuration"
import { Clock, Coffee, Play, LogOut, CheckCircle2, AlertCircle, Info } from "lucide-react"
import { format } from "date-fns"

export const WorkingTimer: React.FC = () => {
  const { timer } = useEmployee()
  const {
    sessionState,
    elapsedSeconds,
    loginTime,
    breaks,
    startWork,
    startLunchBreak,
    endLunchBreak,
    logout,
  } = timer

  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false)

  const handleConfirmLogout = () => {
    logout()
    setIsLogoutDialogOpen(false)
  }

  const getSessionBadge = () => {
    switch (sessionState) {
      case "working":
        return (
          <Badge variant="success" className="animate-pulse flex items-center gap-1.5 font-medium">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
            Active Session
          </Badge>
        )
      case "on-break":
        return (
          <Badge variant="warning" className="flex items-center gap-1.5 font-medium">
            <Coffee className="h-3 w-3" />
            Lunch Break
          </Badge>
        )
      case "logged-out":
        return (
          <Badge variant="outline" className="text-slate-500 border-slate-300">
            Shift Ended
          </Badge>
        )
      case "not-started":
      default:
        return (
          <Badge variant="secondary">
            Not Started
          </Badge>
        )
    }
  }

  return (
    <>
      <Card className="border-slate-200/90 shadow-sm overflow-hidden">
        <CardHeader className="p-4 pb-2 border-b border-slate-100 dark:border-slate-800 flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 rounded-lg">
              <Clock className="h-4 w-4" />
            </div>
            <CardTitle className="text-sm font-semibold text-slate-800 dark:text-slate-100">
              Working Timer
            </CardTitle>
          </div>
          {getSessionBadge()}
        </CardHeader>

        <CardContent className="p-5 space-y-4">
          {/* Main Elapsed Time Display */}
          <div className="text-center py-2 bg-gradient-to-b from-slate-50 to-white dark:from-slate-800/70 dark:to-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 p-4 shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)]">
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1">
              Time Worked Today
            </p>
            <div className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100 font-mono">
              {formatDurationToHMS(elapsedSeconds)}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
              approx. {formatDurationToHuman(elapsedSeconds)}
            </p>
          </div>

          {/* Session Details */}
          <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 dark:text-slate-300 bg-slate-50/80 dark:bg-slate-800/60 p-3 rounded-lg border border-slate-100 dark:border-slate-800">
            <div>
              <span className="text-slate-400 dark:text-slate-400 block text-[11px]">Logged in</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                {sessionState !== "not-started"
                  ? format(new Date(loginTime), "hh:mm a")
                  : "—"}
              </span>
            </div>
            <div>
              <span className="text-slate-400 dark:text-slate-400 block text-[11px]">Breaks taken</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                {breaks.length} {breaks.length === 1 ? "session" : "sessions"}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2 pt-1">
            {sessionState === "working" && (
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  onClick={startLunchBreak}
                  className="w-full text-xs font-medium border-amber-200 dark:border-amber-900 text-amber-800 dark:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-950/40 hover:text-amber-900 dark:hover:text-amber-200 bg-transparent"
                >
                  <Coffee className="h-3.5 w-3.5 mr-1.5 text-amber-600 dark:text-amber-400" />
                  Lunch Break
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setIsLogoutDialogOpen(true)}
                  className="w-full text-xs font-medium border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-red-50 dark:hover:bg-red-950/40 hover:text-red-700 dark:hover:text-red-400 hover:border-red-200 dark:hover:border-red-800 bg-transparent"
                >
                  <LogOut className="h-3.5 w-3.5 mr-1.5" />
                  Logout
                </Button>
              </div>
            )}

            {sessionState === "on-break" && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 p-2.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200 text-xs">
                  <Coffee className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
                  <span>Timer is paused while you are on lunch break.</span>
                </div>
                <Button
                  variant="default"
                  onClick={endLunchBreak}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs shadow-sm"
                >
                  <Play className="h-3.5 w-3.5 mr-1.5" />
                  End Lunch Break & Resume
                </Button>
              </div>
            )}

            {sessionState === "logged-out" && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>Today's shift ended. EOD summary compiled.</span>
                </div>
                <Button
                  variant="default"
                  onClick={startWork}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-xs font-medium"
                >
                  <Play className="h-3.5 w-3.5 mr-1.5" />
                  Start New Session
                </Button>
              </div>
            )}

            {sessionState === "not-started" && (
              <Button
                variant="default"
                onClick={startWork}
                className="w-full bg-blue-600 hover:bg-blue-700 text-xs font-medium"
              >
                <Play className="h-3.5 w-3.5 mr-1.5" />
                Start Work Shift
              </Button>
            )}
          </div>

          {/* Prototype disclaimer tag */}
          <div className="pt-1 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500">
            <span className="flex items-center gap-1">
              <Info className="h-3 w-3" />
              Demo State (Timestamp-backed)
            </span>
            <span className="text-slate-400 dark:text-slate-500">Resets on refresh</span>
          </div>
        </CardContent>
      </Card>

      {/* Logout Confirmation Dialog */}
      <Dialog open={isLogoutDialogOpen} onOpenChange={setIsLogoutDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="mx-auto p-3 bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 rounded-full w-fit mb-2">
              <AlertCircle className="h-6 w-6" />
            </div>
            <DialogTitle className="text-center text-slate-900 dark:text-slate-100">Confirm Shift Logout?</DialogTitle>
            <DialogDescription className="text-center text-slate-500 dark:text-slate-400 text-xs">
              Are you sure you want to end your workday? Your current session will stop, and your
              End-of-Day (EOD) summary for {formatDurationToHuman(elapsedSeconds)} will be calculated.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-center gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsLogoutDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={handleConfirmLogout}
            >
              Yes, End Shift & Logout
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
