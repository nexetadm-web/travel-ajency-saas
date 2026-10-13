import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { tour_packages, tour_bookings } from '@/lib/db/schema';
import { eq, and, desc } from 'drizzle-orm';
import { getSession } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    const agencyId = session?.agency_id || 'test-agency';

    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type');

    let allPackages = await db
      .select()
      .from(tour_packages)
      .where(eq(tour_packages.agency_id, agencyId))
      .orderBy(desc(tour_packages.created_at));

    if (type && type !== 'all') {
      allPackages = allPackages.filter((p) => p.type === type);
    }

    // Fetch all bookings for this agency
    const allBookings = await db
      .select()
      .from(tour_bookings)
      .where(eq(tour_bookings.agency_id, agencyId));

    const packagesWithStats = allPackages.map((pkg) => {
      const pkgBookings = allBookings.filter((b) => b.package_id === pkg.id);
      const bookedPersons = pkgBookings.reduce((sum, b) => sum + (b.persons || 1), 0);
      const totalRevenue = pkgBookings.reduce((sum, b) => sum + (b.total_amount || 0), 0);
      const advanceReceived = pkgBookings.reduce((sum, b) => sum + (b.advance || 0), 0);
      const availableSeats = Math.max(0, (pkg.max_seats || 20) - bookedPersons);

      return {
        ...pkg,
        bookedPersons,
        availableSeats,
        totalRevenue,
        advanceReceived,
        bookingsCount: pkgBookings.length,
      };
    });

    return NextResponse.json({ packages: packagesWithStats });
  } catch (err: any) {
    console.error('Tours GET error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    const agencyId = session?.agency_id || 'test-agency';

    const body = await req.json();
    const {
      package_name,
      type = 'domestic',
      destination,
      duration_days = 3,
      price_per_person = 35000,
      includes = 'ہوٹل رہائش، 4x4 جیپ، ناشتہ و ٹور گائیڈ',
      max_seats = 20,
      departure_dates = '["15 Nov 2026", "22 Nov 2026"]',
    } = body;

    if (!package_name || !destination) {
      return NextResponse.json({ error: 'پیکیج کا نام اور منزل ضروری ہیں' }, { status: 400 });
    }

    const pkgId = crypto.randomUUID();
    await db.insert(tour_packages).values({
      id: pkgId,
      agency_id: agencyId,
      package_name,
      type,
      destination,
      duration_days: Number(duration_days) || 1,
      price_per_person: Number(price_per_person) || 0,
      includes,
      max_seats: Number(max_seats) || 20,
      departure_dates: typeof departure_dates === 'string' ? departure_dates : JSON.stringify(departure_dates),
      status: 'active',
    });

    return NextResponse.json({ success: true, id: pkgId });
  } catch (err: any) {
    console.error('Tours POST error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
