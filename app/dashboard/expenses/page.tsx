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
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-white">دفتر کے اخراجات (Expenses Management)</h1>
            <span className="px-2.5 py-0.5 rounded-full bg-pink-500/20 text-pink-400 text-xs font-semibold">
              ماڈیول 6
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            کرایہ، اسٹاف تنخواہیں، مارکیٹنگ اور بلز کا تفصیلی آڈٹ
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white font-bold text-xs shadow-lg shadow-pink-600/20 transition flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          + نیا خرچہ درج کریں (Add Expense)
        </button>
      </div>

      {/* OVERVIEW CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl bg-slate-950/80 border border-pink-500/30 shadow-xl">
          <span className="text-xs text-pink-300 font-semibold">کل اخراجات (Total Expenses)</span>
          <div className="text-2xl sm:text-3xl font-black text-pink-400 mt-1">
            {formatCurrency(totalExpense)}
          </div>
          <span className="text-[11px] text-pink-300/70 font-medium">مجموعی لاگت</span>
        </div>

        {Object.entries(breakdown).slice(0, 3).map(([cat, amt]: any) => (
          <div key={cat} className="p-5 rounded-3xl bg-slate-950/80 border border-slate-800 shadow-xl">
            <span className="text-xs text-slate-400 font-medium truncate block">
              {CATEGORY_NAMES[cat] || cat}
            </span>
            <div className="text-xl font-bold text-white mt-1">{formatCurrency(amt)}</div>
          </div>
        ))}
      </div>

      {/* EXPENSES TABLE */}
      <div className="rounded-2xl border border-slate-800 bg-slate-950/60 overflow-x-auto shadow-xl">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-900/90 text-slate-400 border-b border-slate-800 uppercase tracking-wider text-[11px]">
            <tr>
              <th className="p-3.5">کیٹیگری (Category)</th>
              <th className="p-3.5">تفصیل (Description)</th>
              <th className="p-3.5">تاریخ (Date)</th>
              <th className="p-3.5">رقم (Amount)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-850">
            {expenses.map((e: any) => (
              <tr key={e.id} className="hover:bg-slate-900/40 transition">
                <td className="p-3.5 font-bold text-white">
                  {CATEGORY_NAMES[e.category] || e.category}
                </td>
                <td className="p-3.5 text-slate-300">{e.description || '-'}</td>
                <td className="p-3.5 text-slate-400">{formatDate(e.date)}</td>
                <td className="p-3.5 font-bold text-rose-400 text-sm">
                  PKR {(e.amount || 0).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {expenses.length === 0 && (
          <p className="text-center text-xs text-slate-500 py-8">کوئی خرچہ درج نہیں ہے</p>
        )}
      </div>

      {/* ADD EXPENSE MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-4">+ نیا خرچہ درج کریں</h3>
            <form onSubmit={handleCreateExpense} className="space-y-3">
              <div>
                <label className="block text-xs text-slate-300 mb-1">کیٹیگری منتخب کریں</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs"
                >
                  <option value="office_rent">دفتر کا کرایہ (Office Rent)</option>
                  <option value="staff_salary">اسٹاف کی تنخواہ (Staff Salary)</option>
                  <option value="marketing">مارکیٹنگ و تشہیر (Marketing)</option>
                  <option value="utility">یوٹیلٹی بلز (Utility Bills)</option>
                  <option value="other">دیگر (Other)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs text-slate-300 mb-1">رقم (PKR)*</label>
                <input
                  type="number"
                  required
                  placeholder="35000"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-300 mb-1">تاریخ (Date)</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-300 mb-1">تفصیل / نوٹ</label>
                <input
                  type="text"
                  placeholder="مالک مکان کو ماہانہ کرایہ کی ادائیگی"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs"
                >
                  منسوخ
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-pink-600 hover:bg-pink-500 text-white font-bold text-xs"
                >
                  محفوظ کریں
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
