import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { agencies } from '@/lib/db/schema';
import { eq, or } from 'drizzle-orm';
import { hashPassword } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      name,
      agency_name,
      owner_name,
      phone,
      email,
      password,
      license_no,
      city,
    } = body;

    const actualAgencyName = (name || agency_name || '').trim();
    const actualOwnerName = (owner_name || '').trim();
    const actualPhone = (phone || '').trim();
    const actualEmail = (email || '').trim().toLowerCase();
    const actualPassword = (password || '').trim();
    const actualCity = (city || '').trim();
    const actualLicense = (license_no || '').trim();

    if (!actualAgencyName || !actualOwnerName || !actualPhone || !actualEmail || !actualPassword) {
      return NextResponse.json(
        { error: 'براہ کرم تمام لازمی معلومات درج کریں (ایجنسی نام، مالک نام، فون، ای میل اور پاسورڈ)' },
        { status: 400 }
      );
    }

    if (actualPassword.length < 6) {
      return NextResponse.json(
        { error: 'پاسورڈ کم از کم 6 ہندسوں کا ہونا چاہیے' },
        { status: 400 }
      );
    }

    // Check if email or phone already exists
    const [existing] = await db
      .select({ id: agencies.id, email: agencies.email, phone: agencies.phone })
      .from(agencies)
      .where(
        or(
          eq(agencies.email, actualEmail),
          eq(agencies.phone, actualPhone)
        )
      )
      .limit(1);

    if (existing) {
      if (existing.email === actualEmail) {
        return NextResponse.json(
          { error: 'یہ ای میل پہلے سے کسی ایجنسی میں رجسٹرڈ ہے (Email already registered)' },
          { status: 409 }
        );
      }
      return NextResponse.json(
        { error: 'یہ فون نمبر پہلے سے رجسٹرڈ ہے (Phone already registered)' },
        { status: 409 }
      );
    }

    const passwordHash = await hashPassword(actualPassword);

    const [created] = await db
      .insert(agencies)
      .values({
        name: actualAgencyName,
        owner_name: actualOwnerName,
        phone: actualPhone,
        email: actualEmail,
        password_hash: passwordHash,
        license_no: actualLicense || null,
        city: actualCity || null,
        role: 'agency',
        status: 'active',
        plan: 'starter',
        monthly_fee: 3000,
      })
      .returning({
        id: agencies.id,
        name: agencies.name,
        owner_name: agencies.owner_name,
        email: agencies.email,
        phone: agencies.phone,
        city: agencies.city,
        license_no: agencies.license_no,
        status: agencies.status,
      });

    return NextResponse.json({
      success: true,
      message: 'ایجنسی کامیابی سے رجسٹر ہو گئی ہے! لاگ ان پیج پر بھیجا جا رہا ہے...',
      redirect: '/login',
      agency: created,
    });
  } catch (error: any) {
    console.error('Agency signup error:', error);
    return NextResponse.json(
      { error: 'رجسٹریشن کے دوران خرابی پیش آگئی', details: error.message },
      { status: 500 }
    );
  }
}
