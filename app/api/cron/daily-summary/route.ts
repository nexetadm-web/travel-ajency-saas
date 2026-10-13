import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { agencies, tickets, pilgrims, groups, notifications, cash_book } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { sendWhatsAppMessage } from '@/lib/whatsapp';
import dayjs from 'dayjs';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const todayStr = dayjs().format('YYYY-MM-DD');
    const sixMonthsFromNow = dayjs().add(6, 'month');
    const sevenDaysFromNow = dayjs().add(7, 'day');

    // Fetch all active agencies
    const allAgencies = await db.select().from(agencies);
    const summaryReports: any[] = [];

    for (const agency of allAgencies) {
      // 1. Today's Tickets & Profit
      const agencyTickets = await db
        .select()
        .from(tickets)
        .where(eq(tickets.agency_id, agency.id));

      const todayTickets = agencyTickets.filter(
        (t) => (t.created_at || '').startsWith(todayStr) || t.travel_date === todayStr
      );
      const ticketsCount = todayTickets.length;
      const todayProfit = todayTickets.reduce(
        (sum, t) => sum + ((t.sale_rate || 0) - (t.purchase_rate || 0)),
        0
      );

      // 2. Bonus AI Alert: Check Passport Expiry < 6 months
      const agencyPilgrims = await db
        .select()
        .from(pilgrims)
        .where(eq(pilgrims.agency_id, agency.id));

      for (const p of agencyPilgrims) {
        if (p.passport_expiry) {
          const expiryDate = dayjs(p.passport_expiry);
          if (expiryDate.isValid() && expiryDate.isBefore(sixMonthsFromNow)) {
            // Insert notification
            await db.insert(notifications).values({
              agency_id: agency.id,
              type: 'passport_expiry',
              title: 'پاسپورٹ ایکسپائری الرٹ (AI Alert)',
              message: `زائر ${p.full_name} (${p.passport_no}) کے پاسپورٹ کی میعاد ${p.passport_expiry} کو ختم ہو رہی ہے (6 ماہ سے کم)`,
            });
          }
        }
      }

      // 3. Bonus AI Alert: Group seat alert if departure in 7 days and available_seats > 0
      const agencyGroups = await db
        .select()
        .from(groups)
        .where(eq(groups.agency_id, agency.id));

      for (const g of agencyGroups) {
        if (g.departure_date) {
          const depDate = dayjs(g.departure_date);
          const pilgrimsInGroup = agencyPilgrims.filter((p) => p.group_id === g.id).length;
          const remainingSeats = Math.max(0, (g.total_seats || 0) - pilgrimsInGroup);

          if (depDate.isValid() && depDate.isBefore(sevenDaysFromNow) && depDate.isAfter(dayjs()) && remainingSeats > 0) {
            await db.insert(notifications).values({
              agency_id: agency.id,
              type: 'group_seat',
              title: 'گروپ نشستیں خالی ہیں الرٹ',
              message: `گروپ "${g.group_name}" کی روانگی 7 دنوں میں ہے اور ${remainingSeats} سیٹیں خالی ہیں`,
            });
          }
        }
      }

      // Calculate Cash in Hand from cash_book
      const agencyCashEntries = await db
        .select()
        .from(cash_book)
        .where(eq(cash_book.agency_id, agency.id));

      const totalCashIn = agencyCashEntries.filter(e => e.type === 'in').reduce((s, e) => s + (e.amount || 0), 0);
      const totalCashOut = agencyCashEntries.filter(e => e.type === 'out').reduce((s, e) => s + (e.amount || 0), 0);
      const cashInHand = 50000 + totalCashIn - totalCashOut;

      // 4. Send WhatsApp Daily Summary to Owner with Cash in Hand
      const summaryMsg = `آج کی سمری - [${agency.name}] - کیش ان ہینڈ: PKR ${cashInHand.toLocaleString()} - ٹکٹس ${ticketsCount} - منافع PKR ${todayProfit.toLocaleString()}`;
      if (agency.phone) {
        await sendWhatsAppMessage({
          agencyId: agency.id,
          recipientPhone: agency.phone,
          messageType: 'daily_summary',
          message: summaryMsg,
        });
      }

      summaryReports.push({
        agency: agency.name,
        todayTickets: ticketsCount,
        todayProfit,
      });
    }

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      reports: summaryReports,
    });
  } catch (error: any) {
    console.error('Cron daily summary error:', error);
    return NextResponse.json({ error: 'کرون جاب میں خرابی', details: error.message }, { status: 500 });
  }
}
