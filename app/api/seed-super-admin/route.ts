import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { agencies } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { SUPER_ADMIN_EMAILS, hashPassword } from '@/lib/auth';

export async function GET() {
  try {
    const adminEmail = SUPER_ADMIN_EMAILS[0];
    const existing = await db
      .select()
      .from(agencies)
      .where(eq(agencies.email, adminEmail))
      .limit(1);

    if (existing.length === 0) {
      const passwordHash = await hashPassword('Admin@123456');
      const [superAdmin] = await db
        .insert(agencies)
        .values({
          name: 'Super Admin Portal',
          owner_name: 'M Nuh Bhatti',
          email: adminEmail,
          phone: '+923000000000',
          license_no: 'GOV-SA-001',
          role: 'super_admin',
          password_hash: passwordHash,
        })
        .returning();

      return NextResponse.json({
        success: true,
        message: 'Super Admin auto-created successfully',
        admin: { email: superAdmin.email, role: superAdmin.role },
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Super Admin already exists in database',
      admin: { email: existing[0].email, role: existing[0].role },
    });
  } catch (error: any) {
    console.error('Seed super admin error:', error);
    return NextResponse.json(
      { error: 'Failed to seed super admin', details: error.message },
      { status: 500 }
    );
  }
}
