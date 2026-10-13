import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { inventoryItems, inventoryIssues, pilgrims } from '@/lib/db/schema';
import { getSession } from '@/lib/auth';
import { eq, desc, and } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getSession();
    if (!session || !session.agency_id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const items = await db
      .select()
      .from(inventoryItems)
      .where(eq(inventoryItems.agencyId, session.agency_id))
      .orderBy(desc(inventoryItems.createdAt));

    return NextResponse.json({ items });
  } catch (error: any) {
    console.error('Fetch inventory items error:', error);
    return NextResponse.json(
      { error: 'سامان کی فہرست حاصل کرنے میں خرابی', details: error.message },
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
    const { itemName, purchasePrice, stockQty } = body;

    if (!itemName || !itemName.trim()) {
      return NextResponse.json(
        { error: 'سامان کا نام لازمی ہے' },
        { status: 400 }
      );
    }

    const price = parseFloat(purchasePrice) || 0;
    const qty = parseInt(stockQty, 10) || 0;

    const [newItem] = await db
      .insert(inventoryItems)
      .values({
        agencyId: session.agency_id,
        itemName: itemName.trim(),
        purchasePrice: price,
        stockQty: qty,
        issuedQty: 0,
      })
      .returning();

    return NextResponse.json({ success: true, item: newItem });
  } catch (error: any) {
    console.error('Create inventory item error:', error);
    return NextResponse.json(
      { error: 'سامان شامل کرنے میں خرابی', details: error.message },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await getSession();
    if (!session || !session.agency_id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { id, addQty } = body;

    if (!id || typeof addQty !== 'number') {
      return NextResponse.json(
        { error: 'آئی ڈی اور تعداد لازمی ہیں' },
        { status: 400 }
      );
    }

    const [item] = await db
      .select()
      .from(inventoryItems)
      .where(and(eq(inventoryItems.id, id), eq(inventoryItems.agencyId, session.agency_id)))
      .limit(1);

    if (!item) {
      return NextResponse.json({ error: 'سامان نہیں ملا' }, { status: 404 });
    }

    const newStock = Math.max(0, (item.stockQty || 0) + addQty);

    const [updated] = await db
      .update(inventoryItems)
      .set({ stockQty: newStock })
      .where(eq(inventoryItems.id, id))
      .returning();

    return NextResponse.json({ success: true, item: updated });
  } catch (error: any) {
    console.error('Update inventory stock error:', error);
    return NextResponse.json(
      { error: 'سٹاک اپڈیٹ کرنے میں خرابی', details: error.message },
      { status: 500 }
    );
  }
}
