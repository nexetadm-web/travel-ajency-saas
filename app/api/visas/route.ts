import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { visas, pilgrims } from '@/lib/db/schema';
import { getSession } from '@/lib/auth';
import { eq, and, desc } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const session = await getSession();
    if (!session || !session.agency_id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');

    const conditions = [eq(visas.agency_id, session.agency_id)];
    if (status && status !== 'all') {
      conditions.push(eq(visas.status, status));
    }

    const allVisas = await db
      .select()
      .from(visas)
      .where(and(...conditions))
      .orderBy(desc(visas.created_at));

    // Also enrich with pilgrim info if linked
    const agencyPilgrims = await db
      .select()
      .from(pilgrims)
      .where(eq(pilgrims.agency_id, session.agency_id));

    const pilgrimMap = new Map(agencyPilgrims.map((p) => [p.id, p]));
    const pilgrimPassportMap = new Map(agencyPilgrims.map((p) => [p.passport_no.toUpperCase(), p]));

    const enrichedVisas = allVisas.map((v) => {
      const pilgrim = (v.pilgrim_id && pilgrimMap.get(v.pilgrim_id)) || pilgrimPassportMap.get(v.passport_no.toUpperCase());
      return {
        ...v,
        pilgrim_name: pilgrim?.full_name || 'Individual Applicant',
        pilgrim_phone: pilgrim?.phone || null,
        photo_url: pilgrim?.photo_url || null,
      };
    });

    return NextResponse.json({ visas: enrichedVisas });
  } catch (error: any) {
    console.error('Fetch visas error:', error);
    return NextResponse.json({ error: 'ویزہ ڈیٹا لانے میں خرابی', details: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session || !session.agency_id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const {
      passport_no,
      pilgrim_id,
      visa_type,
      submission_date,
      embassy,
      visa_number,
      issue_date,
      expiry_date,
      status,
      agent_fee,
      embassy_fee,
    } = body;

    if (!passport_no) {
      return NextResponse.json({ error: 'پاسپورٹ نمبر درج کریں' }, { status: 400 });
    }

    const [newVisa] = await db
      .insert(visas)
      .values({
        agency_id: session.agency_id,
        passport_no: passport_no.trim().toUpperCase(),
        pilgrim_id: pilgrim_id || null,
        visa_type: visa_type || 'umrah',
        submission_date: submission_date || null,
        embassy: embassy || 'Saudi Embassy Islamabad',
        visa_number: visa_number || null,
        issue_date: issue_date || null,
        expiry_date: expiry_date || null,
        status: status || 'document_pending',
        agent_fee: parseFloat(agent_fee) || 0,
        embassy_fee: parseFloat(embassy_fee) || 0,
      })
      .returning();

    return NextResponse.json({ success: true, visa: newVisa });
  } catch (error: any) {
    console.error('Create visa error:', error);
    return NextResponse.json({ error: 'ویزہ داخل کرنے میں خرابی', details: error.message }, { status: 500 });
  }
}
