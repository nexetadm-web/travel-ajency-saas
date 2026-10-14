import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { tour_bookings, tour_packages, agencies } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import QRCode from 'qrcode';

export const dynamic = 'force-dynamic';

function toAsciiSafe(str: string | null | undefined, fallback = 'N/A'): string {
  if (!str) return fallback;
  const cleaned = str.replace(/[^\x20-\x7E]/g, '').trim();
  return cleaned.length > 0 ? cleaned : fallback;
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ bookingId: string }> | { bookingId: string } }
) {
  try {
    const { bookingId } = await params;

    const [booking] = await db
      .select()
      .from(tour_bookings)
      .where(eq(tour_bookings.id, bookingId))
      .limit(1);

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    const [pkg] = await db
      .select()
      .from(tour_packages)
      .where(eq(tour_packages.id, booking.package_id))
      .limit(1);

    const [agency] = await db
      .select()
      .from(agencies)
      .where(eq(agencies.id, booking.agency_id))
      .limit(1);

    const host = req.headers.get('host') || 'localhost:3003';
    const proto = req.headers.get('x-forwarded-proto') || 'http';
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || `${proto}://${host}`;
    const verifyUrl = `${appUrl}/verify/booking/${bookingId}`;

    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595.28, 841.89]);
    const { width, height } = page.getSize();

    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);

    // Header Background banner
    page.drawRectangle({
      x: 0,
      y: height - 120,
      width,
      height: 120,
      color: rgb(0.08, 0.45, 0.65), // Ocean Tour Blue
    });

    const agencyName = toAsciiSafe(agency?.name, 'EXPLORE TRAVELS AND TOURS').toUpperCase();
    page.drawText(agencyName, {
      x: 40,
      y: height - 50,
      size: 18,
      font: fontBold,
      color: rgb(1, 1, 1),
    });

    page.drawText(`OFFICIAL HOLIDAY TOUR VOUCHER AND BOOKING CONFIRMATION`, {
      x: 40,
      y: height - 72,
      size: 10,
      font: fontBold,
      color: rgb(0.85, 0.95, 1),
    });

    const agencyPhone = toAsciiSafe(agency?.phone, '+92 300 1234567');
    const agencyLic = toAsciiSafe(agency?.license_no, 'DTS-4421');
    page.drawText(`License: ${agencyLic} | 24/7 Helpline: ${agencyPhone}`, {
      x: 40,
      y: height - 92,
      size: 8.5,
      font: fontRegular,
      color: rgb(0.85, 0.92, 0.98),
    });

    // Embed QR code
    try {
      const qrDataUrl = await QRCode.toDataURL(verifyUrl, { margin: 1 });
      const qrBytes = Buffer.from(qrDataUrl.split(',')[1], 'base64');
      const qrImg = await pdfDoc.embedPng(qrBytes);
      page.drawImage(qrImg, {
        x: width - 115,
        y: height - 105,
        width: 80,
        height: 80,
      });
      page.drawText('Scan to Verify', {
        x: width - 110,
        y: height - 115,
        size: 7,
        font: fontBold,
        color: rgb(1, 1, 1),
      });
    } catch {
      // QR optional
    }

    // Client & Tour Package Box
    page.drawRectangle({
      x: 40,
      y: height - 260,
      width: width - 80,
      height: 125,
      color: rgb(0.96, 0.98, 1),
      borderColor: rgb(0.8, 0.88, 0.96),
      borderWidth: 1.5,
    });

    page.drawText('TOUR BOOKING DETAILS', {
      x: 55,
      y: height - 150,
      size: 11,
      font: fontBold,
      color: rgb(0.08, 0.45, 0.65),
    });

    let rowY = height - 172;
    const clientName = toAsciiSafe(booking.client_name, 'LEAD PASSENGER').toUpperCase();
    const packageName = toAsciiSafe(pkg?.package_name, 'Holiday Tour Package');
    page.drawText(`Lead Passenger: ${clientName}`, { x: 55, y: rowY, size: 9.5, font: fontBold, color: rgb(0.1, 0.1, 0.1) });
    page.drawText(`Tour Package: ${packageName}`, { x: 300, y: rowY, size: 9.5, font: fontBold, color: rgb(0.08, 0.45, 0.65) });

    rowY -= 20;
    const clientPhone = toAsciiSafe(booking.phone, 'N/A');
    const clientCnic = toAsciiSafe(booking.cnic, 'N/A');
    const destination = toAsciiSafe(pkg?.destination, 'Northern Pakistan');
    const durationDays = pkg?.duration_days || 5;
    page.drawText(`Phone: ${clientPhone} | CNIC: ${clientCnic}`, { x: 55, y: rowY, size: 8.5, font: fontRegular, color: rgb(0.2, 0.2, 0.2) });
    page.drawText(`Destination: ${destination} (${durationDays} Days)`, { x: 300, y: rowY, size: 8.5, font: fontRegular, color: rgb(0.2, 0.2, 0.2) });

    rowY -= 20;
    const travelDate = toAsciiSafe(booking.travel_date, 'Scheduled on Confirmation');
    page.drawText(`Total Persons: ${booking.persons || 1} Adult(s)`, { x: 55, y: rowY, size: 8.5, font: fontBold, color: rgb(0.1, 0.1, 0.1) });
    page.drawText(`Departure Date: ${travelDate}`, { x: 300, y: rowY, size: 8.5, font: fontBold, color: rgb(0.1, 0.1, 0.1) });

    rowY -= 20;
    const bookingRef = booking.id.slice(0, 8).toUpperCase();
    const pkgType = toAsciiSafe(pkg?.type, 'DOMESTIC').toUpperCase();
    page.drawText(`Booking Reference: #${bookingRef}`, { x: 55, y: rowY, size: 8.5, font: fontRegular, color: rgb(0.3, 0.3, 0.3) });
    page.drawText(`Tour Type: ${pkgType} PACKAGE`, { x: 300, y: rowY, size: 8.5, font: fontBold, color: rgb(0.08, 0.45, 0.65) });

    // FINANCIAL SUMMARY BOX
    page.drawRectangle({
      x: 40,
      y: height - 340,
      width: width - 80,
      height: 65,
      color: rgb(0.98, 0.99, 0.98),
      borderColor: rgb(0.85, 0.92, 0.88),
      borderWidth: 1,
    });

    page.drawText('PAYMENT AND FINANCIAL SUMMARY', { x: 55, y: height - 290, size: 9.5, font: fontBold, color: rgb(0.1, 0.5, 0.3) });

    const totalAmt = booking.total_amount || 0;
    const advance = booking.advance || 0;
    const remaining = Math.max(0, totalAmt - advance);

    page.drawText(`Total Package Cost: PKR ${totalAmt.toLocaleString()}`, { x: 55, y: height - 312, size: 8.5, font: fontRegular, color: rgb(0.2, 0.2, 0.2) });
    page.drawText(`Advance Received: PKR ${advance.toLocaleString()}`, { x: 230, y: height - 312, size: 8.5, font: fontBold, color: rgb(0.1, 0.5, 0.3) });
    page.drawText(`Balance Due: PKR ${remaining.toLocaleString()}`, { x: 400, y: height - 312, size: 8.5, font: fontBold, color: remaining > 0 ? rgb(0.8, 0.2, 0.2) : rgb(0.1, 0.5, 0.3) });

    // TOUR INCLUSIONS & INSTRUCTIONS
    page.drawRectangle({
      x: 40,
      y: height - 440,
      width: width - 80,
      height: 85,
      color: rgb(0.98, 0.98, 0.99),
      borderColor: rgb(0.9, 0.9, 0.95),
      borderWidth: 1,
    });

    const includesText = toAsciiSafe(pkg?.includes, 'Luxury Accommodation, Private 4x4 Transportation, Daily Breakfast, Guide');
    page.drawText('PACKAGE INCLUSIONS AND SERVICES:', { x: 55, y: height - 370, size: 9.5, font: fontBold, color: rgb(0.1, 0.2, 0.4) });
    page.drawText(`Includes: ${includesText}`, {
      x: 55,
      y: height - 390,
      size: 8,
      font: fontRegular,
      color: rgb(0.2, 0.2, 0.2),
    });
    page.drawText('Support: Dedicated local tour coordinator available throughout the journey.', {
      x: 55,
      y: height - 408,
      size: 8,
      font: fontRegular,
      color: rgb(0.3, 0.3, 0.3),
    });
    page.drawText('Instructions: Please report at departure point 30 minutes prior to scheduled departure.', {
      x: 55,
      y: height - 425,
      size: 8,
      font: fontRegular,
      color: rgb(0.3, 0.3, 0.3),
    });

    // STAMP & FOOTER
    page.drawText('Agency Operations Manager: ______________________', { x: 55, y: 70, size: 8.5, font: fontRegular, color: rgb(0.3, 0.3, 0.3) });
    page.drawText('Authorized Seal: [ VALID VOUCHER ]', { x: 330, y: 70, size: 8.5, font: fontBold, color: rgb(0.08, 0.45, 0.65) });

    page.drawRectangle({
      x: 0,
      y: 0,
      width,
      height: 40,
      color: rgb(0.96, 0.97, 0.99),
    });

    page.drawText(`Issued by ${agencyName} | Verified Tour Operations | Helpline: ${agencyPhone}`, {
      x: 40,
      y: 15,
      size: 7.5,
      font: fontRegular,
      color: rgb(0.4, 0.4, 0.4),
    });

    const pdfBytes = await pdfDoc.save();

    return new Response(Buffer.from(pdfBytes), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="tour-voucher-${bookingRef}.pdf"`,
      },
    });
  } catch (err: any) {
    console.error('Tour voucher PDF error:', err);
    return NextResponse.json({ error: 'PDF generation failed: ' + (err?.message || 'Unknown error') }, { status: 500 });
  }
}
