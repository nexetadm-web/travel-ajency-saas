import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import QRCode from 'qrcode';

export interface AgencyBranding {
  name: string;
  owner_name?: string;
  phone?: string | null;
  address?: string | null;
  license_no?: string | null;
  logo_url?: string | null;
}

// 1. GENERATE CUSTOMER PAYMENT RECEIPT WITH QR CODE & DYNAMIC BRANDING
export async function generateReceiptPdf(data: {
  agency: AgencyBranding;
  customerName: string;
  phone?: string;
  receiptNo: string;
  date: string;
  amount: number;
  method: string;
  note?: string;
  totalPayable: number;
  totalPaid: number;
  remaining: number;
  verifyUrl: string;
}) {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595.28, 841.89]); // A4
  const { width, height } = page.getSize();

  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);

  // Background Header Banner
  page.drawRectangle({
    x: 0,
    y: height - 120,
    width: width,
    height: 120,
    color: rgb(0.05, 0.35, 0.25), // Emerald Brand Green
  });

  // Agency Name Header (100% Dynamic)
  page.drawText(data.agency.name || 'TRAVEL AGENCY', {
    x: 40,
    y: height - 50,
    size: 22,
    font: fontBold,
    color: rgb(1, 1, 1),
  });

  // Agency Details (Phone, Address, License)
  const metaLine1 = `License No: ${data.agency.license_no || 'N/A'}  |  Phone: ${data.agency.phone || 'N/A'}`;
  page.drawText(metaLine1, {
    x: 40,
    y: height - 75,
    size: 10,
    font: fontRegular,
    color: rgb(0.9, 0.95, 0.9),
  });

  if (data.agency.address) {
    page.drawText(data.agency.address, {
      x: 40,
      y: height - 92,
      size: 9,
      font: fontRegular,
      color: rgb(0.85, 0.9, 0.85),
    });
  }

  // Receipt Title Badge
  page.drawRectangle({
    x: width - 180,
    y: height - 70,
    width: 140,
    height: 35,
    color: rgb(0.95, 0.8, 0.2), // Gold accent
  });

  page.drawText('PAYMENT RECEIPT', {
    x: width - 170,
    y: height - 50,
    size: 11,
    font: fontBold,
    color: rgb(0.1, 0.1, 0.1),
  });

  // Receipt Number & Date bar
  page.drawText(`Receipt #: ${data.receiptNo}`, {
    x: 40,
    y: height - 150,
    size: 12,
    font: fontBold,
    color: rgb(0.1, 0.1, 0.1),
  });

  page.drawText(`Date: ${data.date}`, {
    x: width - 180,
    y: height - 150,
    size: 11,
    font: fontRegular,
    color: rgb(0.3, 0.3, 0.3),
  });

  // Customer Details Box
  page.drawRectangle({
    x: 40,
    y: height - 250,
    width: width - 80,
    height: 80,
    borderColor: rgb(0.8, 0.85, 0.85),
    borderWidth: 1,
    color: rgb(0.97, 0.98, 0.99),
  });

  page.drawText('CUSTOMER DETAILS / گاہک کی تفصیل', {
    x: 55,
    y: height - 185,
    size: 10,
    font: fontBold,
    color: rgb(0.2, 0.4, 0.3),
  });

  page.drawText(`Customer Name: ${data.customerName}`, {
    x: 55,
    y: height - 208,
    size: 11,
    font: fontBold,
    color: rgb(0.1, 0.1, 0.1),
  });

  page.drawText(`Contact: ${data.phone || 'N/A'}`, {
    x: 55,
    y: height - 230,
    size: 10,
    font: fontRegular,
    color: rgb(0.25, 0.25, 0.25),
  });

  // Payment Breakdown Table
  let tableY = height - 280;

  page.drawRectangle({
    x: 40,
    y: tableY - 25,
    width: width - 80,
    height: 25,
    color: rgb(0.9, 0.94, 0.92),
  });

  page.drawText('Description', { x: 55, y: tableY - 18, size: 10, font: fontBold, color: rgb(0.1, 0.1, 0.1) });
  page.drawText('Payment Method', { x: 260, y: tableY - 18, size: 10, font: fontBold, color: rgb(0.1, 0.1, 0.1) });
  page.drawText('Amount (PKR)', { x: width - 140, y: tableY - 18, size: 10, font: fontBold, color: rgb(0.1, 0.1, 0.1) });

  tableY -= 50;
  page.drawText(data.note || 'Travel & Umrah Service Payment', { x: 55, y: tableY, size: 10, font: fontRegular, color: rgb(0.2, 0.2, 0.2) });
  page.drawText(data.method.toUpperCase(), { x: 260, y: tableY, size: 10, font: fontRegular, color: rgb(0.2, 0.2, 0.2) });
  page.drawText(data.amount.toLocaleString(), { x: width - 140, y: tableY, size: 11, font: fontBold, color: rgb(0.05, 0.5, 0.25) });

  // Summary Box (Payable, Paid, Remaining)
  const sumY = tableY - 90;
  page.drawRectangle({
    x: width - 260,
    y: sumY,
    width: 220,
    height: 80,
    borderColor: rgb(0.8, 0.85, 0.85),
    borderWidth: 1,
    color: rgb(0.98, 0.99, 0.98),
  });

  page.drawText(`Total Package: PKR ${data.totalPayable.toLocaleString()}`, {
    x: width - 245,
    y: sumY + 58,
    size: 10,
    font: fontRegular,
    color: rgb(0.2, 0.2, 0.2),
  });

  page.drawText(`Amount Paid: PKR ${data.totalPaid.toLocaleString()}`, {
    x: width - 245,
    y: sumY + 38,
    size: 10,
    font: fontBold,
    color: rgb(0.05, 0.5, 0.25),
  });

  page.drawText(`Balance Due: PKR ${data.remaining.toLocaleString()}`, {
    x: width - 245,
    y: sumY + 15,
    size: 11,
    font: fontBold,
    color: data.remaining > 0 ? rgb(0.8, 0.15, 0.15) : rgb(0.1, 0.6, 0.2),
  });

  // QR Code Generation for Verification
  try {
    const qrPngDataUrl = await QRCode.toDataURL(data.verifyUrl, { margin: 1, width: 120 });
    const qrImageBytes = Buffer.from(qrPngDataUrl.split(',')[1], 'base64');
    const qrImage = await pdfDoc.embedPng(qrImageBytes);

    page.drawImage(qrImage, {
      x: 55,
      y: sumY - 10,
      width: 90,
      height: 90,
    });

    page.drawText('Scan to Verify Receipt Online', {
      x: 55,
      y: sumY - 24,
      size: 8,
      font: fontBold,
      color: rgb(0.3, 0.3, 0.3),
    });

    page.drawText(data.verifyUrl, {
      x: 55,
      y: sumY - 35,
      size: 7,
      font: fontRegular,
      color: rgb(0.4, 0.4, 0.4),
    });
  } catch (err) {
    console.error('QR code generation error:', err);
  }

  // Footer dynamic branding
  page.drawLine({
    start: { x: 40, y: 80 },
    end: { x: width - 40, y: 80 },
    thickness: 1,
    color: rgb(0.85, 0.85, 0.85),
  });

  page.drawText(`Official Receipt generated by ${data.agency.name} | Verified SaaS Document`, {
    x: 40,
    y: 62,
    size: 8,
    font: fontRegular,
    color: rgb(0.5, 0.5, 0.5),
  });

  page.drawText('Thank you for choosing our travel services. جزاك الله خيرا', {
    x: 40,
    y: 48,
    size: 8,
    font: fontRegular,
    color: rgb(0.2, 0.5, 0.3),
  });

  return await pdfDoc.save();
}

