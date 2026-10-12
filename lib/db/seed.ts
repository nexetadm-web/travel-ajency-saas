import { db } from './index';
import { agencies } from './schema';
import { eq } from 'drizzle-orm';
import { SUPER_ADMIN_EMAILS, hashPassword } from '../auth';

export async function seedSuperAdmin() {
  const defaultSuperAdminEmail = SUPER_ADMIN_EMAILS[0];
  const existing = await db
    .select()
    .from(agencies)
    .where(eq(agencies.email, defaultSuperAdminEmail))
    .limit(1);

  if (existing.length === 0) {
    const passwordHash = await hashPassword('Admin@123456');
    const [superAdmin] = await db
      .insert(agencies)
      .values({
        name: 'Super Admin Portal',
        owner_name: 'M Nuh Bhatti',
        email: defaultSuperAdminEmail,
        phone: '+923000000000',
        license_no: 'GOV-SA-001',
        role: 'super_admin',
        password_hash: passwordHash,
      })
      .returning();

    console.log('✅ Super admin created:', superAdmin.email);
    return superAdmin;
  }

  console.log('ℹ️ Super admin already exists:', existing[0].email);
  return existing[0];
}

// If executed directly
if (process.argv[1] && process.argv[1].endsWith('seed.ts')) {
  seedSuperAdmin()
    .then(() => process.exit(0))
    .catch((e) => {
      console.error(e);
      process.exit(1);
    });
}
