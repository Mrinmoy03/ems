export type WorkSessionState = "not-started" | "working" | "on-break" | "logged-out"

export interface BreakRecord {
  id: string
  start: string // ISO date
  end?: string // ISO date (undefined if ongoing)
  durationSeconds: number
}

export interface WorkSession {
  sessionId: string
  date: string // YYYY-MM-DD
  state: WorkSessionState
  loginTime: string // ISO timestamp
  logoutTime?: string // ISO timestamp
  breaks: BreakRecord[]
  totalBreakSeconds: number
}
