import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { agencies } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { getSession, isSuperAdmin, signSessionToken } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session || !isSuperAdmin(session.email)) {
      return NextResponse.json({ error: 'Unauthorized Super Admin access' }, { status: 403 });
    }

    const { agency_id } = await req.json();

    if (!agency_id) {
      return NextResponse.json({ error: 'Agency ID is required' }, { status: 400 });
    }

    const [targetAgency] = await db
      .select()
      .from(agencies)
      .where(eq(agencies.id, agency_id))
      .limit(1);

    if (!targetAgency) {
      return NextResponse.json({ error: 'Agency not found' }, { status: 404 });
    }

    // Sign session token impersonating target agency
    const token = await signSessionToken({
      agency_id: targetAgency.id,
      name: targetAgency.name,
      email: targetAgency.email,
      role: 'agency',
      owner_name: targetAgency.owner_name,
      logo_url: targetAgency.logo_url || undefined,
    });

    const response = NextResponse.json({
      success: true,
      message: `لاگ ان بحیثیت "${targetAgency.name}" کامیابی سے ہو گیا`,
      redirect: '/dashboard',
    });

    response.cookies.set('travel_saas_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 30 * 24 * 60 * 60,
    });

    return response;
  } catch (error: any) {
    console.error('Impersonate error:', error);
    return NextResponse.json({ error: 'Impersonation failed', details: error.message }, { status: 500 });
  }
}
