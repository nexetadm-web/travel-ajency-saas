import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { cash_book } from '@/lib/db/schema';
import { eq, and, desc } from 'drizzle-orm';
import { getSession } from '@/lib/auth';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    const agencyId = session?.agency_id || 'test-agency';

    const { searchParams } = new URL(req.url);
    const filterType = searchParams.get('type');
    const filterMethod = searchParams.get('method');
    const filterDate = searchParams.get('date');

    const todayDate = dayjs().tz('Asia/Karachi').format('YYYY-MM-DD');

    const allEntries = await db
      .select()
      .from(cash_book)
      .where(eq(cash_book.agency_id, agencyId))
      .orderBy(desc(cash_book.date), desc(cash_book.created_at));

    // Calculate metrics
    let totalInAllTime = 0;
    let totalOutAllTime = 0;
    let todayIn = 0;
    let todayOut = 0;

    for (const entry of allEntries) {
      const amt = Number(entry.amount) || 0;
      if (entry.type === 'in') {
        totalInAllTime += amt;
        if (entry.date === todayDate) todayIn += amt;
      } else if (entry.type === 'out') {
        totalOutAllTime += amt;
        if (entry.date === todayDate) todayOut += amt;
      }
    }

    const openingBalance = 50000; // Base baseline float
    const cashInHand = openingBalance + totalInAllTime - totalOutAllTime;

    // Last 7 days chart flow data
    const last7DaysMap = new Map<string, { date: string; displayDate: string; in: number; out: number }>();
    for (let i = 6; i >= 0; i--) {
      const d = dayjs().tz('Asia/Karachi').subtract(i, 'day');
      const dStr = d.format('YYYY-MM-DD');
      last7DaysMap.set(dStr, {
        date: dStr,
        displayDate: d.format('DD MMM'),
        in: 0,
        out: 0,
      });
    }

    for (const entry of allEntries) {
      if (last7DaysMap.has(entry.date)) {
        const item = last7DaysMap.get(entry.date)!;
        const amt = Number(entry.amount) || 0;
        if (entry.type === 'in') item.in += amt;
        else if (entry.type === 'out') item.out += amt;
      }
    }

    const dailyFlow = Array.from(last7DaysMap.values());

    // Filter entries for table
    let filtered = allEntries;
    if (filterType && filterType !== 'all') {
      filtered = filtered.filter((e) => e.type === filterType);
    }
    if (filterMethod && filterMethod !== 'all') {
      filtered = filtered.filter((e) => e.method === filterMethod);
    }
    if (filterDate) {
      filtered = filtered.filter((e) => e.date === filterDate);
    }

    return NextResponse.json({
      entries: filtered,
      todayIn,
      todayOut,
      cashInHand,
      openingBalance,
      dailyFlow,
      todayDate,
    });
  } catch (err: any) {
    console.error('Cashbook GET error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    const agencyId = session?.agency_id || 'test-agency';

    const body = await req.json();
    const {
      type, // 'in' | 'out'
      category = 'عمومی',
      amount,
      method = 'cash',
      description = '',
      date,
    } = body;

    if (!type || !amount) {
      return NextResponse.json({ error: 'قسم اور رقم لازمی ہیں' }, { status: 400 });
    }

    const entryDate = date || dayjs().tz('Asia/Karachi').format('YYYY-MM-DD');

    const entryId = crypto.randomUUID();
    await db.insert(cash_book).values({
      id: entryId,
      agency_id: agencyId,
      date: entryDate,
      opening_balance: 0,
      type,
      category,
      amount: Number(amount),
      method,
      description,
      created_by: session?.email || 'Admin',
    });

    return NextResponse.json({ success: true, id: entryId });
  } catch (err: any) {
    console.error('Cashbook POST error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
