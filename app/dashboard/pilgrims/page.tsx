'use client';

import { useState } from 'react';
import useSWR from 'swr';
import Link from 'next/link';
import {
  Users,
  Search,
  Plus,
  Filter,
  CheckCircle,
  Clock,
  ExternalLink,
  Phone,
  FileText,
  DollarSign,
  Camera,
  Download,
  CreditCard,
  Share2,
  Copy,
  Check,
} from 'lucide-react';
import { formatDate, formatCurrency } from '@/lib/utils';
import PremiumCard from '@/components/ui/premium-card';
import ContentCard from '@/components/ui/content-card';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function PilgrimsDirectoryPage() {
  const [search, setSearch] = useState('');
  const [visaFilter, setVisaFilter] = useState('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopyTrackLink = (passportNo: string) => {
    if (typeof window !== 'undefined') {
      const url = `${window.location.origin}/track/${passportNo}`;
      navigator.clipboard.writeText(url);
      setCopiedId(passportNo);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  const { data, mutate, isLoading } = useSWR(
    `/api/pilgrims?q=${encodeURIComponent(search)}&visaStatus=${visaFilter}`,
    fetcher,
    { dedupingInterval: 3000 }
  );

  const pilgrims = data?.pilgrims || [];

  const totalPilgrims = pilgrims.length;
  const docsPending = pilgrims.filter((p: any) => p.visa_status === 'document_pending' || !p.visa_status).length;
  const visaProcessing = pilgrims.filter((p: any) => p.visa_status === 'in_embassy' || p.visa_status === 'submitted').length;
  const ticketPending = pilgrims.filter((p: any) => p.ticket_status === 'pending' || !p.ticket_status).length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-2 sm:px-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-4 sm:p-6 rounded-[24px] border border-gray-100 shadow-[0_8px_30px_rgba(0,0,0,0.06)]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-gray-900">زائرین ڈائریکٹری اور پاسپورٹ سرچ</h1>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
              کل رجسٹرڈ: {totalPilgrims}
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            پاسپورٹ نمبر، نام، CNIC اور ویزہ سٹیٹس کے لحاظ سے فوری تلاش (&lt;200ms)
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/pilgrims/new"
            className="px-5 py-2.5 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow-lg shadow-emerald-200 transition flex items-center gap-2"
          >
            <Camera className="w-4 h-4" />
            + نیا زائر (AI اسکین)
          </Link>
        </div>
      </div>

      {/* Top 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <PremiumCard
          title="ٹوٹل حجاج / زائرین"
          value={totalPilgrims}
          subtitle="تمام رجسٹرڈ مسافر"
          icon={Users}
          gradient="violet"
          trend="کل تعداد"
        />
        <PremiumCard
          title="دستاویزات پینڈنگ"
          value={docsPending}
          subtitle="کاغذات جمع ہونا باقی"
          icon={FileText}
          gradient="amber"
          trend="پینڈنگ"
        />
        <PremiumCard
          title="سفارت خانے میں (Visa)"
          value={visaProcessing}
          subtitle="پراسیسنگ جاری ہے"
          icon={Clock}
          gradient="rose"
          trend="ایمبیسی"
        />
        <PremiumCard
          title="ٹکٹ پینڈنگ"
          value={ticketPending}
          subtitle="سیٹ کنفرمیشن باقی"
          icon={CheckCircle}
          gradient="cyan"
          trend="ٹکٹنگ"
        />
      </div>

      <ContentCard>
        {/* FILTERS & SEARCH */}
        <div className="flex flex-col sm:flex-row items-center gap-3 mb-6">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="پاسپورٹ نمبر، نام، شناختی کارڈ یا فون نمبر درج کریں..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:border-emerald-500 transition"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={visaFilter}
              onChange={(e) => setVisaFilter(e.target.value)}
              className="px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800 focus:outline-none focus:border-emerald-500 transition"
            >
              <option value="all">تمام ویزہ سٹیٹس</option>
              <option value="document_pending">دستاویزات زیرِ التواء</option>
              <option value="in_embassy">سفارت خانے میں (In Embassy)</option>
              <option value="printed">ویزہ پرنٹ شدہ (Printed)</option>
              <option value="returned">واپس موصول (Returned)</option>
            </select>
          </div>
        </div>

        {/* PILGRIMS TABLE */}
        {isLoading ? (
          <div className="py-20 text-center text-gray-400">
            <div className="inline-block animate-spin text-2xl mb-2">⏳</div>
            <p className="text-xs">زائرین لسٹ لوڈ ہو رہی ہے...</p>
          </div>
        ) : pilgrims.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-gray-50/50 border border-gray-100 text-gray-400">
            <Users className="w-10 h-10 mx-auto mb-2 opacity-30 text-emerald-500" />
            <p className="text-sm font-semibold">کوئی زائر نہیں ملا</p>
          </div>
        ) : (
          <>
            {/* DESKTOP TABLE */}
            <div className="hidden md:block overflow-x-auto rounded-xl border border-gray-100">
          <table className="w-full text-left text-xs text-gray-700 min-w-full">
            <thead className="bg-gray-50/80 text-gray-500 border-b border-gray-100 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="p-4">نام زائر</th>
                <th className="p-4">پاسپورٹ نمبر</th>
                <th className="p-4">میعاد پاسپورٹ</th>
                <th className="p-4">فون / CNIC</th>
                <th className="p-4">ویزہ سٹیٹس</th>
                <th className="p-4">ٹکٹ سٹیٹس</th>
                <th className="p-4">ادائیگی</th>
                <th className="p-4 text-center">ایکشنز اور لنکس</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {pilgrims.map((p: any) => (
                <tr key={p.id} className="hover:bg-gray-50/60 transition">
                  <td className="p-4 font-bold text-gray-900">{p.full_name}</td>
                  <td className="p-4 font-mono text-emerald-700 font-bold">{p.passport_no}</td>
                  <td className="p-4 text-gray-500">{formatDate(p.passport_expiry)}</td>
                  <td className="p-4">
                    <span className="block text-gray-800">{p.phone || '-'}</span>
                    <span className="block text-[10px] text-gray-400">{p.cnic || '-'}</span>
                  </td>
                  <td className="p-4">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                        p.visa_status === 'printed'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : p.visa_status === 'in_embassy'
                          ? 'bg-sky-50 text-sky-700 border border-sky-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}
                    >
                      {p.visa_status}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-gray-100 text-gray-600">
                      {p.ticket_status || 'pending'}
                    </span>
                  </td>
                  <td className="p-4 font-bold text-gray-900">
                    {formatCurrency(p.payment_paid)}
                  </td>
                  <td className="p-4 text-center">
                    <div className="inline-flex flex-wrap items-center justify-center gap-1.5">
                      <Link
                        href={`/dashboard/pilgrims/${p.id}/installments`}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 font-bold text-[11px] border border-indigo-200 transition"
                        title="قسط پلان"
                      >
                        <CreditCard className="w-3 h-3" />
                        <span>اقساط</span>
                      </Link>

                      <button
                        onClick={() => handleCopyTrackLink(p.passport_no)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 font-bold text-[11px] transition"
                        title="ٹریکنگ لنک کاپی کریں"
                      >
                        {copiedId === p.passport_no ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-600" />
                            <span className="text-emerald-600">کاپی ہو گیا</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>ٹریکنگ</span>
                          </>
                        )}
                      </button>

                      {p.phone && (
                        <a
                          href={`https://wa.me/${p.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`السلام علیکم جناب ${p.full_name}! آپ کے عمرہ/حج کیس کا لائیو سٹیٹس اور ویزہ معلومات درج ذیل لنک پر دستیاب ہیں:\n${typeof window !== 'undefined' ? window.location.origin : ''}/track/${p.passport_no}`)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-bold text-[11px] border border-emerald-200 transition"
                          title="حاجی کو WhatsApp لنک بھیجیں"
                        >
                          <Share2 className="w-3 h-3" />
                          <span>WhatsApp</span>
                        </a>
                      )}

                      <a
                        href={`/api/pdf/dua-card/${p.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-2 py-1.5 rounded-lg bg-gray-50 text-gray-600 hover:bg-gray-100 font-bold text-[11px] border border-gray-200 transition"
                        title="دعا کارڈ ڈاؤن لوڈ"
                      >
                        <Download className="w-3 h-3" />
                      </a>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* MOBILE CARDS VIEW */}
        <div className="block md:hidden space-y-3">
          {pilgrims.map((p: any) => (
            <div key={p.id} className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h4 className="font-bold text-gray-900 text-sm">{p.full_name}</h4>
                  <p className="text-[11px] font-mono text-emerald-700 font-bold mt-0.5">{p.passport_no}</p>
                </div>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase shrink-0 ${
                    p.visa_status === 'printed'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : p.visa_status === 'in_embassy'
                      ? 'bg-sky-50 text-sky-700 border border-sky-200'
                      : 'bg-amber-50 text-amber-700 border border-amber-200'
                  }`}
                >
                  {p.visa_status}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs bg-gray-50 p-2.5 rounded-xl">
                <div>
                  <span className="text-[10px] text-gray-400 block">فون</span>
                  <span className="text-gray-800 font-medium">{p.phone || '-'}</span>
                </div>
                <div>
                  <span className="text-[10px] text-gray-400 block">میعاد پاسپورٹ</span>
                  <span className="text-gray-700">{formatDate(p.passport_expiry)}</span>
                </div>
                <div>
                  <span className="text-[10px] text-gray-400 block">ادائیگی</span>
                  <span className="font-bold text-emerald-700">{formatCurrency(p.payment_paid)}</span>
                </div>
                <div>
                  <span className="text-[10px] text-gray-400 block">ٹکٹ</span>
                  <span className="text-gray-700 font-medium">{p.ticket_status || 'pending'}</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 pt-1">
                <Link
                  href={`/dashboard/pilgrims/${p.id}/installments`}
                  className="px-2 py-2 rounded-xl bg-indigo-50 text-indigo-700 hover:bg-indigo-100 font-bold text-[11px] border border-indigo-200 transition flex items-center justify-center gap-1"
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>اقساط</span>
                </Link>

                {p.phone ? (
                  <a
                    href={`https://wa.me/${p.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`السلام علیکم جناب ${p.full_name}! آپ کے عمرہ/حج کیس کا لائیو سٹیٹس اور ویزہ معلومات درج ذیل لنک پر دستیاب ہیں:\n${typeof window !== 'undefined' ? window.location.origin : ''}/track/${p.passport_no}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-2 py-2 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-bold text-[11px] border border-emerald-200 transition flex items-center justify-center gap-1"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>WhatsApp</span>
                  </a>
                ) : (
                  <button
                    onClick={() => handleCopyTrackLink(p.passport_no)}
                    className="px-2 py-2 rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-200 font-bold text-[11px] transition flex items-center justify-center gap-1"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>ٹریکنگ</span>
                  </button>
                )}

                <a
                  href={`/api/pdf/dua-card/${p.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2 py-2 rounded-xl bg-gray-50 text-gray-700 hover:bg-gray-100 font-bold text-[11px] border border-gray-200 transition flex items-center justify-center gap-1"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>دعا کارڈ</span>
                </a>
              </div>
            </div>
          ))}
        </div>
        </>
      )}
      </ContentCard>
    </div>
  );
}
