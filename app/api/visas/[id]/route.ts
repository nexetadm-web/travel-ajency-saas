import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { visas, pilgrims, agencies } from '@/lib/db/schema';
import { getSession } from '@/lib/auth';
import { eq, and } from 'drizzle-orm';
import { sendWhatsAppMessage } from '@/lib/whatsapp';

export const dynamic = 'force-dynamic';

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const session = await getSession();
    if (!session || !session.agency_id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();

    const [existing] = await db
      .select()
      .from(visas)
      .where(and(eq(visas.id, id), eq(visas.agency_id, session.agency_id)))
      .limit(1);

    if (!existing) {
      return NextResponse.json({ error: 'ویزہ نہیں ملا' }, { status: 404 });
    }

    const [updated] = await db
      .update(visas)
      .set(body)
      .where(and(eq(visas.id, id), eq(visas.agency_id, session.agency_id)))
      .returning();

    // If status changed to 'printed', update linked pilgrim and send WhatsApp
    if (body.status === 'printed' && existing.status !== 'printed') {
      const [pilgrim] = await db
        .select()
        .from(pilgrims)
        .where(
          and(
            eq(pilgrims.passport_no, updated.passport_no),
            eq(pilgrims.agency_id, session.agency_id)
          )
        )
        .limit(1);

      if (pilgrim) {
        await db
          .update(pilgrims)
          .set({ visa_status: 'printed' })
          .where(eq(pilgrims.id, pilgrim.id));

        if (pilgrim.phone) {
          const [agency] = await db
            .select()
            .from(agencies)
            .where(eq(agencies.id, session.agency_id))
            .limit(1);

          const agencyName = agency?.name || 'Travel Agency';
          const agencyPhone = agency?.phone || '';
          const msg = `السلام علیکم محترم ${pilgrim.full_name}! مبارک ہو، آپ کا ویزہ پرنٹ ہو چکا ہے۔ پاسپورٹ: ${pilgrim.passport_no}۔ ویزہ نمبر: ${updated.visa_number || 'جاری شدہ'}۔ رابطہ: ${agencyPhone}۔ شکریہ، ${agencyName}`;

          await sendWhatsAppMessage({
            agencyId: session.agency_id,
            recipientPhone: pilgrim.phone,
            messageType: 'visa_update',
            message: msg,
          });
        }
      }
    }

    return NextResponse.json({ success: true, visa: updated });
  } catch (error: any) {
    console.error('Update visa error:', error);
    return NextResponse.json({ error: 'ویزہ اپ ڈیٹ میں خرابی', details: error.message }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const session = await getSession();
    if (!session || !session.agency_id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    await db
      .delete(visas)
      .where(and(eq(visas.id, id), eq(visas.agency_id, session.agency_id)));

    return NextResponse.json({ success: true, message: 'ویزہ حذف کر دیا گیا' });
  } catch (error: any) {
    return NextResponse.json({ error: 'حذف کرنے میں خرابی', details: error.message }, { status: 500 });
  }
}
