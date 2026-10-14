import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { agencies } from '@/lib/db/schema';
import { getSession, isSuperAdmin } from '@/lib/auth';
import { eq } from 'drizzle-orm';

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session || !isSuperAdmin(session.email)) {
      return NextResponse.json({ error: 'Unauthorized Super Admin access' }, { status: 403 });
    }

    const { id } = await params;
    const body = await req.json();

    const [existing] = await db
      .select()
      .from(agencies)
      .where(eq(agencies.id, id))
      .limit(1);

    if (!existing) {
      return NextResponse.json({ error: 'ایجنسی نہیں ملی (Agency not found)' }, { status: 404 });
    }

    const updateData: Record<string, any> = {};

    if (body.status !== undefined) updateData.status = body.status;
    if (body.plan !== undefined) updateData.plan = body.plan;
    if (body.monthly_fee !== undefined) updateData.monthly_fee = Number(body.monthly_fee);
    if (body.name !== undefined) updateData.name = body.name;
    if (body.owner_name !== undefined) updateData.owner_name = body.owner_name;
    if (body.phone !== undefined) updateData.phone = body.phone;
    if (body.city !== undefined) updateData.city = body.city;
    if (body.license_no !== undefined) updateData.license_no = body.license_no;

    const [updated] = await db
      .update(agencies)
      .set(updateData)
      .where(eq(agencies.id, id))
      .returning();

    return NextResponse.json({
      success: true,
      message: 'ایجنسی کامیابی سے اپڈیٹ کر دی گئی ہے',
      agency: updated,
    });
  } catch (error: any) {
    console.error('Update agency error:', error);
    return NextResponse.json({ error: 'ایجنسی اپڈیٹ کرنے میں خرابی', details: error.message }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session || !isSuperAdmin(session.email)) {
      return NextResponse.json({ error: 'Unauthorized Super Admin access' }, { status: 403 });
    }

    const { id } = await params;

    const [existing] = await db
      .select()
      .from(agencies)
      .where(eq(agencies.id, id))
      .limit(1);

    if (!existing) {
      return NextResponse.json({ error: 'ایجنسی نہیں ملی' }, { status: 404 });
    }

    if (existing.role === 'super_admin' || isSuperAdmin(existing.email)) {
      return NextResponse.json(
        { error: 'سپر ایڈمن اکاؤنٹ کو ڈیلیٹ نہیں کیا جا سکتا' },
        { status: 400 }
      );
    }

    await db.delete(agencies).where(eq(agencies.id, id));

    return NextResponse.json({
      success: true,
      message: `ایجنسی "${existing.name}" کامیابی سے ڈیلیٹ کر دی گئی ہے`,
    });
  } catch (error: any) {
    console.error('Delete agency error:', error);
    return NextResponse.json({ error: 'ایجنسی ڈیلیٹ کرنے میں خرابی', details: error.message }, { status: 500 });
  }
}
