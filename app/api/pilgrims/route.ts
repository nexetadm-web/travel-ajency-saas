import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { pilgrims, groups, customers_ledger } from '@/lib/db/schema';
import { getSession } from '@/lib/auth';
import { eq, and, desc, like, or } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const session = await getSession();
    if (!session || !session.agency_id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const groupId = searchParams.get('groupId');
    const query = searchParams.get('q');
    const visaStatus = searchParams.get('visaStatus');

    let baseQuery = db
      .select()
      .from(pilgrims)
      .where(eq(pilgrims.agency_id, session.agency_id))
      .$dynamic();

    const conditions = [eq(pilgrims.agency_id, session.agency_id)];

    if (groupId) {
      conditions.push(eq(pilgrims.group_id, groupId));
    }
    if (visaStatus && visaStatus !== 'all') {
      conditions.push(eq(pilgrims.visa_status, visaStatus));
    }
    if (query && query.trim()) {
      const q = `%${query.trim()}%`;
      conditions.push(
        or(
          like(pilgrims.passport_no, q),
          like(pilgrims.full_name, q),
          like(pilgrims.cnic, q),
          like(pilgrims.phone, q)
        )!
      );
    }

    const allPilgrims = await db
      .select()
      .from(pilgrims)
      .where(and(...conditions))
      .orderBy(desc(pilgrims.created_at));

    return NextResponse.json({ pilgrims: allPilgrims });
  } catch (error: any) {
    console.error('Fetch pilgrims error:', error);
    return NextResponse.json({ error: 'زائرین حاصل کرنے میں خرابی', details: error.message }, { status: 500 });
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
      full_name,
      father_name,
      passport_no,
      passport_expiry,
      cnic,
      phone,
      photo_url,
      passport_scan_url,
      group_id,
      payment_total,
      payment_paid,
    } = body;

    if (!full_name || !passport_no) {
      return NextResponse.json(
        { error: 'نام اور پاسپورٹ نمبر لازمی ہیں' },
        { status: 400 }
      );
    }

    const cleanPassport = passport_no.trim().toUpperCase();

    // Check duplicate passport in this agency
    const [existing] = await db
      .select()
      .from(pilgrims)
      .where(and(eq(pilgrims.passport_no, cleanPassport), eq(pilgrims.agency_id, session.agency_id)))
      .limit(1);

    if (existing) {
      return NextResponse.json(
        { error: 'یہ پاسپورٹ نمبر پہلے سے موجود ہے' },
        { status: 400 }
      );
    }

    const totalVal = parseFloat(payment_total) || 0;
    const paidVal = parseFloat(payment_paid) || 0;

    const [newPilgrim] = await db
      .insert(pilgrims)
      .values({
        agency_id: session.agency_id,
        group_id: group_id || null,
        full_name,
        father_name: father_name || null,
        passport_no: cleanPassport,
        passport_expiry: passport_expiry || null,
        cnic: cnic || null,
        phone: phone || null,
        photo_url: photo_url || null,
        passport_scan_url: passport_scan_url || null,
        visa_status: 'document_pending',
        ticket_status: 'pending',
        hotel_status: 'pending',
        payment_total: totalVal,
        payment_paid: paidVal,
      })
      .returning();

    // Auto-create customer ledger entry for this pilgrim
    await db.insert(customers_ledger).values({
      agency_id: session.agency_id,
      pilgrim_id: newPilgrim.id,
      customer_name: newPilgrim.full_name,
      phone: newPilgrim.phone || null,
      total_payable: totalVal,
      total_paid: paidVal,
      type: 'individual',
    });

    return NextResponse.json({ success: true, pilgrim: newPilgrim });
  } catch (error: any) {
    console.error('Create pilgrim error:', error);
    return NextResponse.json({ error: 'زائر شامل کرنے میں خرابی', details: error.message }, { status: 500 });
  }
}
