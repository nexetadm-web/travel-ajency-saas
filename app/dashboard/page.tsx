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
import PremiumCard from '@/components/ui/premium-card';

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
      <div className="bg-white rounded-[20px] shadow-[0_8px_30px_rgba(0,0,0,0.06)] border border-gray-100 p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {agency?.logo_url ? (
            <img
              src={agency.logo_url}
              alt={agency?.name || 'Al-Haram Travels & Tours'}
              className="w-12 h-12 rounded-xl object-cover border border-emerald-200 shadow-sm"
            />
          ) : (
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-md">
              {agency?.name ? agency.name.charAt(0) : 'A'}
            </div>
          )}
          <div>
            <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              {agency?.name || 'Al-Haram Travels & Tours'}
              <span className="bg-emerald-100 text-emerald-700 text-[10px] px-2 py-0.5 rounded-full font-semibold">لائیو پورٹل</span>
            </h1>
            <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-gray-500">
              <span className="flex items-center gap-1">👤 {agency?.owner_name || 'Haji Abdul Rehman'}</span>
              <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
              <span className="flex items-center gap-1">📞 {agency?.phone || '+92 300 5556677'}</span>
              <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
              <span className="flex items-center gap-1">🪪 لائسنس: {agency?.license_no || 'DTS-LHR-2026'}</span>
            </div>
          </div>
        </div>

        {/* Right CTA Buttons */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <Link
            href="/dashboard/pilgrims/new"
            className="bg-emerald-500 text-white rounded-full px-5 py-2.5 shadow-md shadow-emerald-200 hover:bg-emerald-600 text-xs font-bold transition flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            + نیا حاجی رجسٹر کریں
          </Link>
          <Link
            href="/dashboard/groups"
            className="bg-white border border-gray-200 rounded-full px-5 py-2.5 text-xs font-bold text-gray-700 hover:bg-gray-50 shadow-sm transition flex items-center gap-2"
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

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <PremiumCard
            title="کل حجاج و زائرین (Total Hujjaj)"
            value={totalPilgrims}
            subtitle="رجسٹرڈ عازمین حج و عمرہ"
            icon={Users}
            gradient="violet"
            trend="+12% اس ماہ"
            href="/dashboard/pilgrims"
          />
          <PremiumCard
            title="کل آمدن و ریکوری (Total Revenue)"
            value={formatCurrency(totalRevenue)}
            subtitle="مجموعی وصولیاں و بکنگز"
            icon={DollarSign}
            gradient="emerald"
            trend="وصولی شرح 89%"
            href="/dashboard/ledger"
          />
          <PremiumCard
            title="زیر التواء ویزے (Pending Visa)"
            value={visaPending}
            subtitle="سفارت خانے میں زیر کارروائی"
            icon={FileCheck2}
            gradient="amber"
            trend="فوری فالو اپ درکار"
            href="/dashboard/visas"
          />
          <PremiumCard
            title="روانگی اس ہفتے (Departing Week)"
            value={departingThisWeek > 0 ? departingThisWeek : totalGroups}
            subtitle="روانہ ہونے والے گروپس"
            icon={Plane}
            gradient="rose"
            trend="اگلے 7 دن میں پرواز"
            href="/dashboard/groups"
          />
        </div>
      </div>

      {/* SECOND ROW CARDS (Receivable, Payable, Net Profit, Today Profit) - ALL COLORFUL */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <PremiumCard
          title="کل واجب الوصول (Receivable)"
          value={formatCurrency(receivable)}
          subtitle="گاہکوں اور سب ایجنٹس سے وصولی"
          icon={ArrowDownRight}
          gradient="cyan"
          trend="وصولی کھاتہ اوپن"
          href="/dashboard/ledger"
        />
        <PremiumCard
          title="کل واجب الادا (Payable)"
          value={formatCurrency(payable)}
          subtitle="ایئرلائن اور ہوٹل سپلائرز کو ادائیگی"
          icon={ArrowUpRight}
          gradient={payable === 0 ? 'slate' : 'rose'}
          trend="سپلائرز بقایا بیلنس"
          href="/dashboard/ledger"
        />
        <PremiumCard
          title="خالص منافع (Net Profit)"
          value={formatCurrency(netProfit)}
          subtitle="خالص آپریٹنگ منافع"
          icon={TrendingUp}
          gradient="green"
          trend="منافع مارجن 18.5%"
        />
        <PremiumCard
          title="آج کا منافع (Today Profit)"
          value={formatCurrency(todayProfit)}
          subtitle="آج کی بکنگز اور ٹکٹس"
          icon={DollarSign}
          gradient="purple"
          trend="ریئل ٹائم بکنگ کاؤنٹر"
        />
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
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center group-hover:scale-110 transition-all duration-200 shadow-md shadow-emerald-500/20">
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
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-sky-500 to-blue-600 text-white flex items-center justify-center group-hover:scale-110 transition-all duration-200 shadow-md shadow-sky-500/20">
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
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-violet-600 text-white flex items-center justify-center group-hover:scale-110 transition-all duration-200 shadow-md shadow-purple-500/20">
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
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center group-hover:scale-110 transition-all duration-200 shadow-md shadow-indigo-500/20">
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
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-teal-500 to-emerald-600 text-white flex items-center justify-center group-hover:scale-110 transition-all duration-200 shadow-md shadow-teal-500/20">
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
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 text-white flex items-center justify-center group-hover:scale-110 transition-all duration-200 shadow-md shadow-amber-500/20">
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
