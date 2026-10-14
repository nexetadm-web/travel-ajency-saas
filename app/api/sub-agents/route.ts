import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { subAgents } from '@/lib/db/schema';
import { getSession } from '@/lib/auth';
import { eq, desc } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getSession();
    if (!session || !session.agency_id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const agents = await db
      .select()
      .from(subAgents)
      .where(eq(subAgents.agencyId, session.agency_id))
      .orderBy(desc(subAgents.createdAt));

    return NextResponse.json({ subAgents: agents });
  } catch (error: any) {
    console.error('Fetch sub-agents error:', error);
    return NextResponse.json(
      { error: 'سب ایجنٹس لسٹ حاصل کرنے میں خرابی', details: error.message },
      { status: 500 }
    );
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
      name,
      phone,
      cnic,
      city,
      commissionType,
      commission_type,
      commissionValue,
      commission_value,
    } = body;

    if (!name || !phone) {
      return NextResponse.json(
        { error: 'نام اور فون نمبر لازمی ہیں' },
        { status: 400 }
      );
    }

    const rawType = commissionType || commission_type || 'per_person';
    const isPercent = rawType === 'percent' || rawType === 'percentage';
    const commType = isPercent ? 'percent' : 'per_person';
    const rawVal =
      commissionValue !== undefined && commissionValue !== null
        ? commissionValue
        : commission_value;
    const commVal = parseFloat(rawVal) || (isPercent ? 5 : 5000);

    const [created] = await db
      .insert(subAgents)
      .values({
        agencyId: session.agency_id,
        name: name.trim(),
        phone: phone.trim(),
        cnic: cnic ? cnic.trim() : null,
        city: city ? city.trim() : null,
        commissionType: commType,
        commissionValue: commVal,
        commission_per_haji: isPercent ? 0 : commVal,
        totalPilgrims: 0,
        totalEarned: 0,
        totalPaid: 0,
        remaining: 0,
      })
      .returning();

    return NextResponse.json({ success: true, subAgent: created });
  } catch (error: any) {
    console.error('Create sub-agent error:', error);
    return NextResponse.json(
      { error: 'سب ایجنٹ شامل کرنے میں خرابی', details: error.message },
      { status: 500 }
    );
  }
}
