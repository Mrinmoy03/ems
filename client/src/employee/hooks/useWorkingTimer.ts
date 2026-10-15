import { useState, useEffect, useCallback, useMemo } from "react"
import { WorkSessionState, BreakRecord } from "../types/timer"

export function useWorkingTimer() {
  // Initialize with an active morning session starting 3 hours ago by default for a realistic live demo
  const [sessionState, setSessionState] = useState<WorkSessionState>("working")
  const [loginTime, setLoginTime] = useState<string>(() => {
    const d = new Date()
    d.setHours(d.getHours() - 3)
    d.setMinutes(d.getMinutes() - 15)
    return d.toISOString()
  })
  const [logoutTime, setLogoutTime] = useState<string | null>(null)
  const [breaks, setBreaks] = useState<BreakRecord[]>([])
  const [currentBreakStart, setCurrentBreakStart] = useState<string | null>(null)
  const [currentTime, setCurrentTime] = useState<number>(Date.now())

  // Regular interval to update currentTime every 1 second when active
  useEffect(() => {
    if (sessionState !== "working") {
      return
    }

    const intervalId = window.setInterval(() => {
      setCurrentTime(Date.now())
    }, 1000)

    return () => {
      window.clearInterval(intervalId)
    }
  }, [sessionState])

  // Total completed break duration in seconds
  const completedBreakSeconds = useMemo(() => {
    return breaks.reduce((acc, b) => acc + (b.durationSeconds || 0), 0)
  }, [breaks])

  // Exact elapsed work duration in seconds derived from timestamps
  const elapsedSeconds = useMemo(() => {
    if (sessionState === "not-started") {
      return 0
    }

    const loginTimestamp = new Date(loginTime).getTime()

    if (sessionState === "logged-out" && logoutTime) {
      const logoutTimestamp = new Date(logoutTime).getTime()
      const totalRaw = Math.max(0, Math.floor((logoutTimestamp - loginTimestamp) / 1000))
      return Math.max(0, totalRaw - completedBreakSeconds)
    }

    if (sessionState === "on-break" && currentBreakStart) {
      const breakStartTimestamp = new Date(currentBreakStart).getTime()
      const totalRaw = Math.max(0, Math.floor((breakStartTimestamp - loginTimestamp) / 1000))
      return Math.max(0, totalRaw - completedBreakSeconds)
    }

    // Currently working
    const totalRaw = Math.max(0, Math.floor((currentTime - loginTimestamp) / 1000))
    return Math.max(0, totalRaw - completedBreakSeconds)
  }, [sessionState, loginTime, logoutTime, completedBreakSeconds, currentBreakStart, currentTime])

  const startWork = useCallback(() => {
    const nowIso = new Date().toISOString()
    setLoginTime(nowIso)
    setLogoutTime(null)
    setBreaks([])
    setCurrentBreakStart(null)
    setSessionState("working")
    setCurrentTime(Date.now())
  }, [])

  const startLunchBreak = useCallback(() => {
    if (sessionState !== "working") return
    const nowIso = new Date().toISOString()
    setCurrentBreakStart(nowIso)
    setSessionState("on-break")
  }, [sessionState])

  const endLunchBreak = useCallback(() => {
    if (sessionState !== "on-break" || !currentBreakStart) return
    const nowIso = new Date().toISOString()
    const startMs = new Date(currentBreakStart).getTime()
    const endMs = new Date(nowIso).getTime()
    const durationSec = Math.max(0, Math.floor((endMs - startMs) / 1000))

    const newBreak: BreakRecord = {
      id: `brk-${Date.now()}`,
      start: currentBreakStart,
      end: nowIso,
      durationSeconds: durationSec,
    }

    setBreaks(prev => [...prev, newBreak])
    setCurrentBreakStart(null)
    setSessionState("working")
    setCurrentTime(Date.now())
  }, [sessionState, currentBreakStart])

  const logout = useCallback(() => {
    if (sessionState === "logged-out") return
    const nowIso = new Date().toISOString()

    // If currently on break, close out break
    if (sessionState === "on-break" && currentBreakStart) {
      const startMs = new Date(currentBreakStart).getTime()
      const endMs = new Date(nowIso).getTime()
      const durationSec = Math.max(0, Math.floor((endMs - startMs) / 1000))
      setBreaks(prev => [
        ...prev,
        {
          id: `brk-${Date.now()}`,
          start: currentBreakStart,
          end: nowIso,
          durationSeconds: durationSec,
        },
      ])
      setCurrentBreakStart(null)
    }

    setLogoutTime(nowIso)
    setSessionState("logged-out")
  }, [sessionState, currentBreakStart])

  return {
    sessionState,
    loginTime,
    logoutTime,
    breaks,
    elapsedSeconds,
    startWork,
    startLunchBreak,
    endLunchBreak,
    logout,
  }
}
