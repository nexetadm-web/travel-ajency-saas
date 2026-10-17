'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import useSWR from 'swr';
import { useAgency } from '@/hooks/useAgency';
import {
  ArrowLeft,
  DollarSign,
  TrendingUp,
  FileDown,
  Building2,
  Plane,
  FileCheck2,
  Receipt,
  Car,
  CheckCircle2,
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function GroupProfitPage() {
  const params = useParams();
  const groupId = params.groupId as string;
  const { agency } = useAgency();

  const { data, isLoading } = useSWR(`/api/groups/${groupId}/profit`, fetcher);

  const group = data?.group;
  const f = data?.financials || {
    totalReceived: 0,
    totalExpected: 0,
    ticketsCost: 0,
    hotelsCost: 0,
    transportCost: 0,
    visasCost: 0,
    totalExpenses: 0,
    netProfit: 0,
  };
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const pilgrimsCount = data?.pilgrimsCount || 0;

  const handleExportProfitPdf = async () => {
    try {
      setDownloadingPdf(true);
      const res = await fetch(`/api/groups/${groupId}/profit/pdf`, { cache: 'no-store' });
      if (!res.ok) {
        throw new Error('Server PDF export failed');
      }
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `group-profit-${group?.group_name ? group.group_name.replace(/[^a-zA-Z0-9_-]/g, '_') : groupId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err: any) {
      console.error('Profit PDF error:', err);
      try {
        const { generateGroupProfitPdf } = await import('@/lib/pdf/generator');
        const pdfBytes = await generateGroupProfitPdf({
          agency: {
            name: agency?.name || 'Pyary Travels',
            license_no: agency?.license_no || 'Reg DTS',
            phone: agency?.phone || '',
            address: agency?.address || '',
            logo_url: agency?.logo_url || null,
          },
          groupName: group?.group_name || 'Group',
          totalReceived: f.totalReceived,
          ticketsCost: f.ticketsCost,
          hotelsCost: f.hotelsCost,
          transportCost: f.transportCost,
          visasCost: f.visasCost,
          otherExpenses: 0,
          totalExpenses: f.totalExpenses,
          netProfit: f.netProfit,
          pilgrimsCount,
        });

        const blob = new Blob([pdfBytes as any], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `group-profit-${groupId}.pdf`;
        a.click();
      } catch (clientErr: any) {
        alert('PDF ڈاؤن لوڈ کرنے میں خرابی پیش آگئی: ' + (err?.message || 'Error'));
      }
    } finally {
      setDownloadingPdf(false);
    }
  };

  return (
    <div className="w-full max-w-full overflow-x-hidden space-y-6 max-w-5xl mx-auto px-2 sm:px-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-950/80 border border-slate-800 p-4 sm:p-6 rounded-2xl sm:rounded-3xl overflow-hidden">
        <div className="flex items-center gap-3">
          <Link
            href={`/dashboard/groups/${groupId}`}
            className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition shrink-0"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="font-urdu text-[18px] sm:text-[22px] md:text-[26px] font-bold leading-[1.4] break-words text-white">گروپ مالیاتی آڈٹ اور منافع رپورٹ</h1>
            <p className="text-xs text-slate-400 mt-0.5 break-words">گروپ: {group?.group_name || 'لوڈ ہو رہا ہے...'}</p>
          </div>
        </div>

        <button
          onClick={handleExportProfitPdf}
          disabled={downloadingPdf}
          className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-purple-600/30 hover:bg-purple-600/40 text-purple-200 border border-purple-500/40 text-xs font-bold transition flex items-center justify-center gap-2 disabled:opacity-50 shadow-sm"
        >
          <FileDown className="w-4 h-4 shrink-0" />
          <span>{downloadingPdf ? 'PDF ڈاؤن لوڈ ہو رہی ہے...' : 'منافع رپورٹ PDF ڈاؤن لوڈ'}</span>
        </button>
      </div>

      {/* FORMULA HIGHLIGHT */}
      <div className="p-3 sm:p-4 rounded-2xl bg-slate-950/60 border border-slate-800 text-xs text-slate-300 flex flex-wrap items-center gap-2">
        <span className="font-bold text-emerald-400">فارمولا:</span>
        <span className="break-words leading-relaxed">
          خالص منافع = زائرین سے وصول شدہ کل رقم - (ٹکٹیں + ہوٹل بکنگ + ٹرانسپورٹ + ویزہ فیس)
        </span>
      </div>

      {/* BIG GREEN PROFIT CARD */}
      <div className={`p-4 sm:p-6 md:p-8 rounded-2xl sm:rounded-3xl border shadow-2xl ${
        f.netProfit >= 0
          ? 'bg-gradient-to-br from-slate-950 via-emerald-950/40 to-slate-950 border-emerald-500/40 shadow-emerald-950/30'
          : 'bg-gradient-to-br from-slate-950 via-rose-950/40 to-slate-950 border-rose-500/40 shadow-rose-950/30'
      }`}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
              NET GROUP PROFIT / خالص منافع
            </span>
            <div className="text-2xl sm:text-3xl md:text-5xl font-black text-white mt-1 tracking-tight break-words">
              {formatCurrency(f.netProfit)}
            </div>
            <p className="text-xs text-slate-400 mt-2">
              کل زائرین: <strong>{pilgrimsCount}</strong> | کل متوقع وصولی:{' '}
              {formatCurrency(f.totalExpected)}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 text-xs space-y-1.5 sm:min-w-[240px]">
            <div className="flex justify-between text-slate-400">
              <span>کل موصولہ آمدنی:</span>
              <strong className="text-emerald-400">{formatCurrency(f.totalReceived)}</strong>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>کل آپریٹنگ اخراجات:</span>
              <strong className="text-rose-400">- {formatCurrency(f.totalExpenses)}</strong>
            </div>
            <div className="pt-1.5 border-t border-slate-800 flex justify-between font-bold text-white">
              <span>منافع مارجن:</span>
              <span>
                {f.totalReceived > 0
                  ? `${Math.round((f.netProfit / f.totalReceived) * 100)}%`
                  : '0%'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ITEM-BY-ITEM EXPENSES BREAKDOWN */}
      <div className="rounded-3xl bg-slate-950/80 border border-slate-800 p-6 space-y-4 shadow-xl">
        <h3 className="font-bold text-base text-white">اخراجات کی مد وائز تفصیل (Cost Breakdown)</h3>

        <div className="space-y-3">
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-850 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center">
                <Plane className="w-5 h-5" />
              </div>
              <div>
                <span className="font-bold text-sm text-white block">ہوائی جہاز کی ٹکٹیں (Tickets Purchase)</span>
                <span className="text-[11px] text-slate-400">گروپ کے تصدیق شدہ پاسپورٹس پر خریداری لاگت</span>
              </div>
            </div>
            <span className="font-bold text-rose-400 text-sm">PKR {f.ticketsCost.toLocaleString()}</span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-850 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <span className="font-bold text-sm text-white block">مکہ و مدینہ ہوٹل بکنگز (Hotels Cost)</span>
                <span className="text-[11px] text-slate-400">کمرے اور بیڈز کی مجموعی لاگت</span>
              </div>
            </div>
            <span className="font-bold text-rose-400 text-sm">PKR {f.hotelsCost.toLocaleString()}</span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-850 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center">
                <Car className="w-5 h-5" />
              </div>
              <div>
                <span className="font-bold text-sm text-white block">ٹرانسپورٹ اخراجات (Transport Cost)</span>
                <span className="text-[11px] text-slate-400">جدہ - مکہ - مدینہ بسیں اور گاڑیاں</span>
              </div>
            </div>
            <span className="font-bold text-rose-400 text-sm">PKR {f.transportCost.toLocaleString()}</span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-850 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
                <FileCheck2 className="w-5 h-5" />
              </div>
              <div>
                <span className="font-bold text-sm text-white block">ویزہ اور سفارت خانہ فیس (Visas & Embassy)</span>
                <span className="text-[11px] text-slate-400">سفارت خانہ فیس + ایجنٹ سروس چارجز</span>
              </div>
            </div>
            <span className="font-bold text-rose-400 text-sm">PKR {f.visasCost.toLocaleString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
