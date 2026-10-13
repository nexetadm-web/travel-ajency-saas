import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { visa_case_documents } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { getSession } from '@/lib/auth';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const { id: caseId } = await params;
    const body = await req.json();
    const { doc_id, status, doc_name, file_url } = body;

    if (doc_id && status) {
      // Update existing document status
      await db
        .update(visa_case_documents)
        .set({ status })
        .where(eq(visa_case_documents.id, doc_id));

      return NextResponse.json({ success: true });
    }

    if (doc_name) {
      // Add new document item
      const newId = crypto.randomUUID();
      await db.insert(visa_case_documents).values({
        id: newId,
        case_id: caseId,
        doc_name,
        file_url: file_url || '',
        status: status || 'pending',
      });

      return NextResponse.json({ success: true, id: newId });
    }

    return NextResponse.json({ error: 'ناممکن کارروائی' }, { status: 400 });
  } catch (err: any) {
    console.error('Visa document update error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
