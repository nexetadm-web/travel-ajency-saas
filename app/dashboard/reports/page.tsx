'use client';

import useSWR from 'swr';
import {
  BarChart3,
  TrendingUp,
  DollarSign,
  PieChart,
  Users,
  Plane,
  FileCheck2,
  Calendar,
  Building2,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart as RechartsPie,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { formatCurrency } from '@/lib/utils';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const COLORS = ['#10b981', '#0ea5e9', '#8b5cf6', '#f59e0b', '#ec4899', '#6366f1'];

export default function ReportsAnalyticsPage() {
  const { data: ticketsData } = useSWR('/api/tickets', fetcher);
  const { data: groupsData } = useSWR('/api/groups', fetcher);
  const { data: visasData } = useSWR('/api/visas', fetcher);
  const { data: expensesData } = useSWR('/api/expenses', fetcher);
  const { data: custData } = useSWR('/api/ledger/customers', fetcher);
  const { data: suppData } = useSWR('/api/ledger/suppliers', fetcher);

  const airlineData = ticketsData?.airlineChartData || [];
  const groups = groupsData?.groups || [];
  const visas = visasData?.visas || [];
  const expensesBreakdown = expensesData?.categoryBreakdown || {};

  const totalReceivable = custData?.totalReceivable || 0;
  const totalPayable = suppData?.totalPayable || 0;
  const totalExpense = expensesData?.totalExpense || 0;
  const monthTicketProfit = ticketsData?.stats?.monthProfit || 0;

  // Visa Status Distribution
  const visaStatusCounts: Record<string, number> = {};
  visas.forEach((v: any) => {
    const s = v.status || 'pending';
    visaStatusCounts[s] = (visaStatusCounts[s] || 0) + 1;
  });

  const visaPieData = Object.entries(visaStatusCounts).map(([name, value]) => ({
    name: name.replace('_', ' ').toUpperCase(),
    value,
  }));

  // Expense Pie Data
  const expensePieData = Object.entries(expensesBreakdown).map(([name, value]: any) => ({
    name: name.replace('_', ' ').toUpperCase(),
    value,
  }));

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-black text-white">رپورٹس اور کاروباری تجزیات (Analytics & Reports)</h1>
          <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400 text-xs font-semibold">
            Executive Intelligence
          </span>
        </div>
        <p className="text-xs text-slate-400 mt-1">
          منافع، اخراجات، ایئرلائن کارکردگی اور کیش فلو کی جامع اینالیٹکس
        </p>
      </div>

      {/* TOP SUMMARY CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl bg-slate-950/80 border border-emerald-500/30 shadow-xl">
          <span className="text-xs text-emerald-300 font-semibold">ٹکٹنگ ماہانہ منافع</span>
          <div className="text-2xl font-black text-emerald-400 mt-1">{formatCurrency(monthTicketProfit)}</div>
          <span className="text-[11px] text-emerald-300/70">ٹکٹ مارجن</span>
        </div>

        <div className="p-5 rounded-3xl bg-slate-950/80 border border-sky-500/30 shadow-xl">
          <span className="text-xs text-sky-300 font-semibold">کل واجب الوصول (Receivable)</span>
          <div className="text-2xl font-black text-sky-400 mt-1">{formatCurrency(totalReceivable)}</div>
          <span className="text-[11px] text-sky-300/70">گاہکوں کے بقایا جات</span>
        </div>

        <div className="p-5 rounded-3xl bg-slate-950/80 border border-rose-500/30 shadow-xl">
          <span className="text-xs text-rose-300 font-semibold">کل واجب الادا (Payable)</span>
          <div className="text-2xl font-black text-rose-400 mt-1">{formatCurrency(totalPayable)}</div>
          <span className="text-[11px] text-rose-300/70">سپلائرز کے واجبات</span>
        </div>

        <div className="p-5 rounded-3xl bg-slate-950/80 border border-pink-500/30 shadow-xl">
          <span className="text-xs text-pink-300 font-semibold">کل آپریٹنگ اخراجات</span>
          <div className="text-2xl font-black text-pink-400 mt-1">{formatCurrency(totalExpense)}</div>
          <span className="text-[11px] text-pink-300/70">دفتر و عملہ لاگت</span>
        </div>
      </div>

      {/* CHARTS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Airline Profitability */}
        <div className="p-6 rounded-3xl bg-slate-950/80 border border-slate-800 shadow-xl space-y-4">
          <h3 className="font-bold text-sm text-white flex items-center gap-2">
            <Plane className="w-4 h-4 text-sky-400" />
            ایئرلائن وائز منافع کی تقسیم (Profit by Airline)
          </h3>
          <div className="h-64 w-full">
            {airlineData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={airlineData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="airline" stroke="#94a3b8" fontSize={11} />
                  <YAxis stroke="#94a3b8" fontSize={11} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155' }} />
                  <Bar dataKey="profit" name="خالص منافع (PKR)" fill="#0ea5e9" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-500 text-xs">
                کوئی ایئرلائن ڈیٹا موجود نہیں
              </div>
            )}
          </div>
        </div>

        {/* Chart 2: Visa Pipeline Distribution */}
        <div className="p-6 rounded-3xl bg-slate-950/80 border border-slate-800 shadow-xl space-y-4">
          <h3 className="font-bold text-sm text-white flex items-center gap-2">
            <FileCheck2 className="w-4 h-4 text-purple-400" />
            ویزہ پراسیسنگ پائپ لائن (Visa Status Pipeline)
          </h3>
          <div className="h-64 w-full">
            {visaPieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPie>
                  <Pie
                    data={visaPieData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    fontSize={10}
                  >
                    {visaPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155' }} />
                </RechartsPie>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-500 text-xs">
                کوئی ویزہ ڈیٹا موجود نہیں
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
