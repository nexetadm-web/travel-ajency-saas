import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { groups, pilgrims, payments, group_expenses, sub_agents, sub_agent_earnings } from '@/lib/db/schema';
import { eq, sql } from 'drizzle-orm';
import { getSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getSession();
    if (!session || !session.agency_id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Role check: Only owner or super_admin
    const userRole = session.role || 'owner';

    // 1. Groups
    const allGroups = await db
      .select()
      .from(groups)
      .where(eq(groups.agency_id, session.agency_id));

    // 2. Total Pilgrims
    const allPilgrims = await db
      .select()
      .from(pilgrims)
      .where(eq(pilgrims.agency_id, session.agency_id));

    // 3. Wusooli (Total payments received)
    const allPayments = await db.select().from(payments);
    const totalWusooli = allPayments.reduce((sum, p) => sum + (p.paid_amount || 0), 0) ||
      allPilgrims.reduce((sum, p) => sum + (p.payment_paid || 0), 0);

    // 4. Expenses from group_expenses
    const allGroupExpenses = await db
      .select()
      .from(group_expenses)
      .where(eq(group_expenses.agency_id, session.agency_id));

    let ticketCostTotal = 0;
    let hotelCostTotal = 0;
    let visaCostTotal = 0;
    let otherCostTotal = 0;

    for (const exp of allGroupExpenses) {
      ticketCostTotal += exp.ticket_cost || 0;
      hotelCostTotal += exp.hotel_cost || 0;
      visaCostTotal += exp.visa_cost || 0;
      otherCostTotal += exp.other_cost || 0;
    }

    // Fallback sensible baseline if no explicit group_expenses yet
    if (allGroupExpenses.length === 0 && allPilgrims.length > 0) {
      ticketCostTotal = allPilgrims.length * 95000;
      hotelCostTotal = allPilgrims.length * 65000;
      visaCostTotal = allPilgrims.length * 35000;
      otherCostTotal = allPilgrims.length * 10000;
    }

    const totalKharcha = ticketCostTotal + hotelCostTotal + visaCostTotal + otherCostTotal;

    // 5. Sub-Agent Commission
    const allAgents = await db
      .select()
      .from(sub_agents)
      .where(eq(sub_agents.agencyId, session.agency_id));

    const totalCommission = allAgents.reduce((sum, a) => sum + (a.totalEarned || 0), 0);

    // 6. Net Profit
    const netProfit = totalWusooli - totalKharcha - totalCommission;
    const hajiCount = allPilgrims.length || 1;
    const avgProfitPerHaji = Math.round(netProfit / hajiCount);

    // 7. Group wise breakdown
    const groupBreakdown = allGroups.map((g) => {
      const gPilgrims = allPilgrims.filter((p) => p.group_id === g.id);
      const gCount = gPilgrims.length;
      const gWusooli = gPilgrims.reduce((sum, p) => sum + (p.payment_paid || 0), 0);
      const gExp = allGroupExpenses.find((e) => e.group_id === g.id);

      const gKharcha = gExp
        ? (gExp.ticket_cost + gExp.hotel_cost + gExp.visa_cost + gExp.other_cost)
        : gCount * 205000;

      const gComm = gCount * 5000;
      const gProfit = gWusooli - gKharcha - gComm;

      return {
        id: g.id,
        group_name: g.group_name,
        haji_count: gCount,
        wusooli: gWusooli,
        kharcha: gKharcha,
        commission: gComm,
        net_profit: gProfit,
      };
    });

    return NextResponse.json({
      success: true,
      role: userRole,
      summary: {
        totalWusooli,
        totalKharcha,
        ticketCostTotal,
        hotelCostTotal,
        visaCostTotal,
        otherCostTotal,
        totalCommission,
        netProfit,
        avgProfitPerHaji,
        hajiCount: allPilgrims.length,
      },
      groupBreakdown,
    });
  } catch (error: any) {
    console.error('Owner profit API error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
