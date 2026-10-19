'use client';

import { useState } from 'react';
import useSWR from 'swr';
import {
  Receipt,
  Plus,
  DollarSign,
  PieChart,
  Calendar,
  Building,
  TrendingDown,
} from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';
import PremiumCard from '@/components/ui/premium-card';
import ContentCard from '@/components/ui/content-card';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const CATEGORY_NAMES: Record<string, string> = {
  office_rent: 'دفتر کا کرایہ (Office Rent)',
  staff_salary: 'اسٹاف کی تنخواہ (Staff Salary)',
  marketing: 'مارکیٹنگ و اشتہارات (Marketing)',
  utility: 'بجلی، گیس، انٹرنیٹ (Utility Bills)',
  other: 'دیگر متفرق اخراجات (Other)',
};

export default function ExpensesPage() {
  const { data, mutate, isLoading } = useSWR('/api/expenses', fetcher);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    category: 'office_rent',
    amount: '',
    date: '',
    description: '',
    bill_url: '',
  });

  const expenses = data?.expenses || [];
  const totalExpense = data?.totalExpense || 0;
  const breakdown = data?.categoryBreakdown || {};

  const handleCreateExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      await fetch('/api/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      mutate();
      setShowModal(false);
      setFormData({ category: 'office_rent', amount: '', date: '', description: '', bill_url: '' });
    } catch (err) {
      console.error(err);
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
            دفتر کے اخراجات
          </h1>
          <p className="font-urdu text-sm text-gray-600 text-right transform-none" dir="rtl">
            کرایہ، اسٹاف تنخواہیں اور بلز کا تفصیلی آڈٹ <span className="font-english text-xs text-rose-700 font-semibold">(Expenses Management)</span>
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="font-urdu bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-full flex items-center justify-center gap-2 transform-none shadow-md text-xs font-bold transition"
          style={{ transform: 'none' }}
        >
          <span>+</span> <span>نیا خرچہ درج کریں</span> <span className="font-english text-xs">(Add Expense)</span>
        </button>
      </div>

      {/* OVERVIEW CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <PremiumCard
          title="کل اخراجات"
          value={formatCurrency(totalExpense)}
          subtitle="مجموعی دفتری لاگت"
          icon={DollarSign}
          gradient="rose"
          trend="کل اخراجات"
        />

        {Object.entries(breakdown).slice(0, 3).map(([cat, amt]: any, idx) => {
          const gradients: ('amber' | 'cyan' | 'purple')[] = ['amber', 'cyan', 'purple'];
          return (
            <PremiumCard
              key={cat}
              title={CATEGORY_NAMES[cat] || cat}
              value={formatCurrency(amt)}
              subtitle="کیٹگری خرچہ"
              icon={Receipt}
              gradient={gradients[idx % gradients.length]}
              trend="اخراجات"
            />
          );
        })}
      </div>

      {/* EXPENSES TABLE */}
      <ContentCard>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-700">
            <thead className="bg-gray-50/80 text-gray-500 border-b border-gray-100 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="p-4">کیٹیگری (Category)</th>
                <th className="p-4">تفصیل (Description)</th>
                <th className="p-4">تاریخ (Date)</th>
                <th className="p-4 text-right">رقم (Amount)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {expenses.map((e: any) => (
                <tr key={e.id} className="hover:bg-gray-50/60 transition">
                  <td className="p-4 font-bold text-gray-900">
                    {CATEGORY_NAMES[e.category] || e.category}
                  </td>
                  <td className="p-4 text-gray-600">{e.description || '-'}</td>
                  <td className="p-4 text-gray-400 font-mono">{formatDate(e.date)}</td>
                  <td className="p-4 text-right font-black text-rose-600 text-sm">
                    PKR {(e.amount || 0).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {expenses.length === 0 && (
            <p className="text-center text-xs text-gray-400 py-8">کوئی خرچہ درج نہیں ہے</p>
          )}
        </div>
      </ContentCard>

      {/* ADD EXPENSE MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white border border-gray-100 rounded-3xl p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-gray-900 mb-4">+ نیا خرچہ درج کریں</h3>
            <form onSubmit={handleCreateExpense} className="space-y-3">
              <div>
                <label className="block text-xs text-gray-700 font-medium mb-1">کیٹیگری منتخب کریں</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-xs focus:outline-none focus:border-emerald-500"
                >
                  <option value="office_rent">دفتر کا کرایہ (Office Rent)</option>
                  <option value="staff_salary">اسٹاف کی تنخواہ (Staff Salary)</option>
                  <option value="marketing">مارکیٹنگ و تشہیر (Marketing)</option>
                  <option value="utility">یوٹیلٹی بلز (Utility Bills)</option>
                  <option value="other">دیگر (Other)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs text-gray-700 font-medium mb-1">رقم (PKR)*</label>
                <input
                  type="number"
                  required
                  placeholder="35000"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-xs font-bold focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs text-gray-700 font-medium mb-1">تاریخ (Date)</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs text-gray-700 font-medium mb-1">تفصیل / نوٹ</label>
                <input
                  type="text"
                  placeholder="مالک مکان کو ماہانہ کرایہ کی ادائیگی"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold transition"
                >
                  منسوخ
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow-md shadow-emerald-200 transition"
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
