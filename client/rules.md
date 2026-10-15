# WorkTrack Employee Dashboard — Implementation Rules

## 1. Scope rules
1. Implement only the Employee Dashboard and employee-facing frontend flows in this phase.
2. Preserve the future top-level separation: `employee/`, `admin/`, and `super-admin/`.
3. Admin and Super Admin must remain placeholders; do not build their dashboards now.
4. Frontend only: use realistic mock data. Do not invent a backend or claim data is persisted remotely.
5. Use the supplied screenshot as visual direction and the requirements PDF as the functional source.
6. **Do not include a “Time Allotted” column, allocated-time field, or time-allocation UI.** Task deadlines remain visible.

## 2. Technology rules
- React + TypeScript + Vite.
- Tailwind CSS for layout, responsive utilities, and most component styling.
- SCSS for global styles, theme tokens, and narrowly scoped complex styles only. Avoid styling the same element heavily in both Tailwind and SCSS.
- shadcn/ui for accessible primitives and dialogs/menus/forms.
- Recharts for charts.
- `lucide-react` for icons.
- React Router for routes.
- `date-fns` for date formatting and deadline comparisons.
- `react-hook-form` + `zod` for validated forms where forms are needed.
- `sonner` for toast notifications.
- Use compatible stable package versions and follow the installed Tailwind/shadcn setup; do not mix incompatible setup instructions from different major versions.

## 3. Code quality
- Strict TypeScript. Avoid `any`; use typed models and typed component props.
- Use functional components and hooks.
- Separate UI, data, types, hooks, and utilities.
- Keep components reasonably small and reusable.
- Use a single source of truth for task state. Derive filtered lists, counts, and charts from that data.
- Keep mock data in dedicated files, not inline throughout components.
- Avoid duplicated status/deadline logic; centralize it in utility functions.
- Use stable IDs for mock entities.
- Do not add unnecessary state for values that can be derived.
- Do not add dependencies without a concrete use case.
- Do not use `localStorage` as a substitute for backend persistence unless explicitly requested. In-memory state is sufficient for the first prototype.

## 4. Task rules
- Task statuses: `pending`, `in-progress`, `completed`, `overdue`.
- Define TypeScript types for task status and progress.
- A task has a deadline but no allocated-time property.
- An incomplete task whose deadline is in the past is overdue. A completed task must never be displayed as overdue.
- Ensure counts and charts use the same status derivation.
- Progress values are limited to 0, 25, 50, 75, and 100.
- Progress of 100% sets the task to completed and records a completion timestamp in mock state.
- When an overdue task is updated, require a reason/comment in the UI.
- Allow employees to edit/update delay reason notes directly for overdue tasks at any time from both the table row actions and the task details modal.
- Tasks completed past their deadline must be visually flagged as "Completed (Late)" with an amber badge indicator and audit note preservation, while being properly counted in completed metrics and removed from active overdue backlogs.
- Do not silently change a task's deadline or erase task history.
- Use mock data whose counts are consistent with the dashboard KPIs and task filters.

## 5. Timer rules
- Model work session state explicitly: `not-started`, `working`, `on-break`, and `logged-out`.
- The timer is paused while lunch is active.
- Calculate elapsed time from timestamps; do not rely on a `setInterval` counter as the authoritative duration.
- Clean up intervals/effects correctly.
- Prevent impossible transitions, such as ending a lunch break that was never started.
- The frontend demo must make clear that session state is not saved to a backend and may reset on refresh.
- Avoid automatically logging out an employee based solely on an arbitrary browser timer.

## 6. UI interaction rules
- All visible interactive controls must have a meaningful action.
- Filters/tabs update the displayed task list and counts.
- Search should filter tasks if a search input is shown.
- Add Task opens a functional form/dialog with validation and inserts a mock task into in-memory state.
- Progress actions update the relevant task and dashboard metrics.
- Leave Request opens a form/dialog with validation and adds a mock pending request.
- Notification, profile, and action menus must open and be keyboard accessible.
- Destructive or session-ending actions should use a confirmation dialog when appropriate.
- Show success/error feedback using toasts.
- Include empty states for filters with no matching tasks.

## 7. Security and future integration
- Never place secrets, API keys, or credentials in frontend code.
- Do not implement fake authorization as a security boundary. Role checks must be enforced by a future backend.
- Keep service/data access behind a clean interface so mock data can later be replaced by API calls.
- Do not add backend endpoints or pretend authentication is production-ready.
- Treat employee data as private and show only the signed-in employee's mock data in this module.

## 8. Acceptance criteria
- Project installs and runs using documented commands.
- No TypeScript errors and no avoidable console errors.
- Employee dashboard is responsive and visually coherent.
- No “Time Allotted” UI exists anywhere in the employee module.
- Task status, progress, filters, KPI counts, and charts stay consistent after interactions.
- Timer pauses/resumes correctly for lunch in the demo.
- Forms validate and give visible feedback.
- All visible navigation and controls work or clearly indicate that the destination is a future placeholder.
- Add a README with setup instructions and a short note explaining that this phase uses mock data only.

