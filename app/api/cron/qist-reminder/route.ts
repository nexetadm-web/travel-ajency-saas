import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import {
  installment_payments,
  installment_plans,
  pilgrims,
  agencies,
  whatsapp_logs,
} from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { sendWhatsAppMessage } from '@/lib/whatsapp';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const today = dayjs().tz('Asia/Karachi');
    const tomorrowStr = today.add(1, 'day').format('DD-MM-YYYY');

    // Fetch all pending payments
    const pendingPayments = await db
      .select()
      .from(installment_payments)
      .where(eq(installment_payments.status, 'pending'));

    const remindedList = [];

    for (const payment of pendingPayments) {
      if (payment.dueDate === tomorrowStr) {
        const [plan] = await db
          .select()
          .from(installment_plans)
          .where(eq(installment_plans.id, payment.planId))
          .limit(1);

        if (plan) {
          const [pilgrim] = await db
            .select()
            .from(pilgrims)
            .where(eq(pilgrims.id, plan.pilgrimId))
            .limit(1);

          const [agency] = await db
            .select()
            .from(agencies)
            .where(eq(agencies.id, payment.agencyId))
            .limit(1);

          if (pilgrim && agency) {
            const message = `السلام علیکم ${pilgrim.full_name}!
آپ کی عمرہ پیکیج قسط رقم ₨ ${payment.amount.toLocaleString()} کل بروز ${payment.dueDate} کو واجب الادا ہے۔
برائے مہربانی بروقت ادائیگی یقینی بنائیں۔
شکریہ!
${agency.name} | رابطہ: ${agency.phone}`;

            await sendWhatsAppMessage({
              agencyId: agency.id,
              recipientPhone: pilgrim.phone || '03001234567',
              messageType: 'general',
              message,
            });

            remindedList.push({
              pilgrim: pilgrim.full_name,
              amount: payment.amount,
              dueDate: payment.dueDate,
            });
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      timestamp: today.toISOString(),
      remindedCount: remindedList.length,
      reminders: remindedList,
    });
  } catch (err: any) {
    console.error('Qist reminder cron error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
