# WorkTrack — Enterprise Management System Technical Documentation

This document serves as the **single source of truth** for all WorkTrack frontend architecture, feature specifications, business rules, and technical implementations across the **Employee Dashboard**, the **Admin Panel**, and the **Project Management System**.

---

## 1. Project Overview & Scope

**WorkTrack** is a scalable employee management and project governance platform designed with three core module boundaries:
1. `src/employee/` — **Fully Implemented**: Task execution, live punch/timer, timesheets, modular EOD reports, leave applications, project deliverable context.
2. `src/admin/` — **Fully Implemented**: Executive KPI dashboard, employee directory & credential management, department hierarchy, organization-wide task orchestration, workforce attendance telemetry, unified EOD inspection, view-only leave management, and project management suite (`/admin/projects`).
3. `src/super-admin/` — **Phase 3 Roadmap Placeholder**: Executive platform boundary with role-switch controls.

This frontend phase delivers an interactive, production-quality dashboard prototype using strict TypeScript, React 19, Tailwind CSS, SCSS tokens, shadcn/ui primitives, Recharts, and React Router.

---

## 2. All Work Done & Updates Log

### Phase 1: Setup & Environment Configuration
- [x] Initialized Vite React + TypeScript project within the `client/` directory.
- [x] Configured path aliases (`@/*` pointing to `./src/*`) in `vite.config.ts` and `tsconfig.app.json`.
- [x] Installed and configured Tailwind CSS with custom status tokens and cool-toned palette.
- [x] Set up SCSS theme tokens (`src/styles/tokens.scss`) and modern global styles (`src/styles/globals.scss`) with custom scrollbars and card utility classes.
- [x] Configured Google Fonts (*Plus Jakarta Sans* & *JetBrains Mono*) and branding in `index.html`.

### Phase 2: Design System & Shared UI Components (DRY Primitives)
Built accessible, typed, and reusable UI components in `src/components/ui/` based on Radix UI and class-variance-authority (CVA):
- `Button` (Primary, destructive, outline, secondary, ghost, subtle variants)
- `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter`
- `Dialog` (Modal, backdrop, portal, animated triggers, title, description, footer)
- `DropdownMenu` (Portal, menu items, separators, labels, keyboard navigation)
- `Badge` (Variants: success, warning, destructive, pending, secondary, outline)
- `Progress` (Smooth animated progress bar with dynamic color indicators)
- `Tabs`, `TabsList`, `TabsTrigger`, `TabsContent`
- `Avatar`, `AvatarImage`, `AvatarFallback`
- `Input`, `Textarea`, `Label`
- `Select`, `SelectTrigger`, `SelectContent`, `SelectItem`, `SelectValue`
- `Table`, `TableHeader`, `TableBody`, `TableRow`, `TableHead`, `TableCell`
- `Separator`, `Tooltip`

### Phase 3: Domain Models & Business Logic
Created typed TypeScript models with strict adherence to business rules:
- `task.ts`: `EmployeeTask`, `TaskStatus`, `TaskProgress`, `TaskCounts`.
  - **CRITICAL**: Absolutely NO `allocatedTime` or `timeAllotted` properties.
- `timer.ts`: `WorkSessionState` (`not-started`, `working`, `on-break`, `logged-out`), `BreakRecord`, `WorkSession`.
- `employee.ts`: `EmployeeProfile`, `EmployeeNotification`.
- `leave.ts`: `LeaveRequest`, `LeaveType`, `LeaveStatus`.
- `report.ts`: `MonthlyReport`, `RecentActivityItem`.
- `schedule.ts`: `ScheduleItem`, `ScheduleItemType`.

### Phase 4: Business Rules & Utilities
Centralized all calculation and derivation logic to maintain **Single Source of Truth** and **DRY principle**:
- `taskStatus.ts`:
  - `deriveTaskStatus()`: Strict derivation (completed tasks can never be overdue; incomplete tasks past deadline are overdue; in-progress if progress > 0; pending otherwise).
  - `calculateTaskCounts()`: Synchronous counts calculation ensuring KPI cards, table filters, badges, and charts remain identical at all times.
  - `getStatusBadgeConfig()`: Centralized badge styling, labels, and dot colors.
- `formatDuration.ts`: Formats timestamp differences to `HH:MM:SS` and human-readable `Xh Ym`.
- `date.ts`: Time-appropriate greetings, date-fns formatting, and relative time calculations.

### Phase 5: Reactive Context & Timestamp-Backed Timer
- `useWorkingTimer.ts`: Hook calculating active elapsed work time directly from ISO timestamps. Pauses duration accumulation when on lunch break and resumes on break end.
- `EmployeeContext.tsx`: Comprehensive state provider managing:
  - In-memory tasks store with add, update progress, and complete actions.
  - Mandatory delay explanation validation for overdue tasks.
  - Working timer and break session logging.
  - Leave application submissions.
  - Unread notifications and profile avatar updates.
  - Real-time recent activity stream.

### Phase 6: Employee Components & Dashboard Views
- `AppSidebar.tsx`: Fixed dark navy sidebar (`#0b132b`) on desktop, responsive drawer on mobile, active route highlight, badge counts.
- `DashboardHeader.tsx`: Greeting, employee title, current date, notification popover with mark-read actions, avatar dropdown with quick links, and theme toggle.
- `StatCard.tsx`: Reusable KPI cards with icons, badges, and metrics.
- `WorkingTimer.tsx`: Real-time session timer, break tracking, pause/resume states, logout confirmation modal.
- `TaskTable.tsx`: Full-featured task table with filter pills (All, Pending, In Progress, Completed, Overdue), search bar, progress dialog with 0/25/50/75/100% options, overdue delay comment requirement, and Zod-validated Add Task modal.
- `TaskStatusBadge.tsx` & `TaskProgress.tsx`: DRY status badges and colored progress indicators.
- `ScheduleTimeline.tsx`: Chronological timeline for today's agenda.
- `TaskOverviewChart.tsx`: Recharts donut chart with centered total count and percentage breakdown.
- `HoursWorkedChart.tsx`: Recharts bar chart with daily hours and 8-hour target reference line.
- `PerformanceChart.tsx`: Recharts area chart with 6-month performance curve.
- `LeaveRequestSummary.tsx`: Recent leaves overview and interactive "Apply for Leave" modal.
- `MonthlySummary.tsx`: Monthly high-level performance cards.
- `RecentActivity.tsx`: Chronological event log feed.

### Phase 7: Employee Sub-Pages
Connected via React Router with shared context:
- `/employee` — Full Dashboard Page
- `/employee/tasks` — My Tasks Manager Page
- `/employee/add-task` — Add Self-Directed Task Page
- `/employee/timesheet` — Timesheet & Shift Attendance Page
- `/employee/leave` — Leave Management Page
- `/employee/reports` — EOD Reports & Monthly Summaries Page
- `/employee/profile` — Profile & Photo Change Page
- `/employee/settings` — Notifications & System Preferences Page

### Phase 8: Universal Dark & Light Theme System
- [x] Configured CSS variables and dark mode classes in `src/styles/tokens.scss` with Tailwind dark mode support.
- [x] Created `ThemeProvider` in `src/app/theme-provider.tsx` supporting `light`, `dark`, and `system` modes with `localStorage` persistence (`worktrack-theme`).
- [x] Implemented accessible dropdown `ThemeToggle.tsx` with Sun, Moon, and System options in the top dashboard header.
- [x] Built interactive theme selector cards inside `/employee/settings` with visual previews and active state indicators.
- [x] Styled all UI primitives, cards, dialogs, forms, dropdowns, tables, and charts to seamlessly switch between light and dark modes.
- [x] Synchronized Sonner toasts with theme state via `ThemedToaster`.

### Phase 9: Profile Photo Upload from Device & Dark Mode Button Optimization
- [x] Fixed button styling in `src/components/ui/button.tsx` for `outline`, `secondary`, and `ghost` variants in dark mode (resolved low contrast issue where button was washed out/invisible).
- [x] Upgraded `ProfilePage.tsx` photo upload modal with a multi-tab interface (`Tabs`, `TabsList`, `TabsTrigger`, `TabsContent`):
  - **From Device**: Interactive drag & drop zone + local file browser (`<input type="file" />`), client-side `FileReader` encoding to Base64 data URL, 5MB size validation, and immediate preview.
  - **Presets**: 5 professional curated avatar presets with active checkmark badge.
  - **Image URL**: Direct image link input with live preview.
- [x] Enhanced `tabs.tsx` primitive with universal dark mode classes.
- [x] Added instant visual feedback, error handling, and toast notifications upon saving.

### Phase 10: Dynamic Sidebar Task Badge & Dark Mode Text Visibility Optimization
- [x] Resolved text contrast across dropdown menus (`dropdown-menu.tsx`, `ThemeToggle.tsx`, `DashboardHeader.tsx`) and root HTML/body color scheme (`globals.scss`, `index.html`), ensuring all options and menu items have crisp contrast.
- [x] Implemented dynamic remaining tasks badge logic in `AppSidebar.tsx`:
  - When tasks remain incomplete: displays only the remaining incomplete task count (`pending + inProgress + overdue`).
  - When all tasks are completed: completely hides the number badge beside "My Tasks".

### Phase 11: Task Table Height Matching & 20 Test Mock Tasks
- [x] Configured dynamic height matching between the left task card and the right panel (`WorkingTimer` + `ScheduleTimeline`) using a `ResizeObserver` on `DashboardPage.tsx`.
- [x] Converted `TaskTable.tsx` to a structured flex column layout with fixed card header, pinned filter/search controls, sticky table header (`thead sticky top-0`), and scrollable table body (`overflow-y-auto scrollbar-thin`).
- [x] Expanded `mockTasks.ts` to 20 realistic mock tasks across diverse categories, statuses (completed, in-progress, pending, overdue), and progress milestones for thorough testing.

### Phase 12: Interactive Pagination in My Tasks Manager (10 Tasks per Page)
- [x] Implemented configurable pagination support in `TaskTable.tsx` via `enablePagination` and `pageSize` props.
- [x] Enabled pagination on `/employee/tasks` (`MyTasksPage.tsx`) displaying at most 10 tasks at a time (`pageSize={10}`).
- [x] Added modern pagination footer with item range indicator ("Showing 1 to 10 of 20 tasks"), disabled/active states, direct page buttons (Page 1, 2, ...), and Previous/Next buttons.
- [x] Wired reactive pagination reset to automatically return to Page 1 whenever filter tabs or search queries change.
- [x] Ensured row index calculations adjust dynamically based on current page (`(safeCurrentPage - 1) * pageSize + idx + 1`).

