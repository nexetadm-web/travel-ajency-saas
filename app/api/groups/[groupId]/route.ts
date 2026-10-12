import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { groups, pilgrims } from '@/lib/db/schema';
import { getSession } from '@/lib/auth';
import { eq, and, desc } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ groupId: string }> | { groupId: string } }
) {
  try {
    const session = await getSession();
    if (!session || !session.agency_id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { groupId } = await params;

    const [group] = await db
      .select()
      .from(groups)
      .where(and(eq(groups.id, groupId), eq(groups.agency_id, session.agency_id)))
      .limit(1);

    if (!group) {
      return NextResponse.json({ error: 'گروپ نہیں ملا' }, { status: 404 });
    }

    const groupPilgrims = await db
      .select()
      .from(pilgrims)
      .where(and(eq(pilgrims.group_id, groupId), eq(pilgrims.agency_id, session.agency_id)))
      .orderBy(desc(pilgrims.created_at));

    return NextResponse.json({
      group: {
        ...group,
        booked_seats: groupPilgrims.length,
        available_seats: Math.max(0, (group.total_seats || 0) - groupPilgrims.length),
      },
      pilgrims: groupPilgrims,
    });
  } catch (error: any) {
    console.error('Fetch group details error:', error);
    return NextResponse.json({ error: 'گروپ ڈیٹا حاصل کرنے میں خرابی', details: error.message }, { status: 500 });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ groupId: string }> | { groupId: string } }
) {
  try {
    const session = await getSession();
    if (!session || !session.agency_id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { groupId } = await params;

    const [updated] = await db
      .update(groups)
      .set(body)
      .where(and(eq(groups.id, groupId), eq(groups.agency_id, session.agency_id)))
      .returning();

    return NextResponse.json({ success: true, group: updated });
  } catch (error: any) {
    console.error('Update group error:', error);
    return NextResponse.json({ error: 'گروپ اپ ڈیٹ کرنے میں خرابی', details: error.message }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ groupId: string }> | { groupId: string } }
) {
  try {
    const session = await getSession();
    if (!session || !session.agency_id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { groupId } = await params;

    await db
      .delete(groups)
      .where(and(eq(groups.id, groupId), eq(groups.agency_id, session.agency_id)));

    return NextResponse.json({ success: true, message: 'گروپ حذف کر دیا گیا' });
  } catch (error: any) {
    console.error('Delete group error:', error);
    return NextResponse.json({ error: 'حذف کرنے میں خرابی', details: error.message }, { status: 500 });
  }
}
