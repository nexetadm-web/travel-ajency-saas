import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { groups, pilgrims, hotel_bookings, transport_bookings, visas, tickets, agencies } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { generateGroupProfitPdf, toAsciiSafe } from '@/lib/pdf/generator';

export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ groupId: string }> | { groupId: string } }
) {
  try {
    const { groupId } = await params;

    if (!groupId) {
      return NextResponse.json({ error: 'Group ID is required' }, { status: 400 });
    }

    const [group] = await db
      .select()
      .from(groups)
      .where(eq(groups.id, groupId))
      .limit(1);

    if (!group) {
      return NextResponse.json({ error: 'Group not found' }, { status: 404 });
    }

    // Pilgrims in group
    const groupPilgrims = await db
      .select()
      .from(pilgrims)
      .where(eq(pilgrims.group_id, groupId));

    const totalReceived = groupPilgrims.reduce((acc, p) => acc + (p.payment_paid || 0), 0);

    // Hotels
    const hotelList = await db
      .select()
      .from(hotel_bookings)
      .where(eq(hotel_bookings.group_id, groupId));
    const hotelsCost = hotelList.reduce((acc, h) => acc + (h.total_cost || 0), 0);

    // Transport
    const transportList = await db
      .select()
      .from(transport_bookings)
      .where(eq(transport_bookings.group_id, groupId));
    const transportCost = transportList.reduce((acc, t) => acc + (t.cost || 0), 0);

    // Visas
    const pilgrimIds = groupPilgrims.map((p) => p.id);
    let visasCost = 0;
    if (pilgrimIds.length > 0 && group.agency_id) {
      const allVisas = await db
        .select()
        .from(visas)
        .where(eq(visas.agency_id, group.agency_id));
      const groupVisas = allVisas.filter((v) => v.pilgrim_id && pilgrimIds.includes(v.pilgrim_id));
      visasCost = groupVisas.reduce((acc, v) => acc + (v.embassy_fee || 0) + (v.agent_fee || 0), 0);
    }

    // Tickets
    const passportList = groupPilgrims.map((p) => p.passport_no).filter(Boolean);
    let ticketsCost = 0;
    if (passportList.length > 0 && group.agency_id) {
      const allTickets = await db
        .select()
        .from(tickets)
        .where(eq(tickets.agency_id, group.agency_id));
      const groupTickets = allTickets.filter((t) => t.passport_no && passportList.includes(t.passport_no));
      ticketsCost = groupTickets.reduce((acc, t) => acc + (t.purchase_rate || 0), 0);
    }

    const totalExpenses = ticketsCost + hotelsCost + transportCost + visasCost;
    const netProfit = totalReceived - totalExpenses;

    // Agency branding
    let agency = null;
    if (group.agency_id) {
      const [ag] = await db
        .select()
        .from(agencies)
        .where(eq(agencies.id, group.agency_id))
        .limit(1);
      agency = ag;
    }

    const pdfBytes = await generateGroupProfitPdf({
      agency: {
        name: agency?.name || 'Pyary Travels',
        license_no: agency?.license_no || 'DTS-Reg',
        phone: agency?.phone || '',
        address: agency?.address || '',
        logo_url: agency?.logo_url || null,
      },
      groupName: group.group_name || 'Umrah Group',
      totalReceived,
      ticketsCost,
      hotelsCost,
      transportCost,
      visasCost,
      otherExpenses: 0,
      totalExpenses,
      netProfit,
      pilgrimsCount: groupPilgrims.length,
    });

    const safeFilename = `group-profit-${toAsciiSafe(group.group_name, groupId).replace(/[^a-zA-Z0-9_-]/g, '_')}.pdf`;

    return new Response(Buffer.from(pdfBytes), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${safeFilename}"`,
        'Cache-Control': 'no-store',
      },
    });
  } catch (error: any) {
    console.error('Group profit PDF generation error:', error);
    return NextResponse.json(
      { error: 'Profit PDF generation failed: ' + (error?.message || 'Unknown error') },
      { status: 500 }
    );
  }
}
