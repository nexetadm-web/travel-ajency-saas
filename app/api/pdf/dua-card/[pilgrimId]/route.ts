import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { pilgrims, groups, agencies } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import QRCode from 'qrcode';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ pilgrimId: string }> | { pilgrimId: string } }
) {
  try {
    const { pilgrimId } = await params;

    const [pilgrim] = await db
      .select()
      .from(pilgrims)
      .where(eq(pilgrims.id, pilgrimId))
      .limit(1);

    if (!pilgrim) {
      return NextResponse.json({ error: 'زائر نہیں ملا' }, { status: 404 });
    }

    const [agency] = await db
      .select()
      .from(agencies)
      .where(eq(agencies.id, pilgrim.agency_id))
      .limit(1);

    const [group] = pilgrim.group_id
      ? await db
          .select()
          .from(groups)
          .where(eq(groups.id, pilgrim.group_id))
          .limit(1)
      : [null];

    const host = req.headers.get('host') || 'localhost:3003';
    const proto = req.headers.get('x-forwarded-proto') || 'http';
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || `${proto}://${host}`;
    const verifyUrl = `${appUrl}/verify/pilgrim/${pilgrimId}`;

    // Create PDF Document (A4 size: 595.28 x 841.89)
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595.28, 841.89]);
    const { width, height } = page.getSize();

    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);

    // Header Background banner
    page.drawRectangle({
      x: 0,
      y: height - 120,
      width: width,
      height: 120,
      color: rgb(0.04, 0.45, 0.35), // Emerald / Islamic green
    });

    // Dynamic Agency Name & Title
    const agencyName = (agency?.name || 'AL-HARAM TRAVELS & TOURS').toUpperCase();
    page.drawText(agencyName, {
      x: 40,
      y: height - 50,
      size: 20,
      font: fontBold,
      color: rgb(1, 1, 1),
    });

    page.drawText(`HAJJ & UMRAH PILGRIM DUA CARD & SACRED ITINERARY`, {
      x: 40,
      y: height - 72,
      size: 11,
      font: fontBold,
      color: rgb(0.85, 0.98, 0.9),
    });

    page.drawText(`Govt DTS License: ${agency?.license_no || 'DTS Reg-1234'} | Helplines: ${agency?.phone || '+92 300 1234567'}`, {
      x: 40,
      y: height - 92,
      size: 9,
      font: fontRegular,
      color: rgb(0.85, 0.95, 0.9),
    });

    // Embed QR Code for live verification
    const qrDataUrl = await QRCode.toDataURL(verifyUrl, { margin: 1 });
    const qrImageBytes = Buffer.from(qrDataUrl.split(',')[1], 'base64');
    const qrImage = await pdfDoc.embedPng(qrImageBytes);
    page.drawImage(qrImage, {
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

    // Pilgrim Details Card Container
    page.drawRectangle({
      x: 40,
      y: height - 260,
      width: width - 80,
      height: 125,
      color: rgb(0.96, 0.98, 1.0),
      borderColor: rgb(0.8, 0.88, 0.96),
      borderWidth: 1.5,
    });

    // Pilgrim Info Header
    page.drawText('PILGRIM & FLIGHT ITINERARY', {
      x: 55,
      y: height - 150,
      size: 11,
      font: fontBold,
      color: rgb(0.1, 0.2, 0.4),
    });

    const col1X = 55;
    const col2X = 300;
    let infoY = height - 172;

    page.drawText(`Pilgrim Name: ${pilgrim.full_name}`, { x: col1X, y: infoY, size: 10, font: fontBold, color: rgb(0.1, 0.1, 0.1) });
    page.drawText(`Group: ${group?.group_name || 'Individual Umrah Package'}`, { x: col2X, y: infoY, size: 9, font: fontRegular, color: rgb(0.1, 0.1, 0.1) });

    infoY -= 20;
    page.drawText(`Passport No: ${pilgrim.passport_no}`, { x: col1X, y: infoY, size: 10, font: fontBold, color: rgb(0.04, 0.45, 0.35) });
    page.drawText(`Airline: ${group?.airline || 'Saudi Airlines / PIA'}`, { x: col2X, y: infoY, size: 9, font: fontRegular, color: rgb(0.1, 0.1, 0.1) });

    infoY -= 20;
    page.drawText(`CNIC / ID: ${pilgrim.cnic || 'N/A'} | Phone: ${pilgrim.phone || 'N/A'}`, { x: col1X, y: infoY, size: 9, font: fontRegular, color: rgb(0.2, 0.2, 0.2) });
    page.drawText(`Makkah Hotel: ${group?.makkah_hotel || 'Swissotel / Pullman Zamzam'}`, { x: col2X, y: infoY, size: 9, font: fontBold, color: rgb(0.1, 0.1, 0.1) });

    infoY -= 20;
    page.drawText(`Visa Status: ${pilgrim.visa_status?.toUpperCase() || 'PRINTED'}`, { x: col1X, y: infoY, size: 9, font: fontBold, color: rgb(0.04, 0.45, 0.35) });
    page.drawText(`Madina Hotel: ${group?.madina_hotel || 'Dallah Taibah / Anwar Al Madinah'}`, { x: col2X, y: infoY, size: 9, font: fontBold, color: rgb(0.1, 0.1, 0.1) });

    // SACRED DUAS SECTION HEADER
    page.drawRectangle({
      x: 40,
      y: height - 305,
      width: width - 80,
      height: 32,
      color: rgb(0.94, 0.97, 0.95),
      borderColor: rgb(0.7, 0.85, 0.75),
      borderWidth: 1,
    });

    page.drawText('SACRED DUAS FOR PILGRIMAGE (DUAS IN ARABIC & ENGLISH GUIDE)', {
      x: 55,
      y: height - 290,
      size: 10,
      font: fontBold,
      color: rgb(0.04, 0.45, 0.35),
    });

    // DUA 1: NIYYAH & TALBIYAH
    let duaY = height - 335;
    page.drawText('1. DUA FOR IHRAM & TALBIYAH (Niyyah & Talbiyah):', { x: 50, y: duaY, size: 10, font: fontBold, color: rgb(0.1, 0.2, 0.4) });
    duaY -= 16;
    page.drawText('Labbaik Allahumma Umratan. Labbaik Allahumma Labbaik, Labbaika Laa Shareeka Laka Labbaik,', { x: 50, y: duaY, size: 9, font: fontRegular, color: rgb(0.2, 0.2, 0.2) });
    duaY -= 14;
    page.drawText('Innal Hamda Wan Ni\'mata Laka Wal Mulk, Laa Shareeka Lak.', { x: 50, y: duaY, size: 9, font: fontRegular, color: rgb(0.2, 0.2, 0.2) });
    duaY -= 14;
    page.drawText('Translation: Here I am, O Allah, here I am. Here I am, You have no partner, here I am.', { x: 50, y: duaY, size: 8, font: fontRegular, color: rgb(0.4, 0.4, 0.4) });

    // DUA 2: TAWAF DUA
    duaY -= 25;
    page.drawText('2. DUA FOR TAWAF (Circumambulating the Holy Kaabah):', { x: 50, y: duaY, size: 10, font: fontBold, color: rgb(0.1, 0.2, 0.4) });
    duaY -= 16;
    page.drawText('Subhan-Allahi Wal-Hamdu Lillahi Wa Laa Ilaha Illa-Allahu Wallahu Akbar,', { x: 50, y: duaY, size: 9, font: fontRegular, color: rgb(0.2, 0.2, 0.2) });
    duaY -= 14;
    page.drawText('Wa La Hawla Wa La Quwwata Illa Billahil Aliyyil Azeem.', { x: 50, y: duaY, size: 9, font: fontRegular, color: rgb(0.2, 0.2, 0.2) });
    duaY -= 14;
    page.drawText('Between Yemeni Corner & Black Stone: Rabbana Aatina Fid Dunya Hasanatan Wa Fil Aakhirati Hasanatan Wa Qina Azaban Naar.', { x: 50, y: duaY, size: 8, font: fontRegular, color: rgb(0.4, 0.4, 0.4) });

    // DUA 3: SA\'I DUA
    duaY -= 25;
    page.drawText('3. DUA FOR SA\'I (Between Safa & Marwah):', { x: 50, y: duaY, size: 10, font: fontBold, color: rgb(0.1, 0.2, 0.4) });
    duaY -= 16;
    page.drawText('Innas-Safa Wal-Marwata Min Sha\'a\'irillah. Abda\'u Bima Bada\' Allahu Bih.', { x: 50, y: duaY, size: 9, font: fontRegular, color: rgb(0.2, 0.2, 0.2) });
    duaY -= 14;
    page.drawText('Allahu Akbar, Allahu Akbar, Allahu Akbar. La Ilaha Illallah Wahdahu La Shareeka Lah,', { x: 50, y: duaY, size: 9, font: fontRegular, color: rgb(0.2, 0.2, 0.2) });
    duaY -= 14;
    page.drawText('Lahul Mulku Wa Lahul Hamdu Wa Huwa \'Ala Kulli Shay\'in Qadeer.', { x: 50, y: duaY, size: 9, font: fontRegular, color: rgb(0.2, 0.2, 0.2) });

    // DUA 4: ROZA-E-RASOOL SALUTATION
    duaY -= 25;
    page.drawText('4. SALUTATIONS AT ROZA-E-RASOOL (SAWW) IN MADINAH:', { x: 50, y: duaY, size: 10, font: fontBold, color: rgb(0.1, 0.2, 0.4) });
    duaY -= 16;
    page.drawText('Assalamu \'Alaika Ya Rasool Allah, Assalamu \'Alaika Ya Habeeb Allah,', { x: 50, y: duaY, size: 9, font: fontRegular, color: rgb(0.2, 0.2, 0.2) });
    duaY -= 14;
    page.drawText('Assalamu \'Alaika Ya Sayyidil Mursaleen Wa Khaatamun-Nabiyyeen.', { x: 50, y: duaY, size: 9, font: fontRegular, color: rgb(0.2, 0.2, 0.2) });
    duaY -= 14;
    page.drawText('Peace be upon you O Messenger of Allah, the Beloved of Allah and the Seal of the Prophets.', { x: 50, y: duaY, size: 8, font: fontRegular, color: rgb(0.4, 0.4, 0.4) });

    // FOOTER AGENCY BRANDING
    page.drawRectangle({
      x: 0,
      y: 0,
      width: width,
      height: 45,
      color: rgb(0.95, 0.96, 0.98),
      borderColor: rgb(0.85, 0.88, 0.92),
      borderWidth: 1,
    });

    page.drawText(`Official Pilgrim Card - Issued by ${agencyName} | Emergency Saudi Desk: ${agency?.phone || '+92 300 1234567'}`, {
      x: 40,
      y: 24,
      size: 8,
      font: fontBold,
      color: rgb(0.3, 0.3, 0.3),
    });

    page.drawText(`Verify authentic registration online at: ${verifyUrl}`, {
      x: 40,
      y: 12,
      size: 7,
      font: fontRegular,
      color: rgb(0.4, 0.5, 0.6),
    });

    const pdfBytes = await pdfDoc.save();

    return new Response(Buffer.from(pdfBytes), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="dua-card-${pilgrim.passport_no}.pdf"`,
        'Cache-Control': 'public, max-age=60',
      },
    });
  } catch (err: any) {
    console.error('Dua Card PDF generation error:', err);
    return NextResponse.json({ error: err.message || 'PDF جنریٹ کرنے میں خرابی ہوئی' }, { status: 500 });
  }
}
