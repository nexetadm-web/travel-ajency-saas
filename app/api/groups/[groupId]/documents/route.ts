import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { groups, pilgrims, agencies } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';
import {
  generateEmbassyManifestPdf,
  generateBulkTicketsPdf,
  generateHotelVouchersPdf,
  generateEmbassyExcelCsv,
} from '@/lib/pdf-generator';

export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ groupId: string }> | { groupId: string } }
) {
  try {
    const { groupId } = await params;
    const { searchParams } = new URL(req.url);
    const docType = searchParams.get('type') || 'embassy-pdf';

    const [group] = await db
      .select()
      .from(groups)
      .where(eq(groups.id, groupId))
      .limit(1);

    if (!group) {
      return NextResponse.json({ error: 'Group not found' }, { status: 404 });
    }

    const groupPilgrims = await db
      .select()
      .from(pilgrims)
      .where(eq(pilgrims.group_id, groupId))
      .orderBy(desc(pilgrims.created_at));

    const [agency] = await db
      .select()
      .from(agencies)
      .where(eq(agencies.id, group.agency_id))
      .limit(1);

    const docData = { group, pilgrims: groupPilgrims, agency };
    const safeGroupName = (group.group_name || 'group').replace(/[^a-zA-Z0-9_-]/g, '_');

    if (docType === 'embassy-excel') {
      const csvContent = generateEmbassyExcelCsv(docData);
      return new Response(csvContent, {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="embassy-manifest-${safeGroupName}.csv"`,
          'Cache-Control': 'no-store',
        },
      });
    }

    if (docType === 'bulk-tickets') {
      const pdfBytes = await generateBulkTicketsPdf(docData);
      return new Response(Buffer.from(pdfBytes), {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="bulk-e-tickets-${safeGroupName}.pdf"`,
          'Cache-Control': 'no-store',
        },
      });
    }

    if (docType === 'hotel-vouchers') {
      const pdfBytes = await generateHotelVouchersPdf(docData);
      return new Response(Buffer.from(pdfBytes), {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="hotel-vouchers-${safeGroupName}.pdf"`,
          'Cache-Control': 'no-store',
        },
      });
    }

    // Default: embassy-pdf
    const pdfBytes = await generateEmbassyManifestPdf(docData);
    return new Response(Buffer.from(pdfBytes), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="embassy-manifest-${safeGroupName}.pdf"`,
        'Cache-Control': 'no-store',
      },
    });
  } catch (error: any) {
    console.error('Group document generation error:', error);
    return NextResponse.json(
      { error: 'Document generation failed: ' + (error?.message || 'Unknown error') },
      { status: 500 }
    );
  }
}
