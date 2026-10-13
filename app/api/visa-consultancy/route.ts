import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { visa_cases, visa_case_documents, visa_case_timeline } from '@/lib/db/schema';
import { eq, and, desc } from 'drizzle-orm';
import { getSession } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    const agencyId = session?.agency_id || 'test-agency';

    const { searchParams } = new URL(req.url);
    const country = searchParams.get('country');
    const visa_type = searchParams.get('visa_type');
    const status = searchParams.get('status');
    const search = searchParams.get('q');

    const allCases = await db
      .select()
      .from(visa_cases)
      .where(eq(visa_cases.agency_id, agencyId))
      .orderBy(desc(visa_cases.created_at));

    let filtered = allCases;

    if (country && country !== 'all') {
      filtered = filtered.filter((c) => c.country?.toLowerCase() === country.toLowerCase());
    }
    if (visa_type && visa_type !== 'all') {
      filtered = filtered.filter((c) => c.visa_type === visa_type);
    }
    if (status && status !== 'all') {
      filtered = filtered.filter((c) => c.status === status);
    }
    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(
        (c) =>
          c.client_name?.toLowerCase().includes(q) ||
          c.passport_no?.toLowerCase().includes(q) ||
          c.phone?.includes(q)
      );
    }

    // Key Stats
    const totalCases = allCases.length;
    const approvedCases = allCases.filter((c) => c.status === 'approved').length;
    const pendingCases = allCases.filter(
      (c) => c.status === 'documents_pending' || c.status === 'in_embassy' || c.status === 'applied'
    ).length;
    const totalRevenue = allCases.reduce((sum, c) => sum + (c.paid || 0), 0);

    return NextResponse.json({
      cases: filtered,
      stats: {
        totalCases,
        approvedCases,
        pendingCases,
        totalRevenue,
      },
    });
  } catch (err: any) {
    console.error('Visa consultancy GET error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    const agencyId = session?.agency_id || 'test-agency';

    const body = await req.json();
    const {
      client_name,
      father_name = '',
      passport_no = '',
      phone = '',
      visa_type = 'study',
      country = 'UK',
      status = 'inquiry',
      total_fee = 150000,
      paid = 30000,
      university_name = '',
      employer_name = '',
      travel_date = '',
    } = body;

    if (!client_name) {
      return NextResponse.json({ error: 'کلائنٹ کا نام لازمی ہے' }, { status: 400 });
    }

    const caseId = crypto.randomUUID();
    await db.insert(visa_cases).values({
      id: caseId,
      agency_id: agencyId,
      client_name,
      father_name,
      passport_no,
      phone,
      visa_type,
      country,
      status,
      total_fee: Number(total_fee) || 0,
      paid: Number(paid) || 0,
      university_name,
      employer_name,
      travel_date,
    });

    // Default checklist documents
    const defaultDocs = [
      'Original Passport',
      'Bank Statement (6 Months)',
      'Account Maintenance Certificate',
      visa_type === 'study' ? 'Offer Letter / CAS Letter' : 'Cover Letter & Invitation',
      visa_type === 'study' ? 'IELTS / English Proficiency' : 'Employment Proof / FRC',
      'Police Character Certificate',
    ];

    for (const doc of defaultDocs) {
      await db.insert(visa_case_documents).values({
        id: crypto.randomUUID(),
        case_id: caseId,
        doc_name: doc,
        status: 'pending',
      });
    }

    // Initial timeline
    await db.insert(visa_case_timeline).values({
      id: crypto.randomUUID(),
      case_id: caseId,
      status_from: 'none',
      status_to: status,
      note: `کیس برائے ${country} (${visa_type}) کامیابی سے درج کیا گیا`,
    });

    return NextResponse.json({ success: true, caseId });
  } catch (err: any) {
    console.error('Visa consultancy POST error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
