import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { inventoryIssues, inventoryItems, pilgrims, groups } from '@/lib/db/schema';
import { getSession } from '@/lib/auth';
import { eq, and, desc, inArray } from 'drizzle-orm';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const session = await getSession();
    if (!session || !session.agency_id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const groupId = searchParams.get('groupId');

    let issuesQuery = db
      .select({
        id: inventoryIssues.id,
        agencyId: inventoryIssues.agencyId,
        groupId: inventoryIssues.groupId,
        pilgrimId: inventoryIssues.pilgrimId,
        itemId: inventoryIssues.itemId,
        issuedDate: inventoryIssues.issuedDate,
        returned: inventoryIssues.returned,
        pilgrimName: pilgrims.full_name,
        passportNo: pilgrims.passport_no,
        itemName: inventoryItems.itemName,
      })
      .from(inventoryIssues)
      .leftJoin(pilgrims, eq(inventoryIssues.pilgrimId, pilgrims.id))
      .leftJoin(inventoryItems, eq(inventoryIssues.itemId, inventoryItems.id))
      .where(
        groupId
          ? and(
              eq(inventoryIssues.agencyId, session.agency_id),
              eq(inventoryIssues.groupId, groupId)
            )
          : eq(inventoryIssues.agencyId, session.agency_id)
      )
      .orderBy(desc(inventoryIssues.issuedDate))
      .limit(100);

    const issues = await issuesQuery;

    return NextResponse.json({ issues });
  } catch (error: any) {
    console.error('Fetch inventory issues error:', error);
    return NextResponse.json(
      { error: 'کٹ تقسیم ہسٹری حاصل کرنے میں خرابی', details: error.message },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session || !session.agency_id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { groupId, pilgrimIds, itemIds } = body;

    if (!Array.isArray(pilgrimIds) || pilgrimIds.length === 0) {
      return NextResponse.json(
        { error: 'کم از کم ایک حاجی منتخب کریں' },
        { status: 400 }
      );
    }

    if (!Array.isArray(itemIds) || itemIds.length === 0) {
      return NextResponse.json(
        { error: 'کم از کم ایک سامان / آئٹم منتخب کریں' },
        { status: 400 }
      );
    }

    const todayStr = dayjs().tz('Asia/Karachi').format('DD-MM-YYYY HH:mm');

    // Insert inventory issues
    for (const pilgrimId of pilgrimIds) {
      for (const itemId of itemIds) {
        await db.insert(inventoryIssues).values({
          agencyId: session.agency_id,
          groupId: groupId || null,
          pilgrimId,
          itemId,
          issuedDate: todayStr,
          returned: 0,
        });
      }
    }

    // Update inventory stock for each item
    for (const itemId of itemIds) {
      const [item] = await db
        .select()
        .from(inventoryItems)
        .where(and(eq(inventoryItems.id, itemId), eq(inventoryItems.agencyId, session.agency_id)))
        .limit(1);

      if (item) {
        const qtyToDeduct = pilgrimIds.length;
        const newStock = Math.max(0, (item.stockQty || 0) - qtyToDeduct);
        const newIssued = (item.issuedQty || 0) + qtyToDeduct;

        await db
          .update(inventoryItems)
          .set({
            stockQty: newStock,
            issuedQty: newIssued,
          })
          .where(eq(inventoryItems.id, itemId));
      }
    }

    return NextResponse.json({
      success: true,
      issuedCount: pilgrimIds.length * itemIds.length,
      pilgrimCount: pilgrimIds.length,
    });
  } catch (error: any) {
    console.error('Batch issue inventory error:', error);
    return NextResponse.json(
      { error: 'سامان تقسیم کرنے میں خرابی', details: error.message },
      { status: 500 }
    );
  }
}
