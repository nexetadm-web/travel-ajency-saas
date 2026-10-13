import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { tour_bookings, tour_packages, agencies } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import QRCode from 'qrcode';

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
      return NextResponse.json({ error: 'بکنگ نہیں ملی' }, { status: 404 });
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

    const agencyName = (agency?.name || 'EXPLORE TRAVELS & TOURS').toUpperCase();
    page.drawText(agencyName, {
      x: 40,
      y: height - 50,
      size: 20,
      font: fontBold,
      color: rgb(1, 1, 1),
    });

    page.drawText(`OFFICIAL HOLIDAY TOUR VOUCHER & BOOKING CONFIRMATION`, {
      x: 40,
      y: height - 72,
      size: 11,
      font: fontBold,
      color: rgb(0.85, 0.95, 1),
    });

    page.drawText(`License: ${agency?.license_no || 'DTS-4421'} | 24/7 Helpline: ${agency?.phone || '+92 300 1234567'}`, {
      x: 40,
      y: height - 92,
      size: 9,
      font: fontRegular,
      color: rgb(0.85, 0.92, 0.98),
    });

    // Embed QR code
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
    page.drawText(`Lead Passenger: ${booking.client_name}`, { x: 55, y: rowY, size: 10, font: fontBold, color: rgb(0.1, 0.1, 0.1) });
    page.drawText(`Tour Package: ${pkg?.package_name || 'Northern Areas Tour'}`, { x: 300, y: rowY, size: 10, font: fontBold, color: rgb(0.08, 0.45, 0.65) });

    rowY -= 20;
    page.drawText(`Phone: ${booking.phone || 'N/A'} | CNIC: ${booking.cnic || 'N/A'}`, { x: 55, y: rowY, size: 9, font: fontRegular, color: rgb(0.2, 0.2, 0.2) });
    page.drawText(`Destination: ${pkg?.destination || 'Hunza & Skardu'} (${pkg?.duration_days || 5} Days)`, { x: 300, y: rowY, size: 9, font: fontRegular, color: rgb(0.2, 0.2, 0.2) });

    rowY -= 20;
    page.drawText(`Total Persons: ${booking.persons} Adult(s)`, { x: 55, y: rowY, size: 9, font: fontBold, color: rgb(0.1, 0.1, 0.1) });
    page.drawText(`Departure Date: ${booking.travel_date || 'Scheduled'}`, { x: 300, y: rowY, size: 9, font: fontBold, color: rgb(0.1, 0.1, 0.1) });

    rowY -= 20;
    page.drawText(`Booking Reference: #${booking.id.slice(0, 8).toUpperCase()}`, { x: 55, y: rowY, size: 9, font: fontRegular, color: rgb(0.3, 0.3, 0.3) });
    page.drawText(`Tour Type: ${pkg?.type?.toUpperCase() || 'DOMESTIC'} PACKAGE`, { x: 300, y: rowY, size: 9, font: fontBold, color: rgb(0.08, 0.45, 0.65) });

    // FINANCIAL HISAB SUMMARY BOX
    page.drawRectangle({
      x: 40,
      y: height - 340,
      width: width - 80,
      height: 65,
      color: rgb(0.98, 0.99, 0.98),
      borderColor: rgb(0.85, 0.92, 0.88),
      borderWidth: 1,
    });

    page.drawText('PAYMENT & FINANCIAL SUMMARY', { x: 55, y: height - 290, size: 10, font: fontBold, color: rgb(0.1, 0.5, 0.3) });

    const totalAmt = booking.total_amount || 0;
    const advance = booking.advance || 0;
    const remaining = Math.max(0, totalAmt - advance);

    page.drawText(`Total Package Cost: PKR ${totalAmt.toLocaleString()}`, { x: 55, y: height - 312, size: 9, font: fontRegular, color: rgb(0.2, 0.2, 0.2) });
    page.drawText(`Advance Received: PKR ${advance.toLocaleString()}`, { x: 230, y: height - 312, size: 9, font: fontBold, color: rgb(0.1, 0.5, 0.3) });
    page.drawText(`Balance Due: PKR ${remaining.toLocaleString()}`, { x: 400, y: height - 312, size: 9, font: fontBold, color: remaining > 0 ? rgb(0.8, 0.2, 0.2) : rgb(0.1, 0.5, 0.3) });

    // TOUR INCLUSIONS & ITINERARY
    page.drawRectangle({
      x: 40,
      y: height - 440,
      width: width - 80,
      height: 85,
      color: rgb(0.98, 0.98, 0.99),
      borderColor: rgb(0.9, 0.9, 0.95),
      borderWidth: 1,
    });

    page.drawText('PACKAGE INCLUSIONS & SERVICES:', { x: 55, y: height - 370, size: 10, font: fontBold, color: rgb(0.1, 0.2, 0.4) });
    page.drawText(`• Includes: ${pkg?.includes || 'Luxury Accommodation, Private 4x4 Transportation, Daily Breakfast & Professional Guide'}`, {
      x: 55,
      y: height - 390,
      size: 9,
      font: fontRegular,
      color: rgb(0.2, 0.2, 0.2),
    });
    page.drawText('• Support: Dedicated local coordinator available throughout the tour trip.', {
      x: 55,
      y: height - 408,
      size: 9,
      font: fontRegular,
      color: rgb(0.3, 0.3, 0.3),
    });
    page.drawText('• Instructions: Please report at departure point 30 minutes prior to scheduled departure.', {
      x: 55,
      y: height - 425,
      size: 9,
      font: fontRegular,
      color: rgb(0.3, 0.3, 0.3),
    });

    // STAMP & FOOTER
    page.drawText('Agency Operations Manager: ______________________', { x: 55, y: 70, size: 9, font: fontRegular, color: rgb(0.3, 0.3, 0.3) });
    page.drawText('Authorized Booking Seal: [ VALID VOUCHER ]', { x: 330, y: 70, size: 9, font: fontBold, color: rgb(0.08, 0.45, 0.65) });

    page.drawRectangle({
      x: 0,
      y: 0,
      width,
      height: 40,
      color: rgb(0.96, 0.97, 0.99),
    });

    page.drawText(`Issued by ${agencyName} | Verified Tour Operations | Hotline: ${agency?.phone || '0300-1234567'}`, {
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
        'Content-Disposition': `inline; filename="tour-voucher-${booking.client_name.replace(/\s+/g, '_')}.pdf"`,
      },
    });
  } catch (err: any) {
    console.error('Tour voucher PDF error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
