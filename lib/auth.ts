import { SignJWT, jwtVerify } from 'jose';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';

export const SUPER_ADMIN_EMAILS = [
  'mnuhbhatti333@gmail.com',
  'mnuhbhattii333@gmail.com',
];

export function isSuperAdmin(email: string | null | undefined): boolean {
  if (!email) return false;
  return SUPER_ADMIN_EMAILS.map((e) => e.toLowerCase()).includes(email.toLowerCase().trim());
}

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'travel_agency_saas_super_secret_jwt_key_2026_secure'
);

export interface UserSession {
  agency_id: string;
  name: string;
  email: string;
  role: 'agency' | 'super_admin';
  owner_name?: string;
  logo_url?: string;
}

export async function signSessionToken(payload: UserSession): Promise<string> {
  return await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('30d')
    .sign(JWT_SECRET);
}

export async function verifySessionToken(token: string): Promise<UserSession | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as UserSession;
  } catch {
    return null;
  }
}

export async function getSession(): Promise<UserSession | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('travel_saas_session')?.value;
    if (!token) return null;
    return await verifySessionToken(token);
  } catch {
    return null;
  }
}

export async function hashPassword(plainText: string): Promise<string> {
  return await bcrypt.hash(plainText, 10);
}

export async function verifyPassword(plainText: string, hash: string): Promise<boolean> {
  return await bcrypt.compare(plainText, hash);
}
