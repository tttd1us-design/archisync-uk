import jsPDF from 'jspdf';
import 'jspdf-autotable';

export function exportToPDF(minutesData, projectInfo = {}) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const primaryColor = [26, 54, 93]; // Deep Navy (#1a365d)
  const accentColor = [180, 83, 9];   // Architectural Amber/Gold
  const darkGray = [45, 55, 72];
  const lightGray = [240, 244, 248];

  // 1. Header Banner
  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, 210, 28, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('ARCHISYNC UK | ARCHITECTURAL MEETING MINUTES', 14, 13);
  
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('RIBA PLAN OF WORK COMPLIANT MINUTES & TECHNICAL COORDINATION REPORT', 14, 20);

  // 2. Project Metadata Table
  let currentY = 34;

  doc.setDrawColor(220, 225, 230);
  doc.setFillColor(...lightGray);
  doc.roundedRect(14, currentY, 182, 32, 2, 2, 'FD');

  doc.setTextColor(...darkGray);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  
  doc.text('PROJECT:', 18, currentY + 7);
  doc.setFont('helvetica', 'normal');
  doc.text(minutesData.projectTitle || projectInfo.title || 'London Scheme', 45, currentY + 7);

  doc.setFont('helvetica', 'bold');
  doc.text('PROJECT NO:', 125, currentY + 7);
  doc.setFont('helvetica', 'normal');
  doc.text(minutesData.projectNumber || 'UK-AR-2026', 155, currentY + 7);

  doc.setFont('helvetica', 'bold');
  doc.text('RIBA STAGE:', 18, currentY + 15);
  doc.setTextColor(180, 83, 9);
  doc.setFont('helvetica', 'bold');
  doc.text(minutesData.ribaStage || 'RIBA Stage 3 (Spatial Coordination)', 45, currentY + 15);
  doc.setTextColor(...darkGray);

  doc.setFont('helvetica', 'bold');
  doc.text('DATE / TIME:', 125, currentY + 15);
  doc.setFont('helvetica', 'normal');
  doc.text(minutesData.meetingDate || new Date().toISOString().split('T')[0], 155, currentY + 15);

  doc.setFont('helvetica', 'bold');
  doc.text('MEETING TYPE:', 18, currentY + 23);
  doc.setFont('helvetica', 'normal');
  doc.text(minutesData.meetingType || 'Architectural & Engineering Coordination', 45, currentY + 23);

  currentY += 38;

  // 3. Executive Summary
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...primaryColor);
  doc.text('1. EXECUTIVE SUMMARY', 14, currentY);
  currentY += 4;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(...darkGray);
  const summaryLines = doc.splitTextToSize(
    minutesData.executiveSummary || 'Summary of discussions and technical agreements reached during the joint UK-Korea design workshop.',
    182
  );
  doc.text(summaryLines, 14, currentY + 2);
  currentY += summaryLines.length * 4.5 + 4;

  // 4. Decisions Matrix Table
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...primaryColor);
  doc.text('2. KEY ARCHITECTURAL & TECHNICAL DECISIONS', 14, currentY);
  currentY += 3;

  const decisionsRows = (minutesData.decisions || []).map(d => [
    d.id || 'DEC',
    d.title || 'Decision',
    d.detail || ''
  ]);

  doc.autoTable({
    startY: currentY,
    head: [['Item', 'Subject / Area', 'Agreed Decision & Specification']],
    body: decisionsRows.length > 0 ? decisionsRows : [['DEC-01', 'General', 'No decisions recorded']],
    theme: 'grid',
    headStyles: { fillColor: primaryColor, textColor: 255, fontStyle: 'bold', fontSize: 8 },
    styles: { fontSize: 8, cellPadding: 2.5, textColor: darkGray },
    columnStyles: {
      0: { cellWidth: 18, fontStyle: 'bold' },
      1: { cellWidth: 45, fontStyle: 'bold' },
      2: { cellWidth: 'auto' }
    },
    margin: { left: 14, right: 14 }
  });

  currentY = doc.lastAutoTable.finalY + 8;

  // 5. Action Items Table
  if (currentY > 230) {
    doc.addPage();
    currentY = 20;
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...primaryColor);
  doc.text('3. ACTION ITEMS & DELIVERABLES MATRIX', 14, currentY);
  currentY += 3;

  const actionRows = (minutesData.actionItems || []).map(a => [
    a.id || 'ACT',
    a.task || '',
    a.assignee || 'TBD',
    a.dueDate || 'TBD',
    a.status || 'Pending'
  ]);

  doc.autoTable({
    startY: currentY,
    head: [['Ref', 'Action Task / Deliverable', 'Assignee / Lead', 'Deadline (BST)', 'Status']],
    body: actionRows.length > 0 ? actionRows : [['ACT-01', 'General review', 'All', 'Next meeting', 'Open']],
    theme: 'grid',
    headStyles: { fillColor: primaryColor, textColor: 255, fontStyle: 'bold', fontSize: 8 },
    styles: { fontSize: 8, cellPadding: 2.5, textColor: darkGray },
    columnStyles: {
      0: { cellWidth: 16, fontStyle: 'bold' },
      1: { cellWidth: 'auto' },
      2: { cellWidth: 42 },
      3: { cellWidth: 28 },
      4: { cellWidth: 20, fontStyle: 'bold' }
    },
    margin: { left: 14, right: 14 }
  });

  currentY = doc.lastAutoTable.finalY + 8;

  // 6. Regulatory Risks & Referenced Drawings
  if (currentY > 220) {
    doc.addPage();
    currentY = 20;
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(...primaryColor);
  doc.text('4. UK STATUTORY & REGULATORY RISKS (Building Regs / Planning)', 14, currentY);
  currentY += 5;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...darkGray);
  (minutesData.regulatoryRisks || []).forEach(r => {
    const lines = doc.splitTextToSize(`• ${r}`, 180);
    doc.text(lines, 16, currentY);
    currentY += lines.length * 4;
  });

  currentY += 4;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(...primaryColor);
  doc.text('5. REFERENCED DRAWINGS & BIM REVISIONS', 14, currentY);
  currentY += 5;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...darkGray);
  (minutesData.drawingsReferenced || []).forEach(dr => {
    doc.text(`• [DWG] ${dr}`, 16, currentY);
    currentY += 4.5;
  });

  // 7. Sign-off / Signature Section
  if (currentY > 240) {
    doc.addPage();
    currentY = 20;
  } else {
    currentY += 8;
  }

  doc.setFillColor(...lightGray);
  doc.roundedRect(14, currentY, 182, 28, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(...primaryColor);
  doc.text('OFFICIAL SIGN-OFF / APPROVAL', 18, currentY + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...darkGray);
  doc.text('UK Lead Architect: ____________________ (Signature)   Date: __________', 18, currentY + 15);
  doc.text('Seoul Project Lead: ____________________ (Signature)   Date: __________', 18, currentY + 23);

  // Footer on all pages
  const totalPages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(7.5);
    doc.setTextColor(150, 150, 150);
    doc.text(`ArchiSync UK Meeting Minutes | Page ${i} of ${totalPages} | Confidential - For Project Distribution Only`, 14, 290);
  }

  doc.save(`${(minutesData.projectTitle || 'Meeting_Minutes').replace(/[^a-zA-Z0-9_-]/g, '_')}_RIBA_Minutes.pdf`);
}

