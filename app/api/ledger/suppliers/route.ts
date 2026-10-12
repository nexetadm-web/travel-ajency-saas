import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { suppliers_ledger, supplier_transactions } from '@/lib/db/schema';
import { getSession } from '@/lib/auth';
import { eq, desc } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getSession();
    if (!session || !session.agency_id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const suppliers = await db
      .select()
      .from(suppliers_ledger)
      .where(eq(suppliers_ledger.agency_id, session.agency_id))
      .orderBy(desc(suppliers_ledger.created_at));

    const allTx = await db
      .select()
      .from(supplier_transactions)
      .where(eq(supplier_transactions.agency_id, session.agency_id))
      .orderBy(desc(supplier_transactions.created_at));

    const txMap: Record<string, typeof allTx> = {};
    allTx.forEach((tx) => {
      if (!txMap[tx.supplier_id]) txMap[tx.supplier_id] = [];
      txMap[tx.supplier_id].push(tx);
    });

    const enriched = suppliers.map((s) => ({
      ...s,
      remaining: (s.total_payable || 0) - (s.total_paid || 0),
      transactions: txMap[s.id] || [],
    }));

    const totalPayable = enriched.reduce((acc, s) => acc + Math.max(0, s.remaining), 0);

    return NextResponse.json({
      suppliers: enriched,
      totalPayable,
    });
  } catch (error: any) {
    return NextResponse.json({ error: 'سپلائرز کھاتہ لانے میں خرابی', details: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session || !session.agency_id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { supplier_name, supplier_type, total_payable, phone } = body;

    if (!supplier_name || !supplier_type) {
      return NextResponse.json({ error: 'سپلائر کا نام اور قسم لازمی ہے' }, { status: 400 });
    }

    const [newSupplier] = await db
      .insert(suppliers_ledger)
      .values({
        agency_id: session.agency_id,
        supplier_name,
        supplier_type,
        total_payable: parseFloat(total_payable) || 0,
        total_paid: 0,
        phone: phone || null,
      })
      .returning();

    return NextResponse.json({ success: true, supplier: newSupplier });
  } catch (error: any) {
    return NextResponse.json({ error: 'سپلائر بنانے میں خرابی', details: error.message }, { status: 500 });
  }
}
