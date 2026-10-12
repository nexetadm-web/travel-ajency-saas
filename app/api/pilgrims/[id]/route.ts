import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { pilgrims, agencies } from '@/lib/db/schema';
import { getSession } from '@/lib/auth';
import { eq, and } from 'drizzle-orm';
import { sendWhatsAppMessage } from '@/lib/whatsapp';

export const dynamic = 'force-dynamic';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const session = await getSession();
    if (!session || !session.agency_id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const [pilgrim] = await db
      .select()
      .from(pilgrims)
      .where(and(eq(pilgrims.id, id), eq(pilgrims.agency_id, session.agency_id)))
      .limit(1);

    if (!pilgrim) {
      return NextResponse.json({ error: 'زائر نہیں ملا' }, { status: 404 });
    }

    return NextResponse.json({ pilgrim });
  } catch (error: any) {
    return NextResponse.json({ error: 'خرابی', details: error.message }, { status: 500 });
  }
}

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
      .from(pilgrims)
      .where(and(eq(pilgrims.id, id), eq(pilgrims.agency_id, session.agency_id)))
      .limit(1);

    if (!existing) {
      return NextResponse.json({ error: 'زائر نہیں ملا' }, { status: 404 });
    }

    const [updated] = await db
      .update(pilgrims)
      .set(body)
      .where(and(eq(pilgrims.id, id), eq(pilgrims.agency_id, session.agency_id)))
      .returning();

    // WhatsApp auto on visa_status='visa_printed' or 'printed'
    if (
      body.visa_status &&
      (body.visa_status === 'printed' || body.visa_status === 'visa_printed') &&
      existing.visa_status !== body.visa_status
    ) {
      if (updated.phone) {
        const [agency] = await db
          .select()
          .from(agencies)
          .where(eq(agencies.id, session.agency_id))
          .limit(1);

        const agencyName = agency?.name || 'Travel Agency';
        const agencyPhone = agency?.phone || '';
        const msg = `السلام علیکم محترم ${updated.full_name}! مبارک ہو، آپ کا ویزہ پرنٹ ہو چکا ہے۔ پاسپورٹ نمبر: ${updated.passport_no}۔ تفصیلات کے لیے رابطہ کریں: ${agencyPhone}۔ شکریہ، ${agencyName}`;

        await sendWhatsAppMessage({
          agencyId: session.agency_id,
          recipientPhone: updated.phone,
          messageType: 'visa_update',
          message: msg,
        });
      }
    }

    return NextResponse.json({ success: true, pilgrim: updated });
  } catch (error: any) {
    console.error('Update pilgrim error:', error);
    return NextResponse.json({ error: 'اپ ڈیٹ میں خرابی', details: error.message }, { status: 500 });
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
      .delete(pilgrims)
      .where(and(eq(pilgrims.id, id), eq(pilgrims.agency_id, session.agency_id)));

    return NextResponse.json({ success: true, message: 'زائر حذف ہو گیا' });
  } catch (error: any) {
    return NextResponse.json({ error: 'حذف کرنے میں خرابی', details: error.message }, { status: 500 });
  }
}
