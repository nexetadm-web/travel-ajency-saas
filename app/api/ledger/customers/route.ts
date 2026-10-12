import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { customers_ledger, customer_transactions } from '@/lib/db/schema';
import { getSession } from '@/lib/auth';
import { eq, desc } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getSession();
    if (!session || !session.agency_id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const ledgers = await db
      .select()
      .from(customers_ledger)
      .where(eq(customers_ledger.agency_id, session.agency_id))
      .orderBy(desc(customers_ledger.created_at));

    const allTx = await db
      .select()
      .from(customer_transactions)
      .where(eq(customer_transactions.agency_id, session.agency_id))
      .orderBy(desc(customer_transactions.created_at));

    // Group transactions by ledger_id
    const txMap: Record<string, typeof allTx> = {};
    allTx.forEach((tx) => {
      if (!txMap[tx.ledger_id]) txMap[tx.ledger_id] = [];
      txMap[tx.ledger_id].push(tx);
    });

    const enriched = ledgers.map((l) => ({
      ...l,
      remaining: (l.total_payable || 0) - (l.total_paid || 0),
      transactions: txMap[l.id] || [],
    }));

    const totalReceivable = enriched.reduce((acc, l) => acc + Math.max(0, l.remaining), 0);

    return NextResponse.json({
      customers: enriched,
      totalReceivable,
    });
  } catch (error: any) {
    return NextResponse.json({ error: 'کھاتہ لانے میں خرابی', details: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session || !session.agency_id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { customer_name, phone, total_payable, type } = body;

    if (!customer_name) {
      return NextResponse.json({ error: 'گاہک کا نام لازمی ہے' }, { status: 400 });
    }

    const [newLedger] = await db
      .insert(customers_ledger)
      .values({
        agency_id: session.agency_id,
        customer_name,
        phone: phone || null,
        total_payable: parseFloat(total_payable) || 0,
        total_paid: 0,
        type: type || 'individual',
      })
      .returning();

    return NextResponse.json({ success: true, ledger: newLedger });
  } catch (error: any) {
    return NextResponse.json({ error: 'گاہک کھاتہ بنانے میں خرابی', details: error.message }, { status: 500 });
  }
}
