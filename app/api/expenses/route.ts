import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { expenses } from '@/lib/db/schema';
import { getSession } from '@/lib/auth';
import { eq, desc } from 'drizzle-orm';
import dayjs from 'dayjs';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getSession();
    if (!session || !session.agency_id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const allExpenses = await db
      .select()
      .from(expenses)
      .where(eq(expenses.agency_id, session.agency_id))
      .orderBy(desc(expenses.created_at));

    const totalExpense = allExpenses.reduce((acc, e) => acc + (e.amount || 0), 0);

    const categoryBreakdown: Record<string, number> = {};
    allExpenses.forEach((e) => {
      const cat = e.category || 'other';
      categoryBreakdown[cat] = (categoryBreakdown[cat] || 0) + (e.amount || 0);
    });

    return NextResponse.json({
      expenses: allExpenses,
      totalExpense,
      categoryBreakdown,
    });
  } catch (error: any) {
    return NextResponse.json({ error: 'اخراجات حاصل کرنے میں خرابی', details: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session || !session.agency_id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { category, amount, date, description, bill_url } = body;

    const numAmount = parseFloat(amount) || 0;
    if (numAmount <= 0) {
      return NextResponse.json({ error: 'رقم درست درج کریں' }, { status: 400 });
    }

    const [newExpense] = await db
      .insert(expenses)
      .values({
        agency_id: session.agency_id,
        category: category || 'other',
        amount: numAmount,
        date: date || dayjs().format('YYYY-MM-DD'),
        description: description || null,
        bill_url: bill_url || null,
      })
      .returning();

    return NextResponse.json({ success: true, expense: newExpense });
  } catch (error: any) {
    return NextResponse.json({ error: 'خرچہ محفوظ کرنے میں خرابی', details: error.message }, { status: 500 });
  }
}
