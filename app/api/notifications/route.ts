import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { notifications } from '@/lib/db/schema';
import { getSession } from '@/lib/auth';
import { eq, desc } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getSession();
    if (!session || !session.agency_id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const items = await db
      .select()
      .from(notifications)
      .where(eq(notifications.agency_id, session.agency_id))
      .orderBy(desc(notifications.created_at))
      .limit(20);

    return NextResponse.json({ notifications: items });
  } catch (error: any) {
    return NextResponse.json({ error: 'اطلاعات لانے میں خرابی', details: error.message }, { status: 500 });
  }
}
