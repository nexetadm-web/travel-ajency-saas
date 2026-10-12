import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { agencies } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { isSuperAdmin, hashPassword, verifyPassword, signSessionToken } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'ای میل اور پاس ورڈ درج کریں' },
        { status: 400 }
      );
    }

    const trimmedEmail = email.trim().toLowerCase();

    // Verify if email is in SUPER_ADMIN_EMAILS
    if (!isSuperAdmin(trimmedEmail)) {
      return NextResponse.json(
        { error: 'رسائی ممنوع ہے: یہ ای میل سپر ایڈمن نہیں ہے' },
        { status: 403 }
      );
    }

    // Check if super admin exists in DB
    const [existing] = await db
      .select()
      .from(agencies)
      .where(eq(agencies.email, trimmedEmail))
      .limit(1);

    let superAdminRow = existing;

    if (!existing) {
      // Auto-register super admin with the provided password
      const passwordHash = await hashPassword(password);
      const [newAdmin] = await db
        .insert(agencies)
        .values({
          name: 'Super Admin Portal',
          owner_name: 'M Nuh Bhatti',
          email: trimmedEmail,
          phone: '+923000000000',
          license_no: 'GOV-SA-001',
          role: 'super_admin',
          password_hash: passwordHash,
        })
        .returning();
      superAdminRow = newAdmin;
    } else {
      // Verify password - CRITICAL RULE: If password wrong show "پاس ورڈ غلط ہے", NOT "account not found"
      const isValid = await verifyPassword(password, existing.password_hash);
      if (!isValid) {
        return NextResponse.json(
          { error: 'پاس ورڈ غلط ہے' },
          { status: 401 }
        );
      }
    }

    // Sign session token
    const token = await signSessionToken({
      agency_id: superAdminRow.id,
      name: superAdminRow.name,
      email: superAdminRow.email,
      role: 'super_admin',
      owner_name: superAdminRow.owner_name,
      logo_url: superAdminRow.logo_url || undefined,
    });

    const response = NextResponse.json({
      success: true,
      message: 'سپر ایڈمن کامیابی سے لاگ ان ہو گیا',
      redirect: '/super-admin',
    });

    response.cookies.set('travel_saas_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 30 * 24 * 60 * 60, // 30 days
    });

    return response;
  } catch (error: any) {
    console.error('Super Admin Login Error:', error);
    return NextResponse.json(
      { error: 'سرور میں خرابی پیش آگئی', details: error.message },
      { status: 500 }
    );
  }
}
