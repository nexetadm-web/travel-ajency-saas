import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { tour_packages, tour_bookings } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { getSession } from '@/lib/auth';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const session = await getSession();
    const agencyId = session?.agency_id || 'test-agency';
    const { id: pkgId } = await params;

    const [pkg] = await db
      .select()
      .from(tour_packages)
      .where(and(eq(tour_packages.id, pkgId), eq(tour_packages.agency_id, agencyId)))
      .limit(1);

    if (!pkg) {
      return NextResponse.json({ error: 'پیکیج نہیں ملا' }, { status: 404 });
    }

    const bookings = await db
      .select()
      .from(tour_bookings)
      .where(and(eq(tour_bookings.package_id, pkgId), eq(tour_bookings.agency_id, agencyId)));

    const totalPersons = bookings.reduce((sum, b) => sum + (b.persons || 1), 0);
    const totalRevenue = bookings.reduce((sum, b) => sum + (b.total_amount || 0), 0);
    const totalAdvance = bookings.reduce((sum, b) => sum + (b.advance || 0), 0);
    const estimatedCost = totalPersons * ((pkg.price_per_person || 0) * 0.65); // approx 35% margin
    const netProfit = totalRevenue - estimatedCost;

    return NextResponse.json({
      package: pkg,
      bookings,
      stats: {
        totalPersons,
        totalRevenue,
        totalAdvance,
        estimatedCost,
        netProfit,
        seatsLeft: Math.max(0, (pkg.max_seats || 20) - totalPersons),
      },
    });
  } catch (err: any) {
    console.error('Tour package GET error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
