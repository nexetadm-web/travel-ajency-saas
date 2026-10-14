import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { agencies } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { getSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getSession();

    if (!session || !session.agency_id) {
      return NextResponse.json(
        { error: 'Unauthorized: Session not found' },
        { status: 401 }
      );
    }

    const [agency] = await db
      .select({
        id: agencies.id,
        name: agencies.name,
        owner_name: agencies.owner_name,
        email: agencies.email,
        phone: agencies.phone,
        logo_url: agencies.logo_url,
        address: agencies.address,
        license_no: agencies.license_no,
        city: agencies.city,
        status: agencies.status,
        plan: agencies.plan,
        monthly_fee: agencies.monthly_fee,
        role: agencies.role,
        created_at: agencies.created_at,
      })
      .from(agencies)
      .where(eq(agencies.id, session.agency_id))
      .limit(1);

    if (!agency) {
      return NextResponse.json(
        { error: 'Agency not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ agency });
  } catch (error: any) {
    console.error('Fetch agency error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch agency info', details: error.message },
      { status: 500 }
    );
  }
}
