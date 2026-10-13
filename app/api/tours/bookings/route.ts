import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { tour_bookings, tour_packages } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { getSession } from '@/lib/auth';
import dayjs from 'dayjs';

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    const agencyId = session?.agency_id || 'test-agency';

    const body = await req.json();
    const {
      package_id,
      client_name,
      phone = '',
      cnic = '',
      persons = 1,
      total_amount,
      advance = 0,
      travel_date = '',
    } = body;

    if (!package_id || !client_name) {
      return NextResponse.json({ error: 'پیکیج اور کلائنٹ نام لازمی ہیں' }, { status: 400 });
    }

    const bookingId = crypto.randomUUID();
    const today = dayjs().format('YYYY-MM-DD');

    await db.insert(tour_bookings).values({
      id: bookingId,
      agency_id: agencyId,
      package_id,
      client_name,
      phone,
      cnic,
      persons: Number(persons) || 1,
      total_amount: Number(total_amount) || 0,
      advance: Number(advance) || 0,
      booking_date: today,
      travel_date: travel_date || today,
      status: 'confirmed',
    });

    return NextResponse.json({ success: true, id: bookingId });
  } catch (err: any) {
    console.error('Tour booking POST error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
