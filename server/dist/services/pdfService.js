"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateEodPdf = generateEodPdf;
const pdfkit_1 = __importDefault(require("pdfkit"));
function generateEodPdf(data, res) {
    const doc = new pdfkit_1.default({
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
    }
    else {
        doc
            .fontSize(10)
            .fillColor("#64748b")
            .text("No specific completed deliverables listed for this cycle.", 60, y);
        y += 18;
    }
    // Section: Blockers & Challenges
    y += 15;
    doc
        .font("Helvetica-Bold")
        .fontSize(13)
        .fillColor("#0f172a")
        .text("Blockers, Dependencies & Technical Challenges", 50, y, { underline: true });
    y += 20;
    doc
        .font("Helvetica")
        .fontSize(10)
        .fillColor("#334155")
        .text(data.challenges || "No operational blockers encountered during this shift.", 60, y, {
        width: doc.page.width - 120,
        align: "justify",
    });
    // Section: Next Day Execution Plan
    y += 50;
    doc
        .font("Helvetica-Bold")
        .fontSize(13)
        .fillColor("#0f172a")
        .text("Target Objectives & Next Shift Agenda", 50, y, { underline: true });
    y += 20;
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
        .text("CONFIDENTIAL & PROPRIETARY — Vama Studio Enterprise Management System (WorkTrack)", 50, footerY + 10, { align: "center" });
    doc
        .fontSize(8)
        .fillColor("#94a3b8")
        .text("Mon–Sat 48-Hour Standard Governance Schedule • Strictly Verified", 50, footerY + 22, {
        align: "center",
    });
    doc.end();
}
