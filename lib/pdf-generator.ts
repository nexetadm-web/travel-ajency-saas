import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

export interface GroupDocData {
  group: any;
  pilgrims: any[];
  agency: any;
}

// 1. EMBASSY MANIFEST PDF GENERATOR
export async function generateEmbassyManifestPdf({ group, pilgrims, agency }: GroupDocData): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);

  const pageWidth = 595.28;
  const pageHeight = 841.89;

  let page = pdfDoc.addPage([pageWidth, pageHeight]);

  const drawHeader = (p: any) => {
    // Top banner
    p.drawRectangle({
      x: 0,
      y: pageHeight - 90,
      width: pageWidth,
      height: 90,
      color: rgb(0.06, 0.09, 0.16),
    });

    p.drawText('EMBASSY MANIFEST / PILGRIM OFFICIAL LIST', {
      x: 36,
      y: pageHeight - 38,
      size: 15,
      font: fontBold,
      color: rgb(1, 1, 1),
    });

    p.drawText(
      `${(agency?.name || 'AL-HARAM TRAVEL MANAGEMENT').toUpperCase()} | LIC: ${agency?.license_no || 'DTS-4529'} | TEL: ${agency?.phone || '0300-1234567'}`,
      {
        x: 36,
        y: pageHeight - 58,
        size: 8.5,
        font: fontRegular,
        color: rgb(0.8, 0.85, 0.95),
      }
    );

    // Group info strip
    p.drawRectangle({
      x: 36,
      y: pageHeight - 145,
      width: pageWidth - 72,
      height: 44,
      color: rgb(0.96, 0.98, 1),
      borderColor: rgb(0.85, 0.9, 0.95),
      borderWidth: 1,
    });

    p.drawText(`GROUP: ${(group?.group_name || 'UMRAH SPECIAL GROUP').toUpperCase()}`, {
      x: 48,
      y: pageHeight - 120,
      size: 9.5,
      font: fontBold,
      color: rgb(0.1, 0.15, 0.25),
    });

    p.drawText(`AIRLINE: ${group?.airline || 'SAUDI AIRLINES / PIA'}`, {
      x: 240,
      y: pageHeight - 120,
      size: 8.5,
      font: fontRegular,
      color: rgb(0.3, 0.35, 0.45),
    });

    p.drawText(`DEPARTURE: ${group?.departure_date || 'N/A'}`, {
      x: 370,
      y: pageHeight - 120,
      size: 8.5,
      font: fontRegular,
      color: rgb(0.3, 0.35, 0.45),
    });

    p.drawText(`TOTAL PILGRIMS: ${pilgrims?.length || 0}`, {
      x: 48,
      y: pageHeight - 136,
      size: 8.5,
      font: fontRegular,
      color: rgb(0.3, 0.35, 0.45),
    });

    p.drawText(`PRINT DATE: ${new Date().toLocaleDateString('en-GB')}`, {
      x: 240,
      y: pageHeight - 136,
      size: 8.5,
      font: fontRegular,
      color: rgb(0.3, 0.35, 0.45),
    });
  };

  const drawTableHeader = (p: any, yPos: number) => {
    p.drawRectangle({
      x: 36,
      y: yPos - 18,
      width: pageWidth - 72,
      height: 22,
      color: rgb(0.12, 0.16, 0.23),
    });

    p.drawText('SR', { x: 44, y: yPos - 12, size: 7.5, font: fontBold, color: rgb(1, 1, 1) });
    p.drawText('NAME (AS PASSPORT)', { x: 72, y: yPos - 12, size: 7.5, font: fontBold, color: rgb(1, 1, 1) });
    p.drawText('PASSPORT NO', { x: 230, y: yPos - 12, size: 7.5, font: fontBold, color: rgb(1, 1, 1) });
    p.drawText('FATHER NAME', { x: 330, y: yPos - 12, size: 7.5, font: fontBold, color: rgb(1, 1, 1) });
    p.drawText('DOB / EXPIRY', { x: 440, y: yPos - 12, size: 7.5, font: fontBold, color: rgb(1, 1, 1) });
  };

  drawHeader(page);
  let y = pageHeight - 165;
  drawTableHeader(page, y);
  y -= 26;

  (pilgrims || []).forEach((p, idx) => {
    if (y < 60) {
      page = pdfDoc.addPage([pageWidth, pageHeight]);
      drawHeader(page);
      y = pageHeight - 165;
      drawTableHeader(page, y);
      y -= 26;
    }

    if (idx % 2 === 0) {
      page.drawRectangle({
        x: 36,
        y: y - 5,
        width: pageWidth - 72,
        height: 18,
        color: rgb(0.97, 0.98, 0.99),
      });
    }

    page.drawLine({
      start: { x: 36, y: y - 5 },
      end: { x: pageWidth - 36, y: y - 5 },
      thickness: 0.5,
      color: rgb(0.9, 0.92, 0.95),
    });

    const safeName = (p.full_name || 'N/A').toUpperCase().substring(0, 28);
    const safePassport = (p.passport_no || 'N/A').toUpperCase();
    const safeFather = (p.father_name || '-').toUpperCase().substring(0, 20);
    const safeExpiry = p.passport_expiry || '-';

    page.drawText(`${idx + 1}`, { x: 44, y, size: 8, font: fontRegular, color: rgb(0.2, 0.2, 0.2) });
    page.drawText(safeName, { x: 72, y, size: 8, font: fontRegular, color: rgb(0.1, 0.1, 0.1) });
    page.drawText(safePassport, { x: 230, y, size: 8, font: fontBold, color: rgb(0.15, 0.25, 0.4) });
    page.drawText(safeFather, { x: 330, y, size: 8, font: fontRegular, color: rgb(0.3, 0.3, 0.3) });
    page.drawText(safeExpiry, { x: 440, y, size: 8, font: fontRegular, color: rgb(0.3, 0.3, 0.3) });

    y -= 19;
  });

  // Footer note on all pages
  pdfDoc.getPages().forEach((p, i) => {
    p.drawText(`Official Manifest Verified by ${agency?.name || 'Al-Haram Travel'} - Page ${i + 1}`, {
      x: 36,
      y: 18,
      size: 7.5,
      font: fontRegular,
      color: rgb(0.5, 0.55, 0.6),
    });
  });

  return await pdfDoc.save();
}

