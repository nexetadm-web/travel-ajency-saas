import { db } from '@/lib/db';
import { pilgrims, groups, agencies } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { CheckCircle2, ShieldCheck, Phone, MapPin, Building2, Calendar, Plane } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function VerifyPilgrimPage({
  params,
}: {
  params: Promise<{ id: string }> | { id: string };
}) {
  const { id: pilgrimId } = await params;

  const [pilgrim] = await db
    .select()
    .from(pilgrims)
    .where(eq(pilgrims.id, pilgrimId))
    .limit(1);

  if (!pilgrim) {
    return (
      <div className="min-h-screen bg-[#F8FAFF] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-[24px] p-8 text-center shadow-xl border border-gray-100">
          <div className="w-16 h-16 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center mx-auto mb-4 text-2xl font-black">
            ✕
          </div>
          <h1 className="text-xl font-bold text-gray-900">زائر کا ریکارڈ نہیں ملا</h1>
          <p className="text-xs text-gray-500 mt-2">
            یہ تصدیقی QR کوڈ یا زائر ID ڈیٹا بیس میں موجود نہیں ہے۔ براہ کرم ایجنسی سے رابطہ کریں۔
          </p>
        </div>
      </div>
    );
  }

  const [agency] = await db
    .select()
    .from(agencies)
    .where(eq(agencies.id, pilgrim.agency_id))
    .limit(1);

  const [group] = pilgrim.group_id
    ? await db
        .select()
        .from(groups)
        .where(eq(groups.id, pilgrim.group_id))
        .limit(1)
    : [null];

  return (
    <div className="min-h-screen bg-[#F8FAFF] flex items-center justify-center p-4 antialiased">
      <div className="max-w-lg w-full bg-white rounded-[28px] border border-gray-100 shadow-[0_12px_40px_rgba(0,0,0,0.08)] overflow-hidden">
        {/* Verification Success Banner */}
        <div className="bg-gradient-to-r from-emerald-500 to-teal-600 p-6 text-white text-center">
          <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur text-white flex items-center justify-center mx-auto mb-3 shadow-inner">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <span className="inline-block px-3 py-1 rounded-full bg-white/20 text-xs font-bold uppercase tracking-wider backdrop-blur mb-1">
            ✓ مستند زائر تصدیق (Verified Pilgrim)
          </span>
          <h1 className="text-2xl font-black">{pilgrim.full_name}</h1>
          <p className="text-xs text-emerald-100 mt-1 font-mono">
            پاسپورٹ: {pilgrim.passport_no}
          </p>
        </div>

        {/* Agency Credentials */}
        <div className="p-6 space-y-5">
          <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-between">
            <div>
              <span className="text-[11px] text-gray-500 block">جاری کنندہ ایجنسی:</span>
              <strong className="text-sm text-gray-900">{agency?.name || 'Al-Haram Travels'}</strong>
              <span className="text-[11px] text-emerald-600 font-bold block mt-0.5">
                لائسنس: {agency?.license_no || 'DTS Reg-1234'}
              </span>
            </div>
            <div className="text-right">
              <span className="text-[11px] text-gray-500 block">ایمرجنسی رابطہ:</span>
              <span className="text-xs font-bold text-gray-800">{agency?.phone || '0300-1234567'}</span>
            </div>
          </div>

          {/* Group & Hotel Details */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500">
              مقدس سفر کی تفصیلات (Holy Journey Details)
            </h3>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 rounded-xl border border-gray-100 bg-white">
                <span className="text-[10px] text-gray-400 block">گروپ کا نام</span>
                <strong className="text-gray-900 block truncate">{group?.group_name || 'انفرادی عمرہ'}</strong>
              </div>

              <div className="p-3.5 rounded-xl border border-gray-100 bg-white">
                <span className="text-[10px] text-gray-400 block">ویزہ سٹیٹس</span>
                <strong className="text-emerald-600 block uppercase font-bold">
                  {pilgrim.visa_status || 'منظور شدہ'}
                </strong>
              </div>

              <div className="p-3.5 rounded-xl border border-gray-100 bg-white">
                <span className="text-[10px] text-gray-400 block">مکہ مکرمہ ہوٹل</span>
                <strong className="text-gray-900 block truncate">{group?.makkah_hotel || 'فندق مکہ'}</strong>
              </div>

              <div className="p-3.5 rounded-xl border border-gray-100 bg-white">
                <span className="text-[10px] text-gray-400 block">مدینہ منورہ ہوٹل</span>
                <strong className="text-gray-900 block truncate">{group?.madina_hotel || 'فندق مدینہ'}</strong>
              </div>
            </div>
          </div>

          {/* Download Dua Card Link */}
          <div className="pt-2">
            <a
              href={`/api/pdf/dua-card/${pilgrim.id}`}
              target="_blank"
              rel="noreferrer"
              className="w-full py-3 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow-md shadow-emerald-200 flex items-center justify-center gap-2 transition"
            >
              📄 دعا کارڈ اور مکمل شیڈول PDF ڈاؤن لوڈ کریں
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
