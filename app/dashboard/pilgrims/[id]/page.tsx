'use client';

import { useState, useEffect } from 'react';
import useSWR from 'swr';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import QRCode from 'qrcode';
import {
  User,
  Phone,
  CreditCard,
  Calendar,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ArrowRight,
  DollarSign,
  Receipt,
  FileText,
  Copy,
  ExternalLink,
  QrCode,
  Sparkles,
  Plus,
  Plane,
  Building2,
  ShieldCheck,
  Loader2,
  X,
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function PilgrimDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();

  const { data: pilgrimData, mutate: mutatePilgrim } = useSWR(`/api/pilgrims/${id}`, fetcher);
  const { data: installmentsData, mutate: mutateInstallments } = useSWR(`/api/pilgrims/${id}/installments`, fetcher);

  const pilgrim = pilgrimData?.pilgrim;
  const plan = installmentsData?.plan;
  const paymentsList = installmentsData?.payments || [];
  const stats = installmentsData?.stats || {
    totalAmount: pilgrim?.payment_total || 285000,
    advancePaid: pilgrim?.payment_paid || 50000,
    totalPaid: pilgrim?.payment_paid || 50000,
    remaining: Math.max(0, (pilgrim?.payment_total || 285000) - (pilgrim?.payment_paid || 50000)),
    overdueCount: 0,
    progress: pilgrim?.payment_total ? Math.round(((pilgrim?.payment_paid || 0) / pilgrim.payment_total) * 100) : 20,
  };

  const [activeTab, setActiveTab] = useState<'overview' | 'payments'>('overview');
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);

  // Add Installment Modal
  const [showAddInstallmentModal, setShowAddInstallmentModal] = useState(false);
  const [newInstAmount, setNewInstAmount] = useState('50000');
  const [newInstDueDate, setNewInstDueDate] = useState('');
  const [addingInst, setAddingInst] = useState(false);

  // Pay Modal
  const [payingId, setPayingId] = useState<string | null>(null);
  const [paySuccessMsg, setPaySuccessMsg] = useState('');

  const trackingCode = pilgrim?.tracking_code || 'ALH-' + (pilgrim?.passport_no || '12345').substring(0, 5);
  const publicTrackingUrl = typeof window !== 'undefined' ? `${window.location.origin}/track/${trackingCode}` : `/track/${trackingCode}`;

  useEffect(() => {
    if (publicTrackingUrl) {
      QRCode.toDataURL(publicTrackingUrl, { width: 200, margin: 1 })
        .then((url) => setQrDataUrl(url))
        .catch(console.error);
    }
  }, [publicTrackingUrl, trackingCode]);

  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(publicTrackingUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 3000);
    }
  };

  const handleAddInstallment = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddingInst(true);
    try {
      const res = await fetch(`/api/pilgrims/${id}/installments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          totalAmount: stats.totalAmount,
          advancePaid: stats.totalPaid,
          installmentsCount: 3,
          startDate: newInstDueDate,
        }),
      });
      if (res.ok) {
        setShowAddInstallmentModal(false);
        mutateInstallments();
        mutatePilgrim();
      }
    } catch (err: any) {
      alert('Error creating installment: ' + err.message);
    } finally {
      setAddingInst(false);
    }
  };

  const handlePay = async (paymentId: string) => {
    setPayingId(paymentId);
    setPaySuccessMsg('');
    try {
      const res = await fetch('/api/installments/pay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentId,
          method: 'cash',
        }),
      });
      if (res.ok) {
        setPaySuccessMsg('قسط کی وصولی درج ہو گئی اور حاجی کو واٹس ایپ تصدیق لاگ ہو گئی!');
        mutateInstallments();
        mutatePilgrim();
      }
    } catch (err: any) {
      alert('Payment failed: ' + err.message);
    } finally {
      setPayingId(null);
    }
  };

  if (!pilgrim) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Top Header Card */}
      <div className="bg-white rounded-[24px] shadow-[0_8px_30px_rgba(0,0,0,0.06)] border border-gray-100 p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <Link
            href="/dashboard/pilgrims"
            className="p-2.5 rounded-xl bg-gray-50 border border-gray-200 text-gray-600 hover:text-gray-900 shadow-sm"
          >
            <ArrowRight className="w-5 h-5" />
          </Link>
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-700 text-white font-black text-2xl flex items-center justify-center shadow-lg shadow-violet-200 uppercase">
            {pilgrim.full_name?.charAt(0) || 'H'}
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight">{pilgrim.full_name}</h1>
              <span className="px-3 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
                {pilgrim.visa_status || 'Active'}
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              پاسپورٹ: <strong className="font-mono text-gray-800">{pilgrim.passport_no}</strong> | والد: <strong className="text-gray-800">{pilgrim.father_name || 'N/A'}</strong> | فون: <strong className="text-gray-800">{pilgrim.phone || 'N/A'}</strong>
            </p>
          </div>
        </div>

        {/* Right CTA: Copy Tracking Link & QR Code */}
        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={handleCopyLink}
            className="px-4 py-2.5 rounded-full bg-white border border-gray-200 hover:bg-gray-50 text-xs font-bold text-gray-700 transition flex items-center gap-1.5 shadow-sm"
          >
            {copiedLink ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span className="text-emerald-700">لنک کاپی ہو گیا!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-gray-500" />
                <span>Copy Tracking Link</span>
              </>
            )}
          </button>

          <a
            href={publicTrackingUrl}
            target="_blank"
            rel="noreferrer"
            className="px-5 py-2.5 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold shadow-md shadow-emerald-200 transition flex items-center gap-1.5"
          >
            <ExternalLink className="w-4 h-4" />
            لائیو ٹریکنگ دیکھیں
          </a>
        </div>
      </div>

      {/* TABS HEADER */}
      <div className="flex items-center gap-2 border-b border-gray-200 pb-2">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeTab === 'overview'
              ? 'bg-emerald-500 text-white shadow-md shadow-emerald-200'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <User className="w-4 h-4" />
          بنیادی معلومات و ٹریکنگ QR (Overview)
        </button>

        <button
          onClick={() => setActiveTab('payments')}
          className={`px-5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeTab === 'payments'
              ? 'bg-emerald-500 text-white shadow-md shadow-emerald-200'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          ادائیگی و اقساط (Payments / Qist)
        </button>
      </div>

      {/* TAB 1: OVERVIEW & QR CODE */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Haji Profile Card */}
          <div className="md:col-span-2 bg-white rounded-3xl p-6 border border-gray-100 shadow-[0_8px_30px_rgba(0,0,0,0.06)] space-y-4">
            <h2 className="font-bold text-sm text-gray-900 pb-3 border-b border-gray-100 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              سرکاری دستاویزات اور ریکارڈ کی تفصیل
            </h2>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="p-3 rounded-2xl bg-gray-50 border border-gray-100">
                <span className="text-gray-400 block text-[11px]">پورا نام:</span>
                <strong className="text-gray-900 text-sm mt-0.5 block">{pilgrim.full_name}</strong>
              </div>

              <div className="p-3 rounded-2xl bg-gray-50 border border-gray-100">
                <span className="text-gray-400 block text-[11px]">والد کا نام:</span>
                <strong className="text-gray-900 text-sm mt-0.5 block">{pilgrim.father_name || '-'}</strong>
              </div>

              <div className="p-3 rounded-2xl bg-gray-50 border border-gray-100">
                <span className="text-gray-400 block text-[11px]">پاسپورٹ نمبر:</span>
                <strong className="text-gray-900 text-sm mt-0.5 block font-mono font-bold">{pilgrim.passport_no}</strong>
              </div>

              <div className="p-3 rounded-2xl bg-gray-50 border border-gray-100">
                <span className="text-gray-400 block text-[11px]">پاسپورٹ ایکسپائری:</span>
                <strong className="text-gray-900 text-sm mt-0.5 block">{pilgrim.passport_expiry || '-'}</strong>
              </div>

              <div className="p-3 rounded-2xl bg-gray-50 border border-gray-100">
                <span className="text-gray-400 block text-[11px]">شناختی کارڈ (CNIC):</span>
                <strong className="text-gray-900 text-sm mt-0.5 block font-mono">{pilgrim.cnic || '-'}</strong>
              </div>

              <div className="p-3 rounded-2xl bg-gray-50 border border-gray-100">
                <span className="text-gray-400 block text-[11px]">موبائل / واٹس ایپ:</span>
                <strong className="text-gray-900 text-sm mt-0.5 block font-mono">{pilgrim.phone || '-'}</strong>
              </div>

              <div className="p-3 rounded-2xl bg-gray-50 border border-gray-100">
                <span className="text-gray-400 block text-[11px]">ٹکٹ PNR نمبر:</span>
                <strong className="text-sky-700 text-sm mt-0.5 block font-mono font-bold">{pilgrim.pnr || 'Scheduled'}</strong>
              </div>

              <div className="p-3 rounded-2xl bg-gray-50 border border-gray-100">
                <span className="text-gray-400 block text-[11px]">منفرد ٹریکنگ کوڈ:</span>
                <strong className="text-emerald-700 text-sm mt-0.5 block font-mono font-bold">{trackingCode}</strong>
              </div>
            </div>
          </div>

          {/* QR Code Receipt Printing Box */}
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-[0_8px_30px_rgba(0,0,0,0.06)] text-center space-y-4 flex flex-col items-center justify-between">
            <div className="space-y-1">
              <span className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold">
                <QrCode className="w-3.5 h-3.5" /> رسید و کارڈ پرنٹنگ QR
              </span>
              <h3 className="font-bold text-sm text-gray-900">حاجی لائیو ٹریکنگ QR کوڈ</h3>
              <p className="text-[11px] text-gray-500">حاجی یا اس کے اہل خانہ اپنے موبائل کیمرے سے اسکین کر سکتے ہیں</p>
            </div>

            {qrDataUrl && (
              <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 inline-block shadow-inner">
                <img src={qrDataUrl} alt="Haji Tracking QR Code" className="w-40 h-40 object-contain mx-auto" />
                <span className="block font-mono text-[11px] font-bold text-gray-700 mt-2">{trackingCode}</span>
              </div>
            )}

            <button
              onClick={() => window.print()}
              className="w-full py-2.5 rounded-full bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition shadow-sm"
            >
              🖨️ رسید اور QR پرنٹ کریں
            </button>
          </div>
        </div>
      )}

      {/* TAB 2: PAYMENTS / QIST (Phase 7 Special) */}
      {activeTab === 'payments' && (
        <div className="space-y-6">
          {paySuccessMsg && (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span>{paySuccessMsg}</span>
            </div>
          )}

          {/* Top Summary Cards: Total 300k, Paid 100k, Remaining 200k, progress bar with % */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {/* Total Amount */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col justify-between">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">کل پیکیج رقم (Total)</span>
              <div className="mt-2">
                <span className="text-3xl font-black text-gray-900">{formatCurrency(stats.totalAmount)}</span>
                <span className="block text-xs text-gray-400 mt-1">طے شدہ مکمل فیس</span>
              </div>
            </div>

            {/* Paid Amount */}
            <div className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white rounded-2xl p-6 shadow-md shadow-emerald-200 flex flex-col justify-between">
              <span className="text-xs font-bold text-emerald-100 uppercase tracking-wide">ادا شدہ وصولی (Paid)</span>
              <div className="mt-2">
                <span className="text-3xl font-black text-white">{formatCurrency(stats.totalPaid)}</span>
                <span className="block text-xs text-emerald-100 mt-1">کامیابی سے موصول</span>
              </div>
            </div>

            {/* Remaining Amount */}
            <div className="bg-gradient-to-br from-rose-50 to-red-100 border border-red-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
              <span className="text-xs font-bold text-red-900 uppercase tracking-wide">باقی واجب الادا (Remaining)</span>
              <div className="mt-2">
                <span className="text-3xl font-black text-red-600">{formatCurrency(stats.remaining)}</span>
                <span className="block text-xs text-red-800/80 mt-1">وصول طلب بقایا</span>
              </div>
            </div>
          </div>

          {/* Progress Bar with % */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-2">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-gray-700">ادائیگی کی تکمیل کی شرح</span>
              <span className="text-emerald-600">{stats.progress}% ادا شدہ</span>
            </div>
            <div className="w-full h-3.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-700"
                style={{ width: `${stats.progress}%` }}
              />
            </div>
          </div>

          {/* Installments Timeline Section */}
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-[0_8px_30px_rgba(0,0,0,0.06)] space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div>
                <h3 className="font-bold text-sm text-gray-900 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-emerald-600" />
                  اقساط کا شیڈول و ٹائم لائن (Installments Schedule)
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">ہر قسط کی مقررہ تاریخ اور اسٹیٹس</p>
              </div>

              <button
                onClick={() => setShowAddInstallmentModal(true)}
                className="px-4 py-2 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold shadow-md shadow-emerald-200 transition flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                + نئی قسط شامل کریں
              </button>
            </div>

            {/* Timeline Cards */}
            {paymentsList.length === 0 ? (
              <div className="text-center py-8 text-gray-400 space-y-3">
                <CreditCard className="w-10 h-10 mx-auto text-gray-300" />
                <p className="text-xs">کوئی فعال قسط پلان موجود نہیں ہے۔ اوپر دیے گئے بٹن سے نیا پلان بنائیں یا قسط شامل کریں۔</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {paymentsList.map((inst: any, idx: number) => {
                  const isPaid = inst.status === 'paid';
                  const isOverdue = inst.status === 'overdue';

                  return (
                    <div
                      key={inst.id}
                      className={`p-5 rounded-2xl border transition-all ${
                        isPaid
                          ? 'bg-emerald-50/40 border-emerald-200'
                          : isOverdue
                          ? 'bg-rose-50/40 border-rose-200'
                          : 'bg-white border-gray-200 shadow-sm'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-bold text-gray-500">قسط #{idx + 1}</span>
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            isPaid
                              ? 'bg-emerald-100 text-emerald-800'
                              : isOverdue
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {isPaid ? 'ادا شدہ ✓' : isOverdue ? 'میعاد ختم' : 'زیر التواء'}
                        </span>
                      </div>

                      <div className="space-y-1 mb-4">
                        <span className="text-2xl font-black text-gray-900 block">{formatCurrency(inst.amount)}</span>
                        <span className="text-xs text-gray-500 flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-gray-400" />
                          مقررہ تاریخ: <strong className="text-gray-700">{inst.dueDate}</strong>
                        </span>
                      </div>

                      {!isPaid && (
                        <button
                          onClick={() => handlePay(inst.id)}
                          disabled={payingId === inst.id}
                          className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-200 transition flex items-center justify-center gap-1.5 disabled:opacity-50"
                        >
                          {payingId === inst.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <>
                              <DollarSign className="w-4 h-4" />
                              وصولی درج کریں (Pay)
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ADD INSTALLMENT MODAL */}
      {showAddInstallmentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-100 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="font-bold text-sm text-gray-900">نئی قسط کا اندراج کریں</h3>
              <button
                onClick={() => setShowAddInstallmentModal(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddInstallment} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">قسط کی رقم (PKR)</label>
                <input
                  type="number"
                  required
                  value={newInstAmount}
                  onChange={(e) => setNewInstAmount(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-900 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">مقررہ تاریخ (Due Date)</label>
                <input
                  type="date"
                  required
                  value={newInstDueDate}
                  onChange={(e) => setNewInstDueDate(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddInstallmentModal(false)}
                  className="px-4 py-2 rounded-full border border-gray-200 text-xs font-bold text-gray-600"
                >
                  منسوخ کریں
                </button>
                <button
                  type="submit"
                  disabled={addingInst}
                  className="px-5 py-2 rounded-full bg-emerald-500 text-white text-xs font-bold hover:bg-emerald-600 transition"
                >
                  {addingInst ? 'محفوظ ہو رہا ہے...' : 'محفوظ کریں'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