### Phase 13: Working Days Breakdown Modal & Month-Wise EOD Reports with 2 Months Mock Data
- [x] Created `WorkingDaysModal.tsx` showing all working days of the selected month with hours logged, check-in/out times, presence status, and completed tasks list.
- [x] Updated `MonthlySummary.tsx` making the "Working Days" stat card interactive (`cursor-pointer hover:border-blue-400`) with visual hint ("Click to view all days") and external link icon, triggering `WorkingDaysModal`.
- [x] Enhanced `ReportsPage.tsx` with month-wise EOD reports view:
  - Month switcher button tabs (`October 2026` vs `September 2026`) and top dropdown.
  - Shows each day's date, day of week, hours logged, and a dedicated **Completed Deliverables** card section showing each completed task's ID, title, and category.
  - Search filter by day, task, or summary keyword.
  - Pagination (10 reports per page) with Previous/Next navigation.
- [x] Generated 2 full months of realistic mock data (`mockReports.ts`):
  - **October 2026**: 18 working days logged, 142.5h total, 38 completed tasks, with daily punch logs and EOD reports.
  - **September 2026**: 22 working days logged, 176.0h total, 44 completed tasks, with daily punch logs and EOD reports.

### Phase 14: Timesheet & Attendance Multi-Period Granularity (Weekly & Monthly Views)
- [x] Upgraded `TimesheetPage.tsx` with period selection supporting **Weekly View** (Current active week) and **Monthly Views** (`October 2026` with 18 shifts, `September 2026` with 22 shifts).
- [x] Integrated real-time KPI metrics strip displaying Total Hours, Days Attended, Daily Average, and Tasks Completed for the selected period.
- [x] Added **Completed Tasks column** to shifts history displaying the count and badges of deliverables completed during each shift.
- [x] Integrated search filter by dates, hours, or task deliverables, along with interactive pagination (10 shifts per page) for monthly views.
- [x] Connected Timesheet page to `WorkingDaysModal` to enable one-click deep inspection of working day logs directly from timesheet metrics.

### Phase 15: Day-by-Day Task & Work History in My Tasks Manager (`/employee/tasks`)
- [x] Created `TaskHistoryView.tsx` component rendering chronological day-by-day task deliverables with daily hours logged, shift accomplishment summaries, category tags, and historical task details modals.
- [x] Upgraded `MyTasksPage.tsx` with prominent top view switcher tabs:
  - **Active Tasks**: Displays the current live task backlog with 10-per-page pagination and reactive filters.
  - **Task & Work History**: Displays day-by-day past completed deliverables across full calendar months.
- [x] Added month switching between **October 2026 (38 deliverables, 18 days)** and **September 2026 (44 deliverables, 22 days)**.
### Phase 16: Scalable Year-Wise & Month-Wise Dropdown Selector System
- [x] Built `YearMonthPicker.tsx` component replacing crowded horizontal button strips with a clean, paired selector (`Select Year` -> `Select Month`).
- [x] Auto-populates only historical recorded years (`2026`, `2025`) and dynamically filters months available for the selected year.
- [x] Multi-year mock records expanded to include 2026 (`October`, `September`, `August`) and 2025 (`December`, `November`).

### Phase 17: Shift Attendance Net Hours Math Correction & In-Progress Task Continuity
- [x] Fixed mathematical discrepancy in EOD shift cards where total hours worked did not subtract lunch breaks.
- [x] Implemented standard net shift hours formula: `Net Hours = Gross Shift Duration - Break Duration`.
- [x] Displayed explicit breakdown tooltip/formula label (`08:45 AM - 06:00 PM (9h 15m) minus 45m break = 8h 30m`).
- [x] Synchronized live timer pause state during lunch break.
- [x] Added **In Progress / Carried Forward** task tracking in daily EOD reports: tasks with `progress < 100%` automatically reflect in today's EOD as carried over to the next shift, and dynamically mark complete on the day they reach 100%.

### Phase 18: Comprehensive DRY Architecture Refactoring of EOD Reports
- [x] Refactored `ReportsPage.tsx` from ~800 monolithic lines down to 235 clean, readable lines following DRY and Single Responsibility principles.
- [x] Extracted dedicated subcomponents into `src/employee/components/reports/`:
  - `ShiftAttendanceGrid.tsx`: 4-stat punch grid (Log In, Log Out, Net Hours with breakdown formula, Break Duration).
  - `EodDeliverableItem.tsx`: Completed deliverable item card with late completion tags and delay explanations.
  - `EodCarriedTaskItem.tsx`: Carried-forward task card with progress bar, category, and continuity notes.
  - `EodReportCard.tsx`: Collapsible EOD card with compact collapsed summary and smooth accordion expansion.
  - `ReportsPagination.tsx`: Reusable pagination navigation bar.
- [x] Created `useResolvedEodReports.ts` custom hook encapsulating live context synchronization between `EmployeeContext` timer/tasks and historical reports.
- [x] Extracted `timeCalculations.ts` centralizing shift duration and net worked hours math across the application.
- [x] Added global **"Expand All" / "Collapse All"** toggle and individual card accordion controls.

### Phase 19: Interactive Leave Request Modal & Conditional Editing
- [x] Built `LeaveDetailsModal.tsx` displaying the complete untruncated leave request details:
  - Request ID, formatted application date, leave category, and live status badge.
  - Calendar duration stats, date span, and full untruncated reason container.
  - Super Admin evaluation notes and reviewer remarks.
- [x] Connected modal to both `LeaveRequestSummary.tsx` cards and `LeaveRequestPage.tsx` Application History table rows.
- [x] Implemented strict **Conditional Editability** business logic:
  - **Pending Review**: Fully editable via inline form (category dropdown, date pickers with live calendar-day calculation, reason textarea).
  - **Approved**: Permanent and locked with audit banner; non-editable.
  - **Rejected**: Reviewed and locked with decline explanation; non-editable.
- [x] Added `updateLeaveRequest` method to `EmployeeContext` with real-time recent activity logging and toast notifications.

### Phase 20: Year-Change Lifecycle in Leave Management System
- [x] Implemented annual leave ledger transition architecture:
  - **New / Upcoming Year (2027)**: Starts as a clean, completely blank slate (`0 records`). Annual leave quotas automatically reset to 100% capacity (12 Casual, 10 Sick, 20 Annual, 0 days consumed).
  - **Current Active Year (2026)**: Shows live in-progress usage and active application records.
  - **Historical Archive (2025)**: Preserves past year applications (`LV-210`, `LV-205`, `LV-201`, `LV-198`) and year-end closed balances for compliance audits.
- [x] Built interactive **Year Switcher** pill toolbar in `LeaveRequestPage.tsx` with dynamic contextual banner alerts (`Fresh Quotas • Blank`, `Active Year`, `Archived Records`).
- [x] Connected `LeaveRequestSummary.tsx` to the selected year context, automatically syncing the application forms, empty states, and default date ranges.

---

## 3. Features Implemented

The WorkTrack Employee Dashboard includes the following fully-implemented, production-grade features:

### 1. Universal Dark & Light Theme Mode
- **Persistent Theme Preference**: User preference is stored in `localStorage` under `worktrack-theme`, instantly restored upon page reload.
- **Three Modes Supported**:
  - `Light`: Crisp, cool-toned corporate aesthetic with slate surfaces.
  - `Dark`: Deep, high-contrast dark palette with slate-900/slate-950 backgrounds, elevated borders, and legible typography.
  - `System`: Automatically synchronizes with the user's OS color scheme using `window.matchMedia`.
- **Dual Controls**: Accessible from both the top header dropdown toggle (`ThemeToggle`) and the dedicated Appearance section in `/employee/settings`.
- **Universal Component Coverage**: All cards, modals, dialogs, tables, progress indicators, inputs, select menus, dropdowns, tooltips, and Recharts analytics charts adapt to the active theme.
- **Adaptive Toast System**: Sonner toast notifications automatically match the active theme.

### 2. Live Working Timer & Shift Session Tracker
- **Timestamp-Backed Accuracy**: Timer is calculated dynamically from real timestamps (`Date.now() - sessionStart - totalBreakDuration`), eliminating drift.
- **Digital HUD Display**: Live ticking `HH:MM:SS` timer with animated pulse indicator.
- **Lunch Break Mode**: One-click lunch break button that pauses the work timer without losing shift data, records break duration intervals, and displays a dedicated break status banner.
- **Resumption Flow**: "End Lunch Break & Resume" resumes work tracking and updates cumulative break minutes.
- **End Shift & Logout Modal**: Confirmation dialog summarizing total work duration and compiling an End-of-Day (EOD) summary.
- **State Badges**: Dynamic status tags for `Active Shift`, `On Lunch Break`, and `Logged Out`.

### 3. Task Management (Strict Deadline-Only Architecture)
- **Zero Allocated Time**: In strict compliance with business rules, **no `allocatedTime` or `timeAllotted` field exists anywhere** in models, components, forms, or tables.
- **Prominent Day-by-Day Task & Work History Tab**: In `MyTasksPage` (`/employee/tasks`), users can seamlessly switch between active tasks and a chronological day-by-day work history:
  - Each day displays date, shift hours logged, accomplishment summary, and deliverable cards.
  - Interactive "Details" button opens a task modal displaying ID, category, date, duration, and accomplishment notes.
  - Month switching (`October 2026` vs `September 2026`), category filters, search, and pagination.
- **Matched Height with Right Column (Dashboard)**: On the dashboard, the Today's Tasks card height precisely matches the combined height of the two right-hand cards (Working Timer + Today's Schedule). If fewer tasks exist, the height remains fixed; if more tasks are present, the table body scrolls smoothly with a custom scrollbar while the title, filter pills, search input, and table headers stay pinned.
- **Interactive Pagination (My Tasks Page)**: On the My Tasks Manager page (`/employee/tasks`), displays at most 10 tasks at a time (`pageSize = 10`), providing interactive Previous/Next and page number controls with dynamic row index calculation and search/filter auto-reset.
- **Dynamic Status Derivation (`deriveTaskStatus`)**:
  - `completed`: Set when `progress === 100`. **Completed tasks can NEVER be classified as overdue**, regardless of deadline date.
  - `overdue`: Incomplete tasks (`progress < 100`) where `deadline < now`.
  - `in-progress`: Incomplete tasks where `progress > 0` and deadline is in the future.
  - `pending`: Tasks at `0%` progress with future deadline.
