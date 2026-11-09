import { useState, useEffect, useCallback, useMemo, useRef } from "react"
import { WorkSessionState, BreakRecord } from "../types/timer"
import { api } from "../../services/api"

interface StoredWorkSession {
  sessionState: WorkSessionState
  loginTime: string
  logoutTime: string | null
  breaks: BreakRecord[]
  currentBreakStart: string | null
}

export function useWorkingTimer(employeeId?: string) {
  const todayKey = useMemo(() => new Date().toISOString().slice(0, 10), [])
  const storageKey = employeeId ? `worktrack_timer_${employeeId}_${todayKey}` : `worktrack_timer_guest_${todayKey}`

  // Load or initialize today's session
  const getInitialSession = (): StoredWorkSession => {
    try {
      const stored = localStorage.getItem(storageKey)
      if (stored) {
        const parsed = JSON.parse(stored)
        if (parsed && parsed.loginTime) {
          return parsed
        }
      }
    } catch {}

    const nowIso = new Date().toISOString()
    const freshSession: StoredWorkSession = {
      sessionState: "working",
      loginTime: nowIso,
      logoutTime: null,
      breaks: [],
      currentBreakStart: null,
    }
    try {
      localStorage.setItem(storageKey, JSON.stringify(freshSession))
    } catch {}
    return freshSession
  }

  const [session, setSession] = useState<StoredWorkSession>(getInitialSession)
  const [currentTime, setCurrentTime] = useState<number>(Date.now())
  const hasPunchedInRef = useRef<boolean>(false)

  // Re-sync session when employeeId changes
  useEffect(() => {
    const updated = getInitialSession()
    setSession(updated)

    // Automatically record shift punch-in on backend for live workforce telemetry
    if (employeeId && !hasPunchedInRef.current) {
      hasPunchedInRef.current = true
      api.attendance.punchIn(employeeId)
        .then(() => {
          try {
            const ch = new BroadcastChannel("worktrack_attendance")
            ch.postMessage({ type: "PUNCH_IN", employeeId })
            ch.close()
          } catch {}
        })
        .catch(err => {
          console.warn("Punch-in telemetry sync notice:", err)
        })
    }
  }, [storageKey, employeeId])

  // Save session state to localStorage whenever it changes
  const updateSession = useCallback((updater: (prev: StoredWorkSession) => StoredWorkSession) => {
    setSession(prev => {
      const next = updater(prev)
      try {
        localStorage.setItem(storageKey, JSON.stringify(next))
      } catch {}
      return next
    })
  }, [storageKey])

  // Ticking timer: updates currentTime every 1 second when working or on break
  useEffect(() => {
    if (session.sessionState !== "working" && session.sessionState !== "on-break") {
      return
    }

    const intervalId = window.setInterval(() => {
      setCurrentTime(Date.now())
    }, 1000)

    return () => {
      window.clearInterval(intervalId)
    }
  }, [session.sessionState])

  // Total completed break duration in seconds
  const completedBreakSeconds = useMemo(() => {
    return session.breaks.reduce((acc, b) => acc + (b.durationSeconds || 0), 0)
  }, [session.breaks])

  // Exact elapsed work duration in seconds derived from actual timestamps
  const elapsedSeconds = useMemo(() => {
    if (session.sessionState === "not-started") {
      return 0
    }

    const loginTimestamp = new Date(session.loginTime).getTime()

    if (session.sessionState === "logged-out" && session.logoutTime) {
      const logoutTimestamp = new Date(session.logoutTime).getTime()
      const totalRaw = Math.max(0, Math.floor((logoutTimestamp - loginTimestamp) / 1000))
      return Math.max(0, totalRaw - completedBreakSeconds)
    }

    if (session.sessionState === "on-break" && session.currentBreakStart) {
      const breakStartTimestamp = new Date(session.currentBreakStart).getTime()
      const totalRaw = Math.max(0, Math.floor((breakStartTimestamp - loginTimestamp) / 1000))
      return Math.max(0, totalRaw - completedBreakSeconds)
    }

    // Currently working
    const totalRaw = Math.max(0, Math.floor((currentTime - loginTimestamp) / 1000))
    return Math.max(0, totalRaw - completedBreakSeconds)
  }, [session, completedBreakSeconds, currentTime])

  const startWork = useCallback(() => {
    const nowIso = new Date().toISOString()
    updateSession(() => ({
      sessionState: "working",
      loginTime: nowIso,
      logoutTime: null,
      breaks: [],
      currentBreakStart: null,
    }))
    setCurrentTime(Date.now())
    if (employeeId) {
      api.attendance.punchIn(employeeId)
        .then(() => {
          try {
            const ch = new BroadcastChannel("worktrack_attendance")
            ch.postMessage({ type: "PUNCH_IN", employeeId })
            ch.close()
          } catch {}
        })
        .catch(() => {})
    }
  }, [updateSession, employeeId])

  const startLunchBreak = useCallback(() => {
    if (session.sessionState !== "working") return
    const nowIso = new Date().toISOString()
    updateSession(prev => ({
      ...prev,
      currentBreakStart: nowIso,
      sessionState: "on-break",
    }))
  }, [session.sessionState, updateSession])

  const endLunchBreak = useCallback(() => {
    if (session.sessionState !== "on-break" || !session.currentBreakStart) return
    const nowIso = new Date().toISOString()
    const startMs = new Date(session.currentBreakStart).getTime()
    const endMs = new Date(nowIso).getTime()
    const durationSec = Math.max(0, Math.floor((endMs - startMs) / 1000))

    const newBreak: BreakRecord = {
      id: `brk-${Date.now()}`,
      start: session.currentBreakStart,
      end: nowIso,
      durationSeconds: durationSec,
    }

    updateSession(prev => ({
      ...prev,
      breaks: [...prev.breaks, newBreak],
      currentBreakStart: null,
      sessionState: "working",
    }))
    setCurrentTime(Date.now())
  }, [session.sessionState, session.currentBreakStart, updateSession])

  const logout = useCallback(() => {
    if (session.sessionState === "logged-out") return
    const nowIso = new Date().toISOString()

    updateSession(prev => {
      let updatedBreaks = prev.breaks
      if (prev.sessionState === "on-break" && prev.currentBreakStart) {
        const startMs = new Date(prev.currentBreakStart).getTime()
        const endMs = new Date(nowIso).getTime()
        const durationSec = Math.max(0, Math.floor((endMs - startMs) / 1000))
        updatedBreaks = [
          ...prev.breaks,
          {
            id: `brk-${Date.now()}`,
            start: prev.currentBreakStart,
            end: nowIso,
            durationSeconds: durationSec,
          },
        ]
      }
      return {
        ...prev,
        breaks: updatedBreaks,
        currentBreakStart: null,
        logoutTime: nowIso,
        sessionState: "logged-out",
      }
    })

    if (employeeId) {
      api.attendance.punchOut(employeeId)
        .then(() => {
          try {
            const ch = new BroadcastChannel("worktrack_attendance")
            ch.postMessage({ type: "PUNCH_OUT", employeeId })
            ch.close()
          } catch {}
        })
        .catch(() => {})
    }
  }, [session.sessionState, updateSession, employeeId])

  return {
    sessionState: session.sessionState,
    loginTime: session.loginTime,
    logoutTime: session.logoutTime,
    breaks: session.breaks,
    currentBreakStart: session.currentBreakStart,
    elapsedSeconds,
    startWork,
    startLunchBreak,
    endLunchBreak,
    logout,
  }
}
