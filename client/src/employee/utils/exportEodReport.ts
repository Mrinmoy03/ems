import { DailyEodReport } from "../types/report"
import { toast } from "sonner"
import { api } from "../../services/api"

interface ExportMonthlyEodOptions {
  monthName: string
  year: number
  reports: (DailyEodReport & {
    employeeId?: string
    employeeName?: string
    employeeDepartment?: string
    employeeDesignation?: string
  })[]
  employeeName?: string
  departmentName?: string
}

function escapeCsvCell(cell: string | number | undefined | null): string {
  if (cell === undefined || cell === null) return '""'
  const str = String(cell).replace(/"/g, '""')
  return `"${str}"`
}

/**
 * Generates and triggers download of a comprehensive CSV containing all EOD shifts for a month.
 */
export function downloadMonthlyEodCSV({
  monthName,
  year,
  reports,
  employeeName,
}: ExportMonthlyEodOptions) {
  if (!reports || reports.length === 0) {
    toast.error(`No EOD shift reports found for ${monthName} ${year} to export.`)
    return
  }

  const hasMultipleEmployees = reports.some(r => r.employeeName)

  const headers = [
    "Date",
    "Day of Week",
    ...(hasMultipleEmployees ? ["Employee ID", "Employee Name", "Designation", "Department"] : []),
    "Check In",
    "Check Out",
    "Lunch / Break Duration",
    "Net Hours Worked",
    "Completed Deliverables Count",
    "Completed Deliverables Details",
    "Carried Forward Tasks Count",
    "Carried Tasks Details",
    "Shift Summary & Notes",
    "Submission Timestamp",
  ]

  const rows = reports.map(r => {
    const completedDetails = (r.completedTasks || [])
      .map(t => `${t.id}: ${t.title}${t.isCompletedLate ? " (LATE)" : ""}`)
      .join(" | ")

    const inProgressDetails = (r.inProgressTasks || [])
      .map(
        t =>
          `${t.id}: ${t.title} [${t.progress || 0}%] -> ${t.carriedForwardTo || "Next Shift"}`
      )
      .join(" | ")

    return [
      escapeCsvCell(r.date),
      escapeCsvCell(r.dayOfWeek || ""),
      ...(hasMultipleEmployees
        ? [
            escapeCsvCell(r.employeeId || ""),
            escapeCsvCell(r.employeeName || ""),
            escapeCsvCell(r.employeeDesignation || ""),
            escapeCsvCell(r.employeeDepartment || ""),
          ]
        : []),
      escapeCsvCell(r.checkIn || "—"),
      escapeCsvCell(r.checkOut || "—"),
      escapeCsvCell(r.breakDuration || "0m"),
      escapeCsvCell(r.hoursLogged || `${r.hoursWorked}h`),
      escapeCsvCell(r.completedTasks ? r.completedTasks.length : r.tasksCompleted),
      escapeCsvCell(completedDetails),
      escapeCsvCell(r.inProgressTasks ? r.inProgressTasks.length : r.tasksInProgressCount || 0),
      escapeCsvCell(inProgressDetails),
      escapeCsvCell(r.summary),
      escapeCsvCell(r.submittedAt),
    ].join(",")
  })

  const csvContent = [headers.join(","), ...rows].join("\r\n")
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
  const url = URL.createObjectURL(blob)

  const link = document.createElement("a")
  const safeEmp = employeeName ? `_${employeeName.replace(/\s+/g, "_")}` : ""
  link.setAttribute(
    "download",
    `WorkTrack_Monthly_EOD_${monthName}_${year}${safeEmp}.csv`
  )
  link.href = url
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)

  toast.success(
    `Downloaded Monthly EOD Report (CSV) for ${monthName} ${year} (${reports.length} shifts)`
  )
}

/**
 * Generates and triggers download of a single-day EOD report.
 */
