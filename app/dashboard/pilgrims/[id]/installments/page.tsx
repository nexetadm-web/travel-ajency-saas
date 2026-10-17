'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import useSWR from 'swr';
import {
  CreditCard,
  Plus,
  Calendar,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ArrowRight,
  DollarSign,
  Receipt,
  User,
  Phone,
  FileText,
  Send,
  Loader2,
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { useAgency } from '@/hooks/useAgency';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function PilgrimInstallmentsPage() {
  const params = useParams();
  const router = useRouter();
  const pilgrimId = params.id as string;
  const { agency } = useAgency();

  const { data, mutate, isLoading } = useSWR(`/api/pilgrims/${pilgrimId}/installments`, fetcher);

  const [showNewPlanModal, setShowNewPlanModal] = useState(false);
  const [showPayModal, setShowPayModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<any>(null);

  // New Plan Form
  const [planForm, setPlanForm] = useState({
    totalAmount: '285000',
    advancePaid: '50000',
    installmentsCount: '5',
    startDate: '',
  });
  const [creatingPlan, setCreatingPlan] = useState(false);

  // Pay Form
  const [payMethod, setPayMethod] = useState('cash');
  const [paying, setPaying] = useState(false);

  const pilgrim = data?.pilgrim;
  const plan = data?.plan;
  const payments = data?.payments || [];
  const stats = data?.stats || {
    totalAmount: 0,
    advancePaid: 0,
    totalPaid: 0,
    remaining: 0,
    overdueCount: 0,
    progress: 0,
  };

  const handleCreatePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreatingPlan(true);
    try {
      const res = await fetch(`/api/pilgrims/${pilgrimId}/installments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(planForm),
      });

      if (res.ok) {
        setShowNewPlanModal(false);
        mutate();
      } else {
        const err = await res.json();
        alert(err.error || 'پلان بنانے میں خرابی');
      }
    } catch (err: any) {
      alert(err.message || 'خرابی پیش آئی');
    } finally {
      setCreatingPlan(false);
    }
  };

  const handlePayInstallment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPayment) return;

    setPaying(true);
    try {
      const res = await fetch('/api/installments/pay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentId: selectedPayment.id,
          method: payMethod,
        }),
      });

      if (res.ok) {
        setShowPayModal(false);
        setSelectedPayment(null);
        mutate();
      } else {
        const err = await res.json();
        alert(err.error || 'ادائیگی میں خرابی');
      }
    } catch (err: any) {
      alert(err.message || 'خرابی پیش آئی');
    } finally {
      setPaying(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto px-2 sm:px-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-4 sm:p-6 rounded-[24px] border border-gray-100 shadow-[0_8px_30px_rgba(0,0,0,0.06)]">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard/pilgrims"
            className="w-10 h-10 rounded-xl bg-gray-50 border border-gray-200 text-gray-600 hover:text-gray-900 flex items-center justify-center transition"
          >
            <ArrowRight className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-gray-900">
                💳 قسط پلان مینجمنٹ (Installments Plan)
              </h1>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
                {pilgrim?.full_name || 'لوڈ ہو رہا ہے...'}
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              پاسپورٹ: <strong className="font-mono text-gray-800">{pilgrim?.passport_no || '-'}</strong> | رابطہ: {pilgrim?.phone || '-'}
            </p>
          </div>
        </div>

        {!plan && (
          <button
            onClick={() => {
              if (pilgrim) {
                setPlanForm({
                  totalAmount: String(pilgrim.payment_total || 285000),
                  advancePaid: String(pilgrim.payment_paid || 50000),
                  installmentsCount: '5',
                  startDate: '',
                });
              }
              setShowNewPlanModal(true);
            }}
            className="px-6 py-3 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow-lg shadow-emerald-200 transition flex items-center gap-2 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            + نیا قسط پلان بنائیں
          </button>
        )}
      </div>

      {/* TOP 4 STATS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="p-6 rounded-[20px] bg-white border border-gray-100 shadow-[0_8px_30px_rgba(0,0,0,0.06)]">
          <span className="text-xs font-bold text-gray-500 uppercase block mb-1">کل قسط رقم (Total Plan)</span>
          <span className="text-2xl font-black text-gray-900 block">{formatCurrency(stats.totalAmount)}</span>
          <span className="text-[11px] text-gray-400 mt-1 block">پیشگی ایڈوانس: {formatCurrency(stats.advancePaid)}</span>
        </div>

        <div className="p-6 rounded-[20px] bg-white border-2 border-emerald-100 shadow-[0_8px_30px_rgba(0,0,0,0.06)]">
          <span className="text-xs font-bold text-gray-500 uppercase block mb-1">ادا شدہ رقم (Total Paid)</span>
          <span className="text-2xl font-black text-emerald-600 block">{formatCurrency(stats.totalPaid)}</span>
          <span className="text-[11px] text-emerald-700 mt-1 block font-medium">{stats.progress}% ادا ہو چکی ہے</span>
        </div>

        <div className="p-6 rounded-[20px] bg-white border-2 border-rose-100 shadow-[0_8px_30px_rgba(0,0,0,0.06)]">
          <span className="text-xs font-bold text-gray-500 uppercase block mb-1">باقی واجب الادا (Remaining)</span>
          <span className="text-2xl font-black text-rose-600 block">{formatCurrency(stats.remaining)}</span>
          <span className="text-[11px] text-rose-700 mt-1 block font-medium">بقیہ اقساط</span>
        </div>

        <div className={`p-6 rounded-[20px] shadow-[0_8px_30px_rgba(0,0,0,0.06)] border ${
          stats.overdueCount > 0 ? 'bg-rose-50 border-rose-200 text-rose-900' : 'bg-white border-gray-100'
        }`}>
          <span className="text-xs font-bold text-gray-500 uppercase block mb-1">زائد المیعاد (Overdue Count)</span>
          <span className={`text-2xl font-black block ${stats.overdueCount > 0 ? 'text-rose-600' : 'text-gray-900'}`}>
            {stats.overdueCount} قسط
          </span>
          <span className="text-[11px] mt-1 block">
            {stats.overdueCount > 0 ? '⚠️ فوری واٹس ایپ یاد دہانی بھیجیں' : 'تمام اقساط بروقت ہیں'}
          </span>
        </div>
      </div>

      {/* PAYMENT PROGRESS BAR */}
      <div className="p-6 bg-white rounded-[24px] border border-gray-100 shadow-sm space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-gray-700">قسط ادائیگی پیش رفت (Overall Progress):</span>
          <span className="font-black text-emerald-600">{stats.progress}%</span>
        </div>
        <div className="w-full h-3 rounded-full bg-gray-100 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500"
            style={{ width: `${stats.progress}%` }}
          />
        </div>
      </div>

      {/* INSTALLMENT PAYMENTS TABLE */}
      <div className="bg-white rounded-[24px] border border-gray-100 shadow-[0_8px_30px_rgba(0,0,0,0.06)] overflow-hidden">
        <div className="p-6 pb-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-bold text-gray-900">اقساط کا شیڈول اور وصولی ریکارڈ</h3>
          {plan && (
            <span className="text-xs text-gray-500">
              کل اقساط: <strong className="text-gray-900">{plan.installmentsCount}</strong> (فی قسط: {formatCurrency(plan.perInstallment)})
            </span>
          )}
        </div>

        {!plan ? (
          <div className="p-16 text-center text-gray-400 space-y-3">
            <CreditCard className="w-12 h-12 mx-auto opacity-30 text-emerald-500" />
            <p className="text-sm font-semibold text-gray-700">اس زائر کا کوئی قسط پلان فعال نہیں ہے</p>
            <button
              onClick={() => setShowNewPlanModal(true)}
              className="px-5 py-2.5 rounded-full bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-200"
            >
              + پہلا قسط پلان بنائیں
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-700">
              <thead className="bg-gray-50 text-gray-500 uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="p-4">قسط نمبر</th>
                  <th className="p-4">تاریخ ادائیگی (Due Date)</th>
                  <th className="p-4">رقم (Amount)</th>
                  <th className="p-4">اسٹیٹس</th>
                  <th className="p-4">تاریخ وصولی</th>
                  <th className="p-4">طریقہ / رسید نمبر</th>
                  <th className="p-4 text-center">ایکشن</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {payments.map((p: any, idx: number) => {
                  const isPaid = p.status === 'paid';
                  const isOverdue = p.status === 'overdue';

                  return (
                    <tr key={p.id} className="hover:bg-gray-50/60 transition">
                      <td className="p-4 font-bold text-gray-900">قسط #{idx + 1}</td>
                      <td className="p-4 font-mono font-bold">{p.dueDate}</td>
                      <td className="p-4 font-black text-sm text-gray-900">{formatCurrency(p.amount)}</td>
                      <td className="p-4">
                        <span
                          className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase inline-flex items-center gap-1 ${
                            isPaid
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : isOverdue
                              ? 'bg-rose-50 text-rose-700 border border-rose-200 animate-pulse'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}
                        >
                          {isPaid ? '✓ ادا شدہ (Paid)' : isOverdue ? '⚠️ زائد المیعاد (Overdue)' : 'زیر التواء (Pending)'}
                        </span>
                      </td>
                      <td className="p-4 font-mono text-gray-500">{p.paidDate || '-'}</td>
                      <td className="p-4">
                        {p.receiptNo ? (
                          <span className="font-mono text-emerald-700 font-bold block">{p.receiptNo}</span>
                        ) : (
                          '-'
                        )}
                      </td>
                      <td className="p-4 text-center">
                        {!isPaid ? (
                          <button
                            onClick={() => {
                              setSelectedPayment(p);
                              setShowPayModal(true);
                            }}
                            className="px-4 py-1.5 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow-md shadow-emerald-200 transition"
                          >
                            وصول کریں
                          </button>
                        ) : (
                          <span className="text-emerald-600 font-bold text-xs">مکمل ✓</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL 1: NEW INSTALLMENT PLAN */}
      {showNewPlanModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white border border-gray-100 rounded-[28px] p-6 sm:p-8 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-6">
              <h3 className="text-lg font-bold text-gray-900">+ نیا قسط پلان بنائیں</h3>
              <button
                onClick={() => setShowNewPlanModal(false)}
                className="w-8 h-8 rounded-lg bg-gray-100 text-gray-500 hover:text-gray-900 flex items-center justify-center text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreatePlan} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">کل پیکیج قیمت (PKR)*</label>
                <input
                  type="number"
                  required
                  value={planForm.totalAmount}
                  onChange={(e) => setPlanForm({ ...planForm, totalAmount: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-xs font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">ایڈوانس وصولی (PKR)</label>
                  <input
                    type="number"
                    value={planForm.advancePaid}
                    onChange={(e) => setPlanForm({ ...planForm, advancePaid: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-xs font-bold text-emerald-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">اقساط کی تعداد (e.g. 5)</label>
                  <input
                    type="number"
                    min="1"
                    max="24"
                    value={planForm.installmentsCount}
                    onChange={(e) => setPlanForm({ ...planForm, installmentsCount: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-xs font-bold"
                  />
                </div>
              </div>

              {/* Live Calc Preview */}
              <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs flex items-center justify-between">
                <span className="text-emerald-800 font-bold">ماہانہ قسط خودکار حساب:</span>
                <span className="text-sm font-black text-emerald-700">
                  {formatCurrency(
                    Math.round(
                      ((Number(planForm.totalAmount) || 0) - (Number(planForm.advancePaid) || 0)) /
                        (Number(planForm.installmentsCount) || 1)
                    )
                  )}
                </span>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowNewPlanModal(false)}
                  className="px-5 py-2.5 rounded-full border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-50"
                >
                  منسوخ کریں
                </button>
                <button
                  type="submit"
                  disabled={creatingPlan}
                  className="px-6 py-2.5 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow-md shadow-emerald-200 disabled:opacity-50"
                >
                  {creatingPlan ? 'پلان تیار ہو رہا ہے...' : '✓ پلان محفوظ کریں'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: PAY INSTALLMENT */}
      {showPayModal && selectedPayment && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white border border-gray-100 rounded-[28px] p-6 sm:p-8 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-6">
              <h3 className="text-lg font-bold text-gray-900">💵 قسط رقم وصول کریں</h3>
              <button
                onClick={() => setShowPayModal(false)}
                className="w-8 h-8 rounded-lg bg-gray-100 text-gray-500 hover:text-gray-900 flex items-center justify-center text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handlePayInstallment} className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 text-xs space-y-1">
                <span className="text-gray-400 block">واجب الادا قسط رقم:</span>
                <strong className="text-2xl font-black text-emerald-600 block">
                  {formatCurrency(selectedPayment.amount)}
                </strong>
                <span className="text-[11px] text-gray-500 font-mono block">تاریخ ادائیگی: {selectedPayment.dueDate}</span>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">ادائیگی کا ذریعہ (Method)</label>
                <select
                  value={payMethod}
                  onChange={(e) => setPayMethod(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 font-bold focus:outline-none focus:border-emerald-500"
                >
                  <option value="cash">کیش (Cash)</option>
                  <option value="easypaisa">ایزی پیسہ (Easypaisa)</option>
                  <option value="jazzcash">جاز کیش (Jazzcash)</option>
                  <option value="bank">بینک ٹرانسفر (Bank)</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowPayModal(false)}
                  className="px-5 py-2.5 rounded-full border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-50"
                >
                  منسوخ کریں
                </button>
                <button
                  type="submit"
                  disabled={paying}
                  className="px-6 py-2.5 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow-md shadow-emerald-200 disabled:opacity-50"
                >
                  {paying ? 'وصولی درج ہو رہی ہے...' : '✓ وصولی کنفرم کریں'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
