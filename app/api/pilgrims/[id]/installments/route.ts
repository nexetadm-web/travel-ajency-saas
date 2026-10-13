import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import {
  installment_plans,
  installment_payments,
  pilgrims,
  agencies,
} from '@/lib/db/schema';
import { eq, and, desc } from 'drizzle-orm';
import { getSession } from '@/lib/auth';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const session = await getSession();
    const agencyId = session?.agency_id || 'test-agency';
    const { id: pilgrimId } = await params;

    const [pilgrim] = await db
      .select()
      .from(pilgrims)
      .where(and(eq(pilgrims.id, pilgrimId), eq(pilgrims.agency_id, agencyId)))
      .limit(1);

    if (!pilgrim) {
      return NextResponse.json({ error: 'زائر نہیں ملا' }, { status: 404 });
    }

    const [plan] = await db
      .select()
      .from(installment_plans)
      .where(and(eq(installment_plans.pilgrimId, pilgrimId), eq(installment_plans.agencyId, agencyId)))
      .orderBy(desc(installment_plans.createdAt))
      .limit(1);

    let payments: any[] = [];
    if (plan) {
      payments = await db
        .select()
        .from(installment_payments)
        .where(eq(installment_payments.planId, plan.id));

      const today = dayjs().tz('Asia/Karachi');

      // Check and update overdue status dynamically
      for (const p of payments) {
        if (p.status === 'pending') {
          // Parse DD-MM-YYYY
          const parts = p.dueDate.split('-');
          if (parts.length === 3) {
            const due = dayjs(`${parts[2]}-${parts[1]}-${parts[0]}`);
            if (due.isValid() && due.isBefore(today, 'day')) {
              p.status = 'overdue';
              await db
                .update(installment_payments)
                .set({ status: 'overdue' })
                .where(eq(installment_payments.id, p.id));
            }
          }
        }
      }
    }

    const totalPaid = payments
      .filter((p) => p.status === 'paid')
      .reduce((s, p) => s + (p.amount || 0), 0) + (plan?.advancePaid || 0);

    const totalAmount = plan?.totalAmount || pilgrim.payment_total || 0;
    const remaining = Math.max(0, totalAmount - totalPaid);
    const overdueCount = payments.filter((p) => p.status === 'overdue').length;

    return NextResponse.json({
      pilgrim,
      plan,
      payments,
      stats: {
        totalAmount,
        advancePaid: plan?.advancePaid || 0,
        totalPaid,
        remaining,
        overdueCount,
        progress: totalAmount > 0 ? Math.min(100, Math.round((totalPaid / totalAmount) * 100)) : 0,
      },
    });
  } catch (err: any) {
    console.error('Installments GET error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const session = await getSession();
    const agencyId = session?.agency_id || 'test-agency';
    const { id: pilgrimId } = await params;

    const body = await req.json();
    const {
      totalAmount,
      advancePaid = 0,
      installmentsCount = 5,
      startDate,
    } = body;

    const [pilgrim] = await db
      .select()
      .from(pilgrims)
      .where(and(eq(pilgrims.id, pilgrimId), eq(pilgrims.agency_id, agencyId)))
      .limit(1);

    if (!pilgrim) {
      return NextResponse.json({ error: 'زائر نہیں ملا' }, { status: 404 });
    }

    const total = Number(totalAmount) || pilgrim.payment_total || 250000;
    const advance = Number(advancePaid) || 0;
    const count = Math.max(1, Number(installmentsCount) || 5);
    const perInstallment = Math.round((total - advance) / count);

    const planId = crypto.randomUUID();

    await db.insert(installment_plans).values({
      id: planId,
      agencyId,
      pilgrimId,
      groupId: pilgrim.group_id,
      totalAmount: total,
      advancePaid: advance,
      installmentsCount: count,
      perInstallment,
      status: 'active',
    });

    // Update pilgrim payment total/paid
    await db
      .update(pilgrims)
      .set({
        payment_total: total,
        payment_paid: advance,
      })
      .where(eq(pilgrims.id, pilgrimId));

    // Generate monthly payment dates (+30 days each) in Asia/Karachi DD-MM-YYYY format
    let currentDate = startDate
      ? dayjs(startDate).tz('Asia/Karachi')
      : dayjs().tz('Asia/Karachi').add(30, 'day');

    for (let i = 1; i <= count; i++) {
      const dueDateStr = currentDate.format('DD-MM-YYYY');
      await db.insert(installment_payments).values({
        id: crypto.randomUUID(),
        planId,
        agencyId,
        dueDate: dueDateStr,
        amount: perInstallment,
        status: 'pending',
      });
      currentDate = currentDate.add(30, 'day');
    }

    return NextResponse.json({ success: true, planId });
  } catch (err: any) {
    console.error('Installments POST error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
