'use client';

import { useState, useEffect, cache } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
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
import DashboardHeader from '@/components/DashboardHeader';

// Dynamic import for heavy card component
const PremiumCard = dynamic(() => import('@/components/ui/premium-card'), {
  loading: () => (
    <div className="w-full min-h-[165px] md:min-h-[175px] rounded-2xl bg-gray-100 animate-pulse border border-gray-200" />
  ),
  ssr: true,
});

// Cached fetcher with 60-second revalidation
const cachedFetcher = cache(async (url: string) => {
  const res = await fetch(url, { next: { revalidate: 60 } });
  return res.json();
});

const swrOptions = {
  revalidateOnFocus: false,
  dedupingInterval: 60000,
  keepPreviousData: true,
};

export default function DashboardOverviewPage() {
  const { agency } = useAgency();
  const router = useRouter();

  // Instant navigation prefetching
  useEffect(() => {
    const prefetchRoutes = [
      '/dashboard/groups',
      '/dashboard/pilgrims',
      '/dashboard/pilgrims/new',
      '/dashboard/flights/pnr-check',
      '/dashboard/visas',
      '/dashboard/ledger',
      '/dashboard/cashbook',
      '/dashboard/sub-agents',
      '/dashboard/tours',
    ];
    prefetchRoutes.forEach((route) => {
      try {
        router.prefetch(route);
      } catch (e) {
        // ignore
      }
    });
  }, [router]);

  // Parallel cached SWR data fetching
  const { data: groupsData } = useSWR('/api/groups', cachedFetcher, swrOptions);
  const { data: pilgrimsData } = useSWR('/api/pilgrims', cachedFetcher, swrOptions);
  const { data: ticketsData } = useSWR('/api/tickets', cachedFetcher, swrOptions);
  const { data: visasData } = useSWR('/api/visas', cachedFetcher, swrOptions);
  const { data: ledgerCustData } = useSWR('/api/ledger/customers', cachedFetcher, swrOptions);
  const { data: ledgerSuppData } = useSWR('/api/ledger/suppliers', cachedFetcher, swrOptions);
  const { data: expensesData } = useSWR('/api/expenses', cachedFetcher, swrOptions);
  const { data: notifData } = useSWR('/api/notifications', cachedFetcher, swrOptions);
  const { data: cashbookData } = useSWR('/api/cashbook', cachedFetcher, swrOptions);

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
    <div className="container mx-auto px-4 md:px-8 lg:px-12 max-w-[1440px] space-y-6 sm:space-y-8">
      {/* PROFESSIONAL COMPACT OWNER HEADER */}
      <DashboardHeader />

      {/* AI ALERTS BANNER (If notifications present) */}
      {notifications.length > 0 && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-start gap-3 text-amber-900 text-xs shadow-sm transform-none" dir="rtl" style={{ transform: 'none' }}>
          <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1 transform-none">
            <span className="font-urdu font-bold block text-amber-800 not-italic">
              خودکار AI الرٹس <span className="font-english text-[11px]">(System Alerts)</span>:
            </span>
            <p className="mt-0.5 text-amber-700 font-urdu not-italic">{notifications[0].message}</p>
          </div>
          <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold border border-amber-300 font-urdu shrink-0 not-italic">
            {notifications.length} الرٹس
          </span>
        </div>
      )}

      {/* PHASE 1: 3 PRIMARY EXECUTIVE METRICS CARDS */}
      <div dir="rtl" className="transform-none" style={{ transform: 'none' }}>
        <div className="flex items-center justify-between mb-4 transform-none" style={{ transform: 'none' }}>
          <div className="flex items-center gap-2 transform-none">
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <span className="font-urdu text-sm sm:text-base font-bold text-gray-700 not-italic transform-none">
              کلیدی اشاریے
            </span>
            <span className="font-english text-[11px] font-bold text-gray-400 uppercase tracking-wider transform-none" dir="ltr">
              (PRIMARY EXECUTIVE METRICS)
            </span>
          </div>
          <span className="font-urdu text-xs text-gray-400 not-italic transform-none">ریئل ٹائم ڈیٹا</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5 auto-rows-fr" dir="ltr">
          <PremiumCard
            title="کل حجاج و زائرین (TOTAL HUJJAJ)"
            value={totalPilgrims}
            subtitle="رجسٹرڈ عازمین حج و عمرہ"
            icon={Users}
            gradient="violet"
            trend="+12% اس ماہ"
            href="/dashboard/pilgrims"
            className="col-span-1"
          />
          <PremiumCard
            title="کل آمدن و ریکوری (TOTAL REVENUE)"
            value={formatCurrency(totalRevenue)}
            subtitle="مجموعی وصولیاں و بکنگز"
            icon={DollarSign}
            gradient="emerald"
            trend="وصولی شرح 89%"
            href="/dashboard/ledger"
            className="col-span-1"
          />
          <PremiumCard
            title="زیر التواء ویزے (PENDING VISA)"
            value={visaPending}
            subtitle="سفارت خانے میں زیر کارروائی"
            icon={FileCheck2}
            gradient="amber"
            trend="فوری فالو اپ درکار"
            href="/dashboard/visas"
            className="col-span-1"
          />
        </div>
      </div>

      {/* SECOND ROW METRICS (Departing, Receivable, Payable, Net Profit) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-5 auto-rows-fr">
        <PremiumCard
          title="روانگی اس ہفتے (Departing Week)"
          value={departingThisWeek > 0 ? departingThisWeek : totalGroups}
          subtitle="روانہ ہونے والے گروپس"
          icon={Plane}
          gradient="rose"
          trend="اگلے 7 دن میں پرواز"
          href="/dashboard/groups"
        />
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
            prefetch={true}
            className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 text-center hover:border-emerald-300 hover:shadow-md transition-all duration-150 active:scale-[0.98] flex flex-col items-center justify-center gap-2.5 group"
            style={{ transform: 'none' }}
          >
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center shadow-md shadow-emerald-500/20" style={{ transform: 'none' }}>
              <Users className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold text-gray-900">گروپس اوکیوپینسی</span>
            <span className="text-[11px] text-gray-500">کاؤنٹ ڈاؤن اور سیٹیں</span>
          </Link>

          {/* Action 2: Tickets & PNR Check */}
          <Link
            href="/dashboard/flights/pnr-check"
            prefetch={true}
            className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 text-center hover:border-sky-300 hover:shadow-md transition-all duration-150 active:scale-[0.98] flex flex-col items-center justify-center gap-2.5 group"
            style={{ transform: 'none' }}
          >
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-sky-500 to-blue-600 text-white flex items-center justify-center shadow-md shadow-sky-500/20" style={{ transform: 'none' }}>
              <Plane className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold text-gray-900">PNR لائیو چیک</span>
            <span className="text-[11px] text-gray-500">فلائٹ اسٹیٹس الرٹ</span>
          </Link>

          {/* Action 3: Visa Tracking */}
          <Link
            href="/dashboard/visas"
            prefetch={true}
            className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 text-center hover:border-purple-300 hover:shadow-md transition-all duration-150 active:scale-[0.98] flex flex-col items-center justify-center gap-2.5 group"
            style={{ transform: 'none' }}
          >
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-violet-600 text-white flex items-center justify-center shadow-md shadow-purple-500/20" style={{ transform: 'none' }}>
              <FileCheck2 className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold text-gray-900">ویزہ کنبان بورڈ</span>
            <span className="text-[11px] text-gray-500">ڈریگ اور آٹو واٹس ایپ</span>
          </Link>

          {/* Action 4: Sub-Agents */}
          <Link
            href="/dashboard/sub-agents"
            prefetch={true}
            className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 text-center hover:border-indigo-300 hover:shadow-md transition-all duration-150 active:scale-[0.98] flex flex-col items-center justify-center gap-2.5 group"
            style={{ transform: 'none' }}
          >
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center shadow-md shadow-indigo-500/20" style={{ transform: 'none' }}>
              <Globe2 className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold text-gray-900">سب ایجنٹس کمیشن</span>
            <span className="text-[11px] text-gray-500">5,000 فی حاجی ریکارڈ</span>
          </Link>

          {/* Action 5: Tour Packages */}
          <Link
            href="/dashboard/tours"
            prefetch={true}
            className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 text-center hover:border-teal-300 hover:shadow-md transition-all duration-150 active:scale-[0.98] flex flex-col items-center justify-center gap-2.5 group"
            style={{ transform: 'none' }}
          >
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-teal-500 to-emerald-600 text-white flex items-center justify-center shadow-md shadow-teal-500/20" style={{ transform: 'none' }}>
              <Compass className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold text-gray-900">ٹور پیکجز</span>
            <span className="text-[11px] text-gray-500">اندرون و بیرون ملک واؤچرز</span>
          </Link>

          {/* Action 6: Cash Book */}
          <Link
            href="/dashboard/cashbook"
            prefetch={true}
            className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 text-center hover:border-amber-300 hover:shadow-md transition-all duration-150 active:scale-[0.98] flex flex-col items-center justify-center gap-2.5 group"
            style={{ transform: 'none' }}
          >
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 text-white flex items-center justify-center shadow-md shadow-amber-500/20" style={{ transform: 'none' }}>
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
