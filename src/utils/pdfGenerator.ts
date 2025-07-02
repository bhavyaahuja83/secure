
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { Bill } from '../types';

declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

export const generatePDF = (bill: Bill): void => {
  const doc = new jsPDF('portrait', 'mm', 'a4');
  
  // Set font to Calibri (fallback to Helvetica)
  doc.setFont('helvetica');
  
  let yPosition = 20;

  // SECTION 1: COMPANY HEADER (Centered, Bold, 18pt)
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('SECURE AUTOMATION & SAFETY SOLUTIONS', 105, yPosition, { align: 'center' });
  
  yPosition += 8;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('VILLAGE SUNEHTI, GOHANA ROAD', 105, yPosition, { align: 'center' });
  yPosition += 5;
  doc.text('SONIPAT, HARYANA - 131001', 105, yPosition, { align: 'center' });
  yPosition += 5;
  doc.text('GSM: 9354078266', 105, yPosition, { align: 'center' });
  
  yPosition += 15;
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('INVOICE', 105, yPosition, { align: 'center' });
  
  yPosition += 15;

  // SECTION 2: BILLING DETAILS (2-column layout)
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text("RECIPIENT'S DETAILS (BILL TO)", 15, yPosition);
  doc.text(`BILL NO. ${bill.billNo}`, 140, yPosition);
  
  yPosition += 7;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`DATE: ${new Date(bill.date).toLocaleDateString('en-GB')}`, 140, yPosition);
  yPosition += 5;
  doc.text(`PO: ${bill.poNumber || 'TELEPHONIC CONFIRMATION'}`, 140, yPosition);
  
  // Left column - Customer details
  let leftY = yPosition - 12;
  doc.text(bill.clientName.toUpperCase(), 15, leftY + 7);
  leftY += 7;
  
  const addressLines = bill.clientAddress.split('\n');
  addressLines.forEach(line => {
    if (line.trim()) {
      doc.text(line.trim().toUpperCase(), 15, leftY);
      leftY += 5;
    }
  });
  
  doc.text(`PARTY GST: ${bill.clientGSTIN}`, 15, leftY + 3);
  leftY += 8;
  
  doc.setFont('helvetica', 'bold');
  doc.text(`BUYER: ${bill.clientName.toUpperCase()}`, 15, leftY);
  leftY += 5;
  
  doc.setFont('helvetica', 'normal');
  doc.text(`Site Address: ${bill.siteAddress}`, 15, leftY);
  leftY += 5;
  doc.text('Kind Attn:', 15, leftY);
  
  yPosition = Math.max(leftY + 15, yPosition + 30);

  // SECTION 3: ITEMS TABLE with exact formatting
  const tableData = bill.items.map((item, index) => [
    (index + 1).toString(),
    item.description.toUpperCase(),
    item.hsn || '8518',
    item.qty.toString(),
    `₹${item.rate.toLocaleString('en-IN')}`,
    `₹${item.amount.toLocaleString('en-IN')}`
  ]);

  doc.autoTable({
    startY: yPosition,
    head: [['Sr.No', 'Description', 'HSN/SAC', 'Qty', 'Rate', 'Amount']],
    body: tableData,
    theme: 'grid',
    styles: {
      fontSize: 10,
      font: 'helvetica',
      textColor: [0, 0, 0],
      lineColor: [0, 0, 0],
      lineWidth: 0.5
    },
    headStyles: {
      fillColor: [240, 240, 240],
      fontStyle: 'bold',
      halign: 'center'
    },
    columnStyles: {
      0: { halign: 'center', cellWidth: 20 },
      1: { halign: 'left', cellWidth: 80 },
      2: { halign: 'center', cellWidth: 25 },
      3: { halign: 'center', cellWidth: 20 },
      4: { halign: 'right', cellWidth: 25 },
      5: { halign: 'right', cellWidth: 25 }
    }
  });

  yPosition = (doc as any).lastAutoTable.finalY + 10;

  // SECTION 4: TOTALS & TAXES (Right-aligned box)
  const totalsX = 140;
  const totalsData = [
    ['Total', `₹${bill.subtotal.toLocaleString('en-IN')}`],
    [`Add: CGST ${bill.isIGST ? '0' : '9'}%`, `₹${bill.cgst.toLocaleString('en-IN')}`],
    [`Add: SGST ${bill.isIGST ? '0' : '9'}%`, `₹${bill.sgst.toLocaleString('en-IN')}`],
    [`Add: IGST ${bill.isIGST ? '18' : '0'}%`, `₹${bill.igst.toLocaleString('en-IN')}`],
    ['Round Off', `₹${bill.roundOff}`],
    ['Grand Total', `₹${bill.grandTotal.toLocaleString('en-IN')}`]
  ];

  doc.autoTable({
    startY: yPosition,
    body: totalsData,
    theme: 'grid',
    styles: { fontSize: 10, textColor: [0, 0, 0], lineColor: [0, 0, 0] },
    columnStyles: {
      0: { halign: 'left', cellWidth: 35 },
      1: { halign: 'right', cellWidth: 35 }
    },
    margin: { left: totalsX },
    didDrawCell: function(data) {
      if (data.row.index === 5) { // Grand Total row
        doc.setFillColor(255, 255, 200);
        doc.rect(data.cell.x, data.cell.y, data.cell.width, data.cell.height, 'F');
        doc.setFont('helvetica', 'bold');
      }
    }
  });

  yPosition = (doc as any).lastAutoTable.finalY + 15;

  // SECTION 5: AMOUNT IN WORDS
  doc.setFont('helvetica', 'italic');
  doc.text(`Rs. ${bill.amountInWords}`, 15, yPosition);
  
  yPosition += 20;

  // SECTION 6: COMPANY DETAILS & SIGNATURE
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text('PAN CARD No. BUIPA4572Q', 15, yPosition);
  doc.text('For Secure Automation & Safety Solutions', 155, yPosition);
  yPosition += 4;
  doc.text('GSTIN/UIN No: 06BUIPA4572Q1Z7', 15, yPosition);
  yPosition += 4;
  doc.text('STATE: HARYANA', 15, yPosition);
  doc.setFont('helvetica', 'italic');
  doc.text('(Authorised Signatory)', 155, yPosition + 10);
  
  yPosition += 25;

  // SECTION 7: BANK DETAILS
  doc.setFont('helvetica', 'bold');
  doc.text('RTGS DETAILS:', 15, yPosition);
  yPosition += 6;
  
  doc.setFont('helvetica', 'normal');
  doc.text('SECURE AUTOMATION & SAFETY SOLUTIONS', 15, yPosition);
  yPosition += 4;
  doc.text('HDFC BANK, A/C No.: 1234567890, IFSC: HDFC0001234, BRANCH: SONIPAT', 15, yPosition);

  doc.save(`Invoice-${bill.billNo}.pdf`);
};

export const generateBillPDF = generatePDF;
export const downloadBillPDF = (bill: Bill) => {
  try {
    generatePDF(bill);
    return true;
  } catch (error) {
    console.error('PDF generation failed:', error);
    return false;
  }
};
