import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { groups, pilgrims, whatsapp_logs, agencies } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { getSession } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    const agencyId = session?.agency_id || 'test-agency';

    const body = await req.json();
    const {
      group_id,
      airport = 'علامہ اقبال انٹرنیشنل ایئرپورٹ لاہور',
      flight_time = 'کل رات 9:00 بجے',
      bus_no = 'BUS-786',
      custom_note = '',
      location_link = 'https://maps.google.com/?q=Swissotel+Makkah',
    } = body;

    if (!group_id) {
      return NextResponse.json({ error: 'گروپ ID لازمی ہے' }, { status: 400 });
    }

    // Fetch group details
    const [group] = await db
      .select()
      .from(groups)
      .where(and(eq(groups.id, group_id), eq(groups.agency_id, agencyId)))
      .limit(1);

    if (!group) {
      return NextResponse.json({ error: 'گروپ نہیں ملا' }, { status: 404 });
    }

    // Fetch agency details
    const [agency] = await db
      .select()
      .from(agencies)
      .where(eq(agencies.id, agencyId))
      .limit(1);

    const agencyPhone = agency?.phone || '0300-0000000';
    const agencyName = agency?.name || 'Travel Agency';

    // Fetch all pilgrims in this group
    const groupPilgrims = await db
      .select()
      .from(pilgrims)
      .where(and(eq(pilgrims.group_id, group_id), eq(pilgrims.agency_id, agencyId)));

    if (groupPilgrims.length === 0) {
      return NextResponse.json({ error: 'اس گروپ میں کوئی زائر موجود نہیں ہے' }, { status: 400 });
    }

    const logsToInsert = [];
    const sentResults = [];

    for (const p of groupPilgrims) {
      const recipientPhone = p.phone || '03001234567';
      const pilgrimName = p.full_name;

      const message = `السلام علیکم ${pilgrimName}!
گروپ: ${group.group_name}
روانگی: ${flight_time} بمقام ${airport}
مکہ ہوٹل: ${group.makkah_hotel || 'فندق مکہ'}
مدینہ ہوٹل: ${group.madina_hotel || 'فندق مدینہ'}
بس نمبر: ${bus_no}
رابطہ ایجنسی: ${agencyPhone} (${agencyName})
${custom_note ? `نوٹ: ${custom_note}\n` : ''}📍 لائیو لوکیشن: ${location_link}`;

      const logId = crypto.randomUUID();
      logsToInsert.push({
        id: logId,
        agency_id: agencyId,
        recipient_phone: recipientPhone,
        message_type: 'bulk_group_broadcast',
        message: message,
        status: 'sent',
      });

      sentResults.push({
        pilgrim_id: p.id,
        name: pilgrimName,
        phone: recipientPhone,
        status: 'sent',
        message,
      });
    }

    // Batch insert logs
    for (const log of logsToInsert) {
      await db.insert(whatsapp_logs).values(log);
    }

    return NextResponse.json({
      success: true,
      sent_count: groupPilgrims.length,
      group_name: group.group_name,
      results: sentResults,
    });
  } catch (err: any) {
    console.error('Bulk WhatsApp send error:', err);
    return NextResponse.json({ error: err.message || 'پیغام ارسال کرنے میں خرابی' }, { status: 500 });
  }
}
