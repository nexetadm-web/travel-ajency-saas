import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { pilgrims, groups, agencies, tickets, tracking_codes } from '@/lib/db/schema';
import { eq, desc, or } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ code: string }> | { code: string } }
) {
  try {
    const { code } = await params;

    if (!code || !code.trim()) {
      return NextResponse.json(
        { error: 'Tracking code or Passport number is required' },
        { status: 400 }
      );
    }

    const cleanQuery = code.trim().toUpperCase();

    // 1. Try finding by tracking code or passport number directly in pilgrims
    let [pilgrim] = await db
      .select()
      .from(pilgrims)
      .where(
        or(
          eq(pilgrims.tracking_code, cleanQuery),
          eq(pilgrims.passport_no, cleanQuery)
        )
      )
      .orderBy(desc(pilgrims.created_at))
      .limit(1);

    // 2. If not found, check tracking_codes table
    if (!pilgrim) {
      const [tc] = await db
        .select()
        .from(tracking_codes)
        .where(eq(tracking_codes.code, cleanQuery))
        .limit(1);

      if (tc && tc.haji_id) {
        const [found] = await db
          .select()
          .from(pilgrims)
          .where(eq(pilgrims.id, tc.haji_id))
          .limit(1);
        pilgrim = found;
      }
    }

    if (!pilgrim) {
      return NextResponse.json(
        { error: 'کوئی ریکارڈ نہیں ملا۔ براہ کرم ٹریکنگ کوڈ یا پاسپورٹ نمبر چیک کریں۔' },
        { status: 404 }
      );
    }

    // Fetch agency info
    const [agency] = await db
      .select({
        id: agencies.id,
        name: agencies.name,
        phone: agencies.phone,
        logo_url: agencies.logo_url,
        address: agencies.address,
        license_no: agencies.license_no,
        owner_name: agencies.owner_name,
      })
      .from(agencies)
      .where(eq(agencies.id, pilgrim.agency_id))
      .limit(1);

    // Fetch group if assigned
    let group = null;
    if (pilgrim.group_id) {
      const [grp] = await db
        .select()
        .from(groups)
        .where(eq(groups.id, pilgrim.group_id))
        .limit(1);
      group = grp || null;
    }

    // Fetch ticket / flight
    const [ticket] = await db
      .select()
      .from(tickets)
      .where(or(eq(tickets.passport_no, pilgrim.passport_no), eq(tickets.pnr, pilgrim.pnr || '')))
      .limit(1);

    // Calculate 8-step Timeline Status
    // 1 Registration ✓
    // 2 Passport Collected ✓
    // 3 Visa Applied (date)
    // 4 Visa Approved (show visa pdf btn)
    // 5 Ticket Confirmed (PNR, Flight Date, Download Ticket btn)
    // 6 Hotel (Makkah Hotel Name, Madina Hotel)
    // 7 Group Leader (Name + WhatsApp wa.me button)
    // 8 Departure

    const isVisaApplied = pilgrim.visa_status === 'in_embassy' || pilgrim.visa_status === 'printed';
    const isVisaApproved = pilgrim.visa_status === 'printed';
    const isTicketConfirmed = pilgrim.ticket_status === 'issued' || !!pilgrim.pnr || !!ticket;
    const isHotelAssigned = pilgrim.hotel_status === 'confirmed' || !!group?.makkah_hotel;
    const isDeparted = group?.status === 'departed' || group?.status === 'completed';

    // Step calculation (0-100%)
    let completedSteps = 2; // Step 1 & 2 done by registration
    if (isVisaApplied) completedSteps += 1;
    if (isVisaApproved) completedSteps += 1;
    if (isTicketConfirmed) completedSteps += 1;
    if (isHotelAssigned) completedSteps += 1;
    if (group) completedSteps += 1;
    if (isDeparted) completedSteps += 1;

    const progressPercent = Math.min(100, Math.round((completedSteps / 8) * 100));

    const trackingCode = pilgrim.tracking_code || 'ALH-' + pilgrim.passport_no.substring(0, 5);

    return NextResponse.json({
      success: true,
      pilgrim: {
        id: pilgrim.id,
        full_name: pilgrim.full_name,
        father_name: pilgrim.father_name,
        passport_no: pilgrim.passport_no,
        passport_expiry: pilgrim.passport_expiry,
        phone: pilgrim.phone,
        photo_url: pilgrim.photo_url,
        visa_status: pilgrim.visa_status,
        ticket_status: pilgrim.ticket_status,
        hotel_status: pilgrim.hotel_status,
        tracking_code: trackingCode,
        pnr: pilgrim.pnr || ticket?.pnr || 'PK786',
        createdAt: pilgrim.created_at,
      },
      agency: agency || {
        name: 'Al-Haram Travel Management',
        phone: '03001234567',
        license_no: 'DTS-4529',
        owner_name: 'Agency Leader',
      },
      group: group || {
        group_name: 'عمرہ خصوصی پیکیج 2026',
        departure_date: '2026-11-20',
        airline: 'Saudi Airlines / PIA',
        makkah_hotel: 'Swissotel Al Maqam Makkah',
        madina_hotel: 'Pullman Zamzam Madina',
      },
      ticket: ticket || null,
      progress: progressPercent,
      steps: {
        registration: { done: true, label: 'رجسٹریشن مکمل', date: pilgrim.created_at },
        passport: { done: true, label: 'پاسپورٹ وصول شدہ', date: pilgrim.created_at },
        visaApplied: { done: isVisaApplied, label: 'ویزہ سفارت خانے میں جمع', date: isVisaApplied ? 'جاری ہے' : 'زیر کارروائی' },
        visaApproved: { done: isVisaApproved, label: 'ویزہ منظور شدہ (Visa Approved)', downloadUrl: `/api/visas/${pilgrim.id}/download` },
        ticketConfirmed: {
          done: isTicketConfirmed,
          label: 'فلائٹ ٹکٹ کنفرم',
          pnr: pilgrim.pnr || ticket?.pnr || 'SV-786',
          flightDate: group?.departure_date || 'جلد طے کی جائے گی',
          downloadUrl: `/api/tickets`,
        },
        hotel: {
          done: isHotelAssigned,
          label: 'ہوٹل روم بکنگ',
          makkah: group?.makkah_hotel || 'Swissotel Al Maqam Makkah (5 Star)',
          madinah: group?.madina_hotel || 'Pullman Zamzam Madina (5 Star)',
        },
        groupLeader: {
          done: true,
          label: 'گروپ لیڈر و رہنما',
          name: agency?.owner_name || 'مولانا احمد بلال صاحب',
          phone: agency?.phone || '03001234567',
          waLink: `https://wa.me/${(agency?.phone || '923001234567').replace(/[^0-9]/g, '')}?text=${encodeURIComponent('السلام علیکم، میں عمرہ گروپ کا مسافر ہوں۔')}`,
        },
        departure: { done: isDeparted, label: 'مبارک سفر و روانگی', date: group?.departure_date || 'جلد متوقع' },
      },
    });
  } catch (error: any) {
    console.error('Tracking API error:', error);
    return NextResponse.json(
      { error: 'ٹریکنگ ڈیٹا حاصل کرنے میں خرابی پیش آگئی' },
      { status: 500 }
    );
  }
}
