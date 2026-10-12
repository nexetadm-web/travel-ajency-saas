import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { tickets, pilgrims } from '@/lib/db/schema';
import { getSession } from '@/lib/auth';
import { eq, and, desc, like, or } from 'drizzle-orm';
import dayjs from 'dayjs';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const session = await getSession();
    if (!session || !session.agency_id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q');

    const conditions = [eq(tickets.agency_id, session.agency_id)];

    if (query && query.trim()) {
      const q = `%${query.trim()}%`;
      conditions.push(
        or(
          like(tickets.pnr, q),
          like(tickets.passenger_name, q),
          like(tickets.passport_no, q),
          like(tickets.airline, q)
        )!
      );
    }

    const allTickets = await db
      .select()
      .from(tickets)
      .where(and(...conditions))
      .orderBy(desc(tickets.created_at));

    // Calculate Today's Tickets & Month's Profit
    const todayStr = dayjs().format('YYYY-MM-DD');
    const currentMonthStr = dayjs().format('YYYY-MM');

    let todayCount = 0;
    let monthProfit = 0;
    const airlineProfitMap: Record<string, number> = {};

    allTickets.forEach((t) => {
      const profit = (t.sale_rate || 0) - (t.purchase_rate || 0);
      const createdAt = t.created_at || '';

      if (createdAt.startsWith(todayStr) || t.travel_date === todayStr) {
        todayCount++;
      }
      if (createdAt.startsWith(currentMonthStr)) {
        monthProfit += profit;
      }

      const airline = t.airline || 'Other';
      airlineProfitMap[airline] = (airlineProfitMap[airline] || 0) + profit;
    });

    const airlineChartData = Object.entries(airlineProfitMap).map(([airline, profit]) => ({
      airline,
      profit,
    }));

    return NextResponse.json({
      tickets: allTickets,
      stats: {
        todayCount,
        monthProfit,
        totalTickets: allTickets.length,
      },
      airlineChartData,
    });
  } catch (error: any) {
    console.error('Fetch tickets error:', error);
    return NextResponse.json({ error: 'ٹکٹ لانے میں خرابی', details: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session || !session.agency_id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const {
      pnr,
      airline,
      sector,
      passenger_name,
      passport_no,
      purchase_rate,
      sale_rate,
      travel_date,
      return_date,
      status,
    } = body;

    if (!pnr || !airline || !sector || !passenger_name) {
      return NextResponse.json(
        { error: 'براہ کرم تمام ضروری معلومات درج کریں (PNR، ایئرلائن، سیکٹر، مسافر کا نام)' },
        { status: 400 }
      );
    }

    const pRate = parseFloat(purchase_rate) || 0;
    const sRate = parseFloat(sale_rate) || 0;

    const [newTicket] = await db
      .insert(tickets)
      .values({
        agency_id: session.agency_id,
        pnr: pnr.trim().toUpperCase(),
        airline: airline.trim(),
        sector: sector.trim().toUpperCase(),
        passenger_name: passenger_name.trim(),
        passport_no: passport_no ? passport_no.trim().toUpperCase() : null,
        purchase_rate: pRate,
        sale_rate: sRate,
        travel_date: travel_date || null,
        return_date: return_date || null,
        status: status || 'booked',
      })
      .returning();

    // Link pilgrim if passport matches
    if (passport_no) {
      await db
        .update(pilgrims)
        .set({ ticket_status: 'issued' })
        .where(
          and(
            eq(pilgrims.passport_no, passport_no.trim().toUpperCase()),
            eq(pilgrims.agency_id, session.agency_id)
          )
        );
    }

    return NextResponse.json({ success: true, ticket: newTicket });
  } catch (error: any) {
    console.error('Create ticket error:', error);
    return NextResponse.json({ error: 'ٹکٹ محفوظ کرنے میں خرابی', details: error.message }, { status: 500 });
  }
}
