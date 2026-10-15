export type ScheduleItemType = "login" | "work" | "lunch" | "meeting" | "reminder" | "review"

export interface ScheduleItem {
  id: string
  time: string
  title: string
  type: ScheduleItemType
  duration?: string
  completed: boolean
  isCurrent?: boolean
}