- **Unified KPI Counters**: "Total Tasks", "Pending", "In Progress", "Completed", and "Overdue" counters derived from a single calculation function (`calculateTaskCounts`), guaranteed to match across KPI cards, filter tabs, sidebar badges, and charts.
- **Filter Tabs**: Instant filtering by status (`All`, `Pending`, `In Progress`, `Completed`, `Overdue`) with live counts.
- **Live Search**: Instant keyword search filtering by task title, category, or ID.
- **Discrete Progress Updates**: Interactive progress modal restricted to predefined milestones (`0%`, `25%`, `50%`, `75%`, `100%`) with visual progress preview.
- **Mandatory Overdue Delay Comments**: If an overdue task's progress is updated, the form strictly enforces a non-empty explanation comment before saving.
- **Editable Delay Notes for Overdue Tasks**: Employees can update or refine their delay explanation note at any time without having to advance the task's progress percentage. Accessible directly through the table row actions menu ("Edit Delay Note") or inside the Task Details modal with interactive inline editing (Edit, Save, Cancel) and immediate toast confirmation.
- **"Completed (Late)" Status Tagging**: When an overdue task is completed (or completed after its deadline timestamp), it seamlessly transitions to completed metrics while retaining audit trail transparency via an amber-styled `Completed (Late)` badge and a `Completed Late` indicator beside the completion timestamp in details modals.
- **EOD In-Progress & Carried Forward Reflection**:
  - EOD shift reports display two dedicated, structured deliverable sections: **Completed Deliverables** and **In Progress / Carried Forward Tasks**.
  - Any task that is active or incomplete at the end of a shift (or during live work) is preserved in that day's EOD with its progress percentage (e.g. 50%), status, and destination rollover note (`Carrying forward to Next Shift`).
  - Next day's task queue (`TaskTable`, `MyTasksPage`) displays a visual badge: `Carried over from [Date]` (e.g., `Carried over from Oct 14, 2026`).
  - When the employee marks the carried-over task as completed on the subsequent day, THAT day's EOD report instantly updates to display it under **Completed Deliverables** (flagged On Time or Completed (Late)), while previous days' EOD records immutably maintain that it was in progress on that prior date.
- **EOD Shift Attendance & Punch Times**:
  - Every EOD report displays a prominent 4-stat attendance & work duration summary card:
    - **Log In Time (Punch In)**: e.g. `08:55 AM` with blue icon.
    - **Log Out Time (Punch Out)**: e.g. `05:10 PM` (or `Live Session (Active Shift)` while shift is ongoing) with indigo icon.
    - **Total Hours Worked**: Live session duration or finalized shift hours (e.g. `8h 15m (8.25h)`) with emerald clock badge.
    - **Break Duration**: Total lunch/break time recorded during that shift (e.g. `45m`) with amber coffee badge.
- **Task Details Modal**: Shows detailed task scope, creator origin (`Admin Assigned` vs `Employee Self-Added`), deadline, completion timestamp (with late delivery pill if applicable), and historical/editable progress notes.
- **Quick Completion**: One-click checkmark action to mark any incomplete task as 100% complete. Automatic late-completion detection flags overdue tasks as completed late.

### 4. Self-Assigned Task Creation (Modal & Full Page)
- **Quick Modal**: Add task dialog directly from the dashboard task card.
- **Dedicated Page (`/employee/add-task`)**: Full-page task creation form with pre-filled default deadlines, clear instructions, and category inputs.
- **Form Validation**: Strict schema validation using Zod and React Hook Form (title minimum 3 chars, category minimum 2 chars, valid future deadline).

### 5. Interactive Productivity & Time Analytics Charts (Recharts)
- **Task Distribution Donut Chart (`TaskOverviewChart`)**: Circular status breakdown with dynamic colors (Blue, Amber, Emerald, Red), responsive tooltip, and centered total task counter.
- **Daily Hours Worked Bar Chart (`HoursWorkedChart`)**: Bar chart showing Monday–Friday recorded hours with an 8.0h target reference line and daily completion indicators.
- **Performance Trend Area Chart (`PerformanceChart`)**: 6-month historical productivity score curve with smooth spline curves and soft gradient fill.

### 6. Daily Schedule & Agenda Timeline (`ScheduleTimeline`)
- **Chronological Today Agenda**: Lists meetings, design syncs, sprint reviews, and focus blocks.
- **Category Indicators**: Color-coded badges for `meeting`, `task`, and `review`.
- **Time Slots & Attendees**: Displays event duration, location/call links, and participant count.

### 7. Leave Management & Policy Compliance (`/employee/leave`)
- **Balance Cards**: Breakdown of `Available`, `Used`, and `Total` days for Casual Leave, Sick Leave, and Annual Leave.
- **Interactive Leave Application Modal**:
  - Leave type selector (`Casual`, `Sick`, `Paid`, `Annual`, `Unpaid`).
  - Start and end date pickers with automatic calendar-day duration calculation.
  - Reason validation via Zod.
- **Leave Request History Table**: Chronological log with status badges (`Approved`, `Pending`, `Rejected`) and review notes.
- **Policy Compliance Notice**: Prominent banner confirming that leave approval authority rests strictly with Super Admin.

### 8. Shift Attendance & Timesheet History (`/employee/timesheet`)
- **Live Shift Status**: Embedded working timer widget and current session summary with active break intervals.
- **Multi-Period Timesheet Granularity**:
  - `Weekly View`: Real-time active work week (Mon–Fri) showing today's live session, clock in/out, break durations, and total hours.
  - `Monthly Views (October 2026 & September 2026)`: Historical shift records across the entire month (18 days for October, 22 days for September).
- **Dynamic KPI Metrics Strip**: Displays Total Hours Logged, Days Attended (Present vs Scheduled), Daily Average Hours, and Total Tasks Completed for the active period.
- **Completed Tasks per Shift**: Displays the count and badges of deliverables completed during each shift with task ID and title tooltips.
- **Working Days Breakdown Modal Link**: Clickable link to inspect detailed monthly shift breakdowns with search and filtering.
- **Search & Pagination**: Live search filtering by date, hours, or task deliverables, with 10 shifts per page pagination for monthly views.
- **Timesheet Export**: One-click PDF/CSV timesheet export action with toast feedback.

### 9. EOD Reports & Performance Summaries (`/employee/reports`)
- **Interactive Working Days Breakdown Modal**:
  - Clicking on the "Working Days" stat card in the Monthly Performance Summary opens a comprehensive modal detailing all working days for the selected month.
  - Displays day of the week, punch-in and punch-out timestamps, hours logged badge (`8h 30m`), presence verification pill (`Present`), and a **Tasks Completed** list for each day.
  - In-modal month switcher dropdown enabling instant toggling between October 2026 and September 2026.
  - Search filter enabling quick lookup by date, day, or task title.
  - Quick KPI header summary (Days Present/Scheduled, Total Hours, Daily Average, and Total Tasks Completed).
- **Month-Wise End-of-Day (EOD) Shift Reports**:
  - Hierarchical Year/Month selector via `YearMonthPicker`.
  - Daily records displaying shift date, day of week, hours logged tag, and detailed summary note.
  - **Completed Deliverables Breakdown per Day**: Displays the exact tasks completed during each shift, including task ID badges, titles, and category tags.
  - **Late Completion Tracking & Badges**:
    - Deliverables completed after their deadline or marked completed while overdue display a prominent amber `Completed (Late)` badge.
    - If an employee entered a delay explanation, it is showcased within a highlighted `Delay Reason / Audit Note` callout directly inside the deliverable card.
    - Each shift's header displays a dynamic `X Completed Late` badge alongside `Tasks Completed`.
  - **Live Synchronization with Task Manager**: Completing an overdue task or updating its delay note in the active task view immediately synchronizes with today's EOD shift report in real time.
  - Real-time search filter and pagination (10 reports per page) with Previous/Next controls.
  - One-click PDF report export trigger with toast notifications.
- **Two Full Months Mock Dataset**:
  - `October 2026`: 18 working days logged, 142.5 hours, 38 completed deliverables.
  - `September 2026`: 22 working days logged, 176.0 hours, 44 completed deliverables.

### 10. Employee Profile & Multi-Source Photo Upload (`/employee/profile`)
- **Employee Identity Card**: Displays employee name, active status badge, designation, department, employee ID, email, phone, location, and hire date.
- **High-Contrast Dark Mode Action Button**: "Change Photo" button styled with explicit borders, background, and icons for crystal-clear visibility in both Light and Dark themes.
- **Upload from Device**:
  - Interactive drag-and-drop dropzone and native file browser (`input type="file"`).
  - Supports PNG, JPG, WEBP, and GIF formats up to 5MB.
  - Client-side `FileReader` conversion to Base64 data URL with file validation and error alerts.
- **Multi-Source Selection Tabs**:
  - `From Device`: Drag-and-drop or local file selection.
  - `Presets`: 5 curated professional avatars with checkmark indicator.
  - `Image URL`: Direct web image URL input.
- **Live Avatar Preview**: Real-time visual preview displaying the selected photo before confirming changes.
- **Instant Global Synchronization**: Updates immediately reflect across the profile avatar, the top dashboard header avatar, and trigger a confirmation toast notification.

### 11. Settings & System Preferences (`/employee/settings`)
- **Appearance & Theme**: Interactive 3-card selector for Light, Dark, and System theme modes.
- **Notification Toggles**: Customizable preferences for task deadlines, shift reminders, system announcements, and daily digest emails.
- **Account Security Info**: Session timeout indicators and login audit references.

### 12. Top Dashboard Header (`DashboardHeader`)
- **Dynamic Time Greeting**: Contextual "Good Morning", "Good Afternoon", or "Good Evening" based on the user's current clock.
- **Current Date Display**: Formatted long date (e.g., *Wednesday, October 14, 2026*).
- **Universal Theme Toggle**: Dropdown selector for rapid theme switching.
- **Notification Dropdown**: Popover showing recent alerts, unread counter badge, mark-as-read actions, and relative timestamps.
- **User Avatar Dropdown**: Quick navigation links to Profile, Settings, Timesheet, and shift logout.

### 13. Responsive Navigation Sidebar (`AppSidebar`)
- **Desktop Sidebar**: Fixed dark navy sidebar (`#0b132b`) with active route pills and icons.
- **Mobile Responsive Drawer**: Off-canvas menu with hamburger button toggle and backdrop blur.
- **Dynamic Remaining Tasks Badge**: The badge beside "My Tasks" dynamically computes remaining incomplete tasks (`pending + inProgress + overdue`). When some tasks are completed, only remaining tasks are shown. When all tasks are completed, the badge automatically disappears completely (no number is shown).
- **Company Branding**: WorkTrack logo and employee profile badge at the footer.

