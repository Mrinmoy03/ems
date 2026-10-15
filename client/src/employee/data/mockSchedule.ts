import { ScheduleItem } from "../types/schedule"

export const initialMockSchedule: ScheduleItem[] = [
  {
    id: "sch-1",
    time: "09:00 AM",
    title: "Session Login & Workday Kickoff",
    type: "login",
    duration: "10 mins",
    completed: true,
  },
  {
    id: "sch-2",
    time: "09:30 AM",
    title: "Engineering Daily Standup",
    type: "meeting",
    duration: "30 mins",
    completed: true,
  },
  {
    id: "sch-3",
    time: "10:30 AM",
    title: "Deep Work: Responsive Navigation & Filters",
    type: "work",
    duration: "2h 30m",
    completed: true,
  },
  {
    id: "sch-4",
    time: "01:00 PM",
    title: "Lunch Break & Recharge",
    type: "lunch",
    duration: "1 hour",
    completed: false,
    isCurrent: true,
  },
  {
    id: "sch-5",
    time: "02:30 PM",
    title: "Frontend Architecture & Recharts Sync",
    type: "meeting",
    duration: "45 mins",
    completed: false,
  },
  {
    id: "sch-6",
    time: "04:30 PM",
    title: "EOD Summary Review & Self-Audit",
    type: "review",
    duration: "30 mins",
    completed: false,
  },
]