// 2. BULK E-TICKETS GENERATOR (Each page airline style)
export async function generateBulkTicketsPdf({ group, pilgrims, agency }: GroupDocData): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);

  const pageWidth = 595.28;
  const pageHeight = 841.89;

  (pilgrims || []).forEach((p, i) => {
    const page = pdfDoc.addPage([pageWidth, pageHeight]);

    // Top Header
    page.drawRectangle({
      x: 36,
      y: pageHeight - 120,
      width: pageWidth - 72,
      height: 70,
      color: rgb(0.08, 0.15, 0.32),
    });

    page.drawText('ELECTRONIC FLIGHT TICKET / BOARDING PASS', {
      x: 54,
      y: pageHeight - 75,
      size: 14,
      font: fontBold,
      color: rgb(1, 1, 1),
    });

    page.drawText(`ISSUED BY: ${(agency?.name || 'AL-HARAM TRAVEL').toUpperCase()} | LIC: ${agency?.license_no || 'DTS-4529'}`, {
      x: 54,
      y: pageHeight - 95,
      size: 8.5,
      font: fontRegular,
      color: rgb(0.85, 0.9, 1),
    });

    // Ticket Container Box
    page.drawRectangle({
      x: 36,
      y: pageHeight - 340,
      width: pageWidth - 72,
      height: 200,
      color: rgb(0.98, 0.99, 1),
      borderColor: rgb(0.8, 0.85, 0.95),
      borderWidth: 1.5,
    });

    // Passenger Name & PNR row
    page.drawText('PASSENGER NAME', { x: 54, y: pageHeight - 165, size: 8, font: fontRegular, color: rgb(0.4, 0.45, 0.5) });
    page.drawText((p.full_name || 'N/A').toUpperCase(), { x: 54, y: pageHeight - 185, size: 13, font: fontBold, color: rgb(0.1, 0.15, 0.25) });

    page.drawText('BOOKING REF (PNR)', { x: 380, y: pageHeight - 165, size: 8, font: fontRegular, color: rgb(0.4, 0.45, 0.5) });
    page.drawText((p.pnr || group?.airline || 'PK-786').toUpperCase(), { x: 380, y: pageHeight - 185, size: 14, font: fontBold, color: rgb(0.1, 0.45, 0.7) });

    // Flight details
    page.drawLine({ start: { x: 54, y: pageHeight - 200 }, end: { x: pageWidth - 54, y: pageHeight - 200 }, thickness: 0.5, color: rgb(0.85, 0.88, 0.92) });

    page.drawText('SECTOR / ROUTE', { x: 54, y: pageHeight - 220, size: 8, font: fontRegular, color: rgb(0.4, 0.45, 0.5) });
    page.drawText('PAKISTAN (LHE / ISB / KHI) <-> JEDDAH / MADINAH', { x: 54, y: pageHeight - 238, size: 10, font: fontBold, color: rgb(0.1, 0.1, 0.1) });

    page.drawText('FLIGHT DATE', { x: 380, y: pageHeight - 220, size: 8, font: fontRegular, color: rgb(0.4, 0.45, 0.5) });
    page.drawText(group?.departure_date || 'CONFIRMED ON SCHEDULE', { x: 380, y: pageHeight - 238, size: 10, font: fontBold, color: rgb(0.1, 0.1, 0.1) });

    page.drawText('PASSPORT NO', { x: 54, y: pageHeight - 270, size: 8, font: fontRegular, color: rgb(0.4, 0.45, 0.5) });
    page.drawText((p.passport_no || 'N/A').toUpperCase(), { x: 54, y: pageHeight - 288, size: 10, font: fontBold, color: rgb(0.1, 0.1, 0.1) });

    page.drawText('AIRLINE CARRIER', { x: 220, y: pageHeight - 270, size: 8, font: fontRegular, color: rgb(0.4, 0.45, 0.5) });
    page.drawText(group?.airline || 'SAUDI AIRLINES / PIA', { x: 220, y: pageHeight - 288, size: 10, font: fontBold, color: rgb(0.1, 0.1, 0.1) });

    page.drawText('BAGGAGE ALLOWANCE', { x: 380, y: pageHeight - 270, size: 8, font: fontRegular, color: rgb(0.4, 0.45, 0.5) });
    page.drawText('2 PIECES (23KG EACH) + 7KG HAND CARRY', { x: 380, y: pageHeight - 288, size: 8.5, font: fontBold, color: rgb(0.1, 0.5, 0.2) });

    // Simulated Barcode
    for (let bar = 0; bar < 60; bar++) {
      const barX = 54 + bar * 6;
      page.drawLine({
        start: { x: barX, y: pageHeight - 310 },
        end: { x: barX, y: pageHeight - 330 },
        thickness: (bar % 3 === 0) ? 3 : 1.5,
        color: rgb(0.1, 0.1, 0.1),
      });
    }

    // Notice & Footer
    page.drawText('IMPORTANT TRAVEL NOTICE: PASSENGERS MUST ARRIVE AT THE AIRPORT 4 HOURS PRIOR TO DEPARTURE.', {
      x: 36,
      y: pageHeight - 365,
      size: 7.5,
      font: fontBold,
      color: rgb(0.7, 0.2, 0.2),
    });

    page.drawText(`Official E-Ticket generated by ${agency?.name || 'Al-Haram Travel'} - Verified PNR`, {
      x: 36,
      y: 20,
      size: 7.5,
      font: fontRegular,
      color: rgb(0.5, 0.5, 0.5),
    });
  });

  return await pdfDoc.save();
}