### 14. Scalable Year-wise and Month-wise Selector System (`YearMonthPicker`)
- **Design Rationale**: Horizontal tab buttons do not scale as time progresses and years change (e.g. 12+ months across multiple years). A hierarchical dual-dropdown selector provides compact, elegant, and future-proof navigation.
- **Dynamic Year Scoping**: The Year selector renders only available years with recorded data (e.g. `2026 (Current)` and `2025 (Historical)`). Future years are not displayed until reached.
- **Cascading Month Population**: Selecting a Year dynamically limits the Month dropdown to only the months belonging to that chosen year.
- **Automatic Default Selection**: When switching years (e.g. from 2026 to 2025), the Month dropdown automatically defaults to the latest available month of that target year (e.g., `December 2025`).
- **Flexible Weekly Mode**: For Timesheet and attendance views, `allowWeekly={true}` renders a dedicated "Weekly" toggle button, allowing instant switching between active week logs and any historical year/month records.
- **Universal Reusability**: Implemented via a single centralized component (`src/employee/components/YearMonthPicker.tsx`) utilized across:
  - `TaskHistoryView.tsx` (Day-by-Day Task History)
  - `ReportsPage.tsx` (Header bar and EOD shift reports card)
  - `TimesheetPage.tsx` (Action bar and shift records table)
  - `MonthlySummary.tsx` (Dashboard and Reports KPI summary card)
  - `WorkingDaysModal.tsx` (Working days and shift duration modal)

---

## 4. Don't Repeat Yourself (DRY) Architecture

To prevent duplication and guarantee maintainability, WorkTrack strictly enforces component reusability across all modules:

```text
Reusable UI Primitives (src/components/ui/)
  ├── Button, Card, Dialog, DropdownMenu, Badge, Progress, Tabs, Avatar, Table, Select, Input, Textarea
  └── Used uniformly by all feature components

Reusable Employee Components (src/employee/components/)
  ├── TaskTable.tsx        ── Reused in DashboardPage & MyTasksPage
  ├── TaskStatusBadge.tsx  ── Reused across tables, detail dialogs, and cards
  ├── TaskProgress.tsx     ── Reused across table rows, modals, and previews
  ├── StatCard.tsx         ── Reused across top KPI stats
  ├── WorkingTimer.tsx     ── Reused in DashboardPage & TimesheetPage
  ├── MonthlySummary.tsx   ── Reused in DashboardPage & ReportsPage
  ├── YearMonthPicker.tsx  ── Reusable paired Year & Month picker with dynamic cascading scoping
  ├── WorkingDaysModal.tsx ── Modal dialog breakdown for working days and attendance
  ├── ThemeToggle.tsx      ── Reused in Header and available across app
  └── Charts Components   ── Self-contained Recharts modules with shared tooltips

Centralized Logic (src/employee/utils/)
  ├── deriveTaskStatus()   ── Single function used by table, filters, KPIs, and charts
  ├── calculateTaskCounts()── Single function driving all badges, KPIs, and filter counts
  └── formatDuration()     ── Single function formatting all timer and attendance durations
```

---

## 5. Business Rules Reference

| Rule | Implementation Details |
|---|---|
| **Deadlines Only** | Tasks have a `deadline` (ISO string). **No `allocatedTime` or `timeAllotted` field exists.** |
| **Overdue Derivation** | A task is overdue only if incomplete (`progress < 100`) and `deadline < now`. |
| **Completed Protection** | Completed tasks (`progress === 100`) are **never** classified as overdue, even if deadline has passed. |
| **Overdue Updates** | Updating an overdue task requires an explanation comment in the UI before saving. |
| **Working Timer** | Calculates elapsed seconds from timestamps (`Date.now() - loginTime - breaks`). Pauses during lunch. |
| **Progress Values** | Progress values are restricted to discrete milestones: `0%`, `25%`, `50%`, `75%`, `100%`. |
| **Universal Theme** | Supports `light`, `dark`, and `system` modes, persisted in `localStorage` under `worktrack-theme`. |
| **Sidebar Task Badge** | Shows count of remaining incomplete tasks only (`pending + inProgress + overdue`). Automatically hides when all tasks are completed (`remainingTasks === 0`). |
| **Leave Approval** | Leave requests are submitted in-memory; policy notes that approval rests exclusively with Super Admin. |

---

## 6. Folder Structure

```text
client/
├── public/
├── src/
│   ├── admin/
│   │   └── README.md              # Boundary placeholder
│   ├── super-admin/
│   │   └── README.md              # Boundary placeholder
│   ├── app/
│   │   ├── App.tsx                # App root with ThemeProvider & routes
│   │   ├── router.tsx             # React Router tree
│   │   ├── providers.tsx          # Context providers & ThemedToaster
│   │   └── theme-provider.tsx     # ThemeContext, useTheme hook, localStorage
│   ├── components/
│   │   ├── ui/                    # Reusable shadcn/ui primitives
│   │   └── ThemeToggle.tsx        # Universal theme dropdown toggle
│   ├── employee/
│   │   ├── components/
│   │   │   ├── charts/
│   │   │   │   ├── HoursWorkedChart.tsx
│   │   │   │   ├── PerformanceChart.tsx
│   │   │   │   └── TaskOverviewChart.tsx
│   │   │   ├── reports/
│   │   │   │   ├── EodCarriedTaskItem.tsx
│   │   │   │   ├── EodDeliverableItem.tsx
│   │   │   │   ├── EodReportCard.tsx
│   │   │   │   ├── ReportsPagination.tsx
│   │   │   │   └── ShiftAttendanceGrid.tsx
│   │   │   ├── AppSidebar.tsx
│   │   │   ├── DashboardHeader.tsx
│   │   │   ├── LeaveDetailsModal.tsx
│   │   │   ├── LeaveRequestSummary.tsx
│   │   │   ├── MonthlySummary.tsx
│   │   │   ├── RecentActivity.tsx
│   │   │   ├── ScheduleTimeline.tsx
│   │   │   ├── StatCard.tsx
│   │   │   ├── TaskHistoryView.tsx
│   │   │   ├── TaskProgress.tsx
│   │   │   ├── TaskStatusBadge.tsx
│   │   │   ├── TaskTable.tsx
│   │   │   ├── WorkingDaysModal.tsx
│   │   │   ├── WorkingTimer.tsx
│   │   │   └── YearMonthPicker.tsx
│   │   ├── context/
│   │   │   └── EmployeeContext.tsx
│   │   ├── data/
│   │   │   ├── mockEmployee.ts
│   │   │   ├── mockLeaveRequests.ts
│   │   │   ├── mockReports.ts
│   │   │   ├── mockSchedule.ts
│   │   │   └── mockTasks.ts
│   │   ├── hooks/
│   │   │   ├── useResolvedEodReports.ts
│   │   │   └── useWorkingTimer.ts
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
│   │   │   ├── task.ts
│   │   │   └── timer.ts
│   │   └── utils/
│   │       ├── date.ts
│   │       ├── formatDuration.ts
│   │       ├── taskStatus.ts
│   │       └── timeCalculations.ts
│   ├── lib/
│   │   └── utils.ts
│   ├── styles/
│   │   ├── globals.scss
│   │   └── tokens.scss            # CSS theme variables for light and dark
│   ├── index.html
│   ├── main.tsx
│   └── vite-env.d.ts
├── context.md
├── design.md
├── documentation.md
├── package.json
├── postcss.config.js
├── rules.md
├── tailwind.config.js
├── tsconfig.app.json
├── tsconfig.json
└── vite.config.ts
```

---

## 7. Commands to Run & Test

```bash
# Navigate to client directory
cd client

# Install dependencies
npm install

# Run development server
npm run dev
# -> Opens http://localhost:5173/employee

# Run strict TypeScript check & production build
npm run build

# Preview production bundle
npm run preview
```

---

## 8. Year Lifecycle, Dropdown Archiving & Fresh-Start Production Architecture

### Mental Model & Core Principles
1. **Fresh Start in Production**:
   - When an organization deploys the system in production, they start fresh with **only the current active calendar year** (e.g. `2026`).
   - There are **no previous years** initially because no historical records exist.
   - The year selector dropdown dynamically computes available years via `getAvailableLeaveYears(requests, currentYear)`. In a fresh deployment without history, only `[2026]` is returned.
2. **Upcoming / Future Years Rule**:
   - **Upcoming years (e.g. 2027) MUST NEVER be shown anywhere** until that calendar year actually arrives in real time.
   - Future years are excluded across all year selectors (`LeaveRequestPage`, `YearMonthPicker`, `mockReports.ts`, `mockLeaveRequests.ts`).
3. **Previous Years in Dropdown**:
   - As an organization operates over multiple years, previous years automatically accumulate in the database and appear in a **Select Dropdown** (not horizontal pill tabs).
   - In development/mock mode, past data (e.g. 2025) is included solely to simulate and verify the historical archive behaviors.
4. **Closed Period (Read-Only) Enforcement**:
   - Past calendar years are legally and logically closed audit periods.
   - In past years:
     - `+ Apply Leave` button is hidden and replaced with `Closed Period (Read-Only)` badge.
     - Form schemas reject dates from past calendar years.
     - Table rows display `View` actions only; `Edit` is strictly disabled.
     - All past records are immutable and read-only.

---

## 9. Backend Integration & Dynamic Data Architecture (Zero Hardcoding)

To prepare for backend introduction, all hardcoded dates, periods, and fallbacks have been removed across the entire client source code:

### Key Dynamic Mechanisms
1. **Dynamic Active Month & Safe Fallbacks**:
   - `getCurrentMonthKey()` dynamically resolves against `new Date()`, generating `YYYY-MM` without hardcoded month strings.
   - `getMonthData(monthKey)` safely retrieves month payloads and provides typed fallback defaults, preventing `undefined` runtime crashes when querying new or unseeded months.
2. **Dynamic Date Detection**:
   - Replaced all hardcoded date checks (e.g. `report.date === "Oct 15, 2026"`) with `isFormattedDateToday(report.date)`.
   - Today's date and day of week in EOD shift reports and timesheets are dynamically generated via `formatStandardDate(new Date())` and `format(new Date(), "EEEE")`.
   - In-progress carry-forward labels dynamically compute the next calendar day: `Next Shift (${format(tomorrow, "MMM dd, yyyy")})`.
3. **Centralized Backend Configuration (`src/config/api.ts`)**:
   - Established `API_CONFIG.baseUrl` reading from `import.meta.env.VITE_API_BASE_URL || "/api"`.
   - Structured endpoints map `API_ENDPOINTS` for Authentication, Employee Profile, Tasks, Attendance, Leave Management, and Reports.
