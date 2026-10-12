'use client';

import { useState } from 'react';
import useSWR from 'swr';
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
} from 'lucide-react';
import { formatDate, formatCurrency } from '@/lib/utils';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function PilgrimsDirectoryPage() {
  const [search, setSearch] = useState('');
  const [visaFilter, setVisaFilter] = useState('all');

  const { data, mutate, isLoading } = useSWR(
    `/api/pilgrims?q=${encodeURIComponent(search)}&visaStatus=${visaFilter}`,
    fetcher,
    { dedupingInterval: 3000 }
  );

  const pilgrims = data?.pilgrims || [];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-white">زائرین ڈائریکٹری اور پاسپورٹ سرچ</h1>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-semibold">
              کل رجسٹرڈ: {pilgrims.length}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            پاسپورٹ نمبر، نام، CNIC اور ویزہ سٹیٹس کے لحاظ سے فوری تلاش (&lt;200ms)
          </p>
        </div>
      </div>

      {/* FILTERS & SEARCH */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="پاسپورٹ نمبر، نام، شناختی کارڈ یا فون نمبر درج کریں..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-500" />
          <select
            value={visaFilter}
            onChange={(e) => setVisaFilter(e.target.value)}
            className="px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
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
        <div className="py-20 text-center text-slate-500">
          <div className="inline-block animate-spin text-2xl mb-2">⏳</div>
          <p className="text-xs">زائرین لسٹ لوڈ ہو رہی ہے...</p>
        </div>
      ) : pilgrims.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-slate-950/60 border border-slate-800 text-slate-400">
          <Users className="w-10 h-10 mx-auto mb-2 opacity-30 text-emerald-400" />
          <p className="text-sm font-semibold">کوئی زائر نہیں ملا</p>
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-800 bg-slate-950/60 overflow-x-auto shadow-xl">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/90 text-slate-400 border-b border-slate-800 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="p-3.5">نام زائر</th>
                <th className="p-3.5">پاسپورٹ نمبر</th>
                <th className="p-3.5">میعاد پاسپورٹ</th>
                <th className="p-3.5">فون / CNIC</th>
                <th className="p-3.5">ویزہ سٹیٹس</th>
                <th className="p-3.5">ٹکٹ سٹیٹس</th>
                <th className="p-3.5">ادائیگی</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-850">
              {pilgrims.map((p: any) => (
                <tr key={p.id} className="hover:bg-slate-900/40 transition">
                  <td className="p-3.5 font-bold text-white">{p.full_name}</td>
                  <td className="p-3.5 font-mono text-sky-400 font-bold">{p.passport_no}</td>
                  <td className="p-3.5 text-slate-400">{formatDate(p.passport_expiry)}</td>
                  <td className="p-3.5">
                    <span className="block text-slate-300">{p.phone || '-'}</span>
                    <span className="block text-[10px] text-slate-500">{p.cnic || '-'}</span>
                  </td>
                  <td className="p-3.5">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                      p.visa_status === 'printed'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        : p.visa_status === 'in_embassy'
                        ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40'
                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    }`}>
                      {p.visa_status}
                    </span>
                  </td>
                  <td className="p-3.5">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-400">
                      {p.ticket_status || 'pending'}
                    </span>
                  </td>
                  <td className="p-3.5 font-bold text-white">
                    {formatCurrency(p.payment_paid)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