// 3. HOTEL VOUCHERS GENERATOR (2 per page: Makkah + Madina)
export async function generateHotelVouchersPdf({ group, pilgrims, agency }: GroupDocData): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);

  const pageWidth = 595.28;
  const pageHeight = 841.89;

  const page = pdfDoc.addPage([pageWidth, pageHeight]);

  // Main Header
  page.drawRectangle({
    x: 36,
    y: pageHeight - 85,
    width: pageWidth - 72,
    height: 55,
    color: rgb(0.08, 0.35, 0.25),
  });

  page.drawText('OFFICIAL HOTEL ACCOMMODATION VOUCHERS', {
    x: 54,
    y: pageHeight - 55,
    size: 13,
    font: fontBold,
    color: rgb(1, 1, 1),
  });

  page.drawText(`GROUP: ${(group?.group_name || 'UMRAH GROUP').toUpperCase()} | TOTAL GUESTS: ${pilgrims?.length || 0}`, {
    x: 54,
    y: pageHeight - 72,
    size: 8.5,
    font: fontRegular,
    color: rgb(0.85, 0.95, 0.9),
  });

  // VOUCHER 1: MAKKAH HOTEL
  page.drawRectangle({
    x: 36,
    y: pageHeight - 420,
    width: pageWidth - 72,
    height: 310,
    color: rgb(0.98, 1, 0.98),
    borderColor: rgb(0.7, 0.85, 0.75),
    borderWidth: 1.5,
  });

  page.drawRectangle({
    x: 36,
    y: pageHeight - 145,
    width: pageWidth - 72,
    height: 35,
    color: rgb(0.12, 0.45, 0.32),
  });

  page.drawText('VOUCHER 1: MAKKAH AL-MUKARRAMAH HOTEL', {
    x: 54,
    y: pageHeight - 130,
    size: 11,
    font: fontBold,
    color: rgb(1, 1, 1),
  });

  page.drawText('HOTEL NAME:', { x: 54, y: pageHeight - 170, size: 8.5, font: fontRegular, color: rgb(0.4, 0.4, 0.4) });
  page.drawText(group?.makkah_hotel || 'SWISSOTEL AL MAQAM MAKKAH (5 STAR)', { x: 54, y: pageHeight - 190, size: 12, font: fontBold, color: rgb(0.1, 0.2, 0.15) });

  page.drawText('CHECK-IN DATE', { x: 54, y: pageHeight - 220, size: 8, font: fontRegular, color: rgb(0.4, 0.4, 0.4) });
  page.drawText(group?.departure_date || 'ON FLIGHT ARRIVAL', { x: 54, y: pageHeight - 238, size: 10, font: fontBold, color: rgb(0.1, 0.1, 0.1) });

  page.drawText('ROOM CATEGORY', { x: 220, y: pageHeight - 220, size: 8, font: fontRegular, color: rgb(0.4, 0.4, 0.4) });
  page.drawText('STANDARD QUAD / TRIPLE BED ROOMS', { x: 220, y: pageHeight - 238, size: 9.5, font: fontBold, color: rgb(0.1, 0.1, 0.1) });

  page.drawText('MEAL PLAN', { x: 420, y: pageHeight - 220, size: 8, font: fontRegular, color: rgb(0.4, 0.4, 0.4) });
  page.drawText('BED & BREAKFAST (BUFFET)', { x: 420, y: pageHeight - 238, size: 9.5, font: fontBold, color: rgb(0.1, 0.5, 0.2) });

  page.drawText('PASSENGER REPS:', { x: 54, y: pageHeight - 270, size: 8, font: fontRegular, color: rgb(0.4, 0.4, 0.4) });
  page.drawText(`${(pilgrims[0]?.full_name || 'GROUP LEADER').toUpperCase()} + ${Math.max(0, (pilgrims?.length || 1) - 1)} MORE PILGRIMS`, {
    x: 54,
    y: pageHeight - 288,
    size: 9.5,
    font: fontBold,
    color: rgb(0.1, 0.1, 0.1),
  });

  // VOUCHER 2: MADINAH HOTEL
  page.drawRectangle({
    x: 36,
    y: 50,
    width: pageWidth - 72,
    height: 310,
    color: rgb(0.98, 0.99, 1),
    borderColor: rgb(0.7, 0.8, 0.95),
    borderWidth: 1.5,
  });

  page.drawRectangle({
    x: 36,
    y: 325,
    width: pageWidth - 72,
    height: 35,
    color: rgb(0.15, 0.3, 0.55),
  });

  page.drawText('VOUCHER 2: MADINAH AL-MUNAWWARAH HOTEL', {
    x: 54,
    y: 340,
    size: 11,
    font: fontBold,
    color: rgb(1, 1, 1),
  });

  page.drawText('HOTEL NAME:', { x: 54, y: 300, size: 8.5, font: fontRegular, color: rgb(0.4, 0.4, 0.4) });
  page.drawText(group?.madina_hotel || 'PULLMAN ZAMZAM MADINA (5 STAR)', { x: 54, y: 280, size: 12, font: fontBold, color: rgb(0.1, 0.15, 0.3) });

  page.drawText('CHECK-IN DATE', { x: 54, y: 250, size: 8, font: fontRegular, color: rgb(0.4, 0.4, 0.4) });
  page.drawText('AFTER MAKKAH STAY', { x: 54, y: 232, size: 10, font: fontBold, color: rgb(0.1, 0.1, 0.1) });

  page.drawText('ROOM CATEGORY', { x: 220, y: 250, size: 8, font: fontRegular, color: rgb(0.4, 0.4, 0.4) });
  page.drawText('STANDARD SHARING ROOMS', { x: 220, y: 232, size: 9.5, font: fontBold, color: rgb(0.1, 0.1, 0.1) });

  page.drawText('DISTANCE TO HARAM', { x: 420, y: 250, size: 8, font: fontRegular, color: rgb(0.4, 0.4, 0.4) });
  page.drawText('WITHIN 150 METERS', { x: 420, y: 232, size: 9.5, font: fontBold, color: rgb(0.1, 0.45, 0.6) });

  page.drawText(`Official Vouchers verified by ${agency?.name || 'Al-Haram Travel Management'}`, {
    x: 36,
    y: 20,
    size: 7.5,
    font: fontRegular,
    color: rgb(0.5, 0.5, 0.5),
  });

  return await pdfDoc.save();
}

// 4. EMBASSY EXCEL CSV GENERATOR
export function generateEmbassyExcelCsv({ group, pilgrims, agency }: GroupDocData): string {
  const headers = ['Sr', 'Full Name as Passport', 'Passport Number', 'Father Name', 'Passport Expiry', 'CNIC', 'Phone', 'Visa Status', 'Group Name'];
  const rows = (pilgrims || []).map((p, idx) => [
    idx + 1,
    `"${(p.full_name || '').replace(/"/g, '""')}"`,
    `"${(p.passport_no || '').replace(/"/g, '""')}"`,
    `"${(p.father_name || '').replace(/"/g, '""')}"`,
    `"${p.passport_expiry || ''}"`,
    `"${p.cnic || ''}"`,
    `"${p.phone || ''}"`,
    `"${p.visa_status || ''}"`,
    `"${(group?.group_name || '').replace(/"/g, '""')}"`,
  ]);

  return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
}
