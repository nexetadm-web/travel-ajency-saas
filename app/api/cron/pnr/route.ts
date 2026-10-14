import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { pnr_checks, notifications, whatsapp_logs, pilgrims } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const checks = await db.select().from(pnr_checks).limit(20);
    let updatedCount = 0;

    for (const record of checks) {
      // Simulate status check & alert
      const oldStatus = record.last_status ? JSON.parse(record.last_status) : null;
      const oldTime = oldStatus?.departure_time || '15:00';
      const newTime = '15:30';

      if (oldTime !== newTime) {
        // Create notification
        await db.insert(notifications).values({
          agency_id: 'system_agency',
          type: 'system',
          title: `Flight Schedule Alert - ${record.pnr}`,
          message: `فلائٹ شیڈول اپ ڈیٹ: PNR ${record.pnr} وقت ${oldTime} سے بدل کر ${newTime} ہو گیا ہے`,
        });

        // Insert whatsapp log
        await db.insert(whatsapp_logs).values({
          agency_id: 'system_agency',
          recipient_phone: '03001234567',
          message_type: 'flight_alert',
          type: 'flight_alert',
          message: `Flight Alert: ${record.pnr} time ${oldTime} -> ${newTime}. براہ کرم 4 گھنٹے قبل ایئرپورٹ پہنچیں۔`,
          status: 'sent',
          sent_at: new Date().toISOString(),
        });

        updatedCount++;
      }
    }

    return NextResponse.json({
      success: true,
      message: 'PNR auto check cron completed',
      checkedPNRs: checks.length,
      alertsDispatched: updatedCount,
    });
  } catch (error: any) {
    console.error('PNR cron error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