4. **Context-Driven State Boundary**:
   - All state mutations (tasks, leaves, profile, timer, notifications) flow through `EmployeeContext`, ensuring a seamless plug-and-play migration to REST/GraphQL API services when backend endpoints are connected.

---

## 10. Working Days & Weekly Schedule Policy (Monday to Saturday)

### Work Week Schedule & Norms
The system operates on a **6-day working week** policy:
- **Active Working Days**: Monday through Saturday.
- **Weekly Off / Rest Day**: Sunday (sole weekly off).
- **Standard Daily Shift**: 8.0 hours / day.
- **Standard Weekly Baseline**: **48.0 hours / week** (6 days × 8.0h/day).

### System-Wide Implementation Details
1. **Weekly Hours Worked Analytics (`HoursWorkedChart.tsx`)**:
   - Bar chart renders all 6 active working days (`Mon`, `Tue`, `Wed`, `Thu`, `Fri`, `Sat`).
   - Header badge indicates `Target: 8.0h / day (Mon – Sat)`.
   - Dynamic pace tracker calculates cumulative hours against the **48h Standard** weekly target.
   - Smooth `isAnimationActive={false}` transition ensures instant chart responsiveness.
2. **Attendance & Timesheets (`TimesheetPage.tsx`)**:
   - Weekly shift log captures Monday to Saturday shifts (including Saturday Oct 10 shift).
   - Weekly KPI highlights `Active Work Week (Monday – Saturday)` with `6 / 6` days present and progress evaluated against the 48h weekly threshold.
3. **Monthly Working Days Calculation (`mockReports.ts`)**:
   - Monthly scheduled working days dynamically exclude Sundays:
     - **October 2026**: 27 scheduled working days (31 calendar days - 4 Sundays).
     - **September 2026**: 26 scheduled working days (30 calendar days - 4 Sundays).
     - **August 2026**: 26 scheduled working days (31 calendar days - 5 Sundays).
     - **December 2025**: 27 scheduled working days (31 calendar days - 4 Sundays).
     - **November 2025**: 25 scheduled working days (30 calendar days - 5 Sundays).
     - Safe fallback default: 26 working days.
4. **Working Days Breakdown Modal (`WorkingDaysModal.tsx`)**:
   - Subtitle explicitly reflects: `Mon – Sat (6-Day Work Week)`.
   - KPI metric strip clarifies: `Present / Scheduled (Mon–Sat)`.
5. **Year & Month Selector (`YearMonthPicker.tsx`)**:
   - Weekly quick selector badge updated to 6 days.

---

## 11. Login Credentials & Security Policy (Admin-Managed Only)

### Business Rule & Policy Definition
- **Employees Cannot Change Login Credentials**:
  - Direct employee modification or resetting of login credentials (username, email, passwords, access tokens, SSO linkages) is strictly prohibited.
  - All employee credentials and system permissions are centrally provisioned, updated, and managed exclusively by **Organization Administrators** and **Corporate IT**.

### Implementation Details ([`SettingsPage.tsx`](file:///d:/00_VAMA_WORK/ems/client/src/employee/pages/SettingsPage.tsx))
- **Elimination of Password Modification Inputs**:
  - Removed editable "Current Password" and "New Password" text inputs from the settings interface.
- **Admin-Managed Security & Credentials Card**:
  - Prominent badge: `Admin Managed` (`ShieldCheck`).
  - Clear administrative policy callout:
    > "Employees cannot change or reset login credentials. All user login identifiers, passwords, and system access permissions are centrally provisioned and managed by Organization Administrators and Corporate IT."
  - **Read-Only Account Status Grid**:
    - **Login Identifier / Email**: `alex.morgan@worktrack.io` (read-only display).
    - **Password Status**: `••••••••••••••••` (Locked · Managed by Org Admin).
    - **Authentication Provider**: `Enterprise SSO / WorkTrack Auth`.
    - **Credential Assistance**: Clear guidance directing the employee to the IT Helpdesk or HR Administrator.
- **Preference Persistence**:
  - Form submission button updated to `Save Preferences`, strictly scoped to persisting appearance and alert notification toggles without touching credentials.

---

## 12. Notification Bar Lifecycle & Queue Dynamics

### Core Principles & User Experience
1. **Removal of Read Notifications from Notification Bar**:
   - The notification popover dropdown (`DashboardHeader.tsx`) serves strictly as an **active, actionable notification feed**.
   - When an individual notification is marked as read (by clicking on the item or its check action button), it is immediately removed from the active notification bar feed via `markNotificationRead(id)`.
   - When the user clicks **"Mark all read"**, all notifications are marked read and cleared simultaneously via `markAllNotificationsRead()`.
   - The unread badge on the header Bell icon synchronizes in real time and disappears completely when the bar is empty (`unreadNotificationCount === 0`).
2. **Clean Empty State**:
   - When all notifications are cleared, the dropdown displays a clean, reassuring empty state:
     - Icon: `CheckCheck` in an emerald accent pill.
     - Title: `All caught up!`
     - Subtitle: `No active notifications`.
     - Includes a subtle `Simulate New Notification` action for rapid testing and demonstration.
3. **New Notifications Always Show on Top**:
   - **Chronological Queue Inversion**: Whenever a new notification is generated, it is prepended to the array (`[newNotification, ...prev]`).
   - **Strict Timestamp Sorting**: The notification list is dynamically sorted by timestamp in descending order:
     ```ts
     const sortedNotifications = [...notifications].sort(
       (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
     )
     ```
   - This guarantees that **new notifications will always show on top** of the notification bar, even under rapid concurrent updates.
