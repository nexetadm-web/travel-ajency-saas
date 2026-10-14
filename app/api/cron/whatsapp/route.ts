import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { pilgrims, groups, tickets, installments, agencies } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { sendWhatsApp } from '@/lib/whatsapp';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    let processedCount = 0;
    const now = new Date();
    const tomorrowStr = new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const in3DaysStr = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    // 1. Check groups departing tomorrow or today -> send TICKET alert
    const upcomingGroups = await db.select().from(groups);
    for (const grp of upcomingGroups) {
      if (grp.departure_date && grp.departure_date.startsWith(tomorrowStr)) {
        const groupPilgrims = await db.select().from(pilgrims).where(eq(pilgrims.group_id, grp.id));
        for (const p of groupPilgrims) {
          if (p.phone) {
            await sendWhatsApp(
              p.phone,
              'TICKET',
              {
                name: p.full_name,
                pnr: p.pnr || 'PK786',
                date: grp.departure_date,
                link: `http://localhost:3003/track/${p.tracking_code || p.passport_no}`,
              },
              p.id,
              p.agency_id
            );
            processedCount++;
          }
        }
      }
    }

    // 2. Check installments due in 3 days -> send INSTALLMENT_REMINDER
    const pendingInstallments = await db.select().from(installments).where(eq(installments.status, 'pending'));
    for (const inst of pendingInstallments) {
      if (inst.due_date && (inst.due_date.includes(in3DaysStr) || inst.due_date.startsWith(in3DaysStr))) {
        const [p] = await db.select().from(pilgrims).where(eq(pilgrims.id, inst.haji_id)).limit(1);
        if (p && p.phone) {
          await sendWhatsApp(
            p.phone,
            'INSTALLMENT_REMINDER',
            {
              name: p.full_name,
              amount: `Rs. ${inst.amount}`,
              date: inst.due_date,
            },
            p.id,
            p.agency_id
          );
          processedCount++;
        }
      }
    }

    // 3. Check visa approved (printed) -> send VISA_APPROVED
    const approvedVisas = await db.select().from(pilgrims).where(eq(pilgrims.visa_status, 'printed')).limit(5);
    for (const p of approvedVisas) {
      if (p.phone) {
        await sendWhatsApp(
          p.phone,
          'VISA_APPROVED',
          {
            name: p.full_name,
            link: `http://localhost:3003/track/${p.tracking_code || p.passport_no}`,
          },
          p.id,
          p.agency_id
        );
        processedCount++;
      }
    }

    return NextResponse.json({
      success: true,
      message: 'WhatsApp Autopilot cron completed',
      processed: processedCount,
    });
  } catch (error: any) {
    console.error('WhatsApp cron error:', error);
    return NextResponse.json(
      { error: 'WhatsApp cron failed: ' + (error?.message || 'Unknown error') },
      { status: 500 }
    );
  }
}
