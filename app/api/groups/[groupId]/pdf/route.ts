import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { groups, pilgrims, agencies } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ groupId: string }> | { groupId: string } }
) {
  try {
    const { groupId } = await params;

    if (!groupId) {
      return NextResponse.json({ error: 'Group ID is required' }, { status: 400 });
    }

    const [group] = await db
      .select()
      .from(groups)
      .where(eq(groups.id, groupId))
      .limit(1);

    if (!group) {
      return NextResponse.json({ error: 'Group not found' }, { status: 404 });
    }

    const groupPilgrims = await db
      .select()
      .from(pilgrims)
      .where(eq(pilgrims.group_id, groupId))
      .orderBy(desc(pilgrims.created_at));

    // Fetch agency details for header branding
    let agencyName = 'Travel Agency SaaS';
    let agencyPhone = '';
    let agencyLicense = '';
    if (group.agency_id) {
      const [agency] = await db
        .select()
        .from(agencies)
        .where(eq(agencies.id, group.agency_id))
        .limit(1);
      if (agency) {
        agencyName = agency.name || agencyName;
        agencyPhone = agency.phone || '';
        agencyLicense = agency.license_no || '';
      }
    }

    const pdfDoc = await PDFDocument.create();
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);

    const pageWidth = 595.28;
    const pageHeight = 841.89;

    let page = pdfDoc.addPage([pageWidth, pageHeight]);

    // Draw header banner
    page.drawRectangle({
      x: 0,
      y: pageHeight - 90,
      width: pageWidth,
      height: 90,
      color: rgb(0.06, 0.09, 0.16), // #0f172a
    });

    page.drawText('EMBASSY MANIFEST / PILGRIM LIST', {
      x: 36,
      y: pageHeight - 38,
      size: 16,
      font: fontBold,
      color: rgb(1, 1, 1),
    });

    page.drawText(`${agencyName.toUpperCase()} ${agencyLicense ? `| LIC: ${agencyLicense}` : ''} ${agencyPhone ? `| PH: ${agencyPhone}` : ''}`, {
      x: 36,
      y: pageHeight - 58,
      size: 9,
      font: fontRegular,
      color: rgb(0.8, 0.85, 0.95),
    });

    // Group Details Box
    page.drawRectangle({
      x: 36,
      y: pageHeight - 145,
      width: pageWidth - 72,
      height: 44,
      color: rgb(0.97, 0.98, 0.99),
      borderColor: rgb(0.88, 0.91, 0.94),
      borderWidth: 1,
    });

    page.drawText(`GROUP: ${(group.group_name || 'N/A').toUpperCase()}`, {
      x: 48,
      y: pageHeight - 120,
      size: 10,
      font: fontBold,
      color: rgb(0.12, 0.15, 0.2),
    });

    page.drawText(`AIRLINE: ${group.airline || 'N/A'}`, {
      x: 230,
      y: pageHeight - 120,
      size: 9,
      font: fontRegular,
      color: rgb(0.3, 0.35, 0.45),
    });

    page.drawText(`DEPARTURE: ${group.departure_date || 'N/A'}`, {
      x: 350,
      y: pageHeight - 120,
      size: 9,
      font: fontRegular,
      color: rgb(0.3, 0.35, 0.45),
    });

    page.drawText(`TOTAL PILGRIMS: ${groupPilgrims.length}`, {
      x: 48,
      y: pageHeight - 136,
      size: 9,
      font: fontRegular,
      color: rgb(0.3, 0.35, 0.45),
    });

    page.drawText(`DATE GENERATED: ${new Date().toLocaleDateString('en-GB')}`, {
      x: 230,
      y: pageHeight - 136,
      size: 9,
      font: fontRegular,
      color: rgb(0.3, 0.35, 0.45),
    });

    // Table Header function
    const drawTableHeader = (p: any, yPos: number) => {
      p.drawRectangle({
        x: 36,
        y: yPos - 18,
        width: pageWidth - 72,
        height: 22,
        color: rgb(0.12, 0.16, 0.23), // dark table header
      });

      p.drawText('#', { x: 44, y: yPos - 12, size: 8, font: fontBold, color: rgb(1, 1, 1) });
      p.drawText('PILGRIM FULL NAME', { x: 68, y: yPos - 12, size: 8, font: fontBold, color: rgb(1, 1, 1) });
      p.drawText('PASSPORT NO', { x: 250, y: yPos - 12, size: 8, font: fontBold, color: rgb(1, 1, 1) });
      p.drawText('EXPIRY', { x: 370, y: yPos - 12, size: 8, font: fontBold, color: rgb(1, 1, 1) });
      p.drawText('VISA STATUS', { x: 450, y: yPos - 12, size: 8, font: fontBold, color: rgb(1, 1, 1) });
    };

    let currentY = pageHeight - 165;
    drawTableHeader(page, currentY);
    currentY -= 26;

    if (groupPilgrims.length === 0) {
      page.drawText('No pilgrims registered in this group yet.', {
        x: 48,
        y: currentY,
        size: 9,
        font: fontRegular,
        color: rgb(0.5, 0.5, 0.5),
      });
    } else {
      groupPilgrims.forEach((pilgrimRecord: any, index: number) => {
        if (currentY < 60) {
          // Add new page
          page = pdfDoc.addPage([pageWidth, pageHeight]);
          currentY = pageHeight - 40;
          drawTableHeader(page, currentY);
          currentY -= 26;
        }

        // Alternating row background
        if (index % 2 === 0) {
          page.drawRectangle({
            x: 36,
            y: currentY - 5,
            width: pageWidth - 72,
            height: 18,
            color: rgb(0.97, 0.98, 0.99),
          });
        }

        // Row border
        page.drawLine({
          start: { x: 36, y: currentY - 5 },
          end: { x: pageWidth - 36, y: currentY - 5 },
          thickness: 0.5,
          color: rgb(0.9, 0.92, 0.95),
        });

        const safeIndex = `${index + 1}`;
        const safeName = (pilgrimRecord.full_name || 'N/A').toUpperCase().substring(0, 32);
        const safePassport = (pilgrimRecord.passport_no || 'N/A').toUpperCase();
        const safeExpiry = pilgrimRecord.passport_expiry || '-';
        const safeStatus = (pilgrimRecord.visa_status || 'document_pending').replace(/_/g, ' ').toUpperCase();

        page.drawText(safeIndex, { x: 44, y: currentY, size: 8, font: fontRegular, color: rgb(0.2, 0.2, 0.2) });
        page.drawText(safeName, { x: 68, y: currentY, size: 8, font: fontRegular, color: rgb(0.1, 0.1, 0.1) });
        page.drawText(safePassport, { x: 250, y: currentY, size: 8, font: fontBold, color: rgb(0.15, 0.2, 0.3) });
        page.drawText(safeExpiry, { x: 370, y: currentY, size: 8, font: fontRegular, color: rgb(0.3, 0.3, 0.3) });
        page.drawText(safeStatus, { x: 450, y: currentY, size: 8, font: fontBold, color: rgb(0.1, 0.5, 0.3) });

        currentY -= 19;
      });
    }

    // Add footer on all pages
    const pages = pdfDoc.getPages();
    pages.forEach((p, idx) => {
      p.drawLine({
        start: { x: 36, y: 30 },
        end: { x: pageWidth - 36, y: 30 },
        thickness: 0.5,
        color: rgb(0.85, 0.88, 0.92),
      });

      p.drawText(`Official Embassy Manifest | Confidential Document | Generated by ${agencyName}`, {
        x: 36,
        y: 18,
        size: 7.5,
        font: fontRegular,
        color: rgb(0.5, 0.55, 0.6),
      });

      p.drawText(`Page ${idx + 1} of ${pages.length}`, {
        x: pageWidth - 90,
        y: 18,
        size: 7.5,
        font: fontRegular,
        color: rgb(0.5, 0.55, 0.6),
      });
    });

    const pdfBytes = await pdfDoc.save();

    return new Response(Buffer.from(pdfBytes), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="embassy-${group.group_name.replace(/[^a-zA-Z0-9_-]/g, '_') || groupId}.pdf"`,
        'Cache-Control': 'no-store',
      },
    });
  } catch (error: any) {
    console.error('Embassy Manifest PDF generation error:', error);
    return NextResponse.json(
      { error: 'PDF generation failed: ' + (error?.message || 'Unknown error') },
      { status: 500 }
    );
  }
}
