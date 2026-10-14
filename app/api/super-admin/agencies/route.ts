import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { agencies } from '@/lib/db/schema';
import { getSession, isSuperAdmin, hashPassword } from '@/lib/auth';
import { eq, desc } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getSession();
    if (!session || !isSuperAdmin(session.email)) {
      return NextResponse.json({ error: 'Unauthorized Super Admin access' }, { status: 403 });
    }

    const allAgencies = await db
      .select({
        id: agencies.id,
        name: agencies.name,
        owner_name: agencies.owner_name,
        email: agencies.email,
        phone: agencies.phone,
        logo_url: agencies.logo_url,
        license_no: agencies.license_no,
        address: agencies.address,
        city: agencies.city,
        status: agencies.status,
        plan: agencies.plan,
        monthly_fee: agencies.monthly_fee,
        last_login: agencies.last_login,
        role: agencies.role,
        created_at: agencies.created_at,
      })
      .from(agencies)
      .orderBy(desc(agencies.created_at));

    // Calculate executive SaaS stats
    const totalAgencies = allAgencies.length;
    const activeAgencies = allAgencies.filter((a) => a.status === 'active' || !a.status).length;
    const disabledAgencies = allAgencies.filter((a) => a.status === 'disabled').length;
    const totalRevenue = allAgencies.reduce(
      (sum, a) => sum + (Number(a.monthly_fee) || 3000),
      0
    );

    return NextResponse.json({
      agencies: allAgencies,
      stats: {
        totalAgencies,
        activeAgencies,
        disabledAgencies,
        totalRevenue,
        pendingAgencies: disabledAgencies,
      },
    });
  } catch (error: any) {
    console.error('Fetch agencies error:', error);
    return NextResponse.json({ error: 'Failed to retrieve agencies' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session || !isSuperAdmin(session.email)) {
      return NextResponse.json({ error: 'Unauthorized Super Admin access' }, { status: 403 });
    }

    const body = await req.json();
    const {
      name,
      owner_name,
      phone,
      email,
      password,
      logo_url,
      license_no,
      address,
      city,
      plan,
      monthly_fee,
    } = body;

    if (!name || !owner_name || !email || !password || !phone) {
      return NextResponse.json(
        { error: 'براہ کرم تمام لازمی فیلڈز پر کریں (نام، مالک کا نام، فون، ای میل، پاس ورڈ)' },
        { status: 400 }
      );
    }

    const trimmedEmail = email.trim().toLowerCase();

    // Check if email already registered
    const [existing] = await db
      .select()
      .from(agencies)
      .where(eq(agencies.email, trimmedEmail))
      .limit(1);

    if (existing) {
      return NextResponse.json(
        { error: 'یہ ای میل پہلے سے کسی ایجنسی میں رجسٹرڈ ہے' },
        { status: 400 }
      );
    }

    const passwordHash = await hashPassword(password);

    const [newAgency] = await db
      .insert(agencies)
      .values({
        name,
        owner_name,
        phone,
        email: trimmedEmail,
        password_hash: passwordHash,
        logo_url: logo_url || null,
        license_no: license_no || null,
        address: address || null,
        city: city || null,
        plan: plan || 'starter',
        monthly_fee: monthly_fee ? Number(monthly_fee) : 3000,
        status: 'active',
        role: 'agency',
      })
      .returning({
        id: agencies.id,
        name: agencies.name,
        owner_name: agencies.owner_name,
        email: agencies.email,
        phone: agencies.phone,
        license_no: agencies.license_no,
        city: agencies.city,
        status: agencies.status,
      });

    return NextResponse.json({
      success: true,
      message: `ایجنسی "${newAgency.name}" کامیابی سے بنا دی گئی ہے`,
      agency: newAgency,
    });
  } catch (error: any) {
    console.error('Agency creation error:', error);
    return NextResponse.json(
      { error: 'ایجنسی بنانے میں خرابی پیش آگئی', details: error.message },
      { status: 500 }
    );
  }
}
