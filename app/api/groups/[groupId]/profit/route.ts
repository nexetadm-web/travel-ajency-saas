import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { groups, pilgrims, hotel_bookings, transport_bookings, visas, tickets } from '@/lib/db/schema';
import { getSession } from '@/lib/auth';
import { eq, and } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ groupId: string }> | { groupId: string } }
) {
  try {
    const session = await getSession();
    if (!session || !session.agency_id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { groupId } = await params;

    const [group] = await db
      .select()
      .from(groups)
      .where(and(eq(groups.id, groupId), eq(groups.agency_id, session.agency_id)))
      .limit(1);

    if (!group) {
      return NextResponse.json({ error: 'گروپ نہیں ملا' }, { status: 404 });
    }

    // 1. Pilgrims in group & Total Received
    const groupPilgrims = await db
      .select()
      .from(pilgrims)
      .where(and(eq(pilgrims.group_id, groupId), eq(pilgrims.agency_id, session.agency_id)));

    const totalReceived = groupPilgrims.reduce((acc, p) => acc + (p.payment_paid || 0), 0);
    const totalExpected = groupPilgrims.reduce((acc, p) => acc + (p.payment_total || 0), 0);

    // 2. Hotel Bookings Cost
    const hotelList = await db
      .select()
      .from(hotel_bookings)
      .where(and(eq(hotel_bookings.group_id, groupId), eq(hotel_bookings.agency_id, session.agency_id)));

    const hotelsCost = hotelList.reduce((acc, h) => acc + (h.total_cost || 0), 0);

    // 3. Transport Bookings Cost
    const transportList = await db
      .select()
      .from(transport_bookings)
      .where(and(eq(transport_bookings.group_id, groupId), eq(transport_bookings.agency_id, session.agency_id)));

    const transportCost = transportList.reduce((acc, t) => acc + (t.cost || 0), 0);

    // 4. Visa Fees
    const pilgrimIds = groupPilgrims.map((p) => p.id);
    let visasCost = 0;
    if (pilgrimIds.length > 0) {
      const allVisas = await db
        .select()
        .from(visas)
        .where(eq(visas.agency_id, session.agency_id));

      const groupVisas = allVisas.filter((v) => v.pilgrim_id && pilgrimIds.includes(v.pilgrim_id));
      visasCost = groupVisas.reduce((acc, v) => acc + (v.embassy_fee || 0) + (v.agent_fee || 0), 0);
    }

    // 5. Tickets Purchase Cost for group pilgrims
    const passportList = groupPilgrims.map((p) => p.passport_no).filter(Boolean);
    let ticketsCost = 0;
    if (passportList.length > 0) {
      const allTickets = await db
        .select()
        .from(tickets)
        .where(eq(tickets.agency_id, session.agency_id));

      const groupTickets = allTickets.filter((t) => t.passport_no && passportList.includes(t.passport_no));
      ticketsCost = groupTickets.reduce((acc, t) => acc + (t.purchase_rate || 0), 0);
    }

    const totalExpenses = ticketsCost + hotelsCost + transportCost + visasCost;
    const netProfit = totalReceived - totalExpenses;

    return NextResponse.json({
      group,
      pilgrimsCount: groupPilgrims.length,
      financials: {
        totalReceived,
        totalExpected,
        ticketsCost,
        hotelsCost,
        transportCost,
        visasCost,
        totalExpenses,
        netProfit,
      },
    });
  } catch (error: any) {
    console.error('Calculate group profit error:', error);
    return NextResponse.json({ error: 'منافع کا حساب کرنے میں خرابی', details: error.message }, { status: 500 });
  }
}
