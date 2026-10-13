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

    const mapped = allHotels.map((h: any) => ({
      ...h,
      name: h.name || h.hotel_name || '',
      hotel_name: h.hotel_name || h.name || '',
      price_per_night: h.price_per_night ?? h.per_night_rate ?? 0,
      per_night_rate: h.per_night_rate ?? h.price_per_night ?? 0,
      contact_person: h.contact_person || h.contact || '',
      contact: h.contact || h.contact_person || '',
      type: h.type || 'hotel_directory',
    }));

    return NextResponse.json({ hotels: mapped });
  } catch (error: any) {
    console.error('Fetch hotels error:', error);
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
    const name = body.name || body.hotel_name;
    const city = body.city;
    const type = body.type || 'hotel_directory';
    const price = Number(body.price_per_night ?? body.per_night_rate) || 0;
    const contact = body.contact_person || body.contact || '';

    if (!name || !city) {
      return NextResponse.json({ error: 'Name and city required (ہوٹل کا نام اور شہر لازمی ہیں)' }, { status: 400 });
    }

    const id = crypto.randomUUID();
    const [newHotel] = await db
      .insert(hotels)
      .values({
        id,
        agency_id: session.agency_id,
        name: name.trim(),
        hotel_name: name.trim(),
        city: city.trim(),
        type: type || 'hotel_directory',
        price_per_night: price,
        per_night_rate: price,
        contact_person: contact ? contact.trim() : null,
        contact: contact ? contact.trim() : null,
      })
      .returning();

    return NextResponse.json({ success: true, id, hotel: newHotel });
  } catch (error: any) {
    console.error('Create hotel error:', error);
    return NextResponse.json({ error: 'ہوٹل محفوظ کرنے میں خرابی', details: error.message }, { status: 500 });
  }
}
