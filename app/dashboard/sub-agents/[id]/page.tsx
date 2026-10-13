'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import useSWR from 'swr';
import {
  Users2,
  ArrowRight,
  Phone,
  MapPin,
  CreditCard,
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
  Plus,
  X,
  ExternalLink,
  Loader2,
  Copy,
  Check,
  Send,
} from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';
import { useAgency } from '@/hooks/useAgency';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function SubAgentDetailPage() {
  const params = useParams();
  const subAgentId = params.id as string;
  const { agency } = useAgency();

  const { data, mutate, isLoading } = useSWR(
    subAgentId ? `/api/sub-agents/${subAgentId}` : null,
    fetcher
  );

  const subAgent = data?.subAgent;
  const pilgrims = data?.pilgrims || [];

  const [payModalOpen, setPayModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const [payForm, setPayForm] = useState({
    amount: '',
    method: 'cash',
    receiptNo: '',
    notes: '',
  });

  const handleCopyLink = (passportNo: string) => {
    const url = `${window.location.origin}/track/${passportNo}`;
    navigator.clipboard.writeText(url);
    setCopiedId(passportNo);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handlePayout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!payForm.amount || parseFloat(payForm.amount) <= 0) {
      setErrorMsg('براہ کرم درست ادائیگی رقم درج کریں');
      return;
    }

    setSubmitting(true);
    setErrorMsg('');

    try {
      const res = await fetch(`/api/sub-agents/${subAgentId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payForm),
      });

      const resData = await res.json();
      if (!res.ok) {
        throw new Error(resData.error || 'کمیشن ادائیگی میں خرابی');
      }

      setPayModalOpen(false);
      setPayForm({
        amount: '',
        method: 'cash',
        receiptNo: '',
        notes: '',
      });
      mutate();
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="py-24 text-center text-gray-400">
        <Loader2 className="w-8 h-8 mx-auto animate-spin mb-3 text-indigo-500" />
        <p className="text-xs font-semibold">سب ایجنٹ کھاتہ لوڈ ہو رہا ہے...</p>
      </div>
    );
  }

  if (!subAgent) {
    return (
      <div className="p-12 text-center rounded-[24px] bg-white border border-gray-100 shadow-sm max-w-xl mx-auto mt-10">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
        <h2 className="text-lg font-bold text-gray-900">سب ایجنٹ نہیں ملا</h2>
        <Link
          href="/dashboard/sub-agents"
          className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-50 text-indigo-700 text-xs font-bold"
        >
          <ArrowRight className="w-4 h-4" />
          واپس سب ایجنٹس پورٹل
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header Card */}
      <div className="bg-white rounded-[24px] shadow-[0_8px_30px_rgba(0,0,0,0.06)] border border-gray-100 p-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard/sub-agents"
              className="w-10 h-10 rounded-2xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 transition"
              title="واپس جائیں"
            >
              <ArrowRight className="w-5 h-5" />
            </Link>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-black text-gray-900">{subAgent.name}</h1>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                  {subAgent.commissionType === 'percent'
                    ? `${subAgent.commissionValue}% کمیشن`
                    : `${formatCurrency(subAgent.commissionValue)} فی حاجی`}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 mt-2">
                <span className="flex items-center gap-1 font-mono text-gray-700">
                  <Phone className="w-3.5 h-3.5 text-indigo-500" />
                  {subAgent.phone}
                </span>
                {subAgent.city && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-emerald-500" />
                    {subAgent.city}
                  </span>
                )}
                {subAgent.cnic && (
                  <span className="font-mono text-gray-400">CNIC: {subAgent.cnic}</span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <button
              onClick={() => {
                setErrorMsg('');
                setPayForm({
                  amount: String(subAgent.remaining > 0 ? subAgent.remaining : ''),
                  method: 'cash',
                  receiptNo: `COMM-${Date.now().toString().slice(-5)}`,
                  notes: '',
                });
                setPayModalOpen(true);
              }}
              className="flex-1 md:flex-none px-6 py-3 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow-lg shadow-emerald-200 transition flex items-center justify-center gap-2"
            >
              <CreditCard className="w-4 h-4" />
              💰 کمیشن ادائیگی کریں
            </button>
            <a
              href={`https://wa.me/${subAgent.phone.replace(/[^0-9]/g, '')}?text=السلام علیکم جناب ${encodeURIComponent(subAgent.name)}، ${encodeURIComponent(agency?.name || 'ہماری ایجنسی')} کی جانب سے آپ کا کمیشن کھاتہ: کل حجاج: ${subAgent.totalPilgrims}، باقی رقم: Rs. ${subAgent.remaining}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-3 rounded-full bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 text-xs font-bold transition flex items-center gap-1.5"
            >
              <Send className="w-4 h-4" />
              WhatsApp کھاتہ
            </a>
          </div>
        </div>
      </div>

      {/* METRICS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="rounded-[20px] p-6 shadow-[0_8px_30px_rgba(0,0,0,0.06)] bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold opacity-90">ریفر کردہ حجاج</span>
            <Users2 className="w-5 h-5 opacity-80" />
          </div>
          <div className="text-3xl font-black mt-3">{subAgent.totalPilgrims || 0}</div>
          <div className="text-[11px] opacity-80 mt-1">کل رجسٹرڈ مسافر</div>
        </div>

        <div className="rounded-[20px] p-6 shadow-[0_8px_30px_rgba(0,0,0,0.06)] bg-gradient-to-br from-emerald-500 to-teal-600 text-white">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold opacity-90">کل کمیشن بن چکا</span>
            <TrendingUp className="w-5 h-5 opacity-80" />
          </div>
          <div className="text-3xl font-black mt-3">
            {formatCurrency(subAgent.totalEarned || 0)}
          </div>
          <div className="text-[11px] opacity-80 mt-1">مجموعی کمیشن آمدنی</div>
        </div>

        <div className="rounded-[20px] p-6 shadow-[0_8px_30px_rgba(0,0,0,0.06)] bg-white border-2 border-emerald-100">
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold text-gray-500">ادا شدہ کمیشن</span>
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
          </div>
          <div className="text-3xl font-black text-emerald-600 mt-3">
            {formatCurrency(subAgent.totalPaid || 0)}
          </div>
          <div className="text-[11px] text-gray-400 mt-1">اب تک دی گئی رقم</div>
        </div>

        <div className="rounded-[20px] p-6 shadow-[0_8px_30px_rgba(0,0,0,0.06)] bg-white border-2 border-rose-100">
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold text-gray-500">باقی واجب الادا کمیشن</span>
            <DollarSign className="w-5 h-5 text-rose-500" />
          </div>
          <div className="text-3xl font-black text-rose-600 mt-3">
            {formatCurrency(subAgent.remaining || 0)}
          </div>
          <div className="text-[11px] text-gray-400 mt-1">باقی بیلنس</div>
        </div>
      </div>

      {/* REFERRED PILGRIMS TABLE */}
      <div className="bg-white rounded-[24px] border border-gray-100 shadow-[0_8px_30px_rgba(0,0,0,0.06)] overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-gray-900 text-base">
              اس سب ایجنٹ کے ریفر کردہ حجاج و معتمرین
            </h3>
            <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold">
              {pilgrims.length}
            </span>
          </div>
        </div>

        {pilgrims.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            <Users2 className="w-10 h-10 mx-auto mb-2 opacity-30 text-indigo-400" />
            <p className="text-sm font-semibold text-gray-600">
              فی الحال اس سب ایجنٹ کے نام پر کوئی حاجی رجسٹر نہیں ہے
            </p>
            <p className="text-xs text-gray-400 mt-1">
              نیا حاجی رجسٹر کرتے وقت اس سب ایجنٹ کو منتخب کریں
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-700">
              <thead className="bg-gray-50/80 text-gray-500 border-b border-gray-100 uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="p-4">حاجی کا نام</th>
                  <th className="p-4">پاسپورٹ نمبر</th>
                  <th className="p-4">فون نمبر</th>
                  <th className="p-4">ویزہ سٹیٹس</th>
                  <th className="p-4">پیکیج رقم</th>
                  <th className="p-4">وصول شدہ</th>
                  <th className="p-4 text-center">پبلک ٹریکنگ لنک</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {pilgrims.map((p: any) => (
                  <tr key={p.id} className="hover:bg-indigo-50/20 transition">
                    <td className="p-4 font-bold text-gray-900">{p.full_name}</td>
                    <td className="p-4 font-mono font-bold text-emerald-700">{p.passport_no}</td>
                    <td className="p-4 text-gray-600 font-mono">{p.phone || '-'}</td>
                    <td className="p-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          p.visa_status === 'printed'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}
                      >
                        {p.visa_status}
                      </span>
                    </td>
                    <td className="p-4 font-semibold text-gray-900">
                      {formatCurrency(p.payment_total)}
                    </td>
                    <td className="p-4 font-bold text-emerald-600">
                      {formatCurrency(p.payment_paid)}
                    </td>
                    <td className="p-4 text-center">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          onClick={() => handleCopyLink(p.passport_no)}
                          className="px-2.5 py-1 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 text-[11px] font-bold flex items-center gap-1 transition"
                          title="کاپی کریں"
                        >
                          {copiedId === p.passport_no ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-600" />
                              <span className="text-emerald-600">کاپی ہو گیا</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>لنک</span>
                            </>
                          )}
                        </button>
                        <Link
                          href={`/track/${p.passport_no}`}
                          target="_blank"
                          className="px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-[11px] font-bold flex items-center gap-1 transition"
                        >
                          <ExternalLink className="w-3 h-3" />
                          <span>دیکھیں</span>
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* COMMISSION PAYOUT MODAL */}
      {payModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-[24px] shadow-2xl border border-gray-100 max-w-md w-full p-6 space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                  💰
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-base">کمیشن ادائیگی درج کریں</h3>
                  <p className="text-[11px] text-gray-500">سب ایجنٹ: {subAgent.name}</p>
                </div>
              </div>
              <button
                onClick={() => setPayModalOpen(false)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {errorMsg && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handlePayout} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  ادائیگی رقم (روپے) *
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  placeholder="e.g. 25000"
                  value={payForm.amount}
                  onChange={(e) => setPayForm({ ...payForm, amount: e.target.value })}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold text-gray-900 focus:outline-none focus:border-emerald-500"
                />
                <span className="text-[11px] text-gray-500 mt-1 block">
                  کل باقی رقم: {formatCurrency(subAgent.remaining || 0)}
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  ادائیگی کا ذریعہ
                </label>
                <select
                  value={payForm.method}
                  onChange={(e) => setPayForm({ ...payForm, method: e.target.value })}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:border-emerald-500"
                >
                  <option value="cash">کیش (نقد)</option>
                  <option value="bank">بینک ٹرانسفر (Online Transfer)</option>
                  <option value="easypaisa">ایزی پیسہ (EasyPaisa)</option>
                  <option value="jazzcash">جاز کیش (JazzCash)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">رسید / حوالہ نمبر</label>
                <input
                  type="text"
                  placeholder="e.g. REC-98765"
                  value={payForm.receiptNo}
                  onChange={(e) => setPayForm({ ...payForm, receiptNo: e.target.value })}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">تفصیل / ریمارکس</label>
                <input
                  type="text"
                  placeholder="e.g. رجب عمرہ گروپ کمیشن فائنل"
                  value={payForm.notes}
                  onChange={(e) => setPayForm({ ...payForm, notes: e.target.value })}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setPayModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-xs font-bold hover:bg-gray-50 transition"
                >
                  منسوخ کریں
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold shadow-lg shadow-emerald-200 transition flex items-center gap-2"
                >
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>ادائیگی کنفرم کریں</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
