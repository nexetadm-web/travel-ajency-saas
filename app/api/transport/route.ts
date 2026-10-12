import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { transport_bookings, groups } from '@/lib/db/schema';
import { getSession } from '@/lib/auth';
import { eq, desc } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getSession();
    if (!session || !session.agency_id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const transportList = await db
      .select({
        id: transport_bookings.id,
        group_id: transport_bookings.group_id,
        type: transport_bookings.type,
        route: transport_bookings.route,
        cost: transport_bookings.cost,
        date: transport_bookings.date,
        created_at: transport_bookings.created_at,
        group_name: groups.group_name,
      })
      .from(transport_bookings)
      .leftJoin(groups, eq(transport_bookings.group_id, groups.id))
      .where(eq(transport_bookings.agency_id, session.agency_id))
      .orderBy(desc(transport_bookings.created_at));

    return NextResponse.json({ transportBookings: transportList });
  } catch (error: any) {
    return NextResponse.json({ error: 'ٹرانسپورٹ حاصل کرنے میں خرابی', details: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session || !session.agency_id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { group_id, type, route, cost, date } = body;

    const [newBooking] = await db
      .insert(transport_bookings)
      .values({
        agency_id: session.agency_id,
        group_id: group_id || null,
        type: type || 'Bus',
        route: route || 'JED-MAK-MAD-JED',
        cost: parseFloat(cost) || 0,
        date: date || null,
      })
      .returning();

    return NextResponse.json({ success: true, booking: newBooking });
  } catch (error: any) {
    return NextResponse.json({ error: 'ٹرانسپورٹ محفوظ کرنے میں خرابی', details: error.message }, { status: 500 });
  }
}
