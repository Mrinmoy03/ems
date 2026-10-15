# WorkTrack — Employee Dashboard Frontend

Production-quality frontend prototype for **WorkTrack**, a scalable employee management system.

Built strictly according to [`context.md`](./context.md), [`design.md`](./design.md), and [`rules.md`](./rules.md).

---

## 1. Scope & Architecture

In this initial phase, only the **Employee Dashboard** module is implemented.

Top-level architecture enforces clear role boundaries:
- `client/src/employee/` — Fully implemented Employee Module
- `client/src/admin/` — Admin Module boundary placeholder (`README.md`)
- `client/src/super-admin/` — Super Admin Module boundary placeholder (`README.md`)

---

## 2. Key Features Implemented

1. **Working Hours & Attendance Timer**:
   - Explicit state modeling: `not-started` | `working` | `on-break` | `logged-out`.
   - **Timestamp-backed duration calculation** (avoids imprecise `setInterval` state drift).
   - Lunch break pause and resume handling.
   - Shift Logout flow with confirmation dialog.
   - Demo disclaimer indicator.

2. **Today's Tasks Management (Deadlines, NOT Allocated Time)**:
   - Dynamic status derivation: `pending`, `in-progress`, `completed`, `overdue`.
   - **Strict adherence to business rules**: Absolutely no "Time Allotted" or allocated task duration field anywhere. Deadlines are required; allocated time is not.
   - Completed tasks can **never** be classified as overdue.
   - Incomplete tasks past their deadline automatically calculate as overdue across table, badges, filters, and charts.
   - Milestone progress updates (0%, 25%, 50%, 75%, 100%).
   - Updating an overdue task enforces a mandatory reason/explanation comment.
   - Add Task dialog and page with Zod validation.
   - Dynamic filter tabs (All, Pending, In Progress, Completed, Overdue) with live synchronized counts.
   - Task search filter by title or category.

3. **Analytics & Performance Visualizations (Recharts)**:
   - **Task Overview Donut Chart**: Live status distribution with centered total and percentage breakdown.
   - **Weekly Hours Worked Bar Chart**: Mon-Fri daily hours compared against 8-hour target reference line.
   - **Monthly Performance Trend Area Chart**: 6-month completion rate curve with smooth gradients and tooltip.

4. **Today's Schedule**:
   - Chronological timeline featuring shift login, daily standup, deep work blocks, lunch break, and sync meetings.

5. **Leave Management**:
   - Leave balances display (Casual, Sick, Annual, Unpaid).
   - "Apply for Leave" modal with calendar date validation and day duration calculation.
   - Application history table reflecting Super Admin approval workflow.

6. **Recent Activity Feed**:
   - Real-time event log for task creation, progress milestone updates, completions, and lunch sessions.

7. **Monthly Performance Summary**:
   - Aggregated metrics: Working days present, total hours logged, tasks completed, and average completion hours.

8. **Navigation & Responsive SaaS UI**:
   - Fixed dark navy sidebar (`#0b132b`) on desktop, collapsible drawer on mobile.
   - Cool-toned application background with crisp white cards and subtle borders.
   - Accessible shadcn/ui primitives (Dialogs, Dropdowns, Tabs, Avatars, Badges, Tables, Tooltips).
   - React Router navigation across Dashboard, My Tasks, Add Task, Timesheet, Leave Request, Reports, Profile, and Settings.
   - Profile photo update dialog.

---

## 3. Technology Stack

- **React 19**
- **TypeScript** (Strict mode)
- **Vite**
- **Tailwind CSS & SCSS** (`sass`)
- **shadcn/ui** (Accessible Radix UI primitives)
- **Recharts**
- **React Router** (`react-router-dom`)
- **Lucide React** (Consistent modern iconography)
- **Date-fns** (Robust date operations and formatting)
- **React Hook Form + Zod** (Schema validation)
- **Sonner** (Toast notification system)

---

## 4. Setup & Running the Project

### Prerequisites
- Node.js (v18+ recommended, tested on v24)
- npm (v9+)

### Installation
From the `client` directory:
```bash
npm install
```

