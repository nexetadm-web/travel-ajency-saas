import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { groups, pilgrims } from '@/lib/db/schema';
import { getSession } from '@/lib/auth';
import { eq, desc } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getSession();
    if (!session || !session.agency_id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const agencyGroups = await db
      .select()
      .from(groups)
      .where(eq(groups.agency_id, session.agency_id))
      .orderBy(desc(groups.created_at));

    // Get pilgrims count per group for real-time occupancy
    const allPilgrims = await db
      .select({ id: pilgrims.id, group_id: pilgrims.group_id })
      .from(pilgrims)
      .where(eq(pilgrims.agency_id, session.agency_id));

    const pilgrimCounts: Record<string, number> = {};
    allPilgrims.forEach((p) => {
      if (p.group_id) {
        pilgrimCounts[p.group_id] = (pilgrimCounts[p.group_id] || 0) + 1;
      }
    });

    const enrichedGroups = agencyGroups.map((g) => {
      const bookedCount = pilgrimCounts[g.id] || 0;
      const totalSeats = g.total_seats || 0;
      const availableSeats = Math.max(0, totalSeats - bookedCount);
      return {
        ...g,
        booked_seats: bookedCount,
        available_seats: availableSeats,
      };
    });

    return NextResponse.json({ groups: enrichedGroups });
  } catch (error: any) {
    console.error('Fetch groups error:', error);
    return NextResponse.json({ error: 'گروپس لانے میں خرابی', details: error.message }, { status: 500 });
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
      group_name,
      departure_date,
      return_date,
      airline,
      total_seats,
      makkah_hotel,
      madina_hotel,
      price_per_person,
    } = body;

    if (!group_name) {
      return NextResponse.json({ error: 'گروپ کا نام لازمی ہے' }, { status: 400 });
    }

    const seats = parseInt(total_seats) || 0;

    const [newGroup] = await db
      .insert(groups)
      .values({
        agency_id: session.agency_id,
        group_name,
        departure_date: departure_date || null,
        return_date: return_date || null,
        airline: airline || null,
        total_seats: seats,
        available_seats: seats,
        status: 'open',
        makkah_hotel: makkah_hotel || null,
        madina_hotel: madina_hotel || null,
        price_per_person: parseFloat(price_per_person) || 0,
      })
      .returning();

    return NextResponse.json({ success: true, group: newGroup });
  } catch (error: any) {
    console.error('Create group error:', error);
    return NextResponse.json({ error: 'نیا گروپ بنانے میں خرابی', details: error.message }, { status: 500 });
  }
}
