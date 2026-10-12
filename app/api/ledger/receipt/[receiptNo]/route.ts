import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { customer_transactions, customers_ledger, agencies } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { generateReceiptPdf } from '@/lib/pdf/generator';

export const dynamic = 'force-dynamic';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ receiptNo: string }> | { receiptNo: string } }
) {
  try {
    const { receiptNo } = await params;

    const [tx] = await db
      .select()
      .from(customer_transactions)
      .where(eq(customer_transactions.receipt_no, receiptNo))
      .limit(1);

    if (!tx) {
      return NextResponse.json({ error: 'رسید نہیں ملی' }, { status: 404 });
    }

    const [customer] = await db
      .select()
      .from(customers_ledger)
      .where(eq(customers_ledger.id, tx.ledger_id))
      .limit(1);

    const [agency] = await db
      .select()
      .from(agencies)
      .where(eq(agencies.id, tx.agency_id))
      .limit(1);

    if (!agency) {
      return NextResponse.json({ error: 'ایجنسی نہیں ملی' }, { status: 404 });
    }

    const host = req.headers.get('host') || 'localhost:3003';
    const proto = req.headers.get('x-forwarded-proto') || 'http';
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || `${proto}://${host}`;
    const verifyUrl = `${appUrl}/verify/${receiptNo}`;

    const totalPayable = customer?.total_payable || 0;
    const totalPaid = customer?.total_paid || 0;
    const remaining = Math.max(0, totalPayable - totalPaid);

    const pdfBytes = await generateReceiptPdf({
      agency: {
        name: agency.name,
        phone: agency.phone,
        address: agency.address,
        license_no: agency.license_no,
        logo_url: agency.logo_url,
      },
      customerName: customer?.customer_name || 'Valued Customer',
      phone: customer?.phone || undefined,
      receiptNo,
      date: tx.date,
      amount: tx.amount,
      method: tx.method || 'cash',
      note: tx.note || undefined,
      totalPayable,
      totalPaid,
      remaining,
      verifyUrl,
    });

    return new Response(Buffer.from(pdfBytes), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="receipt-${receiptNo}.pdf"`,
      },
    });
  } catch (error: any) {
    console.error('Generate receipt PDF error:', error);
    return NextResponse.json({ error: 'پی ڈی ایف بنانے میں خرابی', details: error.message }, { status: 500 });
  }
}
