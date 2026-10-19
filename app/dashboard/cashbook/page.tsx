'use client';

import { useState } from 'react';
import useSWR from 'swr';
import {
  Wallet,
  ArrowDownRight,
  ArrowUpRight,
  DollarSign,
  Plus,
  Filter,
  Calendar,
  CreditCard,
  Building,
  TrendingUp,
  Receipt,
  CheckCircle2,
} from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';
import PremiumCard from '@/components/ui/premium-card';
import ContentCard from '@/components/ui/content-card';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function CashBookPage() {
  const [filterType, setFilterType] = useState('all');
  const [filterMethod, setFilterMethod] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);

  const [form, setForm] = useState({
    type: 'in',
    category: 'زائر ایڈوانس (Pilgrim Advance)',
    amount: '',
    method: 'cash',
    description: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const { data, mutate, isLoading } = useSWR(
    `/api/cashbook?type=${filterType}&method=${filterMethod}`,
    fetcher
  );

  const entries = data?.entries || [];
  const todayIn = data?.todayIn || 0;
  const todayOut = data?.todayOut || 0;
  const cashInHand = data?.cashInHand || 0;
  const dailyFlow = data?.dailyFlow || [];

  const handleAddEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.amount) return;

    setSubmitting(true);
    try {
      const res = await fetch('/api/cashbook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        setShowAddModal(false);
        setForm({
          type: 'in',
          category: 'زائر ایڈوانس (Pilgrim Advance)',
          amount: '',
          method: 'cash',
          description: '',
        });
        mutate();
      } else {
        const err = await res.json();
        alert(err.error || 'اندراج شامل کرنے میں خرابی');
      }
    } catch (err: any) {
      alert(err.message || 'خرابی پیش آئی');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-full overflow-x-hidden space-y-6 max-w-7xl mx-auto px-2 sm:px-4">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-4 sm:p-6 rounded-[24px] border border-gray-100 shadow-[0_8px_30px_rgba(0,0,0,0.06)] overflow-hidden transform-none" style={{ transform: 'none' }}>
        <div dir="rtl" className="text-right transform-none" style={{ transform: 'none' }}>
          <h1 className="font-urdu text-[28px] md:text-[32px] font-bold text-right leading-[2.2] transform-none rotate-0 not-italic" dir="rtl" style={{ transform: 'none', fontStyle: 'normal' }}>
            روزمرہ کیش بک
          </h1>
          <p className="font-urdu text-sm text-gray-600 text-right transform-none" dir="rtl">
            روزانہ نقد آمدنی، اخراجات اور کیش ان ہینڈ کا حساب کتاب <span className="font-english text-xs text-emerald-700 font-semibold">(Daily Cash Book)</span>
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="font-urdu bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-full flex items-center gap-2 transform-none shadow-md transition"
          style={{ transform: 'none' }}
        >
          <span>+</span> <span>نیا کیش اندراج</span> <span className="font-english text-xs">(Add Entry)</span>
        </button>
      </div>

      {/* TOP 3 SUMMARY CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        <PremiumCard
          title="کل نقد ہاتھ میں (Cash in Hand)"
          value={formatCurrency(cashInHand)}
          subtitle="ابتدائی بیلنس + آمدنی - اخراجات"
          icon={Wallet}
          gradient="emerald"
          trend="موجودہ کیش"
        />
        <PremiumCard
          title="آمدنی (Total Cash In)"
          value={formatCurrency(todayIn)}
          subtitle="وصول شدہ رقوم اور ایڈوانس"
          icon={ArrowDownRight}
          gradient="cyan"
          trend="کیش ان فلو"
          trendUp={true}
        />
        <PremiumCard
          title="اخراجات (Total Cash Out)"
          value={formatCurrency(todayOut)}
          subtitle="ادائیگیاں اور دفتری اخراجات"
          icon={ArrowUpRight}
          gradient="rose"
          trend="کیش آؤٹ فلو"
          trendUp={false}
        />
      </div>

      {/* 7 DAYS CASH FLOW CHART */}
      <div className="bg-white rounded-[24px] p-6 border border-gray-100 shadow-[0_8px_30px_rgba(0,0,0,0.06)]">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold text-gray-800 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-600" />
            پچھلے 7 دنوں کا کیش فلو چارٹ (Last 7 Days In vs Out)
          </h2>
          <span className="text-xs text-gray-400">ریئل ٹائم تجزیہ</span>
        </div>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={dailyFlow}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
              <XAxis dataKey="displayDate" stroke="#94A3B8" fontSize={11} />
              <YAxis stroke="#94A3B8" fontSize={11} tickFormatter={(val) => `₨${val / 1000}k`} />
              <Tooltip
                formatter={(value: any) => [`₨ ${Number(value).toLocaleString()}`, '']}
                contentStyle={{ backgroundColor: '#FFFFFF', borderRadius: '12px', border: '1px solid #E2E8F0' }}
              />
              <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
              <Bar dataKey="in" name="آمدنی (Cash In)" fill="#10B981" radius={[6, 6, 0, 0]} />
              <Bar dataKey="out" name="اخراجات (Cash Out)" fill="#F43F5E" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* FILTER CONTROLS */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-gray-400" />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3.5 py-2 bg-white border border-gray-200 rounded-xl text-xs text-gray-700 shadow-sm"
          >
            <option value="all">تمام اندراجات (All Types)</option>
            <option value="in">صرف آمدنی (Cash In)</option>
            <option value="out">صرف اخراجات (Cash Out)</option>
          </select>

          <select
            value={filterMethod}
            onChange={(e) => setFilterMethod(e.target.value)}
            className="px-3.5 py-2 bg-white border border-gray-200 rounded-xl text-xs text-gray-700 shadow-sm"
          >
            <option value="all">تمام ادائیگی ذرائع</option>
            <option value="cash">کیش (Cash)</option>
            <option value="bank">بینک ٹرانسفر (Bank)</option>
            <option value="easypaisa">ایزی پیسہ (Easypaisa)</option>
            <option value="jazzcash">جاز کیش (Jazzcash)</option>
          </select>
        </div>

        <span className="text-xs text-gray-500">
          کل ریکارڈز: <strong className="text-gray-900">{entries.length}</strong>
        </span>
      </div>

      {/* ENTRIES TABLE */}
      <ContentCard>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-700">
            <thead className="bg-gray-50/80 text-gray-500 border-b border-gray-100 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="p-4">تاریخ</th>
                <th className="p-4">قسم (Type)</th>
                <th className="p-4">کیٹگری (Category)</th>
                <th className="p-4">تفصیل (Description)</th>
                <th className="p-4">ادائیگی طریقہ</th>
                <th className="p-4 text-right">رقم (Amount)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-400">
                    کیش بک لوڈ ہو رہی ہے...
                  </td>
                </tr>
              ) : entries.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-400">
                    کوئی کیش اندراج نہیں ملا۔ نیا اندراج شامل کرنے کے لیے اوپر بٹن دبائیں۔
                  </td>
                </tr>
              ) : (
                entries.map((entry: any) => (
                  <tr key={entry.id} className="hover:bg-gray-50/60 transition">
                    <td className="p-4 font-mono text-gray-500">{formatDate(entry.date)}</td>
                    <td className="p-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase inline-flex items-center gap-1 ${
                          entry.type === 'in'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}
                      >
                        {entry.type === 'in' ? '↓ آمدنی (IN)' : '↑ اخراجات (OUT)'}
                      </span>
                    </td>
                    <td className="p-4 font-bold text-gray-900">{entry.category || 'عمومی'}</td>
                    <td className="p-4 text-gray-600 max-w-xs truncate">{entry.description || '-'}</td>
                    <td className="p-4">
                      <span className="px-2 py-0.5 rounded-md bg-gray-100 text-gray-700 text-[11px] font-semibold uppercase">
                        {entry.method}
                      </span>
                    </td>
                    <td className={`p-4 text-right font-black text-sm ${
                      entry.type === 'in' ? 'text-emerald-600' : 'text-rose-600'
                    }`}>
                      {entry.type === 'in' ? '+' : '-'} {formatCurrency(entry.amount)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </ContentCard>

      {/* ADD ENTRY MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white border border-gray-100 rounded-[28px] p-6 sm:p-8 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-6">
              <h3 className="text-lg font-bold text-gray-900">+ نیا کیش بک اندراج</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="w-8 h-8 rounded-lg bg-gray-100 text-gray-500 hover:text-gray-900 flex items-center justify-center text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddEntry} className="space-y-4">
              {/* Type Switcher */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setForm({ ...form, type: 'in' })}
                  className={`py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                    form.type === 'in'
                      ? 'bg-emerald-500 text-white shadow-md shadow-emerald-200'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <ArrowDownRight className="w-4 h-4" />
                  آمدنی (Cash In)
                </button>
                <button
                  type="button"
                  onClick={() => setForm({ ...form, type: 'out' })}
                  className={`py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                    form.type === 'out'
                      ? 'bg-rose-500 text-white shadow-md shadow-rose-200'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <ArrowUpRight className="w-4 h-4" />
                  اخراجات (Cash Out)
                </button>
              </div>

              {/* Amount */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">رقم (Amount in PKR)*</label>
                <input
                  type="number"
                  required
                  placeholder="e.g. 50000"
                  value={form.amount}
                  onChange={(e) => setForm({ ...form, amount: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm font-black focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">کیٹگری (Category)</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:border-emerald-500"
                >
                  {form.type === 'in' ? (
                    <>
                      <option value="زائر ایڈوانس (Pilgrim Advance)">زائر ایڈوانس (Pilgrim Advance)</option>
                      <option value="ٹکٹ فروخت کیش (Ticket Sale)">ٹکٹ فروخت کیش (Ticket Sale)</option>
                      <option value="ویزہ کنسلٹنسی فیس (Visa Fee)">ویزہ کنسلٹنسی فیس (Visa Fee)</option>
                      <option value="ٹور پیکیج بکنگ (Tour Booking)">ٹور پیکیج بکنگ (Tour Booking)</option>
                      <option value="سب ایجنٹ وصولی (Sub Agent)">سب ایجنٹ وصولی (Sub Agent)</option>
                      <option value="دیگر آمدن (Other)">دیگر آمدن (Other)</option>
                    </>
                  ) : (
                    <>
                      <option value="دفتری کرایہ (Office Rent)">دفتری کرایہ (Office Rent)</option>
                      <option value="اسٹاف تنخواہ (Staff Salary)">اسٹاف تنخواہ (Staff Salary)</option>
                      <option value="ہوٹل سپلائر ادائیگی (Hotel Supplier)">ہوٹل سپلائر ادائیگی (Hotel Supplier)</option>
                      <option value="ایئرلائن ادائیگی (Airline Payment)">ایئرلائن ادائیگی (Airline Payment)</option>
                      <option value="ٹرانسپورٹ و بس کرایہ (Transport)">ٹرانسپورٹ و بس کرایہ (Transport)</option>
                      <option value="سفارت خانہ فیس (Embassy Fee)">سفارت خانہ فیس (Embassy Fee)</option>
                      <option value="دیگر متفرق اخراجات (Other Expense)">دیگر متفرق اخراجات (Other Expense)</option>
                    </>
                  )}
                </select>
              </div>

              {/* Method */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">ادائیگی کا طریقہ (Method)</label>
                <select
                  value={form.method}
                  onChange={(e) => setForm({ ...form, method: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:border-emerald-500"
                >
                  <option value="cash">کیش (Cash in Hand)</option>
                  <option value="bank">بینک اکاؤنٹ (Bank Transfer)</option>
                  <option value="easypaisa">ایزی پیسہ (Easypaisa)</option>
                  <option value="jazzcash">جاز کیش (Jazzcash)</option>
                </select>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">تفصیل / ریمارکس</label>
                <input
                  type="text"
                  placeholder="کسٹمر یا اخراجات کی تفصیل..."
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-5 py-2.5 rounded-full border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-50"
                >
                  منسوخ کریں
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow-md shadow-emerald-200 disabled:opacity-50"
                >
                  {submitting ? 'محفوظ ہو رہا ہے...' : 'محفوظ کریں'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
