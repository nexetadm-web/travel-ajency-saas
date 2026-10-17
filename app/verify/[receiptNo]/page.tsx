import { db } from '@/lib/db';
import { customer_transactions, customers_ledger, agencies } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { CheckCircle2, ShieldCheck, Building2, Calendar, DollarSign, Phone, QrCode } from 'lucide-react';
import { formatDate, formatCurrency } from '@/lib/utils';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function VerifyReceiptPage({
  params,
}: {
  params: Promise<{ receiptNo: string }> | { receiptNo: string };
}) {
  const { receiptNo } = await params;

  const [tx] = await db
    .select()
    .from(customer_transactions)
    .where(eq(customer_transactions.receipt_no, receiptNo))
    .limit(1);

  if (!tx) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-4">
        <div className="max-w-md w-full p-8 rounded-3xl bg-slate-900 border border-rose-500/30 text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-rose-500/10 text-rose-400 mx-auto flex items-center justify-center font-bold text-2xl">
            ✕
          </div>
          <h1 className="text-xl font-bold text-white">رسید تصدیق نہیں ہو سکی</h1>
          <p className="text-xs text-slate-400">
            رسید نمبر <strong>{receiptNo}</strong> ہمارے ریکارڈ میں موجود نہیں ہے۔
          </p>
          <Link href="/" className="inline-block text-xs text-emerald-400 hover:underline">
            ہوم پیج پر جائیں
          </Link>
        </div>
      </div>
    );
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

  const totalPayable = customer?.total_payable || 0;
  const totalPaid = customer?.total_paid || 0;
  const remaining = Math.max(0, totalPayable - totalPaid);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 text-white flex items-center justify-center p-3 sm:p-4 w-full max-w-full overflow-x-hidden">
      <div className="max-w-lg w-full bg-slate-900/90 border border-emerald-500/40 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 shadow-2xl shadow-emerald-950/60 space-y-6 overflow-hidden">
        {/* Verification Success Badge */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <CheckCircle2 className="w-8 h-8 sm:w-9 sm:h-9" />
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold">
            <ShieldCheck className="w-4 h-4 shrink-0" />
            <span>تصدیق شدہ اصلی رسید (Verified Authentic)</span>
          </div>
          <h1 className="font-urdu text-[20px] sm:text-[24px] font-black text-white break-words">{agency?.name || 'Travel Agency'}</h1>
          <p className="text-xs text-slate-400 break-words">
            حکومتی لائسنس: {agency?.license_no || 'Registered'} | فون: {agency?.phone || '-'}
          </p>
        </div>

        {/* Receipt Details Card */}
        <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3.5 text-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-850">
            <span className="text-slate-400">رسید نمبر (Receipt #):</span>
            <span className="font-mono font-bold text-sky-400 text-sm">{receiptNo}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-400">گاہک کا نام (Customer):</span>
            <span className="font-bold text-white text-sm">{customer?.customer_name || 'Valued Customer'}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-400">تاریخ ادائیگی (Payment Date):</span>
            <span className="text-slate-200">{formatDate(tx.date)}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-400">ادائیگی کا طریقہ (Method):</span>
            <span className="uppercase font-semibold text-slate-200">{tx.method}</span>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-slate-850">
            <span className="text-emerald-400 font-bold">وصول شدہ رقم (Paid):</span>
            <span className="text-xl font-black text-emerald-400">{formatCurrency(tx.amount)}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-400">باقی واجب الادا رقم (Remaining):</span>
            <span className={`font-bold ${remaining > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
              {formatCurrency(remaining)}
            </span>
          </div>
        </div>

        {/* PDF Download Button */}
        <div className="text-center space-y-2">
          <a
            href={`/api/ledger/receipt/${receiptNo}`}
            target="_blank"
            rel="noreferrer"
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 transition flex items-center justify-center gap-2"
          >
            <span>📄</span> پی ڈی ایف رسید ڈاؤن لوڈ کریں (Download Official PDF)
          </a>
          <p className="text-[10px] text-slate-500">
            یہ رسید Travel Agency SaaS کے انکرپٹڈ سیکیورٹی لیجر کے ذریعے تصدیق شدہ ہے۔
          </p>
        </div>
      </div>
    </div>
  );
}
