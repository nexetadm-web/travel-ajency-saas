import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { transports, transport_bookings } from '@/lib/db/schema';
import { getSession } from '@/lib/auth';
import { eq, desc } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const session = await getSession();
    if (!session || !session.agency_id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const filterType = searchParams.get('type');

    let allTransports = await db
      .select()
      .from(transports)
      .where(eq(transports.agency_id, session.agency_id))
      .orderBy(desc(transports.created_at));

    if (filterType && filterType !== 'all') {
      allTransports = allTransports.filter((t: any) => t.type?.toLowerCase() === filterType.toLowerCase());
    }

    return NextResponse.json({ transports: allTransports });
  } catch (error: any) {
    console.error('Fetch transports error:', error);
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
    const { type, route, cost } = body;

    const id = crypto.randomUUID();
    const [created] = await db
      .insert(transports)
      .values({
        id,
        agency_id: session.agency_id,
        type: type || 'Bus',
        route: route || 'JED-MAK-MAD-JED',
        cost: Number(cost) || 0,
      })
      .returning();

    return NextResponse.json({ success: true, id, transport: created });
  } catch (error: any) {
    console.error('Create transport error:', error);
    return NextResponse.json({ error: 'ٹرانسپورٹ محفوظ کرنے میں خرابی', details: error.message }, { status: 500 });
  }
}
