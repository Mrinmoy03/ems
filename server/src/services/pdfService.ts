import PDFDocument from "pdfkit";
import { Response } from "express";

export interface EodPdfData {
  employeeName: string;
  employeeId: string;
  department: string;
  designation: string;
  reportDate: string;
  hoursWorked: number | string;
  tasksCompleted: string[];
  challenges?: string;
  nextDayPlan?: string;
  statusSummary?: {
    completed: number;
    inProgress: number;
    pending: number;
    overdue: number;
  };
}

export interface MonthlyAuditShift {
  date: string;
  employeeName: string;
  employeeId: string;
  department: string;
  hoursWorked: number | string;
  summary: string;
}

export interface MonthlyAuditPdfData {
  monthName: string;
  year: number;
  totalShifts: number;
  totalHours: number;
  departmentName?: string;
  employeeName?: string;
  shifts: MonthlyAuditShift[];
}

export function generateEodPdf(data: EodPdfData, res: Response): void {
  const doc = new PDFDocument({
    margin: 50,
    size: "A4",
    info: {
      Title: `WorkTrack EOD Report - ${data.employeeName} (${data.reportDate})`,
      Author: "WorkTrack Enterprise Management",
    },
  });

  // Pipe to response
  doc.pipe(res);

  // Brand Header
  doc
    .rect(0, 0, doc.page.width, 100)
    .fill("#0b132b");

  doc
    .font("Helvetica-Bold")
    .fontSize(22)
    .fillColor("#ffffff")
    .text("WORKTRACK ENTERPRISE", 50, 32);

  doc
    .font("Helvetica")
    .fontSize(10)
    .fillColor("#94a3b8")
    .text("Official End-Of-Day (EOD) Operations Summary", 50, 58);

  doc
    .fontSize(10)
    .fillColor("#38bdf8")
    .text(`Report Date: ${data.reportDate}`, 400, 38, { align: "right" });

  doc
    .fontSize(9)
    .fillColor("#94a3b8")
    .text(`Generated: ${new Date().toLocaleDateString()}`, 400, 54, { align: "right" });

  // Employee Information Box
  let y = 125;
  doc
    .rect(50, y, doc.page.width - 100, 75)
    .fillAndStroke("#f8fafc", "#e2e8f0");

  doc
    .font("Helvetica-Bold")
    .fontSize(11)
    .fillColor("#0f172a")
    .text(`Employee: ${data.employeeName} (${data.employeeId})`, 65, y + 15);

  doc
    .font("Helvetica")
    .fontSize(9)
    .fillColor("#64748b")
    .text(`Designation: ${data.designation}`, 65, y + 35);

  doc
    .fontSize(9)
    .fillColor("#64748b")
    .text(`Department: ${data.department}`, 65, y + 50);

  doc
    .font("Helvetica-Bold")
    .fontSize(11)
    .fillColor("#2563eb")
    .text(`Total Shift Hours: ${data.hoursWorked} hrs`, 350, y + 15, { align: "right" });

  // Section: Completed Deliverables
  y = 220;
  doc
    .font("Helvetica-Bold")
    .fontSize(13)
    .fillColor("#0f172a")
    .text("Key Deliverables & Completed Tasks", 50, y, { underline: true });

  y += 20;
  doc.font("Helvetica");
  if (data.tasksCompleted && data.tasksCompleted.length > 0) {
    data.tasksCompleted.forEach((task) => {
      doc
        .fontSize(10)
        .fillColor("#334155")
        .text(`•  ${task}`, 60, y);
      y += 18;
    });
  } else {
    doc
      .fontSize(10)
      .fillColor("#64748b")
      .text("No specific completed deliverables listed for this cycle.", 60, y);
    y += 18;
  }

  // Section: Blockers & Challenges
  y = Math.max(y + 10, doc.y + 12);
  doc
    .font("Helvetica-Bold")
    .fontSize(13)
    .fillColor("#0f172a")
    .text("Blockers, Dependencies & Technical Challenges", 50, y, { underline: true });

  y += 18;
  doc
    .font("Helvetica")
    .fontSize(10)
    .fillColor("#334155")
    .text(data.challenges || "No operational blockers encountered during this shift.", 60, y, {
      width: doc.page.width - 120,
      align: "justify",
    });

  // Section: Next Day Execution Plan
  y = Math.max(y + 20, doc.y + 12);
  doc
    .font("Helvetica-Bold")
    .fontSize(13)
    .fillColor("#0f172a")
    .text("Target Objectives & Next Shift Agenda", 50, y, { underline: true });

  y += 18;
  doc
    .font("Helvetica")
    .fontSize(10)
    .fillColor("#334155")
    .text(data.nextDayPlan || "Continue assigned development sprint and review open tickets.", 60, y, {
      width: doc.page.width - 120,
      align: "justify",
    });

  // Footer / Compliance Sign-off
  const footerY = doc.page.height - 70;
  doc
    .strokeColor("#cbd5e1")
    .lineWidth(1)
    .moveTo(50, footerY)
    .lineTo(doc.page.width - 50, footerY)
    .stroke();

  doc
    .fontSize(8)
    .fillColor("#94a3b8")
    .text(
      "CONFIDENTIAL & PROPRIETARY — Vama Studio Enterprise Management System (WorkTrack)",
      50,
      footerY + 10,
      { align: "center" }
    );

  doc
    .fontSize(8)
    .fillColor("#94a3b8")
    .text("Mon–Sat 48-Hour Standard Governance Schedule • Strictly Verified", 50, footerY + 22, {
      align: "center",
    });

  doc.end();
}

