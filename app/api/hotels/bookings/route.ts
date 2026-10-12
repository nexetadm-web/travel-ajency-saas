import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { hotel_bookings, hotels, groups } from '@/lib/db/schema';
import { getSession } from '@/lib/auth';
import { eq, desc } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getSession();
    if (!session || !session.agency_id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const bookings = await db
      .select({
        id: hotel_bookings.id,
        group_id: hotel_bookings.group_id,
        hotel_id: hotel_bookings.hotel_id,
        check_in: hotel_bookings.check_in,
        check_out: hotel_bookings.check_out,
        total_rooms: hotel_bookings.total_rooms,
        total_beds: hotel_bookings.total_beds,
        total_cost: hotel_bookings.total_cost,
        advance_paid: hotel_bookings.advance_paid,
        created_at: hotel_bookings.created_at,
        hotel_name: hotels.hotel_name,
        city: hotels.city,
        group_name: groups.group_name,
      })
      .from(hotel_bookings)
      .leftJoin(hotels, eq(hotel_bookings.hotel_id, hotels.id))
      .leftJoin(groups, eq(hotel_bookings.group_id, groups.id))
      .where(eq(hotel_bookings.agency_id, session.agency_id))
      .orderBy(desc(hotel_bookings.created_at));

    return NextResponse.json({ bookings });
  } catch (error: any) {
    return NextResponse.json({ error: 'بکنگز حاصل کرنے میں خرابی', details: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session || !session.agency_id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { group_id, hotel_id, check_in, check_out, total_rooms, total_beds, total_cost, advance_paid } = body;

    const [newBooking] = await db
      .insert(hotel_bookings)
      .values({
        agency_id: session.agency_id,
        group_id: group_id || null,
        hotel_id: hotel_id || null,
        check_in: check_in || null,
        check_out: check_out || null,
        total_rooms: parseInt(total_rooms) || 0,
        total_beds: parseInt(total_beds) || 0,
        total_cost: parseFloat(total_cost) || 0,
        advance_paid: parseFloat(advance_paid) || 0,
      })
      .returning();

    return NextResponse.json({ success: true, booking: newBooking });
  } catch (error: any) {
    return NextResponse.json({ error: 'بکنگ محفوظ کرنے میں خرابی', details: error.message }, { status: 500 });
  }
}