export function exportToMarkdown(minutesData) {
  let md = `# ARCHISYNC UK - ARCHITECTURAL MEETING MINUTES\n\n`;
  md += `**Project:** ${minutesData.projectTitle}\n`;
  md += `**Project Number:** ${minutesData.projectNumber}\n`;
  md += `**RIBA Stage:** ${minutesData.ribaStage}\n`;
  md += `**Date:** ${minutesData.meetingDate}\n`;
  md += `**Meeting Type:** ${minutesData.meetingType}\n\n`;
  md += `---\n\n`;

  md += `## 1. Executive Summary\n\n${minutesData.executiveSummary || 'N/A'}\n\n`;

  md += `## 2. Key Decisions & Technical Specifications\n\n`;
  (minutesData.decisions || []).forEach(d => {
    md += `- **[${d.id}] ${d.title}**: ${d.detail}\n`;
  });
  md += `\n`;

  md += `## 3. Action Items Matrix\n\n`;
  md += `| Ref | Task / Deliverable | Assignee | Deadline | Status |\n`;
  md += `|---|---|---|---|---|\n`;
  (minutesData.actionItems || []).forEach(a => {
    md += `| ${a.id} | ${a.task} | ${a.assignee} | ${a.dueDate} | ${a.status} |\n`;
  });
  md += `\n`;

  md += `## 4. Statutory & Regulatory Risks\n\n`;
  (minutesData.regulatoryRisks || []).forEach(r => {
    md += `- ${r}\n`;
  });
  md += `\n`;

  md += `## 5. Referenced Drawings & BIM Models\n\n`;
  (minutesData.drawingsReferenced || []).forEach(dwg => {
    md += `- ${dwg}\n`;
  });

  return md;
}