4. **Context-Driven Notification Triggers ([`EmployeeContext.tsx`](file:///d:/00_VAMA_WORK/ems/client/src/employee/context/EmployeeContext.tsx))**:
   - Exposed `addNotification` in `useEmployee()`.
   - Automatically dispatches high-priority notifications placed at the top of the bar when:
     - A new task is created via `addTask()`.
     - A task is completed (100% milestone reached) via `updateTaskProgress()`.
     - A leave application is submitted via `applyForLeave()`.

---

## 13. Reactive Notification Preferences & Automated Alert Engines

### Architecture & Persistence
Notification settings in [`SettingsPage.tsx`](file:///d:/00_VAMA_WORK/ems/client/src/employee/pages/SettingsPage.tsx) are fully wired to reactive alert engines in [`EmployeeContext.tsx`](file:///d:/00_VAMA_WORK/ems/client/src/employee/context/EmployeeContext.tsx) and persisted across browser sessions via `localStorage` (`"worktrack_notification_preferences"`):
```ts
export interface NotificationPreferences {
  taskDeadlineApproaching: boolean // 30 min before deadline
  lunchBreakReminder: boolean // Alert if lunch break exceeds 60 min
  eodAutoDigest: boolean // Display summary of completed assignments at workday wrap-up
}
```

### The Three Automated Alert Engines
1. **Task Deadline Approaching Engine (30-Minute Threshold)**:
   - **Trigger**: Every 10 seconds, active incomplete deliverables (`progress < 100` and `status !== 'completed'`) are inspected.
   - **Condition**: If remaining deadline time is between 0 and 30 minutes (`0 < diffMs <= 30 * 60 * 1000`), an alert is triggered.
   - **Behavior**:
     - Prevents duplicate alerts per task session using a dedicated session ref (`alertedDeadlineTaskIdsRef`).
     - Dispatches a high-priority notification placed directly on top of the notification bar.
     - Displays an actionable Sonner warning toast informing the employee of the remaining minutes.
2. **Lunch Break Active Reminder Engine (> 60 Minutes)**:
   - **Trigger**: Monitored continuously during `sessionState === 'on-break'`.
   - **Condition**: If active break duration exceeds 60 minutes (3,600 seconds) without shift resumption.
   - **Behavior**:
     - Dispatches an urgent reminder notification to the notification bar (`"Lunch Break Exceeded"`).
     - Fires a warning toast prompting the user to click **"Resume Shift"** to continue billable hours tracking.
     - Automatically resets its alert flag whenever a new lunch break begins.
3. **Daily EOD Auto-Digest Engine (Workday Wrap-Up)**:
   - **Trigger**: Listens for workday completion / logout (`sessionState === 'logged-out'`).
   - **Condition**: Employee clicks "End Shift & Logout" in the timer confirmation modal.
   - **Behavior**:
     - Compiles a comprehensive digest: total net hours logged today (e.g. `8h 15m`) and total deliverables marked 100% complete during the workday.
     - Dispatches a celebratory summary notification to the top of the notification bar.
     - Fires a success toast confirming shift wrap-up and audit readiness.

---

## 14. Phase 2: Admin Panel Implementation Architecture

### 14.1 Architectural Overview & Module Boundaries
Phase 2 expands WorkTrack from an employee dashboard into a cohesive multi-tiered organizational management platform. The Admin Portal is architected under `src/admin/` with its own state engine ([`AdminContext.tsx`](file:///d:/00_VAMA_WORK/ems/client/src/admin/context/AdminContext.tsx)), dark navy executive sidebar ([`AdminSidebar.tsx`](file:///d:/00_VAMA_WORK/ems/client/src/admin/components/AdminSidebar.tsx)), enterprise header ([`AdminHeader.tsx`](file:///d:/00_VAMA_WORK/ems/client/src/admin/components/AdminHeader.tsx)), and full interactive dialogs and pages.

- **Role Boundaries & Entitlements**:
  - **Admin CAN**:
    - Provision new employee accounts and generate secure initial login keys ([`EmployeeFormDialog.tsx`](file:///d:/00_VAMA_WORK/ems/client/src/admin/components/EmployeeFormDialog.tsx)).
    - Edit employee profiles, designations, department assignments, and contact metadata.
    - Deactivate or delete employee accounts with confirmation dialogs.
    - Create, modify, and archive departments with duplicate code prevention ([`DepartmentDialog.tsx`](file:///d:/00_VAMA_WORK/ems/client/src/admin/components/DepartmentDialog.tsx)).
    - Dispatch tasks and multi-assign deliverables across multiple employees simultaneously ([`TaskAssignmentDialog.tsx`](file:///d:/00_VAMA_WORK/ems/client/src/admin/components/TaskAssignmentDialog.tsx)).
    - **Modify task deadlines**: Permitted strictly when accompanied by a mandatory documented business justification, permanently appended to an audit history log ([`DeadlineChangeDialog.tsx`](file:///d:/00_VAMA_WORK/ems/client/src/admin/components/DeadlineChangeDialog.tsx)).
    - View organization-wide attendance telemetry, daily check-in timestamps, and break compliance ([`AttendancePage.tsx`](file:///d:/00_VAMA_WORK/ems/client/src/admin/pages/AttendancePage.tsx)).
    - Inspect aggregated End-of-Day (EOD) work reports and milestone velocity ([`ReportsPage.tsx`](file:///d:/00_VAMA_WORK/ems/client/src/admin/pages/ReportsPage.tsx)).
    - View employee leave applications (**Strictly View-Only**; [`LeaveManagementPage.tsx`](file:///d:/00_VAMA_WORK/ems/client/src/admin/pages/LeaveManagementPage.tsx)).
    - Submit administrative recommendations and observations addressed to the Super Admin ([`AdminCommentDialog.tsx`](file:///d:/00_VAMA_WORK/ems/client/src/admin/components/AdminCommentDialog.tsx)).
  - **Admin CANNOT**:
    - Approve or reject employee leave applications (strictly reserved for Super Admin; all decision buttons are omitted, and prominent legal/compliance notices are displayed).
    - Override global audit purge policies.
    - Allocate fixed duration or "Time Allotted" properties to tasks (strictly deadline-only model).
  - **Employee Restriction**:
    - Employees cannot alter their primary login credentials; administrators hold authoritative credential provisioning controls.

### 14.2 Routing & Navigation Structure
- `/admin` — Operations & Org Overview Dashboard ([`AdminDashboardPage.tsx`](file:///d:/00_VAMA_WORK/ems/client/src/admin/pages/AdminDashboardPage.tsx))
- `/admin/employees` — Workforce Directory & Access Management ([`EmployeesPage.tsx`](file:///d:/00_VAMA_WORK/ems/client/src/admin/pages/EmployeesPage.tsx))
- `/admin/employees/:employeeId` — Employee Profile Details (7 Tabs: Overview, Tasks, Attendance, Reports, Leave, Performance, Notes; [`EmployeeDetailsPage.tsx`](file:///d:/00_VAMA_WORK/ems/client/src/admin/pages/EmployeeDetailsPage.tsx))
- `/admin/departments` — Department Architecture & Team Leads ([`DepartmentsPage.tsx`](file:///d:/00_VAMA_WORK/ems/client/src/admin/pages/DepartmentsPage.tsx))
- `/admin/tasks` — Task & Milestone Orchestration with Multi-Assignee & Deadline Audits ([`TasksPage.tsx`](file:///d:/00_VAMA_WORK/ems/client/src/admin/pages/TasksPage.tsx))
- `/admin/attendance` — Workforce Attendance & Time Logs with Monday–Saturday 48h Baseline ([`AttendancePage.tsx`](file:///d:/00_VAMA_WORK/ems/client/src/admin/pages/AttendancePage.tsx))
- `/admin/reports` — EOD Deliverables & Deliverable Audits ([`ReportsPage.tsx`](file:///d:/00_VAMA_WORK/ems/client/src/admin/pages/ReportsPage.tsx))
- `/admin/leave` — Leave Applications & Schedule Requests (View-Only with Super Admin notice; [`LeaveManagementPage.tsx`](file:///d:/00_VAMA_WORK/ems/client/src/admin/pages/LeaveManagementPage.tsx))
- `/admin/settings` — System Administration & Policy Configuration ([`AdminSettingsPage.tsx`](file:///d:/00_VAMA_WORK/ems/client/src/admin/pages/AdminSettingsPage.tsx))
- `/super-admin` — Phase 3 Executive Governance Plane Placeholder ([`SuperAdminPlaceholderPage.tsx`](file:///d:/00_VAMA_WORK/ems/client/src/super-admin/SuperAdminPlaceholderPage.tsx))

### 14.3 Strict Business Rules Enforced
1. **Mandatory Deadline Modification Audit**:
   - `updateTaskDeadline(taskId, newDeadline, reason)`: Validates that `reason` is non-empty. Creates a `DeadlineChangeRecord` with timestamp and actor name.
2. **Multi-Employee Task Assignment with No "Time Allotted"**:
   - Admins can assign a task to one or multiple employees simultaneously (`assignedTo: string[]`). No time allocation or duration properties exist in the model.
3. **View-Only Leave Requests for Admin**:
   - Prominent notification banners emphasize Super Admin exclusivity.
   - Admins use `AdminCommentDialog` to send recommendations to the Super Admin.
4. **Monday through Saturday Schedule Baseline**:
   - 6-day work week (Monday to Saturday), 8 hours/day, 48 hours/week standard. Sundays designated as non-working rest day.

### 14.4 Dedicated Employee Task Inspection & Self-Assignment Indicator
1. **Interactive Entry Points**:
   - In `/admin/employees` ([`EmployeeTable.tsx`](file:///d:/00_VAMA_WORK/ems/client/src/admin/components/EmployeeTable.tsx)):
     - Added **"Check Dedicated Tasks"** option with icon `<CheckSquare />` to each row's action dropdown menu.
     - The **"Active Tasks" count pill** is now an interactive button; clicking directly opens the dedicated tasks modal for that specific employee.
2. **Dedicated Tasks Modal ([`EmployeeDedicatedTasksDialog.tsx`](file:///d:/00_VAMA_WORK/ems/client/src/admin/components/EmployeeDedicatedTasksDialog.tsx))**:
   - Displays all tasks assigned to the chosen employee with real-time status filter tabs (`All`, `In Progress`, `Pending`, `Completed`, `Overdue`) and search filtering.
   - Allows the admin to click **"Modify Deadline"** directly within this modal, opening [`DeadlineChangeDialog.tsx`](file:///d:/00_VAMA_WORK/ems/client/src/admin/components/DeadlineChangeDialog.tsx) with mandatory business reason logging.
   - Includes direct **"Assign Task"** button pre-populating this employee.
3. **Self-Assigned vs Admin-Assigned Indicators**:
   - Distinguishes tasks created by the employee themselves (`task.isSelfCreated === true` or `task.assignedBy` matches employee name/id/"self") from administrative tasks.
   - Self-assigned tasks render a distinct violet badge: `<Badge className="bg-purple-100 text-purple-700 ...">Self-Assigned by Employee</Badge>`.
   - Admin-assigned tasks render an outline badge: `<Badge variant="outline">Assigned by Sarah Jenkins</Badge>`.
   - The indicator is also rendered inside [`EmployeeTaskOverview.tsx`](file:///d:/00_VAMA_WORK/ems/client/src/admin/components/EmployeeTaskOverview.tsx) on the employee details profile page.

### 14.5 Unified EOD Reports Architecture Matching Employee Experience
1. **Consistent Modular Rendering**:
   - Both the organizational EOD reports page ([`ReportsPage.tsx`](file:///d:/00_VAMA_WORK/ems/client/src/admin/pages/ReportsPage.tsx)) and the employee profile EOD tab ([`EmployeeDetailsPage.tsx`](file:///d:/00_VAMA_WORK/ems/client/src/admin/pages/EmployeeDetailsPage.tsx)) now utilize the exact modular [`EodReportCard.tsx`](file:///d:/00_VAMA_WORK/ems/client/src/employee/components/reports/EodReportCard.tsx).
2. **Rich EOD Report Anatomy**:
   - **Shift Attendance Grid**: Punch In, Punch Out, Lunch Break duration, and Net Shift Hours.
   - **Completed Deliverables**: Title, category, deadline, completion timestamp, progress badge, and late deliverable warnings.
   - **Carried-Forward Tasks**: In-progress deliverables carrying into the next shift.
   - **Blockers & Notes**: Prominent amber alert for logged dependencies and blockers.
3. **Multi-Year / Multi-Month Filtering**:
   - Integrated [`YearMonthPicker.tsx`](file:///d:/00_VAMA_WORK/ems/client/src/employee/components/YearMonthPicker.tsx) with hierarchical year and month selection.
   - Added global search across dates and task deliverables, plus an **"Expand All / Collapse All"** toggle.
4. **Monthly and Daily EOD Report Downloads**:
   - Built [`exportEodReport.ts`](file:///d:/00_VAMA_WORK/ems/client/src/employee/utils/exportEodReport.ts) providing client-side CSV generation (`downloadMonthlyEodCSV` and `downloadDailyEodCSV`) and PDF ledger triggers.
   - Built [`DownloadMonthlyEodButton.tsx`](file:///d:/00_VAMA_WORK/ems/client/src/employee/components/reports/DownloadMonthlyEodButton.tsx) featuring a dropdown menu:
     - **Download CSV Spreadsheet**: Compiles all shift dates, check-in/out timestamps, lunch break duration, net hours logged, completed deliverables, carried-forward tasks, and shift summary into a `.csv` download file.
     - **Export PDF Audit Report**: Formats the selected month's shift deliverables into an audited printable ledger.
   - Added to Employee EOD Reports, Admin Organization EOD Reports, and Admin Employee Profile EOD Tab.

### 14.6 Admin-Exclusive Credential Provisioning & Password Management
1. **Admin-Defined Login ID & Password on Account Creation**:
   - In [`EmployeeFormDialog.tsx`](file:///d:/00_VAMA_WORK/ems/client/src/admin/components/EmployeeFormDialog.tsx), the old "provision password" checkbox has been replaced with explicit credential inputs:
     - **Employee Login ID**: Custom or auto-generated unique ID (e.g. `EMP-1050`), verified against collisions.
     - **Set Password & Confirm Password**: Dedicated password input fields with show/hide toggle and match validation.
   - Upon creation, a dedicated credentials card provides quick copying of Login ID, Login Email, and Password for employee onboarding.
2. **Admin-Only Password Update Authority (Directly via Edit Profile)**:
   - When administrators view an employee profile (`/admin/employees/:id`) and click **"Edit Profile"**, [`EmployeeFormDialog.tsx`](file:///d:/00_VAMA_WORK/ems/client/src/admin/components/EmployeeFormDialog.tsx) provides **New Password** and **Confirm New Password** fields directly within the edit form. Leaving these fields blank preserves the existing password, while entering a new matching password updates the credentials immediately.
   - Dedicated [`UpdatePasswordDialog.tsx`](file:///d:/00_VAMA_WORK/ems/client/src/admin/components/UpdatePasswordDialog.tsx) is also available from the table action menu and profile header.
3. **Strict Employee Restriction**:
   - Employees have read-only credential settings and cannot modify their Login ID, email, or password. Password fields are permanently locked from employee self-service.

### 14.7 Complete Employee-Admin Feature Parity & Visibility Audit
1. **Task Delays & Milestone Governance ([`TasksPage.tsx`](file:///d:/00_VAMA_WORK/ems/client/src/admin/pages/TasksPage.tsx))**:
   - When employees record an overdue task delay explanation (`task.delayReason` / `task.comment`), it surfaces prominently in an amber alert chip directly in the admin tasks table and dedicated employee task modal.
   - Task completion milestones (`0%`, `25%`, `50%`, `75%`, `100%`) are rendered with visual progress bars and milestone indicators alongside status badges.
   - Self-assigned tasks (`Self-Assigned`) vs admin deliverables (`Admin Assigned`) are distinctively badged across all task lists.
2. **Comprehensive Leave Details & Quota Tracking ([`AdminLeaveDetailsDialog.tsx`](file:///d:/00_VAMA_WORK/ems/client/src/admin/components/AdminLeaveDetailsDialog.tsx), [`EmployeeLeaveSummary.tsx`](file:///d:/00_VAMA_WORK/ems/client/src/admin/components/EmployeeLeaveSummary.tsx))**:
   - Built a dedicated details dialog enabling Admins to inspect untruncated leave reasons, applied dates, duration, and Super Admin review status.
   - Displays real-time leave entitlement quota summary cards in employee profile (Casual: 8/12, Sick: 5/8, Annual: 14/18).
   - Preserves Super Admin exclusivity for approval/rejection decisions while letting Admins attach operational advisory notes.
3. **Workforce Attendance Logs Export ([`AttendancePage.tsx`](file:///d:/00_VAMA_WORK/ems/client/src/admin/pages/AttendancePage.tsx))**:
   - Added **"Export CSV"** button in attendance toolbar, allowing administrators to download filtered punch logs, break durations, and net billable hours to a structured CSV spreadsheet.

---

## 15. WorkTrack Project Management System (Admin & Employee Integration)

### 15.1 Architectural Overview & Core Concepts
WorkTrack supports two distinct but compatible work management modes:
1. **Normal Tasks (Independent)**:
   - Standalone deliverables assigned to one or more employees with explicit deadlines.
   - Operates without requiring any project linkage (`projectId: undefined`).
2. **Project-Based Work Packages**:
   - High-level corporate initiatives subdivided into modular **Project Parts / Work Packages**.
   - Each project part carries an explicit **Contribution Weight (%)** defining its share of total project completion.
   - Tasks and assignments belong to specific project parts without causing double counting.

### 15.2 Weighted Contribution & Progress Calculation Engine
- **Centralized Formula ([`projectProgress.ts`](file:///d:/00_VAMA_WORK/ems/client/src/utils/projectProgress.ts))**:
  $$\text{Overall Project Progress} = \frac{\sum (\text{Part Weight} \times \text{Part Progress})}{100}$$
- **100% Total Contribution Weight Validation**:
  - The sum of all active project parts must equal exactly 100%: $\sum \text{Part.weight} = 100\%$.
  - In [`ProjectPartDialog.tsx`](file:///d:/00_VAMA_WORK/ems/client/src/admin/components/ProjectPartDialog.tsx), a live reactive balance meter informs administrators of the projected total weight and remaining balance.
  - If a project's weights do not equal 100%, a prominent amber warning banner alerts administrators to rebalance work package allocations.
- **Part Progress Derivation**:
  - Derived from the average progress of underlying tasks assigned to that part ($\text{Part Progress} = \frac{\sum \text{Task.progress}}{N}$).
  - If no individual tasks are linked, the part's configured milestone progress is utilized.
- **Strict Prevention of Double Counting**:
  - Project tasks are counted as standard deliverables in individual employee task queues. Their progress updates roll up into their assigned part, and the part's weighted contribution rolls into overall project progress.

### 15.3 Admin Project Management Interfaces
1. **Navigation Entry ([`AdminSidebar.tsx`](file:///d:/00_VAMA_WORK/ems/client/src/admin/components/AdminSidebar.tsx))**:
   - Added **"Projects"** menu item under Administration with `<FolderKanban />` icon and a live badge indicating in-progress initiatives.
2. **Projects Portfolio Page ([`ProjectsPage.tsx`](file:///d:/00_VAMA_WORK/ems/client/src/admin/pages/ProjectsPage.tsx) — `/admin/projects`)**:
   - KPI metrics: Total Portfolio, In Progress, Planning, Completed.
   - Reactive search by project name, unique project code (e.g. `WT-ECS`), or client organization.
   - Filters for status, business unit / department, and priority.
   - Dual presentation: Interactive **Grid Card View** and structured **Table View**.
   - Each project card features stacked contribution weight visualization ([`ProjectWeightBar.tsx`](file:///d:/00_VAMA_WORK/ems/client/src/components/projects/ProjectWeightBar.tsx)), weighted progress bar ([`ProjectProgressBar.tsx`](file:///d:/00_VAMA_WORK/ems/client/src/components/projects/ProjectProgressBar.tsx)), status badge ([`ProjectStatusBadge.tsx`](file:///d:/00_VAMA_WORK/ems/client/src/components/projects/ProjectStatusBadge.tsx)), timeline dates, and reference links ([`ProjectLinksList.tsx`](file:///d:/00_VAMA_WORK/ems/client/src/components/projects/ProjectLinksList.tsx)).
3. **Dedicated Project Details Page ([`ProjectDetailsPage.tsx`](file:///d:/00_VAMA_WORK/ems/client/src/admin/pages/ProjectDetailsPage.tsx) — `/admin/projects/:projectId`)**:
   - **Header Banner**: Project code, status badge, priority pill, client name, description, overall progress, and target deadline.
   - **6-Tab Suite**:
     1. **Overview**: Work package delivery matrix, progress countdown, team allocations, and reference URLs.
     2. **Project Parts**: Complete table of work packages with weights (%), assigned departments, assignees, deadlines, progress bars, calculated contribution (+X%), and status. Includes Add Part and Edit Part dialogs.
     3. **Team & Assignments**: Department breakdown and accountability roster mapping each employee to their responsible work package.
     4. **Tasks**: All deliverables linked to the project, grouped by work package, with assignees, deadlines, progress, and direct "Assign Project Task" dispatcher.
     5. **Activity & History**: Chronological audit trail documenting project creation, work package additions, weight reallocations, and progress sync events.
     6. **Links & References**: Dedicated directory of URLs (Live Site, Staging, GitHub Repo, Figma Design Spec, Documentation) with one-click copy and secure external launch.
4. **Project Creation & Editing Dialogs**:
   - [`ProjectFormDialog.tsx`](file:///d:/00_VAMA_WORK/ems/client/src/admin/components/ProjectFormDialog.tsx): Name, code (with auto-generation helper), client, description, status, priority, start date, deadline, project owner, department multi-select, employee multi-select, and dynamic URL list.
   - [`ProjectPartDialog.tsx`](file:///d:/00_VAMA_WORK/ems/client/src/admin/components/ProjectPartDialog.tsx): Work package name, contribution weight (%), assigned department, employee assignees, start/deadline dates, and notes.

### 15.4 Employee Dashboard Project Integration
1. **Task Table Project Column ([`TaskTable.tsx`](file:///d:/00_VAMA_WORK/ems/client/src/employee/components/TaskTable.tsx))**:
   - Added a dedicated **Project** column between Task Details and Category across the Dashboard task card and [`MyTasksPage.tsx`](file:///d:/00_VAMA_WORK/ems/client/src/employee/pages/MyTasksPage.tsx).
   - Project-linked tasks display an indigo badge with the project name and work package identifier.
   - Independent tasks display a neutral `Independent Task` label.
2. **Task Details Modal Project Context ([`TaskTable.tsx`](file:///d:/00_VAMA_WORK/ems/client/src/employee/components/TaskTable.tsx))**:
   - When an employee opens an assigned task, a prominent Project Context banner displays:
     - Associated Project Name and Work Package badge.
     - Project scope description.
     - Authorized project links (Live Site, Staging, Repository, Figma, Docs) opening safely in a new tab.
3. **Optional Project Association on Self-Assigned Tasks ([`AddTaskPage.tsx`](file:///d:/00_VAMA_WORK/ems/client/src/employee/pages/AddTaskPage.tsx))**:
   - Employees logging self-directed work can optionally tag an active corporate project and work package or leave it as an independent deliverable.
4. **Single Source of Truth & Real-Time Progress Flow**:
   - State managed centrally via [`ProjectContext.tsx`](file:///d:/00_VAMA_WORK/ems/client/src/context/ProjectContext.tsx) mounted at application root.
   - When an employee updates their task progress (e.g. Alex Morgan advances `TSK-201` from 25% to 75% or completes it at 100%), `EmployeeContext` triggers `syncTaskProgressToProject`.
   - The project part's progress updates immediately.
   - The overall project progress updates immediately.
   - Admin viewing `/admin/projects` or `/admin/projects/:projectId` sees the live progress update with zero manual refresh.

### 15.5 Admin Dashboard Visual Telemetry
- [x] **Initiative Status Mix Donut Chart Center Metric**:
  - Embedded the aggregated total work count (`totalWorkCount = Completed + In Progress + Pending + Overdue`) with the label `"Total Work"` centered in the donut hole of the "Initiative Status Mix" card on [`AdminDashboardPage.tsx`](file:///d:/00_VAMA_WORK/ems/client/src/admin/pages/AdminDashboardPage.tsx).
  - Correctly reflects the full distribution sum (e.g. 8 Completed + 9 In Progress + 5 Pending + 3 Overdue = 25 Total Work).
  - Designed with `pointer-events-none` so slice hover tooltips remain fully responsive across both light and dark modes.
  - Aligned with the typography and layout pattern established in [`TaskOverviewChart.tsx`](file:///d:/00_VAMA_WORK/ems/client/src/employee/components/charts/TaskOverviewChart.tsx).

### 15.6 Universal Pagination System with Dynamic 10 / 20 / 30 Page Size Selectors
- [x] **Universal Pagination Component ([`DataPagination.tsx`](file:///d:/00_VAMA_WORK/ems/client/src/components/common/DataPagination.tsx))**:
  - Built a shared, responsive pagination bar displaying item range telemetry (`Showing X to Y of Z [items]`).
  - Added interactive page size selector pills (`[10 | 20 | 30]`) defaulting to 10 items per page with instant re-pagination.
  - Smart windowing for numbered page buttons with ellipsis truncation, direct page switching, and Previous/Next buttons with disabled states.
- [x] **Upgraded Views across Employee & Admin**:
  - Applied dynamic 10 / 20 / 30 pagination across EOD reports, timesheets (weekly and monthly), task backlogs, work history, working days modal, attendance logs, projects, and workforce directory.

### 15.7 Super Admin Role Integration & Exclusive Leave Decision Governance
- [x] **DRY Architectural Parity**:
  - Super Admin shares 100% feature parity with Admin: uses the exact same components and layouts ([`AdminLayout.tsx`](file:///d:/00_VAMA_WORK/ems/client/src/admin/layouts/AdminLayout.tsx), [`AdminDashboardPage.tsx`](file:///d:/00_VAMA_WORK/ems/client/src/admin/pages/AdminDashboardPage.tsx), [`EmployeesPage.tsx`](file:///d:/00_VAMA_WORK/ems/client/src/admin/pages/EmployeesPage.tsx), [`ProjectsPage.tsx`](file:///d:/00_VAMA_WORK/ems/client/src/admin/pages/ProjectsPage.tsx), [`TasksPage.tsx`](file:///d:/00_VAMA_WORK/ems/client/src/admin/pages/TasksPage.tsx), etc.). Zero redundant pages created.
  - Wired in [`router.tsx`](file:///d:/00_VAMA_WORK/ems/client/src/app/router.tsx) under `/super-admin` with `initialRole="super-admin"`.
- [x] **Role State & Context Management ([`AdminContext.tsx`](file:///d:/00_VAMA_WORK/ems/client/src/admin/context/AdminContext.tsx))**:
  - Added `currentRole: "admin" | "super-admin"`, `isSuperAdmin: boolean`, and `setRole: (role) => void`.
  - Added authoritative decision actions: `approveLeave(leaveId, remarks)` and `rejectLeave(leaveId, remarks)`.
  - Automatically updates `leaveRequests` state, marks status as `approved` / `rejected`, appends executive remarks to `adminComment`, and triggers toast notifications.
- [x] **Dynamic Visual Identity & Navigation ([`AdminSidebar.tsx`](file:///d:/00_VAMA_WORK/ems/client/src/admin/components/AdminSidebar.tsx) & [`AdminHeader.tsx`](file:///d:/00_VAMA_WORK/ems/client/src/admin/components/AdminHeader.tsx))**:
  - **Sidebar Badge**: Displays `SUPER ADMIN` with royal purple theme and `Executive Governance` subtitle when in Super Admin mode; displays `ADMIN` with blue theme when in Admin mode.
  - **Leave Management Nav Item**: Displays `Approvals` badge for Super Admin; displays `View Only` badge for Admin.
  - **Role Switcher**: Integrated interactive 3-way toggle (`Employee` | `Admin` | `Super Admin`) at the bottom of the sidebar with active role pill highlighting.
  - **Header Badge**: Dynamically displays `Super Admin` (purple) or `System Admin` (blue).
- [x] **Exclusive Leave Approval & Rejection Workflow ([`LeaveManagementPage.tsx`](file:///d:/00_VAMA_WORK/ems/client/src/admin/pages/LeaveManagementPage.tsx) & [`AdminLeaveDetailsDialog.tsx`](file:///d:/00_VAMA_WORK/ems/client/src/admin/components/AdminLeaveDetailsDialog.tsx))**:
  - **Super Admin Mode**:
    - Replaces the read-only notice with an active **"Super Admin Executive Authority Active"** banner.
    - Adds direct **Approve** (emerald `CheckCircle2`) and **Reject** (rose `XCircle`) action buttons on each pending leave row.
    - Features a dedicated **Super Admin Decision Modal** with optional executive remarks / audit reason logging.
    - [`AdminLeaveDetailsDialog.tsx`](file:///d:/00_VAMA_WORK/ems/client/src/admin/components/AdminLeaveDetailsDialog.tsx) empowers Super Admin to approve or reject directly from the modal with remarks input.
  - **Admin Mode**:
    - Maintains the view-only governance policy with the advisory note sender dialog for Administrators.

---

## 16. Authentication System & Backend Architecture

### 16.1 Unified Multi-Role Authentication
- [x] **Universal Enterprise Login Page ([`LoginPage.tsx`](file:///d:/00_VAMA_WORK/ems/client/src/auth/pages/LoginPage.tsx))**:
  - Located at `/login`.
  - Serves **Super Admin**, **Admin**, and **Employees** through a unified login interface.
  - Supports credential authentication via Email address or Employee ID (`VAMA-XXX`) and secure password.
  - Includes password visibility toggle, error handling, session loading animations, and corporate branding.
  - Features 1-click **Quick Fill Test Credentials** for testing:
    - **Super Admin**: `superadmin@vamastudio.com` / `SuperAdmin@2026!`
    - **Admin**: `admin@vamastudio.com` / `Admin@2026!`
    - **Employee**: `alex.m@vamastudio.com` / `Employee@2026!`
- [x] **Strict Employee Provisioning Policy**:
  - Employees cannot self-register.
  - An authorized Administrator first provisions the employee record in `/admin/employees` using [`EmployeeFormDialog.tsx`](file:///d:/00_VAMA_WORK/ems/client/src/admin/components/EmployeeFormDialog.tsx), establishing their Login ID, email, and password.
  - The provisioned credentials automatically sync to the backend API (`POST /api/employees`) and client authentication store.
  - The employee then logs in with their Admin-assigned credentials.
- [x] **Role-Based Access Control & Route Guarding ([`ProtectedRoute.tsx`](file:///d:/00_VAMA_WORK/ems/client/src/auth/components/ProtectedRoute.tsx))**:
  - Enforces route protection across all three workspaces:
    - `/employee/*` — Restricted to authenticated users with `employee` role.
    - `/admin/*` — Restricted to authenticated users with `admin` or `super-admin` role.
    - `/super-admin/*` — Restricted strictly to users with `super-admin` role.
  - Unauthenticated access redirects automatically to `/login` preserving target location state.
  - Unauthorized role navigation redirects users to their appropriate workspace.
- [x] **Universal Logout & Session Termination**:
  - Connected across [`AdminHeader.tsx`](file:///d:/00_VAMA_WORK/ems/client/src/admin/components/AdminHeader.tsx), [`AdminSidebar.tsx`](file:///d:/00_VAMA_WORK/ems/client/src/admin/components/AdminSidebar.tsx), [`DashboardHeader.tsx`](file:///d:/00_VAMA_WORK/ems/client/src/employee/components/DashboardHeader.tsx), and [`AppSidebar.tsx`](file:///d:/00_VAMA_WORK/ems/client/src/employee/components/AppSidebar.tsx).
  - Clears auth token, active user session, terminates working timer shift, and returns the user safely to `/login`.

---

### 16.2 Industrial Modular Node.js / Express Backend (`server/`)
Constructed a production-ready, industrial standard backend in `server/` with clean separation of concerns:

```
server/
├── package.json               # Dependencies: express, cors, multer, mysql2, dotenv, jsonwebtoken, bcryptjs, pdfkit
├── tsconfig.json              # Strict TypeScript configuration
├── .env.example / .env        # Database and JWT secrets configuration
└── src/
    ├── config/
    │   ├── db.ts              # MySQL2 connection pool with keep-alive & error handling
    │   ├── schema.sql         # Full relational MySQL schema with indexing & FK cascades
    │   └── initDb.ts          # Automated table creation and seed data execution
    ├── middleware/
    │   ├── auth.ts            # JWT authentication middleware
    │   ├── roleGuard.ts       # Role-based route authorization guards
    │   ├── upload.ts          # Multer file upload handler
    │   └── errorHandler.ts    # Centralized JSON error and 404 handlers
    ├── controllers/
    │   ├── authController.ts        # Login, getMe, logout
    │   ├── employeeController.ts    # CRUD employees & password provisioning
    │   ├── projectController.ts     # Projects & weighted progress calculation
    │   ├── taskController.ts        # Tasks & delay justifications (NO allocatedTime)
    │   ├── attendanceController.ts  # Punch-in, punch-out, shift duration logging
    │   ├── leaveController.ts       # Leave applications & Super Admin decisions
    │   ├── reportController.ts      # EOD report submission & PDFKit generation
    │   └── departmentController.ts  # Department organization management
    ├── services/
    │   └── pdfService.ts      # PDFKit server-side generator for audited EOD reports
    ├── routes/
    │   ├── authRoutes.ts
    │   ├── employeeRoutes.ts
    │   ├── projectRoutes.ts
    │   ├── taskRoutes.ts
    │   ├── attendanceRoutes.ts
    │   ├── leaveRoutes.ts
    │   ├── reportRoutes.ts
    │   ├── departmentRoutes.ts
    │   └── index.ts           # Aggregated /api router
    ├── types/
    │   └── index.ts           # Shared TypeScript domain interfaces
    ├── app.ts                 # Express application configuration with CORS
    └── index.ts               # Server startup & database initialization
```

### 16.3 Relational MySQL Database Architecture
The database schema (`schema.sql`) implements 12 relational tables:
1. `users`: Authentication identities, password hashes, and roles (`employee`, `admin`, `super-admin`).
2. `departments`: Organization units and color coding.
3. `employees`: Workforce profiles linked to user accounts.
4. `projects`: Project governance records, external links, and calculated weighted progress.
5. `project_parts`: Work packages with contribution weights summing to 100%.
6. `project_part_assignees`: Many-to-many relationship linking employees to project parts.
7. `tasks`: Individual deliverables (**strictly NO allocatedTime or timeAllotted fields**).
8. `attendance`: Daily shift records, check-in, check-out, and duration seconds.
9. `attendance_breaks`: Categorized breaks (lunch, tea, other) with timestamps.
10. `leave_requests`: Leave filings with Super Admin exclusive approval/rejection authority.
11. `eod_reports`: Daily shift summaries, completed tasks, blockers, and next-day plans.
12. `comments`: Contextual remarks across tasks, projects, and leave requests.

### 16.4 Server-Side EOD PDF Generation (`pdfService.ts`)
- Utilizes `pdfkit` to generate official corporate PDF shift reports.
- Includes corporate header branding, report date, employee identity box, total shift hours, completed deliverables bulleted list, operational blockers, and next-shift execution agenda.
- Accessible via `GET /api/reports/eod/pdf?date=...&employeeId=...` and wired to frontend export triggers in [`ReportsPage.tsx`](file:///d:/00_VAMA_WORK\ems\client\src\employee\pages\ReportsPage.tsx) and [`DownloadMonthlyEodButton.tsx`](file:///d:/00_VAMA_WORK\ems\client\src\employee\components\reports\DownloadMonthlyEodButton.tsx).

### 16.5 Resilient Client-Server Integration ([`api.ts`](file:///d:/00_VAMA_WORK/ems/client/src/services/api.ts))
- Built a typed API service in `client/src/services/api.ts` communicating with `http://localhost:5000/api`.
- Attaches Bearer JWT authentication tokens to outgoing requests.
- Designed with **graceful fallback**: if the user's MySQL service is not yet started locally, the frontend continues operating smoothly with client-side state and seed accounts, preventing white screens or connection failures.