### Start Development Server
```bash
npm run dev
```
Open your browser at `http://localhost:5173`.

### Production Build & Typecheck
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

> **Convenience**: You can also run `npm run dev` or `npm run build` directly from the project root.

---

## 5. Folder Structure

```text
client/
├── public/
├── src/
│   ├── admin/
│   │   └── README.md              # Admin placeholder boundary
│   ├── super-admin/
│   │   └── README.md              # Super Admin placeholder boundary
│   ├── app/
│   │   ├── App.tsx                # App root
│   │   ├── router.tsx             # React Router route definitions
│   │   └── providers.tsx          # Context & Tooltip & Toast providers
│   ├── components/
│   │   └── ui/                    # shadcn/ui components (button, card, dialog, etc.)
│   ├── employee/
│   │   ├── components/
│   │   │   ├── charts/
│   │   │   │   ├── HoursWorkedChart.tsx
│   │   │   │   ├── PerformanceChart.tsx
│   │   │   │   └── TaskOverviewChart.tsx
│   │   │   ├── AppSidebar.tsx
│   │   │   ├── DashboardHeader.tsx
│   │   │   ├── LeaveRequestSummary.tsx
│   │   │   ├── MonthlySummary.tsx
│   │   │   ├── RecentActivity.tsx
│   │   │   ├── ScheduleTimeline.tsx
│   │   │   ├── StatCard.tsx
│   │   │   ├── TaskProgress.tsx
│   │   │   ├── TaskStatusBadge.tsx
│   │   │   ├── TaskTable.tsx
│   │   │   └── WorkingTimer.tsx
│   │   ├── context/
│   │   │   └── EmployeeContext.tsx# Reactive state & action handlers
│   │   ├── data/
│   │   │   ├── mockEmployee.ts
│   │   │   ├── mockLeaveRequests.ts
│   │   │   ├── mockReports.ts
│   │   │   ├── mockSchedule.ts
│   │   │   └── mockTasks.ts
│   │   ├── hooks/
│   │   │   └── useWorkingTimer.ts # Timestamp-backed session timer
│   │   ├── layouts/
│   │   │   └── EmployeeLayout.tsx
│   │   ├── pages/
│   │   │   ├── AddTaskPage.tsx
│   │   │   ├── DashboardPage.tsx
│   │   │   ├── LeaveRequestPage.tsx
│   │   │   ├── MyTasksPage.tsx
│   │   │   ├── ProfilePage.tsx
│   │   │   ├── ReportsPage.tsx
│   │   │   ├── SettingsPage.tsx
│   │   │   └── TimesheetPage.tsx
│   │   ├── types/
│   │   │   ├── employee.ts
│   │   │   ├── leave.ts
│   │   │   ├── report.ts
│   │   │   ├── schedule.ts
│   │   │   ├── task.ts            # Strictly NO allocatedTime or timeAllotted
│   │   │   └── timer.ts
│   │   └── utils/
│   │       ├── date.ts
│   │       ├── formatDuration.ts
│   │       └── taskStatus.ts      # Centralized status derivation & KPI counts
│   ├── lib/
│   │   └── utils.ts               # cn() class merge helper
│   ├── styles/
│   │   ├── globals.scss
│   │   └── tokens.scss
│   ├── index.html
│   ├── main.tsx
│   └── vite-env.d.ts
├── package.json
├── tailwind.config.js
├── postcss.config.js
├── tsconfig.json
├── tsconfig.app.json
└── vite.config.ts
```

---

## 6. Frontend Prototype Assumptions & Limitations

1. **Frontend-Only Demo**: There is no backend connected in this phase. Data mutations (tasks, progress, leaves, avatar) persist in-memory during the browser session and reset on hard refresh.
2. **Attendance Timer**: Elapsed time calculations are based on accurate JavaScript timestamps. Durable multi-day attendance records and server-side clock sync will be handled by the backend in future phases.
3. **Leave Requests**: Applications are submitted to the in-memory store. Automated email dispatch to Super Admin will be integrated once the backend email service is built.
4. **No Allocated Time**: As mandated, all task models and UI use explicit deadlines only. No allocated time duration or "Time Allotted" columns exist.
