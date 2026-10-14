import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { agencies } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { verifyPassword, signSessionToken, isSuperAdmin } from '@/lib/auth';

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
        { error: 'پاس ورڈ یا ای میل غلط ہے (Invalid email or password)' },
        { status: 401 }
      );
    }

    // Check if agency is disabled or deleted
    if (agency.status === 'disabled' || agency.status === 'deleted') {
      return NextResponse.json(
        { error: 'آپ کی ایجنسی غیر فعال کر دی گئی ہے، براہ کرم سپورٹ سے رابطہ کریں (Your agency is disabled, contact support)' },
        { status: 403 }
      );
    }

    const isMatch = await verifyPassword(password, agency.password_hash);
    if (!isMatch) {
      return NextResponse.json(
        { error: 'پاس ورڈ یا ای میل غلط ہے (Invalid email or password)' },
        { status: 401 }
      );
    }

    const isSuper = agency.role === 'super_admin' || isSuperAdmin(agency.email);
    const redirectUrl = isSuper ? '/super-admin' : '/dashboard';

    // Update last_login
    try {
      await db
        .update(agencies)
        .set({ last_login: new Date().toISOString() })
        .where(eq(agencies.id, agency.id));
    } catch (err) {
      // Non-blocking
    }

    const token = await signSessionToken({
      agency_id: agency.id,
      name: agency.name,
      email: agency.email,
      role: isSuper ? 'super_admin' : 'agency',
      owner_name: agency.owner_name,
      logo_url: agency.logo_url || undefined,
    });

    const response = NextResponse.json({
      success: true,
      message: 'کامیابی سے لاگ ان ہو گیا',
      redirect: redirectUrl,
      agency: {
        id: agency.id,
        name: agency.name,
        email: agency.email,
        role: isSuper ? 'super_admin' : 'agency',
      },
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