## 9. Don't Repeat Yourself (DRY) & Component Reusability Rule
- **Strict DRY Principle**: Do not repeat code, markup, or logic across components or files.
- **Reuse Existing Components**: Always leverage and reuse existing shared UI primitives (`src/components/ui/`), employee components (`TaskTable`, `TaskStatusBadge`, `TaskProgress`, `StatCard`, `WorkingTimer`, etc.), and centralized utilities instead of creating redundant or parallel components.
- **Component Composition**: Compose complex screens from existing reusable primitives rather than reinventing similar blocks.
- **Single Source of Logic**: All status derivations, KPI calculations, and formatting must live in dedicated utility functions (`taskStatus.ts`, `formatDuration.ts`, `date.ts`) and never be re-implemented inline.

## 10. Sidebar Task Badge Display Rule
- **Remaining Incomplete Tasks Only**: The badge beside "My Tasks" in the navigation sidebar must display ONLY the count of remaining incomplete tasks (`pending + inProgress + overdue`).
- **Hide When All Completed**: If all tasks are marked as completed (`remainingTasks === 0`), NO number badge will be displayed beside "My Tasks" in the sidebar.

## 11. Task Page Pagination & Display Density Rule
- **My Tasks Page Max Capacity**: On the My Tasks page (`/employee/tasks`), the task table must display at most 10 tasks at a time (`pageSize = 10`).
- **Pagination for Overflow**: When total tasks exceed 10 (or when filtered results exceed the page size), interactive pagination controls (Previous, Next, direct page number buttons, item count indicator) must be provided.
- **Search & Filter Synchronization**: Modifying filter tabs or typing in the search bar must automatically reset the active pagination page to page 1.

## 12. Working Days Breakdown & Month-Wise EOD Reports Rule
- **Working Days Interactivity**: The "Working Days" metric card in the Monthly Performance Summary must be interactive (`cursor-pointer`). Clicking it must display all working days for the active month along with logged hours, punch in/out timestamps, and completed tasks.
- **Month-Wise EOD Navigation**: The EOD Shift Reports view must support switching between calendar months (e.g. October 2026 and September 2026).
- **Daily Completed Deliverables Breakdown**: Each day's EOD record must display the specific deliverables completed during that shift with task IDs, titles, and categories alongside logged hours and shift summaries.

## 13. Timesheet Multi-Period Granularity Rule
- **Period Switching**: The Timesheet & Attendance page must support toggling between active work week records (Weekly view) and historical calendar months (e.g. October 2026 and September 2026).
- **Daily Completed Deliverables**: Timesheet shift records must display the count and details of tasks completed on each day alongside clock in/out times, break durations, and logged hours.
- **Monthly Shift Pagination**: When displaying monthly timesheet records, pagination (10 shifts per page) must be provided with real-time search filtering.

## 14. Day-by-Day Task History Rule
- **Dual Mode in My Tasks**: The My Tasks page (`/employee/tasks`) must feature prominent view switcher tabs: `Active Tasks` (current workload backlog) and `Task & Work History` (day-by-day completed deliverables).
- **Day-by-Day Breakdown**: The history view must group tasks chronologically by day, showing the date, shift hours logged, day accomplishment summary note, and all completed deliverable cards.
- **Deliverable Details**: Users must be able to inspect detailed metadata (task ID, category, completion date, duration, notes) via an interactive Details dialog.
- **Multi-Month & Category Filtering**: Support month toggling (October 2026 vs September 2026), category filter pills, keyword search, and pagination.

## 15. Scalable Year-wise and Month-wise Selection Rule
- **Hierarchical Dropdown System**: Avoid horizontal month button strips or flat month lists which fail to scale as months increase and years transition. Use the centralized, reusable `YearMonthPicker` component across all views displaying monthly records (`TaskHistoryView`, `ReportsPage`, `TimesheetPage`, `MonthlySummary`, `WorkingDaysModal`).
- **Dynamic Year Scoping**: The year dropdown displays only available years (e.g. current year 2026 and historical recorded years such as 2025). Future years with no data must not appear prematurely.
- **Cascading Month Population**: Selecting a year dynamically restricts the month dropdown to only the months recorded for that chosen year.
- **Auto-Selection on Year Transition**: Switching years automatically selects the latest available month of that target year (e.g., selecting 2025 defaults to December 2025).
- **Flexible Weekly Mode**: For Timesheet and attendance views, allow seamless toggling between live "Weekly" records and any historical Year/Month selection without duplicating markup.

## 16. Overdue Note Editing & Completed Late Rule
- **Overdue Note Editing**: Overdue tasks must provide employees the ability to view, add, and edit their progress delay explanation at any time. This must be accessible via both the table row actions menu ("Edit Delay Note") and directly inside the Task Details modal through an inline editing mode with Cancel and Save actions.
- **Completed Late Status Badge**: When a task that was overdue or completed after its deadline timestamp is marked as completed (progress = 100%), it must display a distinct `Completed (Late)` badge with an amber-warning style (`text-amber-400 bg-amber-500/15 border-amber-500/30`) in place of the standard green `Completed` badge.
- **Completed At Late Indicator**: In task details dialogs, tasks marked as completed late must display a `Completed Late` pill adjacent to the completion timestamp.
- **EOD Report & Timesheet Synchronization**: When an overdue task is marked as completed (or when a late deliverable is finished), the End-of-Day (EOD) shift reports, Working Days modal, and Timesheet views must automatically reflect it with a `Completed (Late)` badge, highlight the `X Completed Late` count in the shift header, and prominently display the employee's delay reason note directly inside the deliverable card.
- **Backlog & Metric Integrity**: Marking an overdue task as completed must transition it out of the active overdue backlog into completed status; KPI cards and filters must reflect it under Completed, preserving late completion metadata without inflating active overdue counts.
