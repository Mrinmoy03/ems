# WorkTrack Employee Dashboard — Design Specification

## 1. Product and scope
Build the **Employee Dashboard only** for WorkTrack, a scalable employee management system. Use the provided WorkTrack dashboard screenshot as the primary visual reference and the `Scalable Employee Management` PDF as the functional source.

The application will eventually have three role areas:
- `employee/` — implement now.
- `admin/` — create only a clear placeholder/module boundary for future work.
- `super-admin/` — create only a clear placeholder/module boundary for future work.

Do not build Admin or Super Admin screens in this phase.

## 2. Visual direction
Create a polished, professional SaaS dashboard inspired by the supplied screenshot:
- Dark navy vertical sidebar on desktop.
- Light cool-gray/blue page background.
- White cards with subtle borders, restrained shadows, and rounded corners.
- Blue as the primary action color.
- Green for completed/success, amber for in-progress/warnings, red for overdue/errors, gray for pending/neutral.
- Clear typography, compact data density, strong hierarchy, generous alignment, and consistent spacing.
- Use icons consistently; prefer Lucide icons.
- Avoid excessive gradients, glassmorphism, oversized headings, decorative animations, or overly saturated colors.
- Prioritize functional clarity over pixel-perfect copying.

## 3. Layout
### Desktop
- Fixed or sticky left sidebar, approximately 200–220px wide.
- Main content area fills remaining width and has responsive padding.
- Top header includes greeting, employee name, date, notifications, avatar, and role/designation.
- Main dashboard uses a responsive grid; allow the task table to be the dominant section.
- Right-side panels may contain the working timer and today's schedule when viewport width permits.
- Analytics and summary cards appear below the primary task area.

### Tablet and mobile
- Sidebar collapses into a drawer or compact navigation.
- Header content wraps without overlap.
- KPI cards use a responsive grid.
- Task table becomes horizontally scrollable or transforms into accessible task cards on narrow screens.
- Timer actions remain easy to tap.
- No page-level horizontal overflow.

## 4. Dashboard information architecture
### Navigation
- Dashboard
- My Tasks
- Add Task
- Timesheet
- Leave Request
- Reports
- Profile
- Settings
- Logout

Use working client-side routes for the employee area. Routes may render a useful scaffold for secondary employee pages, but the dashboard is the primary deliverable.

### Header
- Greeting based on local time where practical.
- Employee name and designation from mock employee data.
- Current date.
- Notifications control with a visible unread indicator.
- Profile/avatar menu.

### KPI cards
Show:
- Hours Worked Today
- Total Tasks
- Completed
- In Progress
- Overdue

Use mock data and ensure the figures are internally consistent with the task list. Do not hardcode screenshot values if the underlying task data says otherwise.

### Today's Tasks
Table/card fields:
- Checkbox or selection control where appropriate.
- Task name and optional category/project.
- Deadline.
- Status.
- Progress.
- Actions menu.

**Never show a “Time Allotted” column or allocated-duration field.** A deadline is required; allocated time is not part of this frontend.

Task statuses:
- Pending
- In Progress
- Completed
- Overdue

Use status badges with both text and color, so meaning is not communicated by color alone. Include tabs or filters for All, Pending, In Progress, Completed, and Overdue, with live counts derived from data.

### Task progress and overdue experience
- Show progress percentage and a progress bar.
- Support progress updates using 0%, 25%, 50%, 75%, and 100% values.
- Treat 100% as completed.
- Overdue tasks should show a clear overdue label and allow an employee to add a reason/comment.
- A task is overdue when it is not completed and its deadline is earlier than the current time. Keep status derivation consistent across cards, table, and counts.
- The PDF says progress options are only visible when a task is overdue. This rule is ambiguous for normal in-progress work. For the frontend prototype, show normal progress controls for in-progress tasks and require an explanation when updating an overdue task; keep this behavior isolated so it can be changed easily.

### Working Timer
- Show active session state and elapsed time for today.
- Actions: Start Lunch Break / End Lunch Break and Logout.
- Timer pauses while lunch break is active and resumes after the break ends.
- Use a reliable timer hook based on timestamps, not incrementing state as the source of truth.
- In this frontend-only phase, use mock/local in-memory state and clearly mark backend persistence as not connected. Do not imply real attendance records are saved.
- Provide confirmation before logout if useful, and a safe UI state for active lunch break.

### Today's Schedule
Display a chronological timeline such as login, lunch, resumed work, meetings, and task reminders. Use illustrative mock events and label them as demo data where appropriate.

### Analytics
Use responsive charts for:
- Task overview by status (donut/pie).
- Performance trend (line/area).
- Hours worked by day (bar chart), if useful for the employee view.

Charts must have readable labels/tooltips, accessible color contrast, and empty states. Derive chart data from mock data where practical.

### Recent Activity
Show a chronological feed of task additions, progress changes, and completion events.

### Leave Request
Show recent leave requests with date, type, and status, plus a “View All” or “Apply for Leave” action.

### Monthly Summary
Show useful monthly stats such as days worked, hours worked, tasks completed, and average completion time only if the metric is available and meaningful. Do not fabricate calculations from unrelated data; label demo metrics as illustrative.

## 5. Components and interaction states
Create reusable components for:
- `AppSidebar`
- `DashboardHeader`
- `StatCard`
- `TaskTable` / `TaskCard`
- `TaskStatusBadge`
- `TaskProgress`
- `WorkingTimer`
- `ScheduleTimeline`
- `TaskOverviewChart`
- `PerformanceChart`
- `HoursWorkedChart`
- `RecentActivity`
- `LeaveRequestSummary`
- `MonthlySummary`
- `EmptyState`
- `LoadingState`
- `ErrorState`
- `ConfirmDialog`
- `TaskProgressDialog` or `TaskDetailsDialog`

Include hover, focus, active, disabled, loading, empty, and error states. Menus, tabs, filters, buttons, dialogs, and timer actions must work in the prototype; avoid inert decorative controls.

## 6. Accessibility
- Use semantic headings, buttons, links, table markup, and form labels.
- Keyboard navigation and visible focus indicators.
- Accessible dialog behavior and Escape handling via the chosen UI primitives.
- Sufficient contrast.
- Add accessible names to icon-only buttons.
- Respect reduced-motion preferences.
- Do not rely on color alone for task status.

## 7. Responsive and quality requirements
- Test desktop, tablet, and mobile breakpoints.
- No console errors or broken routes.
- Avoid layout shifts and overflowing charts.
- Use skeletons or stable placeholders if loading states are shown.
- Keep spacing, radius, typography, and color tokens consistent.
