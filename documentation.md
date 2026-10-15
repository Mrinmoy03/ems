# WorkTrack — Scalable Employee Management System

## Documentation Overview

The primary, comprehensive technical and feature documentation for this project is maintained in:
👉 **[`client/documentation.md`](./client/documentation.md)**

---

## Implemented Features Summary

The **Employee Dashboard module** is fully implemented with:
1. **Universal Dark and Light Theme Mode**: `ThemeProvider`, system preference detection, `localStorage` persistence, header toggle dropdown, and dedicated settings cards.
2. **Live Working Timer & Lunch Break Tracking**: Timestamp-backed session duration, pause during lunch, dynamic resumption, and shift logout summary.
3. **Strict Deadline-Only Task Management**: Complete elimination of "time allotted" fields; tasks strictly track deadlines; real-time status derivation (`completed`, `in-progress`, `pending`, `overdue`).
4. **Completed Task Protection**: Tasks marked 100% or completed can never be classified as overdue.
5. **Overdue Task Delay Explanations**: Mandatory explanation requirement when updating overdue tasks.
6. **Task Progress Milestones**: Discrete milestones (0%, 25%, 50%, 75%, 100%) with visual progress feedback.
7. **Interactive Productivity Analytics (Recharts)**: Donut task overview chart, daily hours worked bar chart with 8h target reference line, and 6-month performance curve.
8. **Daily Schedule & Agenda Timeline**: Chronological today timeline for meetings and sprints.
9. **Leave Management & Balances**: Casual, sick, and annual leave balances; interactive application modal with automatic calendar-day calculation.
10. **Timesheet & Attendance Logs**: Multi-period shifts history (Weekly view, October 2026 with 18 shifts, September 2026 with 22 shifts) with clock in/out, break duration, daily completed tasks breakdown, search, and pagination.
11. **EOD Reports & Monthly Summaries**: EOD daily report submission and monthly performance scores.
12. **Employee Profile & Multi-Source Photo Upload**: Profile card with role assignments, high-contrast dark mode action button, and multi-tab photo upload modal (Device upload via drag-and-drop / file browser, preset avatars, and image URL).
13. **Dynamic Sidebar Task Badge**: Shows only remaining incomplete tasks (`pending + inProgress + overdue`). Automatically hides completely when all tasks are completed.
14. **Matched Task Card Height (Dashboard)**: Task card height dynamically locks to match the right two panels with sticky headers and internal scrollbar.
15. **Interactive Pagination (My Tasks Page)**: Shows at most 10 tasks at a time (`pageSize = 10`) with interactive Previous, Next, page buttons, and reactive search/filter reset.
16. **Day-by-Day Task & Work History in My Tasks**: Prominent view switcher between Active Tasks and chronologically grouped day-by-day deliverables with hours logged, shift summaries, and details dialogs.
17. **Working Days & Hours Breakdown Modal**: Clicking "Working Days" opens a comprehensive dialog with all working days, punch times, hours logged, and completed tasks.
18. **Month-Wise EOD Shift Reports**: Dedicated month selection tabs (October 2026 vs September 2026) with daily hours logged and completed deliverables breakdown.
19. **2 Months Rich Mock Dataset**: Complete 18-day October and 22-day September datasets with daily tasks and shift summaries.
21. **Scalable Year-Wise & Month-Wise Selector System**: Hierarchical paired dropdown selector (`YearMonthPicker.tsx`) that scales gracefully across years and months without crowded button strips. Only available years (2026, 2025) are displayed; selecting a year dynamically populates that year's recorded months and auto-defaults to the latest month.
22. **Multi-Year Rich Mock Dataset**: Complete mock history covering 2026 (October, September, August) and 2025 (December, November) with working days, hours logged, and completed deliverable audits.
23. **Don't Repeat Yourself (DRY) Architecture**: Reusable UI primitives in `src/components/ui/` and shared employee components (`YearMonthPicker`, `TaskTable`, `MonthlySummary`, `WorkingDaysModal`, etc.).
24. **Shift Attendance Net Hours Deduction**: Automatic deduction of lunch breaks from shift duration (`Net Hours = Gross Shift Duration - Break Duration`) with formula transparency.
25. **Modular EOD Reports & In-Progress Continuity**: Multi-card collapsible EOD accordion with live synchronization, in-progress carried forward deliverables, and component decomposition (`useResolvedEodReports`, `EodReportCard`, `ShiftAttendanceGrid`, `EodDeliverableItem`, `EodCarriedTaskItem`).
26. **Interactive Leave Request Modal & Conditional Editing**: Clicking any leave request in the summary or history table opens a modal showing untruncated details and reviewer comments. Pending requests are fully editable with live duration recalculation; approved/rejected requests are permanently locked.
27. **Year Lifecycle & Fresh-Start Production Architecture**:
    - **Upcoming Years Rule**: Upcoming calendar years (e.g. 2027) are strictly hidden everywhere across the system until that calendar year arrives in real time.
    - **Previous Years in Dropdown**: Historical years appear in a clean dropdown selector (e.g. 2025 archive). Past years are closed, read-only periods (no retroactive leave applications, table actions view-only, edits disabled).
    - **Fresh Start in Production**: When an actual organization launches the system, they start fresh with only the current active year (`2026`) and zero prior data; historical mock data (`2025`) exists solely during development to preview and test the archive behaviors.
28. **Backend Integration & Dynamic Data Architecture (Zero Hardcoding)**:
    - **Dynamic Periods & Dates**: All hardcoded month keys (`"2026-10"`), fixed date checks (`"Oct 15, 2026"`), and unseeded fallbacks have been replaced with dynamic helpers (`getCurrentMonthKey`, `getMonthData`, `formatStandardDate`, `isFormattedDateToday`).
    - **Safe Fallback Handlers**: Prevents `undefined` runtime crashes when querying unseeded or newly provisioned tenant months in production.
    - **Centralized API Config**: Created `src/config/api.ts` with `API_CONFIG` reading from `import.meta.env.VITE_API_BASE_URL` and structured endpoint definitions across auth, tasks, attendance, leaves, and reports.

For complete architectural details, business rule specifications, component reusability maps, and test instructions, consult **[`client/documentation.md`](./client/documentation.md)**.