// 2. GENERATE EMBASSY / GROUP LIST PDF
export async function generateEmbassyListPdf(data: {
  agency: AgencyBranding;
  groupName: string;
  departureDate?: string;
  airline?: string;
  pilgrims: Array<{
    full_name: string;
    father_name?: string | null;
    passport_no: string;
    passport_expiry?: string | null;
    cnic?: string | null;
    visa_status?: string | null;
  }>;
}) {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([841.89, 595.28]); // Landscape A4
  const { width, height } = page.getSize();

  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);

  // Top Dynamic Header
  page.drawRectangle({
    x: 0,
    y: height - 85,
    width: width,
    height: 85,
    color: rgb(0.08, 0.28, 0.22),
  });

  page.drawText(data.agency.name.toUpperCase(), {
    x: 35,
    y: height - 38,
    size: 18,
    font: fontBold,
    color: rgb(1, 1, 1),
  });

  page.drawText(`Government Approved License: ${data.agency.license_no || 'Registered'} | Tel: ${data.agency.phone || 'N/A'} | ${data.agency.address || ''}`, {
    x: 35,
    y: height - 58,
    size: 9,
    font: fontRegular,
    color: rgb(0.88, 0.95, 0.9),
  });

  page.drawText(`EMBASSY VISA / GROUP MANIFEST`, {
    x: width - 240,
    y: height - 38,
    size: 12,
    font: fontBold,
    color: rgb(1, 0.85, 0.2),
  });

  page.drawText(`Group: ${data.groupName} | Flight: ${data.airline || 'Scheduled'} | Date: ${data.departureDate || 'N/A'}`, {
    x: 35,
    y: height - 110,
    size: 11,
    font: fontBold,
    color: rgb(0.1, 0.1, 0.1),
  });

  // Table Headers
  const startY = height - 140;
  page.drawRectangle({
    x: 35,
    y: startY - 22,
    width: width - 70,
    height: 24,
    color: rgb(0.9, 0.93, 0.91),
  });

  page.drawText('Sr #', { x: 45, y: startY - 14, size: 9, font: fontBold, color: rgb(0.1, 0.1, 0.1) });
  page.drawText('Pilgrim Name', { x: 80, y: startY - 14, size: 9, font: fontBold, color: rgb(0.1, 0.1, 0.1) });
  page.drawText('Father / Husband Name', { x: 230, y: startY - 14, size: 9, font: fontBold, color: rgb(0.1, 0.1, 0.1) });
  page.drawText('Passport No', { x: 380, y: startY - 14, size: 9, font: fontBold, color: rgb(0.1, 0.1, 0.1) });
  page.drawText('Passport Expiry', { x: 480, y: startY - 14, size: 9, font: fontBold, color: rgb(0.1, 0.1, 0.1) });
  page.drawText('CNIC / ID', { x: 590, y: startY - 14, size: 9, font: fontBold, color: rgb(0.1, 0.1, 0.1) });
  page.drawText('Visa Status', { x: 710, y: startY - 14, size: 9, font: fontBold, color: rgb(0.1, 0.1, 0.1) });

  let rowY = startY - 38;
  data.pilgrims.forEach((p, idx) => {
    if (rowY < 50) return;
    if (idx % 2 === 1) {
      page.drawRectangle({
        x: 35,
        y: rowY - 4,
        width: width - 70,
        height: 18,
        color: rgb(0.97, 0.98, 0.98),
      });
    }

    page.drawText(`${idx + 1}`, { x: 45, y: rowY, size: 8, font: fontRegular, color: rgb(0.2, 0.2, 0.2) });
    page.drawText(p.full_name || '-', { x: 80, y: rowY, size: 8, font: fontBold, color: rgb(0.1, 0.1, 0.1) });
    page.drawText(p.father_name || '-', { x: 230, y: rowY, size: 8, font: fontRegular, color: rgb(0.2, 0.2, 0.2) });
    page.drawText(p.passport_no || '-', { x: 380, y: rowY, size: 8, font: fontBold, color: rgb(0.15, 0.25, 0.5) });
    page.drawText(p.passport_expiry || '-', { x: 480, y: rowY, size: 8, font: fontRegular, color: rgb(0.2, 0.2, 0.2) });
    page.drawText(p.cnic || '-', { x: 590, y: rowY, size: 8, font: fontRegular, color: rgb(0.2, 0.2, 0.2) });
    page.drawText(p.visa_status?.toUpperCase() || 'PENDING', { x: 710, y: rowY, size: 8, font: fontBold, color: rgb(0.1, 0.5, 0.2) });

    rowY -= 20;
  });

  // Footer signature
  page.drawText(`Authorized Agency Stamp & Signature: _______________________`, {
    x: width - 360,
    y: 35,
    size: 9,
    font: fontRegular,
    color: rgb(0.3, 0.3, 0.3),
  });

  return await pdfDoc.save();
}

