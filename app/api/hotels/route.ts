import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { hotels } from '@/lib/db/schema';
import { getSession } from '@/lib/auth';
import { eq, desc } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getSession();
    if (!session || !session.agency_id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const allHotels = await db
      .select()
      .from(hotels)
      .where(eq(hotels.agency_id, session.agency_id))
      .orderBy(desc(hotels.created_at));

    return NextResponse.json({ hotels: allHotels });
  } catch (error: any) {
    return NextResponse.json({ error: 'ہوٹل حاصل کرنے میں خرابی', details: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session || !session.agency_id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { city, hotel_name, per_night_rate, contact } = body;

    if (!city || !hotel_name) {
      return NextResponse.json({ error: 'شہر اور ہوٹل کا نام لازمی ہے' }, { status: 400 });
    }

    const [newHotel] = await db
      .insert(hotels)
      .values({
        agency_id: session.agency_id,
        city,
        hotel_name,
        per_night_rate: parseFloat(per_night_rate) || 0,
        contact: contact || null,
      })
      .returning();

    return NextResponse.json({ success: true, hotel: newHotel });
  } catch (error: any) {
    return NextResponse.json({ error: 'ہوٹل محفوظ کرنے میں خرابی', details: error.message }, { status: 500 });
  }
}
