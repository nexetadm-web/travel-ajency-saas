'use client';

import { useState } from 'react';
import Link from 'next/link';
import useSWR from 'swr';
import { useAgency } from '@/hooks/useAgency';
import {
  Users,
  Plane,
  FileCheck2,
  DollarSign,
  TrendingUp,
  CreditCard,
  Building2,
  BookOpen,
  Receipt,
  Plus,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  Calendar,
  Globe2,
  Compass,
  Wallet,
  CheckCircle2,
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function DashboardOverviewPage() {
  const { agency } = useAgency();

  // Parallel SWR data fetching
  const { data: groupsData } = useSWR('/api/groups', fetcher, { revalidateOnFocus: false });
  const { data: pilgrimsData } = useSWR('/api/pilgrims', fetcher, { revalidateOnFocus: false });
  const { data: ticketsData } = useSWR('/api/tickets', fetcher, { revalidateOnFocus: false });
  const { data: visasData } = useSWR('/api/visas', fetcher, { revalidateOnFocus: false });
  const { data: ledgerCustData } = useSWR('/api/ledger/customers', fetcher, { revalidateOnFocus: false });
  const { data: ledgerSuppData } = useSWR('/api/ledger/suppliers', fetcher, { revalidateOnFocus: false });
  const { data: expensesData } = useSWR('/api/expenses', fetcher, { revalidateOnFocus: false });
  const { data: notifData } = useSWR('/api/notifications', fetcher, { revalidateOnFocus: false });
  const { data: cashbookData } = useSWR('/api/cashbook', fetcher, { revalidateOnFocus: false });

  const totalGroups = groupsData?.groups?.length || 0;
  const totalPilgrims = pilgrimsData?.pilgrims?.length || 0;
  const monthTickets = ticketsData?.stats?.totalTickets || 0;
  const todayTickets = ticketsData?.stats?.todayCount || 0;
  const ticketsMonthProfit = ticketsData?.stats?.monthProfit || 0;

  const visaPending =
    visasData?.visas?.filter(
      (v: any) => v.status === 'document_pending' || v.status === 'in_embassy'
    )?.length || 0;
  const receivable = ledgerCustData?.totalReceivable || 0;
  const payable = ledgerSuppData?.totalPayable || 0;
  const totalExpenses = expensesData?.totalExpense || 0;

  // Real net profit calculation
  const netProfit =
    (receivable > 0 ? receivable : 0) + ticketsMonthProfit - payable - totalExpenses;
  const todayProfit =
    ticketsData?.stats?.todayCount ? ticketsData.stats.todayCount * 5000 : 0;

  const notifications = notifData?.notifications || [];

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* TOP AGENCY HEADER CARD (Shell/PSO Light Theme) */}
      <div className="bg-white rounded-[24px] shadow-[0_8px_30px_rgba(0,0,0,0.06)] border border-gray-100 p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          {agency?.logo_url ? (
            <img
              src={agency.logo_url}
              alt={agency?.name}
              className="w-14 h-14 rounded-2xl object-cover border border-emerald-200 shadow-md shadow-emerald-500/10"
            />
          ) : (
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white text-2xl font-black flex items-center justify-center shadow-lg shadow-emerald-500/20 uppercase">
              {agency?.name ? agency.name.charAt(0) : 'T'}
            </div>
          )}
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                {agency?.name || 'Travel Agency SaaS'}
              </h1>
              <span className="px-3 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                لائیو پورٹل
              </span>
            </div>
            <p className="text-sm text-gray-500 mt-1">
              حکومتی لائسنس: <strong className="text-gray-700">{agency?.license_no || 'DTS Reg.'}</strong> | رابطہ: <strong className="text-gray-700">{agency?.phone || '0300-0000000'}</strong> | مالک: <strong className="text-gray-700">{agency?.owner_name || 'ایڈمن'}</strong>
            </p>
          </div>
        </div>

        {/* Right CTA Buttons */}
        <div className="flex items-center gap-3 flex-wrap">
          <Link
            href="/dashboard/groups"
            className="bg-emerald-500 text-white rounded-full px-6 py-3 shadow-lg shadow-emerald-200 hover:bg-emerald-600 text-xs font-bold transition flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            + نیا گروپ بنائیں
          </Link>
          <Link
            href="/dashboard/tickets"
            className="bg-white border border-gray-200 rounded-full px-6 py-3 text-xs font-bold text-gray-700 hover:bg-gray-50 shadow-sm transition flex items-center gap-2"
          >
            <Plane className="w-4 h-4 text-sky-500" />
            + نئی ٹکٹ
          </Link>
        </div>
      </div>

      {/* AI ALERTS BANNER (If notifications present) */}
      {notifications.length > 0 && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-start gap-3 text-amber-900 text-xs shadow-sm">
          <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="font-bold block text-amber-800">خودکار AI الرٹس (System Alerts):</span>
            <p className="mt-0.5 text-amber-700">{notifications[0].message}</p>
          </div>
          <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold border border-amber-300">
            {notifications.length} الرٹس
          </span>
        </div>
      )}

      {/* 8 METRICS CARDS - COLORFUL GRADIENTS LIKE SHELL CARDS */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-gray-500 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-600" />
            کاروباری سمری اور کلیدی اشاریے (Executive Key Metrics)
          </h2>
          <span className="text-xs text-gray-400">ریئل ٹائم اپ ڈیٹ</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* 1 Groups: bg-gradient-to-br from-blue-500 to-indigo-600 text-white */}
          <Link
            href="/dashboard/groups"
            className="rounded-[20px] p-6 shadow-[0_8px_30px_rgba(0,0,0,0.06)] hover:shadow-[0_12px_40px_rgba(0,0,0,0.12)] hover:-translate-y-1 transition-all bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold text-blue-100 uppercase tracking-wide">
                عمرہ گروپس (Groups)
              </span>
              <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur text-white flex items-center justify-center">
                <Users className="w-5 h-5" />
              </div>
            </div>
            <div>
              <span className="text-3xl font-black tracking-tight">{totalGroups}</span>
              <span className="block text-xs text-blue-100 mt-1 font-medium">فعال عمرہ و حج گروپس</span>
            </div>
          </Link>

          {/* 2 Pilgrims: bg-gradient-to-br from-emerald-400 to-cyan-600 text-white */}
          <Link
            href="/dashboard/pilgrims"
            className="rounded-[20px] p-6 shadow-[0_8px_30px_rgba(0,0,0,0.06)] hover:shadow-[0_12px_40px_rgba(0,0,0,0.12)] hover:-translate-y-1 transition-all bg-gradient-to-br from-emerald-400 to-cyan-600 text-white flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold text-emerald-100 uppercase tracking-wide">
                کل زائرین (Pilgrims)
              </span>
              <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur text-white flex items-center justify-center">
                <Users className="w-5 h-5" />
              </div>
            </div>
            <div>
              <span className="text-3xl font-black tracking-tight">{totalPilgrims}</span>
              <span className="block text-xs text-emerald-100 mt-1 font-medium">
                پاسپورٹ و ٹکٹ رجسٹرڈ
              </span>
            </div>
          </Link>

          {/* 3 Tickets: bg-gradient-to-br from-orange-400 to-pink-500 text-white */}
          <Link
            href="/dashboard/tickets"
            className="rounded-[20px] p-6 shadow-[0_8px_30px_rgba(0,0,0,0.06)] hover:shadow-[0_12px_40px_rgba(0,0,0,0.12)] hover:-translate-y-1 transition-all bg-gradient-to-br from-orange-400 to-pink-500 text-white flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold text-orange-100 uppercase tracking-wide">
                ماہانہ ٹکٹس (Tickets)
              </span>
              <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur text-white flex items-center justify-center">
                <Plane className="w-5 h-5" />
              </div>
            </div>
            <div>
              <span className="text-3xl font-black tracking-tight">{monthTickets}</span>
              <span className="block text-xs text-orange-100 mt-1 font-medium">
                آج کی ٹکٹس: {todayTickets} | منافع: {formatCurrency(ticketsMonthProfit)}
              </span>
            </div>
          </Link>

          {/* 4 Visas: bg-gradient-to-br from-violet-500 to-purple-600 text-white */}
          <Link
            href="/dashboard/visas"
            className="rounded-[20px] p-6 shadow-[0_8px_30px_rgba(0,0,0,0.06)] hover:shadow-[0_12px_40px_rgba(0,0,0,0.12)] hover:-translate-y-1 transition-all bg-gradient-to-br from-violet-500 to-purple-600 text-white flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold text-purple-100 uppercase tracking-wide">
                ویزہ کارروائی (Visas)
              </span>
              <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur text-white flex items-center justify-center">
                <FileCheck2 className="w-5 h-5" />
              </div>
            </div>
            <div>
              <span className="text-3xl font-black tracking-tight">{visaPending}</span>
              <span className="block text-xs text-purple-100 mt-1 font-medium">
                سفارت خانے میں زیر التواء
              </span>
            </div>
          </Link>

          {/* 5 Receivable: bg-gradient-to-br from-blue-50 to-indigo-100 border-blue-200 text-blue-900 value text-emerald-600 */}
          <Link
            href="/dashboard/ledger"
            className="rounded-[20px] p-6 shadow-[0_8px_30px_rgba(0,0,0,0.06)] hover:shadow-[0_12px_40px_rgba(0,0,0,0.12)] hover:-translate-y-1 transition-all bg-gradient-to-br from-blue-50 to-indigo-100 border border-blue-200 flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold text-blue-900 uppercase tracking-wide">
                کل واجب الوصول (Receivable)
              </span>
              <div className="w-10 h-10 rounded-xl bg-blue-500/15 text-blue-700 flex items-center justify-center">
                <ArrowDownRight className="w-5 h-5" />
              </div>
            </div>
            <div>
              <span className="text-3xl font-black text-emerald-600 tracking-tight block">
                {formatCurrency(receivable)}
              </span>
              <span className="block text-xs text-blue-800/80 mt-1 font-medium">
                گاہکوں اور سب ایجنٹس سے وصولی
              </span>
            </div>
          </Link>

          {/* 6 Payable: bg-gradient-to-br from-red-50 to-rose-100 border-red-200 value text-red-600 */}
          <Link
            href="/dashboard/ledger"
            className="rounded-[20px] p-6 shadow-[0_8px_30px_rgba(0,0,0,0.06)] hover:shadow-[0_12px_40px_rgba(0,0,0,0.12)] hover:-translate-y-1 transition-all bg-gradient-to-br from-red-50 to-rose-100 border border-red-200 flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold text-rose-900 uppercase tracking-wide">
                کل واجب الادا (Payable)
              </span>
              <div className="w-10 h-10 rounded-xl bg-red-500/15 text-red-700 flex items-center justify-center">
                <ArrowUpRight className="w-5 h-5" />
              </div>
            </div>
            <div>
              <span className="text-3xl font-black text-red-600 tracking-tight block">
                {formatCurrency(payable)}
              </span>
              <span className="block text-xs text-rose-800/80 mt-1 font-medium">
                ایئرلائن اور ہوٹل سپلائرز کو ادائیگی
              </span>
            </div>
          </Link>

          {/* 7 Net Profit: Keep green but add glow shadow-[0_0_20px_rgba(34,197,94,0.3)] */}
          <div className="rounded-[20px] p-6 shadow-[0_0_20px_rgba(34,197,94,0.3)] hover:shadow-[0_0_30px_rgba(34,197,94,0.5)] hover:-translate-y-1 transition-all bg-gradient-to-br from-green-500 via-emerald-600 to-teal-700 text-white flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold text-emerald-100 uppercase tracking-wide">
                خالص منافع (Net Profit)
              </span>
              <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur text-white flex items-center justify-center">
                <TrendingUp className="w-5 h-5" />
              </div>
            </div>
            <div>
              <span className="text-3xl font-black tracking-tight block text-white drop-shadow-sm">
                {formatCurrency(netProfit)}
              </span>
              <span className="block text-xs text-emerald-100 mt-1 font-medium">
                خالص آپریٹنگ منافع
              </span>
            </div>
          </div>

          {/* 8 Today Profit: bg-gradient-to-br from-purple-50 to-violet-100 border-purple-200 value text-purple-700 */}
          <div className="rounded-[20px] p-6 shadow-[0_8px_30px_rgba(0,0,0,0.06)] hover:shadow-[0_12px_40px_rgba(0,0,0,0.12)] hover:-translate-y-1 transition-all bg-gradient-to-br from-purple-50 to-violet-100 border border-purple-200 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold text-purple-900 uppercase tracking-wide">
                آج کا منافع (Today Profit)
              </span>
              <div className="w-10 h-10 rounded-xl bg-purple-500/15 text-purple-700 flex items-center justify-center">
                <DollarSign className="w-5 h-5" />
              </div>
            </div>
            <div>
              <span className="text-3xl font-black text-purple-700 tracking-tight block">
                {formatCurrency(todayProfit)}
              </span>
              <span className="block text-xs text-purple-800/80 mt-1 font-medium">
                آج کی بکنگز اور ٹکٹس
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* QUICK ACTIONS 6 CARDS (Colorful circles with hover scale effect) */}
      <div>
        <h2 className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-4 flex items-center gap-2">
          <span>⚡</span> فوری رسائی اور پاور ٹولز (Module Quick Actions)
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {/* Action 1: Groups */}
          <Link
            href="/dashboard/groups"
            className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 text-center hover:border-emerald-300 hover:shadow-md transition flex flex-col items-center justify-center gap-2.5 group"
          >
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center hover:scale-110 transition-all duration-200 shadow-sm">
              <Users className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold text-gray-900">گروپس اوکیوپینسی</span>
            <span className="text-[11px] text-gray-500">کاؤنٹ ڈاؤن اور سیٹیں</span>
          </Link>

          {/* Action 2: Tickets */}
          <Link
            href="/dashboard/tickets"
            className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 text-center hover:border-sky-300 hover:shadow-md transition flex flex-col items-center justify-center gap-2.5 group"
          >
            <div className="w-12 h-12 rounded-full bg-sky-100 text-sky-600 flex items-center justify-center hover:scale-110 transition-all duration-200 shadow-sm">
              <Plane className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold text-gray-900">PNR انسٹنٹ سرچ</span>
            <span className="text-[11px] text-gray-500">ایئرلائن منافع چارٹ</span>
          </Link>

          {/* Action 3: Visa Tracking */}
          <Link
            href="/dashboard/visas"
            className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 text-center hover:border-purple-300 hover:shadow-md transition flex flex-col items-center justify-center gap-2.5 group"
          >
            <div className="w-12 h-12 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center hover:scale-110 transition-all duration-200 shadow-sm">
              <FileCheck2 className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold text-gray-900">ویزہ کنبان بورڈ</span>
            <span className="text-[11px] text-gray-500">ڈریگ اور آٹو واٹس ایپ</span>
          </Link>

          {/* Action 4: Visa Consultancy */}
          <Link
            href="/dashboard/visa-consultancy"
            className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 text-center hover:border-indigo-300 hover:shadow-md transition flex flex-col items-center justify-center gap-2.5 group"
          >
            <div className="w-12 h-12 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center hover:scale-110 transition-all duration-200 shadow-sm">
              <Globe2 className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold text-gray-900">ویزہ کنسلٹنسی</span>
            <span className="text-[11px] text-gray-500">اسٹڈی / وزٹ / ورک ویزہ</span>
          </Link>

          {/* Action 5: Tour Packages */}
          <Link
            href="/dashboard/tours"
            className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 text-center hover:border-teal-300 hover:shadow-md transition flex flex-col items-center justify-center gap-2.5 group"
          >
            <div className="w-12 h-12 rounded-full bg-teal-100 text-teal-600 flex items-center justify-center hover:scale-110 transition-all duration-200 shadow-sm">
              <Compass className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold text-gray-900">ٹور پیکجز</span>
            <span className="text-[11px] text-gray-500">اندرون و بیرون ملک واؤچرز</span>
          </Link>

          {/* Action 6: Cash Book */}
          <Link
            href="/dashboard/cashbook"
            className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 text-center hover:border-amber-300 hover:shadow-md transition flex flex-col items-center justify-center gap-2.5 group"
          >
            <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center hover:scale-110 transition-all duration-200 shadow-sm">
              <Wallet className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold text-gray-900">روزمرہ کیش بک</span>
            <span className="text-[11px] text-gray-500">کیش ان ہینڈ اور آمدن</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
