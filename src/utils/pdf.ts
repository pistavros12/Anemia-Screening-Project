import jsPDF from 'jspdf';
import { ScreeningRecord } from '../types';

export function generatePdfReport(record: ScreeningRecord): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();

  // Colors
  const coffeeBrown = '#4A2E20';
  const ethiopianGreen = '#078930';
  const goldAmber = '#F4C430';
  const redOchre = '#B33A3A';
  const charcoal = '#2E2019';
  const parchment = '#F1E9D8';

  // Decorative top geometric pattern simulation (Ethiopian Tibeb banner)
  const segments = 21;
  const segWidth = pageWidth / segments;
  for (let i = 0; i < segments; i++) {
    const col = i % 3 === 0 ? ethiopianGreen : i % 3 === 1 ? goldAmber : redOchre;
    doc.setFillColor(col);
    doc.rect(i * segWidth, 0, segWidth, 4, 'F');
  }

  // Header Title
  doc.setTextColor(coffeeBrown);
  doc.setFont('times', 'bold');
  doc.setFontSize(18);
  doc.text('ETHIOPIAN CLINICAL ANEMIA SCREENING REGISTRY', pageWidth / 2, 18, { align: 'center' });

  doc.setTextColor(ethiopianGreen);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text('Point-of-Care Altitude-Compensated Hemoglobin Diagnostic Report', pageWidth / 2, 24, { align: 'center' });

  // Divider line
  doc.setDrawColor(ethiopianGreen);
  doc.setLineWidth(0.8);
  doc.line(15, 28, pageWidth - 15, 28);

  // Section 1: Patient & Encounter Card
  doc.setFillColor(parchment);
  doc.roundedRect(15, 33, pageWidth - 30, 36, 3, 3, 'F');
  doc.setDrawColor('#DCD3C0');
  doc.roundedRect(15, 33, pageWidth - 30, 36, 3, 3, 'S');

  doc.setTextColor(coffeeBrown);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('PATIENT & ENCOUNTER INFORMATION', 20, 40);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(charcoal);
  doc.setFontSize(9.5);

  // Left column
  doc.text(`Patient Name:`, 20, 47);
  doc.setFont('helvetica', 'bold');
  doc.text(`${record.patientName}`, 50, 47);
  doc.setFont('helvetica', 'normal');

  doc.text(`Age / Sex:`, 20, 54);
  doc.text(`${record.patientAge || 'N/A'} years / ${record.patientGender}`, 50, 54);

  doc.text(`Location:`, 20, 61);
  doc.text(`${record.locationName}`, 50, 61);

  // Right column
  const col2X = 115;
  doc.text(`Screening Date:`, col2X, 47);
  doc.text(`${record.timestamp}`, col2X + 32, 47);

  doc.text(`Health Worker:`, col2X, 54);
  doc.text(`${record.healthWorker}`, col2X + 32, 54);

  doc.text(`Recorded Elevation:`, col2X, 61);
  doc.text(`${Math.round(record.elevationM)} meters a.s.l.`, col2X + 32, 61);

  // Section 2: Clinical Screening Findings
  doc.setTextColor(coffeeBrown);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('DIAGNOSTIC SCREENING FINDINGS', 15, 78);

  // Diagnostic Results Box
  const isAnemic = record.anemiaStatus.toUpperCase().includes('ANEMIC') && !record.anemiaStatus.toUpperCase().includes('NOT');
  const boxBg = isAnemic ? '#FDEDED' : '#E8F5E9';
  const boxBorder = isAnemic ? redOchre : ethiopianGreen;

  doc.setFillColor(boxBg);
  doc.roundedRect(15, 82, pageWidth - 30, 42, 3, 3, 'F');
  doc.setDrawColor(boxBorder);
  doc.setLineWidth(1);
  doc.roundedRect(15, 82, pageWidth - 30, 42, 3, 3, 'S');

  doc.setTextColor(boxBorder);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text(record.anemiaStatus, 22, 94);

  doc.setTextColor(charcoal);
  doc.setFontSize(11);
  doc.text(`WHO Severity Grade: ${record.severity}`, 115, 94);

  doc.setDrawColor('#E0D0BE');
  doc.line(22, 100, pageWidth - 22, 100);

  // Measurements row
  doc.setFontSize(9);
  doc.setTextColor('#6B5B52');
  doc.text('Raw Measured Hb:', 22, 107);
  doc.text('Altitude-Adjusted Hb:', 85, 107);
  doc.text('Elevation Offset:', 145, 107);

  doc.setFontSize(13);
  doc.setTextColor(coffeeBrown);
  doc.setFont('helvetica', 'bold');
  doc.text(`${record.rawHb.toFixed(1)} g/dL`, 22, 116);
  doc.text(`${record.adjustedHb.toFixed(1)} g/dL`, 85, 116);

  const offset = record.adjustedHb - record.rawHb;
  doc.text(`${offset >= 0 ? '+' : ''}${offset.toFixed(2)} g/dL`, 145, 116);

  // If severe, add alert block
  let currentY = 132;
  if (record.severity === 'Severe') {
    doc.setFillColor('#FDE8E8');
    doc.roundedRect(15, currentY, pageWidth - 30, 18, 2, 2, 'F');
    doc.setDrawColor(redOchre);
    doc.roundedRect(15, currentY, pageWidth - 30, 18, 2, 2, 'S');

    doc.setTextColor(redOchre);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.text('URGENT CLINICAL ALERT:', 20, currentY + 7);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.text(
      'Patient exhibits severe anemia indicators. Immediate clinician referral and formal venous blood laboratory test required.',
      20,
      currentY + 13
    );
    currentY += 24;
  }

  // Altitude Adjustment Formula Explanation
  doc.setFillColor('#FAF6EE');
  doc.roundedRect(15, currentY, pageWidth - 30, 24, 2, 2, 'F');
  doc.setDrawColor('#E2D7C3');
  doc.roundedRect(15, currentY, pageWidth - 30, 24, 2, 2, 'S');

  doc.setTextColor(coffeeBrown);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('HIGH-ALTITUDE PHYSIOLOGICAL COMPENSATION FORMULA:', 20, currentY + 6);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(charcoal);
  doc.setFontSize(8);
  doc.text(
    `e = ${Math.round(record.elevationM)}m / 1000 = ${(record.elevationM / 1000).toFixed(2)} | ΔHb = -0.032·e + 0.022·e² | Adjusted Hb = Measured Hb - ΔHb`,
    20,
    currentY + 12
  );
  doc.text(
    'Standard sea-level hemoglobin bands underdiagnose anemia in Ethiopian highlands due to hypoxia-driven erythropoiesis.',
    20,
    currentY + 18
  );

  currentY += 30;

  // Mandatory Medical Disclaimer
  doc.setFillColor('#F5EFE4');
  doc.roundedRect(15, currentY, pageWidth - 30, 26, 2, 2, 'F');
  doc.setDrawColor('#D8CAB5');
  doc.roundedRect(15, currentY, pageWidth - 30, 26, 2, 2, 'S');

  doc.setTextColor(redOchre);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.text('MANDATORY CLINICAL USAGE DISCLAIMER:', 20, currentY + 6);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(charcoal);
  doc.setFontSize(7.5);
  const disclaimerLines = [
    'This digital tool is an auxiliary point-of-care screening aid only, not a definitive diagnostic device.',
    'All estimated hemoglobin values and screening categorizations must be confirmed by a qualified health',
    'professional using accredited laboratory venous blood analysis (e.g. CBC or HemoCue analyzer). This tool',
    'must not be used as the sole basis for prescribing blood transfusions or treatment regimens.',
  ];
  disclaimerLines.forEach((line, idx) => {
    doc.text(line, 20, currentY + 11 + idx * 4);
  });

  currentY += 34;

  // Signatures
  doc.setDrawColor(charcoal);
  doc.setLineWidth(0.4);
  doc.line(25, currentY + 18, 85, currentY + 18);
  doc.line(125, currentY + 18, 185, currentY + 18);

  doc.setFontSize(8);
  doc.setTextColor(charcoal);
  doc.text('Screening Clinician Signature', 30, currentY + 23);
  doc.text('Supervising Medical Officer Signature', 128, currentY + 23);

  // Bottom decorative pattern
  for (let i = 0; i < segments; i++) {
    const col = i % 3 === 0 ? ethiopianGreen : i % 3 === 1 ? goldAmber : redOchre;
    doc.setFillColor(col);
    doc.rect(i * segWidth, doc.internal.pageSize.getHeight() - 4, segWidth, 4, 'F');
  }

  // Save / Download
  const filename = `Anemia_Screening_${record.patientName.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.pdf`;
  doc.save(filename);
}
