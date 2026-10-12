import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { agencies } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { verifyPassword, signSessionToken } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'براہ کرم ای میل اور پاس ورڈ درج کریں' },
        { status: 400 }
      );
    }

    const trimmedEmail = email.trim().toLowerCase();

    const [agency] = await db
      .select()
      .from(agencies)
      .where(eq(agencies.email, trimmedEmail))
      .limit(1);

    if (!agency) {
      return NextResponse.json(
        { error: 'پاس ورڈ یا ای میل غلط ہے' },
        { status: 401 }
      );
    }

    const isMatch = await verifyPassword(password, agency.password_hash);
    if (!isMatch) {
      return NextResponse.json(
        { error: 'پاس ورڈ یا ای میل غلط ہے' },
        { status: 401 }
      );
    }

    const token = await signSessionToken({
      agency_id: agency.id,
      name: agency.name,
      email: agency.email,
      role: agency.role as 'agency' | 'super_admin',
      owner_name: agency.owner_name,
      logo_url: agency.logo_url || undefined,
    });

    const response = NextResponse.json({
      success: true,
      message: 'کامیابی سے لاگ ان ہو گیا',
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
    console.error('Agency login error:', error);
    return NextResponse.json(
      { error: 'لاگ ان کے دوران خرابی پیش آگئی', details: error.message },
      { status: 500 }
    );
  }
}
