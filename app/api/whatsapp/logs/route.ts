import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { whatsapp_logs } from '@/lib/db/schema';
import { getSession } from '@/lib/auth';
import { eq, desc } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getSession();
    if (!session || !session.agency_id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const logs = await db
      .select()
      .from(whatsapp_logs)
      .where(eq(whatsapp_logs.agency_id, session.agency_id))
      .orderBy(desc(whatsapp_logs.created_at))
      .limit(50);

    return NextResponse.json({ logs });
  } catch (error: any) {
    return NextResponse.json({ error: 'لاگز لانے میں خرابی', details: error.message }, { status: 500 });
  }
}
