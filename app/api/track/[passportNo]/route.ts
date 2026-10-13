import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { pilgrims, groups, agencies, tickets, hotels } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ passportNo: string }> | { passportNo: string } }
) {
  try {
    const { passportNo } = await params;

    if (!passportNo || !passportNo.trim()) {
      return NextResponse.json(
        { error: 'پاسپورٹ نمبر لازمی ہے' },
        { status: 400 }
      );
    }

    const cleanPassport = passportNo.trim().toUpperCase();

    // Fetch pilgrim by passport_no
    const [pilgrim] = await db
      .select()
      .from(pilgrims)
      .where(eq(pilgrims.passport_no, cleanPassport))
      .orderBy(desc(pilgrims.created_at))
      .limit(1);

    if (!pilgrim) {
      return NextResponse.json(
        { error: 'اس پاسپورٹ نمبر کا کوئی ریکارڈ نہیں ملا' },
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

    // Fetch ticket / flight if matching passport or pnr
    const pilgrimTickets = await db
      .select()
      .from(tickets)
      .where(eq(tickets.passport_no, cleanPassport))
      .limit(2);

    // Calculate Payment details
    const total = pilgrim.payment_total || 0;
    const paid = pilgrim.payment_paid || 0;
    const remaining = Math.max(0, total - paid);
    const percentPaid = total > 0 ? Math.min(100, Math.round((paid / total) * 100)) : 0;

    // Mask passport for privacy (e.g. "PK***123")
    const len = cleanPassport.length;
    let maskedPassport = cleanPassport;
    if (len > 4) {
      maskedPassport = cleanPassport.slice(0, 2) + '*'.repeat(len - 4) + cleanPassport.slice(-2);
    }

    // Timeline calculation
    const isDocReceived = true;
    const isVisaProcessing = pilgrim.visa_status === 'in_embassy' || pilgrim.visa_status === 'printed' || pilgrim.visa_status === 'returned';
    const isVisaApproved = pilgrim.visa_status === 'printed' || pilgrim.visa_status === 'returned';
    const isHotelConfirmed = pilgrim.hotel_status === 'confirmed' || !!(group && (group.makkah_hotel || group.madina_hotel));
    const isTicketIssued = pilgrim.ticket_status === 'issued' || pilgrimTickets.length > 0;

    const timeline = [
      {
        step: 1,
        title: 'دستاویزات موصول',
        subtitle: 'پاسپورٹ اور شناختی کوائف کی تصدیق مکمل',
        completed: isDocReceived,
        active: !isVisaProcessing,
      },
      {
        step: 2,
        title: 'ویزا پروسیسنگ',
        subtitle: 'سفارت خانے / منسٹری میں ویزا زیرِ عمل',
        completed: isVisaProcessing,
        active: isVisaProcessing && !isVisaApproved,
      },
      {
        step: 3,
        title: 'ویزا جاری (منظور)',
        subtitle: 'عمرہ / حج الیکٹرانک ویزا جاری ہو گیا',
        completed: isVisaApproved,
        active: isVisaApproved && !isHotelConfirmed,
      },
      {
        step: 4,
        title: 'ہوٹل بکنگ و واؤچر',
        subtitle: group?.makkah_hotel ? `مکہ: ${group.makkah_hotel}` : 'مکہ و مدینہ ہوٹل بکنگ کنفرم',
        completed: isHotelConfirmed,
        active: isHotelConfirmed && !isTicketIssued,
      },
      {
        step: 5,
        title: 'ایئر ٹکٹ جاری',
        subtitle: pilgrimTickets.length > 0 ? `PNR: ${pilgrimTickets[0].pnr} (${pilgrimTickets[0].sector})` : 'پرواز اور سیٹ کنفرمیشن',
        completed: isTicketIssued,
        active: isTicketIssued,
      },
    ];

    return NextResponse.json({
      success: true,
      pilgrim: {
        id: pilgrim.id,
        full_name: pilgrim.full_name,
        father_name: pilgrim.father_name,
        passport_no: maskedPassport,
        raw_passport: pilgrim.passport_no,
        phone: pilgrim.phone,
        visa_status: pilgrim.visa_status,
        ticket_status: pilgrim.ticket_status,
        hotel_status: pilgrim.hotel_status,
      },
      group: group ? {
        id: group.id,
        group_name: group.group_name,
        departure_date: group.departure_date,
        return_date: group.return_date,
        makkah_hotel: group.makkah_hotel,
        madinah_hotel: group.madina_hotel,
        airline: group.airline,
      } : null,
      tickets: pilgrimTickets,
      agency: agency || {
        name: 'ٹراول ایجنسی',
        phone: '0300-1234567',
        address: 'پاکستان',
      },
      payment: {
        total,
        paid,
        remaining,
        percentPaid,
      },
      timeline,
    });
  } catch (error: any) {
    console.error('Tracking API error:', error);
    return NextResponse.json(
      { error: 'ٹریکنگ معلومات حاصل کرنے میں خرابی', details: error.message },
      { status: 500 }
    );
  }
}
