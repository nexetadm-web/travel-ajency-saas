import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { visa_cases, visa_case_documents, visa_case_timeline, agencies, whatsapp_logs } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { getSession } from '@/lib/auth';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const session = await getSession();
    const agencyId = session?.agency_id || 'test-agency';
    const { id: caseId } = await params;

    const [visaCase] = await db
      .select()
      .from(visa_cases)
      .where(and(eq(visa_cases.id, caseId), eq(visa_cases.agency_id, agencyId)))
      .limit(1);

    if (!visaCase) {
      return NextResponse.json({ error: 'ویزہ کیس نہیں ملا' }, { status: 404 });
    }

    const documents = await db
      .select()
      .from(visa_case_documents)
      .where(eq(visa_case_documents.case_id, caseId));

    const timeline = await db
      .select()
      .from(visa_case_timeline)
      .where(eq(visa_case_timeline.case_id, caseId));

    return NextResponse.json({
      case: visaCase,
      documents,
      timeline,
    });
  } catch (err: any) {
    console.error('Visa case GET error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const session = await getSession();
    const agencyId = session?.agency_id || 'test-agency';
    const { id: caseId } = await params;

    const body = await req.json();
    const { status, paid, note = '' } = body;

    const [currentCase] = await db
      .select()
      .from(visa_cases)
      .where(and(eq(visa_cases.id, caseId), eq(visa_cases.agency_id, agencyId)))
      .limit(1);

    if (!currentCase) {
      return NextResponse.json({ error: 'ویزہ کیس نہیں ملا' }, { status: 404 });
    }

    const updates: any = {};
    if (status !== undefined) updates.status = status;
    if (paid !== undefined) updates.paid = Number(paid);

    await db
      .update(visa_cases)
      .set(updates)
      .where(eq(visa_cases.id, caseId));

    // Log timeline if status changed
    if (status && status !== currentCase.status) {
      await db.insert(visa_case_timeline).values({
        id: crypto.randomUUID(),
        case_id: caseId,
        status_from: currentCase.status,
        status_to: status,
        note: note || `اسٹیٹس کو "${currentCase.status}" سے تبدیل کر کے "${status}" کر دیا گیا`,
      });

      // AUTO WHATSAPP IF STATUS -> APPROVED
      if (status === 'approved') {
        const [agency] = await db
          .select()
          .from(agencies)
          .where(eq(agencies.id, agencyId))
          .limit(1);

        const agencyName = agency?.name || 'Visa Consultancy';
        const clientPhone = currentCase.phone || '03001234567';

        const approvalMsg = `🎉 مبارک ہو ${currentCase.client_name}!
آپ کا ${currentCase.country} کا ${currentCase.visa_type.toUpperCase()} ویزہ باضابطہ منظور ہو گیا ہے!
پاسپورٹ اور ویزہ دستاویزات وصول کرنے کے لیے ہمارے دفتر تشریف لائیں۔
شکریہ!
${agencyName}
📞 رابطہ: ${agency?.phone || '0300-1234567'}`;

        await db.insert(whatsapp_logs).values({
          id: crypto.randomUUID(),
          agency_id: agencyId,
          recipient_phone: clientPhone,
          message_type: 'visa_approval',
          message: approvalMsg,
          status: 'sent',
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Visa case PATCH error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
