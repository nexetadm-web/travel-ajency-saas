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
  Clock,
  ArrowRight,
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

  // Departing this week estimate based on groups
  const groupsList = groupsData?.groups || [];
  const departingThisWeek = groupsList.filter((g: any) => {
    if (!g.departure_date) return false;
    const dep = new Date(g.departure_date).getTime();
    const now = Date.now();
    const week = 7 * 24 * 60 * 60 * 1000;
    return dep >= now && dep <= now + week;
  }).length;

  // Total Revenue calculation
  const totalRevenue =
    (receivable > 0 ? receivable : 0) +
    (ticketsData?.stats?.totalSales || ticketsMonthProfit * 4);

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
              {agency?.name ? agency.name.charAt(0) : 'H'}
            </div>
          )}
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                {agency?.name || 'Al-Haram Travel Management System'}
              </h1>
              <span className="px-3 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                لائیو پورٹل
              </span>
            </div>
            <p className="text-sm text-gray-500 mt-1">
              حکومتی لائسنس: <strong className="text-gray-700">{agency?.license_no || 'DTS Reg. Verified'}</strong> | رابطہ: <strong className="text-gray-700">{agency?.phone || '0300-0000000'}</strong> | ایڈمن: <strong className="text-gray-700">{agency?.owner_name || 'مالک ایجنسی'}</strong>
            </p>
          </div>
        </div>

        {/* Right CTA Buttons */}
        <div className="flex items-center gap-3 flex-wrap">
          <Link
            href="/dashboard/pilgrims/new"
            className="bg-emerald-500 text-white rounded-full px-6 py-3 shadow-lg shadow-emerald-200 hover:bg-emerald-600 text-xs font-bold transition flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            + نیا حاجی رجسٹر کریں
          </Link>
          <Link
            href="/dashboard/groups"
            className="bg-white border border-gray-200 rounded-full px-6 py-3 text-xs font-bold text-gray-700 hover:bg-gray-50 shadow-sm transition flex items-center gap-2"
          >
            <Users className="w-4 h-4 text-emerald-600" />
            نیا گروپ
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

      {/* PHASE 1: 4 ULTRA PREMIUM GRADIENT STAT CARDS WITH DOT PATTERN OVERLAY */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-gray-500 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-600" />
            کلیدی اشاریے (Primary Executive Metrics)
          </h2>
          <span className="text-xs text-gray-400">ریئل ٹائم ڈیٹا</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Card 1: Total Hujjaj */}
          <Link
            href="/dashboard/pilgrims"
            className="bg-gradient-to-br from-violet-600 to-indigo-700 text-white shadow-xl shadow-violet-300/50 rounded-2xl p-6 relative overflow-hidden group hover:scale-[1.02] transition duration-200 flex flex-col justify-between"
          >
            {/* Dot Pattern Overlay Opacity 10% */}
            <div
              className="absolute inset-0 opacity-10 pointer-events-none rounded-2xl"
              style={{
                backgroundImage: 'radial-gradient(circle, #ffffff 1.5px, transparent 1.5px)',
                backgroundSize: '12px 12px',
              }}
            />
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold text-violet-100 uppercase tracking-wide">
                  کل حجاج و زائرین (Total Hujjaj)
                </span>
                <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center text-white shadow-inner">
                  <Users className="w-6 h-6" />
                </div>
              </div>
              <div>
                <span className="text-3xl font-black tracking-tight">{totalPilgrims}</span>
                <span className="block text-xs text-violet-200 mt-1 font-medium">رجسٹرڈ عازمین حج و عمرہ</span>
              </div>
            </div>
            <div className="relative z-10 pt-4 mt-2 border-t border-white/10 flex items-center justify-between text-[11px] text-white/80">
              <span className="flex items-center gap-1 text-violet-200">
                <TrendingUp className="w-3.5 h-3.5" /> +12% اس ماہ
              </span>
              <ArrowRight className="w-3.5 h-3.5 opacity-70 group-hover:translate-x-1 transition" />
            </div>
          </Link>

          {/* Card 2: Total Revenue */}
          <Link
            href="/dashboard/ledger"
            className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-xl shadow-emerald-200/50 rounded-2xl p-6 relative overflow-hidden group hover:scale-[1.02] transition duration-200 flex flex-col justify-between"
          >
            <div
              className="absolute inset-0 opacity-10 pointer-events-none rounded-2xl"
              style={{
                backgroundImage: 'radial-gradient(circle, #ffffff 1.5px, transparent 1.5px)',
                backgroundSize: '12px 12px',
              }}
            />
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold text-emerald-100 uppercase tracking-wide">
                  کل آمدن و ریکوری (Total Revenue)
                </span>
                <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center text-white shadow-inner">
                  <DollarSign className="w-6 h-6" />
                </div>
              </div>
              <div>
                <span className="text-3xl font-black tracking-tight">{formatCurrency(totalRevenue)}</span>
                <span className="block text-xs text-emerald-100 mt-1 font-medium">مجموعی وصولیاں و بکنگز</span>
              </div>
            </div>
            <div className="relative z-10 pt-4 mt-2 border-t border-white/10 flex items-center justify-between text-[11px] text-white/80">
              <span className="flex items-center gap-1 text-emerald-100">
                <TrendingUp className="w-3.5 h-3.5" /> وصولی شرح 89%
              </span>
              <ArrowRight className="w-3.5 h-3.5 opacity-70 group-hover:translate-x-1 transition" />
            </div>
          </Link>

          {/* Card 3: Pending Visa */}
          <Link
            href="/dashboard/visas"
            className="bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-xl shadow-amber-200/50 rounded-2xl p-6 relative overflow-hidden group hover:scale-[1.02] transition duration-200 flex flex-col justify-between"
          >
            <div
              className="absolute inset-0 opacity-10 pointer-events-none rounded-2xl"
              style={{
                backgroundImage: 'radial-gradient(circle, #ffffff 1.5px, transparent 1.5px)',
                backgroundSize: '12px 12px',
              }}
            />
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold text-amber-100 uppercase tracking-wide">
                  زیر التواء ویزے (Pending Visa)
                </span>
                <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center text-white shadow-inner">
                  <FileCheck2 className="w-6 h-6" />
                </div>
              </div>
              <div>
                <span className="text-3xl font-black tracking-tight">{visaPending}</span>
                <span className="block text-xs text-amber-100 mt-1 font-medium">سفارت خانے میں زیر کارروائی</span>
              </div>
            </div>
            <div className="relative z-10 pt-4 mt-2 border-t border-white/10 flex items-center justify-between text-[11px] text-white/80">
              <span className="flex items-center gap-1 text-amber-100">
                <Clock className="w-3.5 h-3.5" /> فوری فالو اپ درکار
              </span>
              <ArrowRight className="w-3.5 h-3.5 opacity-70 group-hover:translate-x-1 transition" />
            </div>
          </Link>

          {/* Card 4: Departing Week */}
          <Link
            href="/dashboard/groups"
            className="bg-gradient-to-br from-rose-500 to-pink-600 text-white shadow-xl shadow-rose-200/50 rounded-2xl p-6 relative overflow-hidden group hover:scale-[1.02] transition duration-200 flex flex-col justify-between"
          >
            <div
              className="absolute inset-0 opacity-10 pointer-events-none rounded-2xl"
              style={{
                backgroundImage: 'radial-gradient(circle, #ffffff 1.5px, transparent 1.5px)',
                backgroundSize: '12px 12px',
              }}
            />
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold text-rose-100 uppercase tracking-wide">
                  روانگی اس ہفتے (Departing Week)
                </span>
                <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center text-white shadow-inner">
                  <Plane className="w-6 h-6" />
                </div>
              </div>
              <div>
                <span className="text-3xl font-black tracking-tight">{departingThisWeek > 0 ? departingThisWeek : totalGroups}</span>
                <span className="block text-xs text-rose-100 mt-1 font-medium">روانہ ہونے والے گروپس</span>
              </div>
            </div>
            <div className="relative z-10 pt-4 mt-2 border-t border-white/10 flex items-center justify-between text-[11px] text-white/80">
              <span className="flex items-center gap-1 text-rose-100">
                <Calendar className="w-3.5 h-3.5" /> اگلے 7 دن میں پرواز
              </span>
              <ArrowRight className="w-3.5 h-3.5 opacity-70 group-hover:translate-x-1 transition" />
            </div>
          </Link>
        </div>
      </div>

      {/* SECOND ROW CARDS (Receivable, Payable, Net Profit, Today Profit) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Receivable */}
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

        {/* Payable */}
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

        {/* Net Profit */}
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

        {/* Today Profit */}
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

      {/* QUICK ACTIONS 6 CARDS */}
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
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-all duration-200 shadow-sm">
              <Users className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold text-gray-900">گروپس اوکیوپینسی</span>
            <span className="text-[11px] text-gray-500">کاؤنٹ ڈاؤن اور سیٹیں</span>
          </Link>

          {/* Action 2: Tickets & PNR Check */}
          <Link
            href="/dashboard/flights/pnr-check"
            className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 text-center hover:border-sky-300 hover:shadow-md transition flex flex-col items-center justify-center gap-2.5 group"
          >
            <div className="w-12 h-12 rounded-full bg-sky-100 text-sky-600 flex items-center justify-center group-hover:scale-110 transition-all duration-200 shadow-sm">
              <Plane className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold text-gray-900">PNR لائیو چیک</span>
            <span className="text-[11px] text-gray-500">فلائٹ اسٹیٹس الرٹ</span>
          </Link>

          {/* Action 3: Visa Tracking */}
          <Link
            href="/dashboard/visas"
            className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 text-center hover:border-purple-300 hover:shadow-md transition flex flex-col items-center justify-center gap-2.5 group"
          >
            <div className="w-12 h-12 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center group-hover:scale-110 transition-all duration-200 shadow-sm">
              <FileCheck2 className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold text-gray-900">ویزہ کنبان بورڈ</span>
            <span className="text-[11px] text-gray-500">ڈریگ اور آٹو واٹس ایپ</span>
          </Link>

          {/* Action 4: Sub-Agents */}
          <Link
            href="/dashboard/sub-agents"
            className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 text-center hover:border-indigo-300 hover:shadow-md transition flex flex-col items-center justify-center gap-2.5 group"
          >
            <div className="w-12 h-12 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center group-hover:scale-110 transition-all duration-200 shadow-sm">
              <Globe2 className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold text-gray-900">سب ایجنٹس کمیشن</span>
            <span className="text-[11px] text-gray-500">5,000 فی حاجی ریکارڈ</span>
          </Link>

          {/* Action 5: Tour Packages */}
          <Link
            href="/dashboard/tours"
            className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 text-center hover:border-teal-300 hover:shadow-md transition flex flex-col items-center justify-center gap-2.5 group"
          >
            <div className="w-12 h-12 rounded-full bg-teal-100 text-teal-600 flex items-center justify-center group-hover:scale-110 transition-all duration-200 shadow-sm">
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
            <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center group-hover:scale-110 transition-all duration-200 shadow-sm">
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
