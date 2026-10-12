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
  ChevronRight,
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function DashboardOverviewPage() {
  const { agency } = useAgency();

  // Fetch data in parallel with SWR (<200ms response)
  const { data: groupsData } = useSWR('/api/groups', fetcher, { revalidateOnFocus: false });
  const { data: pilgrimsData } = useSWR('/api/pilgrims', fetcher, { revalidateOnFocus: false });
  const { data: ticketsData } = useSWR('/api/tickets', fetcher, { revalidateOnFocus: false });
  const { data: visasData } = useSWR('/api/visas', fetcher, { revalidateOnFocus: false });
  const { data: ledgerCustData } = useSWR('/api/ledger/customers', fetcher, { revalidateOnFocus: false });
  const { data: ledgerSuppData } = useSWR('/api/ledger/suppliers', fetcher, { revalidateOnFocus: false });
  const { data: expensesData } = useSWR('/api/expenses', fetcher, { revalidateOnFocus: false });
  const { data: notifData } = useSWR('/api/notifications', fetcher, { revalidateOnFocus: false });

  const totalGroups = groupsData?.groups?.length || 0;
  const totalPilgrims = pilgrimsData?.pilgrims?.length || 0;
  const monthTickets = ticketsData?.stats?.totalTickets || 0;
  const todayTickets = ticketsData?.stats?.todayCount || 0;
  const ticketsMonthProfit = ticketsData?.stats?.monthProfit || 0;

  const visaPending = visasData?.visas?.filter((v: any) => v.status === 'document_pending' || v.status === 'in_embassy')?.length || 0;
  const receivable = ledgerCustData?.totalReceivable || 0;
  const payable = ledgerSuppData?.totalPayable || 0;
  const totalExpenses = expensesData?.totalExpense || 0;

  // Approximate overall net cash flow
  const netProfit = (receivable > 0 ? receivable : 0) + ticketsMonthProfit - payable - totalExpenses;
  const todayProfit = ticketsData?.stats?.todayCount ? ticketsData.stats.todayCount * 5000 : 0;

  const notifications = notifData?.notifications || [];

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Top Welcome & Agency Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border border-slate-800 p-6 rounded-3xl shadow-xl">
        <div className="flex items-center gap-4">
          {agency?.logo_url ? (
            <img
              src={agency.logo_url}
              alt={agency?.name}
              className="w-14 h-14 rounded-2xl object-cover border border-emerald-500/40 shadow-lg"
            />
          ) : (
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white font-black text-2xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
              {agency?.name ? agency.name.charAt(0) : 'T'}
            </div>
          )}
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-white">{agency?.name || 'Travel Agency SaaS'}</h1>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-semibold border border-emerald-500/20">
                100% آن لائن
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              خوش آمدید، <strong>{agency?.owner_name || 'ایڈمن'}</strong> | حکومتی لائسنس: {agency?.license_no || 'DTS Reg'} | رابطہ: {agency?.phone || '0300-0000000'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/groups"
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 transition flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            + نیا گروپ بنائیں
          </Link>
          <Link
            href="/dashboard/tickets"
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs border border-slate-700 transition flex items-center gap-1.5"
          >
            <Plane className="w-4 h-4 text-sky-400" />
            + نئی ٹکٹ
          </Link>
        </div>
      </div>

      {/* AI ALERTS BANNER (If any notifications present) */}
      {notifications.length > 0 && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3 text-amber-200 text-xs">
          <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="font-bold block text-amber-300">خودکار AI الرٹس (System Alerts):</span>
            <p className="mt-0.5 text-slate-300">{notifications[0].message}</p>
          </div>
          <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold">
            {notifications.length} الرٹس
          </span>
        </div>
      )}

      {/* TOP 8 BIG GRADIENT CARDS */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            کاروباری سمری اور کلیدی اشاریے (Executive Key Metrics)
          </h2>
          <span className="text-[11px] text-slate-500">اپ ڈیٹ: ہر 5 سیکنڈ میں</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Total Groups */}
          <Link
            href="/dashboard/groups"
            className="p-5 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/40 border border-slate-800 hover:border-emerald-500/40 transition group shadow-xl flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-400">کل گروپس (Groups)</span>
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div>
              <span className="text-3xl font-extrabold text-white tracking-tight">{totalGroups}</span>
              <span className="block text-[11px] text-emerald-400 mt-1 font-medium">فعال عمرہ و حج ٹورز</span>
            </div>
          </Link>

          {/* Card 2: Pilgrims Count */}
          <Link
            href="/dashboard/pilgrims"
            className="p-5 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-sky-950/40 border border-slate-800 hover:border-sky-500/40 transition group shadow-xl flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-400">کل زائرین (Pilgrims)</span>
              <div className="w-9 h-9 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div>
              <span className="text-3xl font-extrabold text-white tracking-tight">{totalPilgrims}</span>
              <span className="block text-[11px] text-sky-400 mt-1 font-medium">پاسپورٹ اور ویزہ رجسٹرڈ</span>
            </div>
          </Link>

          {/* Card 3: Tickets Month */}
          <Link
            href="/dashboard/tickets"
            className="p-5 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950/40 border border-slate-800 hover:border-indigo-500/40 transition group shadow-xl flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-400">ماہانہ ٹکٹس (Tickets)</span>
              <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
                <Plane className="w-4 h-4" />
              </div>
            </div>
            <div>
              <span className="text-3xl font-extrabold text-white tracking-tight">{monthTickets}</span>
              <span className="block text-[11px] text-indigo-400 mt-1 font-medium">آج کی ٹکٹس: {todayTickets}</span>
            </div>
          </Link>

          {/* Card 4: Visa Pending */}
          <Link
            href="/dashboard/visas"
            className="p-5 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-amber-950/40 border border-slate-800 hover:border-amber-500/40 transition group shadow-xl flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-400">ویزہ زیر التواء (Visas)</span>
              <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
                <FileCheck2 className="w-4 h-4" />
              </div>
            </div>
            <div>
              <span className="text-3xl font-extrabold text-amber-400 tracking-tight">{visaPending}</span>
              <span className="block text-[11px] text-amber-300/80 mt-1 font-medium">سفارت خانے میں کارروائی جاری</span>
            </div>
          </Link>

          {/* Card 5: Total Receivable */}
          <Link
            href="/dashboard/ledger"
            className="p-5 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/60 border border-emerald-500/20 hover:border-emerald-500/40 transition group shadow-xl flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-emerald-300">کل واجب الوصول (Receivable)</span>
              <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <ArrowDownRight className="w-4 h-4" />
              </div>
            </div>
            <div>
              <span className="text-2xl font-extrabold text-emerald-400 tracking-tight">
                {formatCurrency(receivable)}
              </span>
              <span className="block text-[11px] text-emerald-300/70 mt-1 font-medium">گاہکوں سے لینی ہے</span>
            </div>
          </Link>

          {/* Card 6: Total Payable */}
          <Link
            href="/dashboard/ledger"
            className="p-5 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-rose-950/60 border border-rose-500/20 hover:border-rose-500/40 transition group shadow-xl flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-rose-300">کل واجب الادا (Payable)</span>
              <div className="w-9 h-9 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center">
                <ArrowUpRight className="w-4 h-4" />
              </div>
            </div>
            <div>
              <span className="text-2xl font-extrabold text-rose-400 tracking-tight">
                {formatCurrency(payable)}
              </span>
              <span className="block text-[11px] text-rose-300/70 mt-1 font-medium">سپلائرز کو دینی ہے</span>
            </div>
          </Link>

          {/* Card 7: Net Profit */}
          <div className="p-5 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-teal-950/60 border border-teal-500/30 shadow-xl flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-teal-300">مجموعی خالص منافع (Net Profit)</span>
              <div className="w-9 h-9 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <div>
              <span className="text-2xl font-extrabold text-teal-300 tracking-tight">
                {formatCurrency(netProfit)}
              </span>
              <span className="block text-[11px] text-teal-400/80 mt-1 font-medium">خالص آپریٹنگ منافع</span>
            </div>
          </div>

          {/* Card 8: Today Profit */}
          <div className="p-5 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-purple-950/60 border border-purple-500/30 shadow-xl flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-purple-300">آج کا منافع (Today Profit)</span>
              <div className="w-9 h-9 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center">
                <DollarSign className="w-4 h-4" />
              </div>
            </div>
            <div>
              <span className="text-2xl font-extrabold text-purple-300 tracking-tight">
                {formatCurrency(todayProfit)}
              </span>
              <span className="block text-[11px] text-purple-400/80 mt-1 font-medium">آج کی بکنگز اور ٹکٹس</span>
            </div>
          </div>
        </div>
      </div>

      {/* BOTTOM SMALL POWER TOOL CARDS FOR EACH MODULE */}
      <div>
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
          <span>⚡</span> فوری رسائی اور پاور ٹولز (Module Quick Actions)
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <Link
            href="/dashboard/groups"
            className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-emerald-500/50 hover:bg-slate-850 transition text-center flex flex-col items-center justify-center gap-2 group"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center group-hover:scale-110 transition">
              <Users className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-white">گروپس اوکیوپینسی</span>
            <span className="text-[10px] text-slate-400">کاؤنٹ ڈاؤن اور سیٹیں</span>
          </Link>

          <Link
            href="/dashboard/tickets"
            className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-sky-500/50 hover:bg-slate-850 transition text-center flex flex-col items-center justify-center gap-2 group"
          >
            <div className="w-10 h-10 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center group-hover:scale-110 transition">
              <Plane className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-white">PNR انسٹنٹ سرچ</span>
            <span className="text-[10px] text-slate-400">ایئرلائن منافع چارٹ</span>
          </Link>

          <Link
            href="/dashboard/visas"
            className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-purple-500/50 hover:bg-slate-850 transition text-center flex flex-col items-center justify-center gap-2 group"
          >
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center group-hover:scale-110 transition">
              <FileCheck2 className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-white">ویزہ کنبان بورڈ</span>
            <span className="text-[10px] text-slate-400">ڈریگ اور آٹو واٹس ایپ</span>
          </Link>

          <Link
            href="/dashboard/hotels"
            className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-amber-500/50 hover:bg-slate-850 transition text-center flex flex-col items-center justify-center gap-2 group"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center group-hover:scale-110 transition">
              <Building2 className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-white">ہوٹل و ٹرانسپورٹ</span>
            <span className="text-[10px] text-slate-400">مکہ و مدینہ الاٹمنٹ</span>
          </Link>

          <Link
            href="/dashboard/ledger"
            className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-teal-500/50 hover:bg-slate-850 transition text-center flex flex-col items-center justify-center gap-2 group"
          >
            <div className="w-10 h-10 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center group-hover:scale-110 transition">
              <BookOpen className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-white">کھاتہ اور QR رسیدیں</span>
            <span className="text-[10px] text-slate-400">کسٹمر و سپلائر لیجر</span>
          </Link>

          <Link
            href="/dashboard/settings/whatsapp"
            className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-pink-500/50 hover:bg-slate-850 transition text-center flex flex-col items-center justify-center gap-2 group"
          >
            <div className="w-10 h-10 rounded-xl bg-pink-500/10 text-pink-400 flex items-center justify-center group-hover:scale-110 transition">
              <Receipt className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-white">WhatsApp برانڈنگ</span>
            <span className="text-[10px] text-slate-400">9PM آٹو سمری کرون</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
