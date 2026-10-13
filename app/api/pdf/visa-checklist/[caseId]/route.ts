import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { visa_cases, visa_case_documents, agencies } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import QRCode from 'qrcode';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ caseId: string }> | { caseId: string } }
) {
  try {
    const { caseId } = await params;

    const [visaCase] = await db
      .select()
      .from(visa_cases)
      .where(eq(visa_cases.id, caseId))
      .limit(1);

    if (!visaCase) {
      return NextResponse.json({ error: 'ویزہ کیس نہیں ملا' }, { status: 404 });
    }

    const [agency] = await db
      .select()
      .from(agencies)
      .where(eq(agencies.id, visaCase.agency_id))
      .limit(1);

    const documents = await db
      .select()
      .from(visa_case_documents)
      .where(eq(visa_case_documents.case_id, caseId));

    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595.28, 841.89]);
    const { width, height } = page.getSize();

    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);

    // Header Banner
    page.drawRectangle({
      x: 0,
      y: height - 110,
      width,
      height: 110,
      color: rgb(0.12, 0.23, 0.54), // Royal Navy Blue
    });

    const agencyName = (agency?.name || 'GLOBAL VISA CONSULTANCY').toUpperCase();
    page.drawText(agencyName, {
      x: 40,
      y: height - 45,
      size: 18,
      font: fontBold,
      color: rgb(1, 1, 1),
    });

    page.drawText(`OFFICIAL EMBASSY DOCUMENT SUBMISSION CHECKLIST`, {
      x: 40,
      y: height - 68,
      size: 11,
      font: fontBold,
      color: rgb(0.85, 0.9, 1),
    });

    page.drawText(`Lic No: ${agency?.license_no || 'DTS-3342'} | Phone: ${agency?.phone || '+92 300 0000000'} | Email: ${agency?.email || 'info@agency.com'}`, {
      x: 40,
      y: height - 88,
      size: 9,
      font: fontRegular,
      color: rgb(0.8, 0.85, 0.95),
    });

    // Case Info Box
    page.drawRectangle({
      x: 40,
      y: height - 230,
      width: width - 80,
      height: 105,
      color: rgb(0.97, 0.98, 1),
      borderColor: rgb(0.82, 0.86, 0.96),
      borderWidth: 1.5,
    });

    let infoY = height - 145;
    page.drawText(`Applicant: ${visaCase.client_name}`, { x: 55, y: infoY, size: 10, font: fontBold, color: rgb(0.1, 0.1, 0.1) });
    page.drawText(`Country: ${visaCase.country}`, { x: 320, y: infoY, size: 10, font: fontBold, color: rgb(0.12, 0.23, 0.54) });

    infoY -= 20;
    page.drawText(`Passport No: ${visaCase.passport_no || 'Pending'}`, { x: 55, y: infoY, size: 10, font: fontBold, color: rgb(0.1, 0.1, 0.1) });
    page.drawText(`Visa Category: ${visaCase.visa_type.toUpperCase()}`, { x: 320, y: infoY, size: 10, font: fontBold, color: rgb(0.1, 0.1, 0.1) });

    infoY -= 20;
    page.drawText(`Father / Guardian: ${visaCase.father_name || 'N/A'}`, { x: 55, y: infoY, size: 9, font: fontRegular, color: rgb(0.2, 0.2, 0.2) });
    page.drawText(`Current Status: ${visaCase.status.toUpperCase()}`, { x: 320, y: infoY, size: 9, font: fontBold, color: rgb(0.1, 0.5, 0.2) });

    infoY -= 20;
    page.drawText(`Contact: ${visaCase.phone || 'N/A'}`, { x: 55, y: infoY, size: 9, font: fontRegular, color: rgb(0.2, 0.2, 0.2) });
    if (visaCase.university_name) {
      page.drawText(`Institution: ${visaCase.university_name}`, { x: 320, y: infoY, size: 9, font: fontRegular, color: rgb(0.2, 0.2, 0.2) });
    }

    // CHECKLIST HEADER
    page.drawRectangle({
      x: 40,
      y: height - 275,
      width: width - 80,
      height: 32,
      color: rgb(0.93, 0.95, 0.98),
      borderColor: rgb(0.8, 0.85, 0.92),
      borderWidth: 1,
    });

    page.drawText('SR', { x: 55, y: height - 263, size: 9, font: fontBold, color: rgb(0.2, 0.3, 0.5) });
    page.drawText('REQUIRED EMBASSY DOCUMENT', { x: 90, y: height - 263, size: 9, font: fontBold, color: rgb(0.2, 0.3, 0.5) });
    page.drawText('VERIFICATION STATUS', { x: 380, y: height - 263, size: 9, font: fontBold, color: rgb(0.2, 0.3, 0.5) });
    page.drawText('CHECK', { x: 510, y: height - 263, size: 9, font: fontBold, color: rgb(0.2, 0.3, 0.5) });

    // RENDER DOCUMENTS LIST
    let docY = height - 305;
    documents.forEach((doc, idx) => {
      const isVerified = doc.status === 'verified';
      const isReceived = doc.status === 'received';

      page.drawText(`${idx + 1}.`, { x: 55, y: docY, size: 9, font: fontRegular, color: rgb(0.3, 0.3, 0.3) });
      page.drawText(doc.doc_name, { x: 90, y: docY, size: 9, font: fontBold, color: rgb(0.1, 0.1, 0.1) });

      const statusText = isVerified ? 'VERIFIED ✓' : isReceived ? 'RECEIVED' : 'PENDING';
      const statusColor = isVerified ? rgb(0.05, 0.5, 0.2) : isReceived ? rgb(0.1, 0.3, 0.7) : rgb(0.7, 0.3, 0.1);
      page.drawText(statusText, { x: 380, y: docY, size: 9, font: fontBold, color: statusColor });

      // Draw Checkbox Square
      page.drawRectangle({
        x: 515,
        y: docY - 2,
        width: 14,
        height: 14,
        color: isVerified ? rgb(0.9, 0.98, 0.92) : rgb(1, 1, 1),
        borderColor: rgb(0.6, 0.6, 0.6),
        borderWidth: 1,
      });

      if (isVerified) {
        page.drawText('X', { x: 519, y: docY, size: 9, font: fontBold, color: rgb(0.05, 0.5, 0.2) });
      }

      // Separator line
      page.drawLine({
        start: { x: 40, y: docY - 8 },
        end: { x: width - 40, y: docY - 8 },
        thickness: 0.5,
        color: rgb(0.9, 0.9, 0.9),
      });

      docY -= 26;
    });

    // Signatures Area
    page.drawText('Prepared By: _____________________', { x: 55, y: 80, size: 9, font: fontRegular, color: rgb(0.3, 0.3, 0.3) });
    page.drawText('Authorized Officer Stamp: _____________________', { x: 300, y: 80, size: 9, font: fontRegular, color: rgb(0.3, 0.3, 0.3) });

    // Footer
    page.drawRectangle({
      x: 0,
      y: 0,
      width,
      height: 40,
      color: rgb(0.96, 0.97, 0.99),
    });
    page.drawText(`Generated by ${agencyName} Visa Management Portal | Strictly Confidential`, {
      x: 40,
      y: 15,
      size: 8,
      font: fontRegular,
      color: rgb(0.4, 0.4, 0.4),
    });

    const pdfBytes = await pdfDoc.save();

    return new Response(Buffer.from(pdfBytes), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="visa-checklist-${visaCase.client_name.replace(/\s+/g, '_')}.pdf"`,
      },
    });
  } catch (err: any) {
    console.error('Visa checklist PDF error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
