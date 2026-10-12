import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { customer_transactions, customers_ledger, supplier_transactions, suppliers_ledger } from '@/lib/db/schema';
import { getSession } from '@/lib/auth';
import { eq, and } from 'drizzle-orm';
import dayjs from 'dayjs';

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session || !session.agency_id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { target, ledger_id, type, amount, method, note, date } = body;

    const numAmount = parseFloat(amount) || 0;
    if (numAmount <= 0) {
      return NextResponse.json({ error: 'رقم درست درج کریں' }, { status: 400 });
    }

    const txDate = date || dayjs().format('YYYY-MM-DD');

    // 1. CUSTOMER TRANSACTION
    if (target === 'customer') {
      const receiptNo = `REC-${Date.now().toString().slice(-6)}-${Math.floor(1000 + Math.random() * 9000)}`;

      const [tx] = await db
        .insert(customer_transactions)
        .values({
          ledger_id,
          agency_id: session.agency_id,
          type: type || 'receive',
          amount: numAmount,
          date: txDate,
          method: method || 'cash',
          note: note || 'Customer payment',
          receipt_no: receiptNo,
        })
        .returning();

      // Update customer ledger total_paid
      const [ledger] = await db
        .select()
        .from(customers_ledger)
        .where(and(eq(customers_ledger.id, ledger_id), eq(customers_ledger.agency_id, session.agency_id)))
        .limit(1);

      if (ledger) {
        const newPaid = (ledger.total_paid || 0) + (type === 'refund' ? -numAmount : numAmount);
        await db
          .update(customers_ledger)
          .set({ total_paid: newPaid })
          .where(eq(customers_ledger.id, ledger_id));
      }

      return NextResponse.json({ success: true, transaction: tx, receiptNo });
    }

    // 2. SUPPLIER TRANSACTION
    if (target === 'supplier') {
      const [tx] = await db
        .insert(supplier_transactions)
        .values({
          supplier_id: ledger_id,
          agency_id: session.agency_id,
          type: type || 'pay',
          amount: numAmount,
          date: txDate,
          method: method || 'bank',
          note: note || 'Supplier payment',
        })
        .returning();

      const [supplier] = await db
        .select()
        .from(suppliers_ledger)
        .where(and(eq(suppliers_ledger.id, ledger_id), eq(suppliers_ledger.agency_id, session.agency_id)))
        .limit(1);

      if (supplier) {
        const newPaid = (supplier.total_paid || 0) + numAmount;
        await db
          .update(suppliers_ledger)
          .set({ total_paid: newPaid })
          .where(eq(suppliers_ledger.id, ledger_id));
      }

      return NextResponse.json({ success: true, transaction: tx });
    }

    return NextResponse.json({ error: 'ہدف درست منتخب کریں (customer یا supplier)' }, { status: 400 });
  } catch (error: any) {
    console.error('Record transaction error:', error);
    return NextResponse.json({ error: 'ٹرانزیکشن ریکارڈ کرنے میں خرابی', details: error.message }, { status: 500 });
  }
}