export function downloadDailyEodCSV(
  report: DailyEodReport & { employeeName?: string; employeeId?: string },
  customEmpName?: string
) {
  const empName = customEmpName || report.employeeName
  const headers = [
    "Date",
    "Day of Week",
    ...(empName ? ["Employee Name", "Employee ID"] : []),
    "Check In",
    "Check Out",
    "Break Duration",
    "Net Hours Worked",
    "Completed Deliverables Count",
    "Completed Deliverables",
    "Carried Tasks Count",
    "Carried Tasks Details",
    "Shift Summary",
    "Submission Timestamp",
  ]

  const completedDetails = (report.completedTasks || [])
    .map(t => `${t.id}: ${t.title}${t.isCompletedLate ? " (LATE)" : ""}`)
    .join(" | ")

  const inProgressDetails = (report.inProgressTasks || [])
    .map(
      t =>
        `${t.id}: ${t.title} [${t.progress || 0}%] -> ${t.carriedForwardTo || "Next Shift"}`
    )
    .join(" | ")

  const row = [
    escapeCsvCell(report.date),
    escapeCsvCell(report.dayOfWeek || ""),
    ...(empName ? [escapeCsvCell(empName), escapeCsvCell(report.employeeId || "")] : []),
    escapeCsvCell(report.checkIn || "—"),
    escapeCsvCell(report.checkOut || "—"),
    escapeCsvCell(report.breakDuration || "0m"),
    escapeCsvCell(report.hoursLogged || `${report.hoursWorked}h`),
    escapeCsvCell(report.completedTasks ? report.completedTasks.length : report.tasksCompleted),
    escapeCsvCell(completedDetails),
    escapeCsvCell(
      report.inProgressTasks ? report.inProgressTasks.length : report.tasksInProgressCount || 0
    ),
    escapeCsvCell(inProgressDetails),
    escapeCsvCell(report.summary),
    escapeCsvCell(report.submittedAt),
  ].join(",")

  const csvContent = [headers.join(","), row].join("\r\n")
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
  const url = URL.createObjectURL(blob)

  const link = document.createElement("a")
  const safeDate = report.date.replace(/[\s,]+/g, "_")
  link.setAttribute("download", `WorkTrack_EOD_Shift_${safeDate}.csv`)
  link.href = url
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)

  toast.success(`Downloaded EOD Shift Report for ${report.date} (CSV)`)
}

/**
 * Downloads official PDF format for a daily or monthly EOD report from backend PDF generator.
 */
export async function exportMonthlyEodPDF(
  monthName: string,
  year: number,
  count: number,
  employeeId?: string
) {
  try {
    toast.loading(`Generating audited Monthly EOD PDF for ${monthName} ${year}...`, { id: "pdf-month" })
    const url = api.reports.getPdfDownloadUrl(undefined, employeeId, `${year}-${monthName}`)
    const res = await fetch(url)
    if (!res.ok) throw new Error(`Server returned HTTP ${res.status}`)
    const blob = await res.blob()
    const blobUrl = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = blobUrl
    link.download = `WorkTrack_EOD_Monthly_${monthName}_${year}.pdf`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(blobUrl)
    toast.success(`Downloaded official Monthly Audit PDF (${count} shifts).`, { id: "pdf-month" })
  } catch (err: any) {
    console.error("PDF download failed:", err)
    toast.error(`Failed to export monthly PDF: ${err.message}`, { id: "pdf-month" })
  }
}

export async function downloadDailyEodPDF(
  report: DailyEodReport,
  customEmployeeId?: string
) {
  try {
    const empId = customEmployeeId || (report as any).employeeId || (report as any).empCode
    const safeDate = typeof report.date === "string" ? report.date : ""
    toast.loading(`Generating official EOD PDF for shift ${safeDate}...`, { id: "pdf-day" })
    const url = api.reports.getPdfDownloadUrl(report.id, empId, safeDate)
    const res = await fetch(url)
    if (!res.ok) throw new Error(`Server returned HTTP ${res.status}`)
    const blob = await res.blob()
    const blobUrl = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = blobUrl
    link.download = `WorkTrack_EOD_${safeDate.replace(/[\s,]+/g, "_")}${empId ? `_${empId}` : ""}.pdf`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(blobUrl)
    toast.success(`Downloaded official PDF for shift ${safeDate}`, { id: "pdf-day" })
  } catch (err: any) {
    console.error("PDF download failed:", err)
    toast.error(`Failed to export EOD PDF: ${err.message}`, { id: "pdf-day" })
  }
}
