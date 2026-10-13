import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import {
  installment_payments,
  installment_plans,
  pilgrims,
  customer_transactions,
  customers_ledger,
  whatsapp_logs,
  agencies,
} from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { getSession } from '@/lib/auth';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    const agencyId = session?.agency_id || 'test-agency';

    const body = await req.json();
    const { paymentId, method = 'cash', note = '' } = body;

    if (!paymentId) {
      return NextResponse.json({ error: 'ادائیگی ID لازمی ہے' }, { status: 400 });
    }

    const [payment] = await db
      .select()
      .from(installment_payments)
      .where(and(eq(installment_payments.id, paymentId), eq(installment_payments.agencyId, agencyId)))
      .limit(1);

    if (!payment) {
      return NextResponse.json({ error: 'قسط کا ریکارڈ نہیں ملا' }, { status: 404 });
    }

    const [plan] = await db
      .select()
      .from(installment_plans)
      .where(eq(installment_plans.id, payment.planId))
      .limit(1);

    const [pilgrim] = plan?.pilgrimId
      ? await db
          .select()
          .from(pilgrims)
          .where(eq(pilgrims.id, plan.pilgrimId))
          .limit(1)
      : [null];

    const todayStr = dayjs().tz('Asia/Karachi').format('DD-MM-YYYY');
    const receiptNo = 'RCP-QIST-' + Date.now().toString().slice(-6);

    // Update payment record
    await db
      .update(installment_payments)
      .set({
        paidDate: todayStr,
        status: 'paid',
        method,
        receiptNo,
      })
      .where(eq(installment_payments.id, paymentId));

    // Update pilgrim paid amount
    if (pilgrim) {
      const newPaid = (pilgrim.payment_paid || 0) + (payment.amount || 0);
      await db
        .update(pilgrims)
        .set({ payment_paid: newPaid })
        .where(eq(pilgrims.id, pilgrim.id));

      // Customer transaction entry
      const [ledger] = await db
        .select()
        .from(customers_ledger)
        .where(and(eq(customers_ledger.pilgrim_id, pilgrim.id), eq(customers_ledger.agency_id, agencyId)))
        .limit(1);

      if (ledger) {
        await db.insert(customer_transactions).values({
          id: crypto.randomUUID(),
          ledger_id: ledger.id,
          agency_id: agencyId,
          type: 'receive',
          amount: payment.amount,
          date: todayStr,
          method,
          note: `قسط وصولی - ${receiptNo}`,
          receipt_no: receiptNo,
        });

        await db
          .update(customers_ledger)
          .set({ total_paid: (ledger.total_paid || 0) + payment.amount })
          .where(eq(customers_ledger.id, ledger.id));
      }

      // WhatsApp Audit log
      const [agency] = await db
        .select()
        .from(agencies)
        .where(eq(agencies.id, agencyId))
        .limit(1);

      const waMsg = `محترم ${pilgrim.full_name}!
آپ کی قسط رقم ₨ ${payment.amount.toLocaleString()} بذریعہ ${method.toUpperCase()} وصول پا گئی ہے۔
رسید نمبر: ${receiptNo}
تاریخ: ${todayStr}
شکریہ!
${agency?.name || 'Travel Agency'} (رابطہ: ${agency?.phone || '0300-0000000'})`;

      await db.insert(whatsapp_logs).values({
        id: crypto.randomUUID(),
        agency_id: agencyId,
        recipient_phone: pilgrim.phone || '03001234567',
        message_type: 'qist_receipt',
        message: waMsg,
        status: 'sent',
      });
    }

    return NextResponse.json({
      success: true,
      receiptNo,
      paidDate: todayStr,
    });
  } catch (err: any) {
    console.error('Installment payment error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