// 3. GENERATE GROUP PROFIT BREAKDOWN REPORT PDF
export async function generateGroupProfitPdf(data: {
  agency: AgencyBranding;
  groupName: string;
  totalReceived: number;
  ticketsCost: number;
  hotelsCost: number;
  transportCost: number;
  visasCost: number;
  otherExpenses: number;
  totalExpenses: number;
  netProfit: number;
  pilgrimsCount: number;
}) {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595.28, 841.89]);
  const { width, height } = page.getSize();

  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);

  // Header
  page.drawRectangle({
    x: 0,
    y: height - 100,
    width: width,
    height: 100,
    color: rgb(0.06, 0.3, 0.2),
  });

  page.drawText(data.agency.name, {
    x: 40,
    y: height - 45,
    size: 20,
    font: fontBold,
    color: rgb(1, 1, 1),
  });

  page.drawText(`Group Profit & Loss Statement | Group: ${data.groupName}`, {
    x: 40,
    y: height - 70,
    size: 11,
    font: fontRegular,
    color: rgb(0.9, 0.95, 0.9),
  });

  // Net Profit Card
  const profitY = height - 180;
  page.drawRectangle({
    x: 40,
    y: profitY,
    width: width - 80,
    height: 60,
    color: data.netProfit >= 0 ? rgb(0.92, 0.98, 0.93) : rgb(0.99, 0.92, 0.92),
    borderColor: data.netProfit >= 0 ? rgb(0.2, 0.7, 0.3) : rgb(0.8, 0.2, 0.2),
    borderWidth: 1.5,
  });

  page.drawText('NET GROUP PROFIT / خالص منافع', {
    x: 60,
    y: profitY + 38,
    size: 11,
    font: fontBold,
    color: data.netProfit >= 0 ? rgb(0.1, 0.45, 0.2) : rgb(0.7, 0.1, 0.1),
  });

  page.drawText(`PKR ${data.netProfit.toLocaleString()}`, {
    x: 60,
    y: profitY + 12,
    size: 20,
    font: fontBold,
    color: data.netProfit >= 0 ? rgb(0.05, 0.5, 0.2) : rgb(0.8, 0.1, 0.1),
  });

  // Financial breakdown
  let currY = profitY - 40;
  const drawRow = (label: string, value: number, isMinus = false) => {
    page.drawText(label, { x: 55, y: currY, size: 10, font: fontRegular, color: rgb(0.2, 0.2, 0.2) });
    const valText = `${isMinus ? '-' : '+'} PKR ${value.toLocaleString()}`;
    page.drawText(valText, {
      x: width - 200,
      y: currY,
      size: 10,
      font: fontBold,
      color: isMinus ? rgb(0.7, 0.2, 0.2) : rgb(0.1, 0.5, 0.2),
    });
    page.drawLine({
      start: { x: 45, y: currY - 6 },
      end: { x: width - 45, y: currY - 6 },
      thickness: 0.5,
      color: rgb(0.9, 0.9, 0.9),
    });
    currY -= 28;
  };

  page.drawText('FINANCIAL DETAILS', { x: 45, y: currY + 15, size: 11, font: fontBold, color: rgb(0.1, 0.1, 0.1) });
  drawRow(`Total Revenue Received (${data.pilgrimsCount} Pilgrims)`, data.totalReceived, false);
  drawRow('Tickets Purchase Cost', data.ticketsCost, true);
  drawRow('Hotels Booking Cost (Makkah + Madina)', data.hotelsCost, true);
  drawRow('Transport Booking Cost (Buses / GMC)', data.transportCost, true);
  drawRow('Visa & Embassy Fees', data.visasCost, true);
  drawRow('Other Group Expenses', data.otherExpenses, true);
  drawRow('Total Operating Cost', data.totalExpenses, true);

  return await pdfDoc.save();
}
