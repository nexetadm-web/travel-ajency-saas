import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { pilgrims, groups, customers_ledger, subAgents } from '@/lib/db/schema';
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
      sub_agent_id,
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
    const trackingCode = 'ALH-' + Math.floor(10000 + Math.random() * 90000);

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
        sub_agent_id: sub_agent_id || null,
        tracking_code: trackingCode,
        pnr: body.pnr || null,
        passport_scan_data: body.passport_scan_data ? JSON.stringify(body.passport_scan_data) : null,
      })
      .returning();

    // Auto-create tracking_codes record
    try {
      const { tracking_codes, payments, sub_agent_earnings } = await import('@/lib/db/schema');
      await db.insert(tracking_codes).values({
        haji_id: newPilgrim.id,
        code: trackingCode,
      });

      // Auto-create payments record
      await db.insert(payments).values({
        haji_id: newPilgrim.id,
        total_amount: totalVal,
        paid_amount: paidVal,
        remaining: Math.max(0, totalVal - paidVal),
      });

      // If sub-agent attached, create sub_agent_earnings record
      if (sub_agent_id) {
        await db.insert(sub_agent_earnings).values({
          sub_agent_id,
          haji_id: newPilgrim.id,
          amount: 5000,
          paid: 0,
        });
      }
    } catch (e) {
      console.error('Tracking or payments insert notice:', e);
    }

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

    // If sub-agent is attached, update commission and count
    if (sub_agent_id) {
      const [agent] = await db
        .select()
        .from(subAgents)
        .where(and(eq(subAgents.id, sub_agent_id), eq(subAgents.agencyId, session.agency_id)))
        .limit(1);

      if (agent) {
        let earnedCommission = 0;
        if (agent.commissionType === 'percent') {
          earnedCommission = (totalVal * (agent.commissionValue || 0)) / 100;
        } else {
          earnedCommission = (agent.commission_per_haji || agent.commissionValue || 5000);
        }

        const newTotalPilgrims = (agent.totalPilgrims || 0) + 1;
        const newTotalEarned = (agent.totalEarned || 0) + earnedCommission;
        const newRemaining = newTotalEarned - (agent.totalPaid || 0);

        await db
          .update(subAgents)
          .set({
            totalPilgrims: newTotalPilgrims,
            totalEarned: newTotalEarned,
            remaining: newRemaining,
          })
          .where(eq(subAgents.id, sub_agent_id));
      }
    }

    return NextResponse.json({ success: true, pilgrim: newPilgrim, tracking_code: trackingCode });
  } catch (error: any) {
    console.error('Create pilgrim error:', error);
    return NextResponse.json({ error: 'زائر شامل کرنے میں خرابی', details: error.message }, { status: 500 });
  }
}
