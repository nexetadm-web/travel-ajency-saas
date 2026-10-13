import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { subAgents, pilgrims, cash_book } from '@/lib/db/schema';
import { getSession } from '@/lib/auth';
import { eq, and, desc } from 'drizzle-orm';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

export const dynamic = 'force-dynamic';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const session = await getSession();
    if (!session || !session.agency_id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const [agent] = await db
      .select()
      .from(subAgents)
      .where(and(eq(subAgents.id, id), eq(subAgents.agencyId, session.agency_id)))
      .limit(1);

    if (!agent) {
      return NextResponse.json({ error: 'سب ایجنٹ نہیں ملا' }, { status: 404 });
    }

    const referredPilgrims = await db
      .select()
      .from(pilgrims)
      .where(and(eq(pilgrims.agency_id, session.agency_id), eq(pilgrims.sub_agent_id, id)))
      .orderBy(desc(pilgrims.created_at));

    return NextResponse.json({ subAgent: agent, pilgrims: referredPilgrims });
  } catch (error: any) {
    console.error('Fetch sub-agent detail error:', error);
    return NextResponse.json(
      { error: 'تفصیلات حاصل کرنے میں خرابی', details: error.message },
      { status: 500 }
    );
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const session = await getSession();
    if (!session || !session.agency_id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const { amount, method, receiptNo, notes } = body;

    const payAmount = parseFloat(amount);
    if (!payAmount || payAmount <= 0) {
      return NextResponse.json(
        { error: 'درست رقم درج کریں' },
        { status: 400 }
      );
    }

    const [agent] = await db
      .select()
      .from(subAgents)
      .where(and(eq(subAgents.id, id), eq(subAgents.agencyId, session.agency_id)))
      .limit(1);

    if (!agent) {
      return NextResponse.json({ error: 'سب ایجنٹ نہیں ملا' }, { status: 404 });
    }

    const newPaid = (agent.totalPaid || 0) + payAmount;
    const newRemaining = (agent.totalEarned || 0) - newPaid;

    const [updated] = await db
      .update(subAgents)
      .set({
        totalPaid: newPaid,
        remaining: newRemaining,
      })
      .where(eq(subAgents.id, id))
      .returning();

    const todayStr = dayjs().tz('Asia/Karachi').format('DD-MM-YYYY');

    // Add cashbook transaction
    await db.insert(cash_book).values({
      agency_id: session.agency_id,
      date: todayStr,
      type: 'out',
      category: 'سب ایجنٹ کمیشن ادائیگی',
      amount: payAmount,
      method: method || 'cash',
      description: `سب ایجنٹ ${agent.name} کو کمیشن ادائیگی - رسید: ${receiptNo || 'N/A'}${notes ? ' - ' + notes : ''}`,
      created_by: session.name || 'سسٹم',
    });

    return NextResponse.json({ success: true, subAgent: updated });
  } catch (error: any) {
    console.error('Commission payout error:', error);
    return NextResponse.json(
      { error: 'کمیشن ادائیگی میں خرابی', details: error.message },
      { status: 500 }
    );
  }
}