export function generateMonthlyAuditPdf(data: MonthlyAuditPdfData, res: Response): void {
  const doc = new PDFDocument({
    margin: 50,
    size: "A4",
    info: {
      Title: `WorkTrack Monthly EOD Audit - ${data.monthName} ${data.year}`,
      Author: "WorkTrack Enterprise Management",
    },
  });

  doc.pipe(res);

  // Brand Header
  doc.rect(0, 0, doc.page.width, 100).fill("#0b132b");

  doc
    .font("Helvetica-Bold")
    .fontSize(22)
    .fillColor("#ffffff")
    .text("WORKTRACK ENTERPRISE", 50, 32);

  doc
    .font("Helvetica")
    .fontSize(10)
    .fillColor("#94a3b8")
    .text("Monthly Workforce Operations & EOD Shift Audit Ledger", 50, 58);

  doc
    .fontSize(10)
    .fillColor("#38bdf8")
    .text(`Period: ${data.monthName} ${data.year}`, 400, 38, { align: "right" });

  doc
    .fontSize(9)
    .fillColor("#94a3b8")
    .text(`Audited Shifts: ${data.totalShifts}`, 400, 54, { align: "right" });

  // Summary Metrics Card
  let y = 120;
  doc.rect(50, y, doc.page.width - 100, 65).fillAndStroke("#f8fafc", "#e2e8f0");

  doc
    .font("Helvetica-Bold")
    .fontSize(11)
    .fillColor("#0f172a")
    .text(`Executive Monthly Summary — ${data.monthName} ${data.year}`, 65, y + 14);

  doc
    .font("Helvetica")
    .fontSize(9)
    .fillColor("#64748b")
    .text(`Scope: ${data.employeeName ? `Employee: ${data.employeeName}` : (data.departmentName ? `Department: ${data.departmentName}` : "Organization-Wide All Departments")}`, 65, y + 34);

  doc
    .font("Helvetica-Bold")
    .fontSize(12)
    .fillColor("#2563eb")
    .text(`Total Verified Hours: ${data.totalHours} hrs`, 350, y + 14, { align: "right" });

  doc
    .font("Helvetica")
    .fontSize(9)
    .fillColor("#64748b")
    .text(`Total Shift Reports: ${data.totalShifts}`, 350, y + 34, { align: "right" });

  // Shift Log Entries
  y = 205;
  doc
    .font("Helvetica-Bold")
    .fontSize(12)
    .fillColor("#0f172a")
    .text("Detailed Shift Logs & Daily Deliverables", 50, y, { underline: true });

  y += 20;

  if (data.shifts && data.shifts.length > 0) {
    data.shifts.forEach((s) => {
      if (y > doc.page.height - 100) {
        doc.addPage();
        y = 50;
      }

      doc.rect(50, y, doc.page.width - 100, 48).fillAndStroke("#ffffff", "#f1f5f9");

      doc
        .font("Helvetica-Bold")
        .fontSize(10)
        .fillColor("#1e293b")
        .text(`${s.date} — ${s.employeeName} (${s.employeeId})`, 60, y + 8);

      doc
        .font("Helvetica")
        .fontSize(9)
        .fillColor("#2563eb")
        .text(`${s.hoursWorked} hrs`, doc.page.width - 120, y + 8, { align: "right" });

      doc
        .font("Helvetica")
        .fontSize(8.5)
        .fillColor("#64748b")
        .text(`Dept: ${s.department} • Deliverables: ${s.summary || "Daily shift completion recorded."}`, 60, y + 26, {
          width: doc.page.width - 130,
          ellipsis: true,
        });

      y += 56;
    });
  } else {
    doc.fontSize(10).fillColor("#64748b").text("No individual shift reports recorded for this billing cycle.", 60, y);
    y += 25;
  }

  // Footer / Compliance Sign-off
  const footerY = doc.page.height - 70;
  doc
    .strokeColor("#cbd5e1")
    .lineWidth(1)
    .moveTo(50, footerY)
    .lineTo(doc.page.width - 50, footerY)
    .stroke();

  doc
    .fontSize(8)
    .fillColor("#94a3b8")
    .text(
      "CONFIDENTIAL & PROPRIETARY — Vama Studio Enterprise Management System (WorkTrack)",
      50,
      footerY + 10,
      { align: "center" }
    );

  doc
    .fontSize(8)
    .fillColor("#94a3b8")
    .text("Official Mon–Sat Compliance Ledger • Verified by Enterprise Administration", 50, footerY + 22, {
      align: "center",
    });

  doc.end();
}
