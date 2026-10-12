import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { agencies } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { getSession, hashPassword } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session || !session.agency_id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { name, owner_name, phone, logo_url, license_no, address, password } = body;

    const updateData: Record<string, any> = {};
    if (name) updateData.name = name;
    if (owner_name) updateData.owner_name = owner_name;
    if (phone) updateData.phone = phone;
    if (logo_url !== undefined) updateData.logo_url = logo_url;
    if (license_no !== undefined) updateData.license_no = license_no;
    if (address !== undefined) updateData.address = address;

    if (password && password.trim().length >= 6) {
      updateData.password_hash = await hashPassword(password);
    }

    await db
      .update(agencies)
      .set(updateData)
      .where(eq(agencies.id, session.agency_id));

    const [updated] = await db
      .select({
        id: agencies.id,
        name: agencies.name,
        owner_name: agencies.owner_name,
        email: agencies.email,
        phone: agencies.phone,
        logo_url: agencies.logo_url,
        address: agencies.address,
        license_no: agencies.license_no,
        role: agencies.role,
      })
      .from(agencies)
      .where(eq(agencies.id, session.agency_id))
      .limit(1);

    return NextResponse.json({
      success: true,
      message: 'ایجنسی کی معلومات کامیابی سے محفوظ کر لی گئیں',
      agency: updated,
    });
  } catch (error: any) {
    console.error('Update agency error:', error);
    return NextResponse.json(
      { error: 'ایجنسی اپ ڈیٹ کرنے میں ناکامی', details: error.message },
      { status: 500 }
    );
  }
}
