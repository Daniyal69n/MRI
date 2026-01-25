import jsPDF from 'jspdf';

interface PatientData {
  patientId: string;
  firstName: string;
  lastName: string;
  age: number;
  gender: string;
  contactNumber: string;
  email?: string;
  address?: string;
  medicalHistory?: string;
  notes?: string;
}

interface DoctorData {
  firstName: string;
  lastName: string;
  specialization?: string;
  pmdcNumber?: string;
}

interface ReportData {
  patient: PatientData;
  doctor: DoctorData;
  scanDate: string;
  purpose: string;
  findings?: Array<{ finding: string; details: string }>;
  impression: string;
  recommendation: string;
}

export function generateReport(data: ReportData): void {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  let yPosition = 20;

  // Header Section
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  doc.text('GOVERNMENT OF PAKISTAN', pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 6;
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('CIVIL HOSPITAL Islamabad', pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 8;

  // Hospital Address (right side)
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('123 Kahuta road, Islamabad', pageWidth - 20, yPosition - 8, { align: 'right' });
  doc.text('Phone: 042-1234567', pageWidth - 20, yPosition - 4, { align: 'right' });

  // Title
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('MRI BRAIN ANALYSIS REPORT', pageWidth / 2, yPosition, { align: 'center' });
  doc.line(20, yPosition + 2, pageWidth - 20, yPosition + 2);
  yPosition += 15;

  // Patient Information Section
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Patient Information:', 20, yPosition);
  yPosition += 8;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  
  const patientInfo = [
    { label: 'Name:', value: `${data.patient.firstName} ${data.patient.lastName}` },
    { label: 'Patient ID:', value: data.patient.patientId },
    { label: 'Age:', value: `${data.patient.age} Years` },
    { label: 'Gender:', value: data.patient.gender },
    { label: 'Contact Number:', value: data.patient.contactNumber },
  ];

  let xPos = 20;
  let labelWidth = 50;
  
  patientInfo.forEach((info, index) => {
    if (index % 2 === 0) {
      xPos = 20;
    } else {
      xPos = pageWidth / 2;
    }
    
    if (index % 2 === 0 && index > 0) {
      yPosition += 6;
    }
    
    doc.setFont('helvetica', 'bold');
    doc.text(info.label, xPos, yPosition);
    doc.setFont('helvetica', 'normal');
    doc.text(info.value, xPos + labelWidth, yPosition);
  });

  yPosition += 8;
  if (data.patient.email) {
    doc.setFont('helvetica', 'bold');
    doc.text('Email:', 20, yPosition);
    doc.setFont('helvetica', 'normal');
    doc.text(data.patient.email, 20 + labelWidth, yPosition);
    yPosition += 6;
  }
  
  if (data.patient.address) {
    doc.setFont('helvetica', 'bold');
    doc.text('Address:', 20, yPosition);
    doc.setFont('helvetica', 'normal');
    doc.text(data.patient.address, 20 + labelWidth, yPosition);
    yPosition += 6;
  }

  yPosition += 5;
  doc.line(20, yPosition, pageWidth - 20, yPosition);
  yPosition += 10;

  // Purpose Section
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Purpose:', 20, yPosition);
  yPosition += 6;
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(data.purpose, 20, yPosition);
  yPosition += 10;

  // MRI Brain Scan Details
  doc.setFillColor(230, 240, 255);
  doc.rect(20, yPosition, pageWidth - 40, 20, 'F');
  
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('MRI Brain Scan Details', 25, yPosition + 8);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Modalities Used: MRI (Magnetic Resonance Imaging)', 25, yPosition + 15);
  doc.text(`Scan Date: ${data.scanDate}`, 25, yPosition + 20);
  yPosition += 25;

  // MRI Brain Findings
  yPosition += 5;
  doc.setFillColor(230, 240, 255);
  doc.rect(20, yPosition, pageWidth - 40, 15, 'F');
  
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('MRI Brain Findings', 25, yPosition + 8);
  yPosition += 20;

  if (data.findings && data.findings.length > 0) {
    // Table header
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Findings', 25, yPosition);
    doc.text('Details', pageWidth / 2, yPosition);
    yPosition += 6;
    doc.line(25, yPosition, pageWidth - 25, yPosition);
    yPosition += 5;

    // Table rows
    doc.setFont('helvetica', 'normal');
    data.findings.forEach((finding) => {
      if (yPosition > pageHeight - 30) {
        doc.addPage();
        yPosition = 20;
      }
      
      const findingLines = doc.splitTextToSize(finding.finding, (pageWidth / 2) - 35);
      const detailsLines = doc.splitTextToSize(finding.details, (pageWidth / 2) - 35);
      const maxLines = Math.max(findingLines.length, detailsLines.length);
      
      doc.text(findingLines, 25, yPosition);
      doc.text(detailsLines, pageWidth / 2, yPosition);
      yPosition += maxLines * 5 + 3;
    });
  } else {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('No significant findings recorded.', 25, yPosition);
    yPosition += 8;
  }

  yPosition += 5;

  // Impression Section
  if (yPosition > pageHeight - 40) {
    doc.addPage();
    yPosition = 20;
  }

  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Impression:', 20, yPosition);
  yPosition += 6;
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  const impressionLines = doc.splitTextToSize(data.impression, pageWidth - 40);
  doc.text(impressionLines, 20, yPosition);
  yPosition += impressionLines.length * 5 + 8;

  // Recommendation Section
  if (yPosition > pageHeight - 40) {
    doc.addPage();
    yPosition = 20;
  }

  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Recommendation:', 20, yPosition);
  yPosition += 6;
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  const recommendationLines = doc.splitTextToSize(data.recommendation, pageWidth - 40);
  doc.text(recommendationLines, 20, yPosition);
  yPosition += recommendationLines.length * 5 + 15;

  // Medical Officer Section
  if (yPosition > pageHeight - 50) {
    doc.addPage();
    yPosition = 20;
  }

  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Medical Officer Information:', 20, yPosition);
  yPosition += 8;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text(`Dr. ${data.doctor.firstName} ${data.doctor.lastName}`, 20, yPosition);
  yPosition += 6;
  
  doc.setFont('helvetica', 'normal');
  if (data.doctor.specialization) {
    doc.text(data.doctor.specialization, 20, yPosition);
    yPosition += 6;
  }
  
  if (data.doctor.pmdcNumber) {
    doc.text(`PMDC No: ${data.doctor.pmdcNumber}`, 20, yPosition);
    yPosition += 6;
  }

  yPosition += 8;
  doc.text('Signature: ___________________', 20, yPosition);

  // Save the PDF
  const fileName = `MRI_Report_${data.patient.patientId}_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(fileName);
}
