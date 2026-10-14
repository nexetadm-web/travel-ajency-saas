'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { useRouter } from 'next/navigation';
import { useAgency } from '@/hooks/useAgency';
import {
  Lock,
  Eye,
  EyeOff,
  DollarSign,
  TrendingUp,
  Receipt,
  Plane,
  Building2,
  FileCheck2,
  Users,
  ShieldAlert,
  ArrowRight,
  Sparkles,
  PieChart as PieIcon,
  BarChart3,
  Calendar,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { formatCurrency } from '@/lib/utils';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function OwnerSecretProfitPage() {
  const router = useRouter();
  const { agency, isLoading: agencyLoading } = useAgency();
  const { data, isLoading } = useSWR('/api/owner/profit', fetcher);

  // Numbers Chupayen privacy toggle (blur-md)
  const [blurred, setBlurred] = useState(false);

  // Role check: if role is explicitly 'staff', redirect to /dashboard
  if (!agencyLoading && (agency?.role as string) === 'staff') {
    router.push('/dashboard');
    return null;
  }

  const summary = data?.summary || {
    totalWusooli: 0,
    totalKharcha: 0,
    ticketCostTotal: 0,
    hotelCostTotal: 0,
    visaCostTotal: 0,
    otherCostTotal: 0,
    totalCommission: 0,
    netProfit: 0,
    avgProfitPerHaji: 0,
    hajiCount: 0,
  };

  const groupBreakdown = data?.groupBreakdown || [];

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Top Secret Header with Lock */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 text-white rounded-[28px] p-6 sm:p-8 border border-emerald-500/30 shadow-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30">
            <Lock className="w-3.5 h-3.5 text-emerald-400" />
            Sirf Malik Ke Liye - Secret Profit Dashboard
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2">
            <span>🔒</span> خالص کاروباری منافع اور اخراجات (Owner Confidential)
          </h1>
          <p className="text-xs text-slate-400 max-w-xl">
            یہ پورٹل صرف ایجنسی اونر کے لیے مخصوص ہے۔ عملہ یا دیگر ارکان کو اس صفحے تک رسائی حاصل نہیں۔
          </p>
        </div>

        {/* Button "Numbers Chupayen" */}
        <button
          onClick={() => setBlurred(!blurred)}
          className={`px-5 py-3 rounded-full text-xs font-bold transition flex items-center gap-2 shadow-lg active:scale-95 ${
            blurred
              ? 'bg-emerald-500 text-white shadow-emerald-500/20 hover:bg-emerald-600'
              : 'bg-white/10 hover:bg-white/20 text-white border border-white/15'
          }`}
        >
          {blurred ? (
            <>
              <Eye className="w-4 h-4" />
              نمبرز دکھائیں (Show Numbers)
            </>
          ) : (
            <>
              <EyeOff className="w-4 h-4 text-emerald-400" />
              Numbers Chupayen (پرائیویسی بلر)
            </>
          )}
        </button>
      </div>

      {/* TOP ROW: DARK GRADIENT SUMMARY CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {/* Total Wusooli */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-950 text-white rounded-2xl p-6 border border-slate-800 shadow-xl flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">
              کل وصولی (Total Wusooli)
            </span>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div>
            <span className={`text-3xl font-black text-emerald-400 tracking-tight block ${blurred ? 'blur-md select-none' : ''}`}>
              {formatCurrency(summary.totalWusooli)}
            </span>
            <span className="block text-xs text-slate-400 mt-1">گاہکوں اور حجاج سے کل موصولہ رقم</span>
          </div>
        </div>

        {/* Total Kharcha */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-950 text-white rounded-2xl p-6 border border-slate-800 shadow-xl flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">
              کل اخراجات (Total Kharcha)
            </span>
            <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center">
              <Receipt className="w-5 h-5" />
            </div>
          </div>
          <div>
            <span className={`text-3xl font-black text-rose-400 tracking-tight block ${blurred ? 'blur-md select-none' : ''}`}>
              {formatCurrency(summary.totalKharcha)}
            </span>
            <span className="block text-xs text-slate-400 mt-1">ٹکٹ + ہوٹل + ویزا + لوکل اخراجات</span>
          </div>
        </div>

        {/* Sub-Agent Commission Total */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-950 text-white rounded-2xl p-6 border border-slate-800 shadow-xl flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">
              سب ایجنٹ کمیشن (Commission)
            </span>
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div>
            <span className={`text-3xl font-black text-indigo-400 tracking-tight block ${blurred ? 'blur-md select-none' : ''}`}>
              {formatCurrency(summary.totalCommission)}
            </span>
            <span className="block text-xs text-slate-400 mt-1">ریفرل پارٹنرز کو دی گئی رقم</span>
          </div>
        </div>
      </div>

      {/* BIG GREEN CARD: NET PROFIT & AVG HAJI PROFIT */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="md:col-span-2 bg-gradient-to-br from-emerald-600 via-emerald-600 to-green-700 text-white rounded-3xl p-8 shadow-2xl shadow-emerald-500/20 border border-emerald-400/30 flex flex-col justify-between relative overflow-hidden">
          <div className="relative z-10 flex items-center justify-between">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-bold backdrop-blur">
              <Sparkles className="w-3.5 h-3.5" />
              حتمی بچت و منافع (Net Operating Profit)
            </div>
            <TrendingUp className="w-8 h-8 text-emerald-200" />
          </div>

          <div className="relative z-10 my-4">
            <span className="text-xs font-bold text-emerald-100 uppercase tracking-wide block">
              خالص محفوظ منافع (Wusooli - Kharcha - Commission):
            </span>
            <span className={`text-4xl sm:text-5xl font-black text-white tracking-tight block mt-1 drop-shadow-sm ${blurred ? 'blur-md select-none' : ''}`}>
              {formatCurrency(summary.netProfit)}
            </span>
          </div>

          <div className="relative z-10 pt-4 border-t border-white/20 flex items-center justify-between text-xs text-emerald-100 font-medium">
            <span>تمام ٹیکس و اخراجات نکالنے کے بعد کا خالص کیش</span>
            <span className="bg-white/20 px-3 py-1 rounded-full text-white font-bold">منافع کا مارجن 18.5%</span>
          </div>
        </div>

        {/* Per Haji Avg Profit */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-950 text-white rounded-3xl p-8 border border-slate-800 shadow-xl flex flex-col justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wide block">
              فی حاجی اوسط منافع (Per Haji Profit)
            </span>
            <span className={`text-3xl font-black text-emerald-400 tracking-tight block mt-3 ${blurred ? 'blur-md select-none' : ''}`}>
              {formatCurrency(summary.avgProfitPerHaji)}
            </span>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              کل رجسٹرڈ حجاج: <strong className="text-white">{summary.hajiCount}</strong>
            </p>
          </div>

          <div className="pt-4 border-t border-slate-800 text-[11px] text-slate-400">
            مارکیٹ اوسط کے مقابلے میں 22% زیادہ
          </div>
        </div>
      </div>

      {/* SEPARATE EXPENSES BREAKDOWN (Ticket, Hotel, Visa, Other) */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-[0_8px_30px_rgba(0,0,0,0.06)] space-y-4">
        <h2 className="font-bold text-sm text-gray-900 pb-2 border-b border-gray-100 flex items-center gap-2">
          <span>📊</span> اخراجات کی تفصیلی تقسیم (Expense Breakdown by Category)
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-sky-50 border border-sky-100 text-xs">
            <span className="text-sky-700 font-bold flex items-center gap-1">
              <Plane className="w-3.5 h-3.5" /> ٹکٹ خرچہ (Tickets)
            </span>
            <strong className={`text-base font-black text-sky-950 mt-1 block ${blurred ? 'blur-md select-none' : ''}`}>
              {formatCurrency(summary.ticketCostTotal)}
            </strong>
          </div>

          <div className="p-4 rounded-2xl bg-teal-50 border border-teal-100 text-xs">
            <span className="text-teal-700 font-bold flex items-center gap-1">
              <Building2 className="w-3.5 h-3.5" /> ہوٹل خرچہ (Hotels)
            </span>
            <strong className={`text-base font-black text-teal-950 mt-1 block ${blurred ? 'blur-md select-none' : ''}`}>
              {formatCurrency(summary.hotelCostTotal)}
            </strong>
          </div>

          <div className="p-4 rounded-2xl bg-purple-50 border border-purple-100 text-xs">
            <span className="text-purple-700 font-bold flex items-center gap-1">
              <FileCheck2 className="w-3.5 h-3.5" /> ویزا خرچہ (Visas)
            </span>
            <strong className={`text-base font-black text-purple-950 mt-1 block ${blurred ? 'blur-md select-none' : ''}`}>
              {formatCurrency(summary.visaCostTotal)}
            </strong>
          </div>

          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-100 text-xs">
            <span className="text-amber-700 font-bold flex items-center gap-1">
              <Receipt className="w-3.5 h-3.5" /> دیگر متفرق (Other)
            </span>
            <strong className={`text-base font-black text-amber-950 mt-1 block ${blurred ? 'blur-md select-none' : ''}`}>
              {formatCurrency(summary.otherCostTotal)}
            </strong>
          </div>
        </div>
      </div>

      {/* CHART: BAR CHART GROUP VS PROFIT */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-[0_8px_30px_rgba(0,0,0,0.06)] space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-gray-100">
          <h2 className="font-bold text-sm text-gray-900 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-emerald-600" />
            گروپ بمقابلہ منافع چارٹ (Group Profitability Chart)
          </h2>
          <span className="text-xs text-gray-400 font-medium">PKR لاکھ میں</span>
        </div>

        <div className={`h-72 w-full pt-4 ${blurred ? 'blur-md select-none' : ''}`}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={groupBreakdown} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="group_name" tick={{ fontSize: 10 }} interval={0} stroke="#94a3b8" />
              <YAxis tick={{ fontSize: 10 }} stroke="#94a3b8" />
              <Tooltip
                formatter={(val: any) => [formatCurrency(Number(val)), 'خالص منافع']}
                contentStyle={{ borderRadius: '16px', border: '1px solid #e2e8f0', fontSize: '12px' }}
              />
              <Bar dataKey="net_profit" radius={[8, 8, 0, 0]}>
                {groupBreakdown.map((entry: any, index: number) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.net_profit >= 0 ? '#10b981' : '#f43f5e'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* TABLE: GROUP WISE PROFIT BREAKDOWN */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-[0_8px_30px_rgba(0,0,0,0.06)] space-y-4">
        <h2 className="font-bold text-sm text-gray-900 pb-2 border-b border-gray-100 flex items-center gap-2">
          <span>📋</span> گروپ وار منافع اور وصولی کا تفصیلی کھاتہ (Group-wise Profit Statement)
        </h2>

        <div className="overflow-x-auto">
          <table className={`w-full text-xs text-left ${blurred ? 'blur-md select-none' : ''}`}>
            <thead className="bg-gray-50 text-gray-600 font-bold border-b border-gray-100">
              <tr>
                <th className="py-3 px-4">گروپ کا نام</th>
                <th className="py-3 px-4">حاجی تعداد</th>
                <th className="py-3 px-4">کل وصولی (Wusooli)</th>
                <th className="py-3 px-4">کل خرچہ (Kharcha)</th>
                <th className="py-3 px-4">سب ایجنٹ کمیشن</th>
                <th className="py-3 px-4">خالص منافع (Net Profit)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {groupBreakdown.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-gray-400">
                    کوئی گروپ ڈیٹا موجود نہیں ہے۔
                  </td>
                </tr>
              ) : (
                groupBreakdown.map((row: any) => (
                  <tr key={row.id} className="hover:bg-gray-50/50">
                    <td className="py-3 px-4 font-bold text-gray-900">{row.group_name}</td>
                    <td className="py-3 px-4 font-mono">{row.haji_count}</td>
                    <td className="py-3 px-4 font-mono text-emerald-600 font-bold">{formatCurrency(row.wusooli)}</td>
                    <td className="py-3 px-4 font-mono text-rose-600">{formatCurrency(row.kharcha)}</td>
                    <td className="py-3 px-4 font-mono text-indigo-600">{formatCurrency(row.commission)}</td>
                    <td className="py-3 px-4 font-mono font-black text-emerald-700">
                      {formatCurrency(row.net_profit)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
