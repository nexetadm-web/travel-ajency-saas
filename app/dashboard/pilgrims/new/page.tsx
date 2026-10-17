'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import useSWR from 'swr';
import Link from 'next/link';
import {
  Camera,
  Upload,
  Sparkles,
  ArrowRight,
  UserCheck,
  CreditCard,
  FileCheck2,
  CheckCircle2,
  AlertCircle,
  Loader2,
  X,
  Plane,
} from 'lucide-react';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function NewPilgrimPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: groupsData } = useSWR('/api/groups', fetcher);
  const groups = groupsData?.groups || [];

  const { data: subAgentsData } = useSWR('/api/sub-agents', fetcher);
  const subAgents = subAgentsData?.subAgents || [];

  const getCommissionDisplay = (agent: any) => {
    const type = agent.commissionType || agent.commission_type || agent.type || 'fixed';
    const value =
      agent.commissionValue !== undefined && agent.commissionValue !== null
        ? agent.commissionValue
        : agent.commission_value !== undefined && agent.commission_value !== null
        ? agent.commission_value
        : agent.commission_per_haji !== undefined && agent.commission_per_haji !== null
        ? agent.commission_per_haji
        : agent.commission || 0;

    if (
      type === 'percentage' ||
      type === 'percent' ||
      type === 'commission' ||
      String(value).includes('%')
    ) {
      return `${value}% کمیشن`;
    } else {
      return `Rs. ${Number(value).toLocaleString()} کمیشن`;
    }
  };

  const [scanModalOpen, setScanModalOpen] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [scanSuccess, setScanSuccess] = useState(false);
  const [pulseGlow, setPulseGlow] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const [form, setForm] = useState({
    group_id: '',
    sub_agent_id: '',
    full_name: '',
    father_name: '',
    passport_no: '',
    passport_expiry: '',
    cnic: '',
    phone: '',
    pnr: '',
    photo_url: '',
    passport_scan_url: '',
    passport_scan_data: null as any,
    visa_status: 'document_pending',
    payment_total: '285000',
    payment_paid: '50000',
  });

  const handlePassportUpload = async (file: File) => {
    if (!file) return;

    setScanning(true);
    setScanSuccess(false);
    setErrorMsg('');

    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = reader.result as string;
        const res = await fetch('/api/passport/scan', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image: base64, fileName: file.name }),
        });

        const data = await res.json();
        if (res.ok && data.data) {
          // Auto-fill form fields with optimistic UI
          setForm((prev) => ({
            ...prev,
            full_name: data.data.name || prev.full_name,
            father_name: data.data.father_name || prev.father_name,
            passport_no: data.data.passport_no || prev.passport_no,
            passport_expiry: data.data.expiry || prev.passport_expiry,
            cnic: data.data.cnic || prev.cnic,
            passport_scan_data: data.data,
          }));
          setScanSuccess(true);
          setPulseGlow(true);
          setTimeout(() => setPulseGlow(false), 4000);
          setScanModalOpen(false);
        } else {
          setErrorMsg(data.error || 'پاسپورٹ اسکین نہیں ہو سکا');
        }
        setScanning(false);
      };
      reader.readAsDataURL(file);
    } catch (err: any) {
      setErrorMsg(err.message || 'فائل اپلوڈ میں خرابی');
      setScanning(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) handlePassportUpload(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.full_name || !form.passport_no) {
      setErrorMsg('براہ کرم پورا نام اور پاسپورٹ نمبر درج کریں');
      return;
    }

    setSubmitting(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/pilgrims', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const resData = await res.json();
      if (!res.ok) {
        setErrorMsg(resData.error || 'زائر شامل کرنے میں خرابی');
        setSubmitting(false);
        return;
      }

      router.push(form.group_id ? `/dashboard/groups/${form.group_id}` : '/dashboard/pilgrims');
      router.refresh();
    } catch (err: any) {
      setErrorMsg(err.message || 'خرابی پیش آگئی');
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-full overflow-x-hidden max-w-4xl mx-auto space-y-6 px-2 sm:px-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 overflow-hidden">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/pilgrims"
            className="p-2 rounded-xl bg-white border border-gray-200 text-gray-600 hover:text-gray-900 shadow-sm shrink-0"
          >
            <ArrowRight className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="font-urdu text-[18px] sm:text-[22px] md:text-[26px] font-bold leading-[1.4] break-words text-gray-900">نیا حاجی / زائر رجسٹر کریں (New Haji)</h1>
            <p className="text-xs text-gray-500 break-words">پاسپورٹ AI خودکار اسکین یا دستی اندراج</p>
          </div>
        </div>

        {/* Top Button requested in Phase 3 */}
        <button
          type="button"
          onClick={() => setScanModalOpen(true)}
          className="px-5 py-2.5 rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold text-xs shadow-lg shadow-emerald-200 hover:from-emerald-600 hover:to-teal-700 flex items-center gap-2 active:scale-95 transition"
        >
          <Camera className="w-4 h-4" />
          🛂 Passport Scan - Photo se Data Auto
        </button>
      </div>

      {/* DRAG-DROP SCAN MODAL */}
      {scanModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 border border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-emerald-100 text-emerald-600">
                  <Sparkles className="w-5 h-5" />
                </span>
                <h3 className="font-bold text-base text-gray-900">پاسپورٹ AI اسکین</h3>
              </div>
              <button
                onClick={() => setScanModalOpen(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-emerald-300 rounded-2xl p-8 text-center bg-emerald-50/50 hover:bg-emerald-50 transition cursor-pointer space-y-3"
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handlePassportUpload(f);
                }}
                accept="image/*"
                className="hidden"
              />
              <div className="w-14 h-14 rounded-full bg-emerald-500 text-white flex items-center justify-center mx-auto shadow-md shadow-emerald-200">
                {scanning ? (
                  <Loader2 className="w-7 h-7 animate-spin" />
                ) : (
                  <Upload className="w-7 h-7" />
                )}
              </div>
              <div>
                <p className="font-bold text-gray-800 text-sm">Passport photo yahan daalein</p>
                <p className="text-xs text-gray-500 mt-1">
                  یا کلک کر کے اپنے کمپیوٹر / موبائل سے تصویر منتخب کریں
                </p>
              </div>
              <span className="inline-block px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold">
                95% درستگی اور فوری آٹو فِل
              </span>
            </div>

            <div className="text-xs text-gray-500 text-center">
              نام، والد کا نام، پاسپورٹ نمبر، ایکسپائری، اور شناختی کارڈ خودکار طور پر درج ہو جائے گا۔
            </div>
          </div>
        </div>
      )}

      {/* SCAN ACCURACY SUCCESS BANNER */}
      {scanSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <div>
              <span className="font-bold block">پاسپورٹ کامیابی سے اسکین ہو گیا!</span>
              <span className="text-[11px] text-emerald-700">فارم کے خانے خودکار طور پر بھر دیے گئے ہیں۔</span>
            </div>
          </div>
          <span className="px-3 py-1 rounded-full bg-emerald-600 text-white font-bold text-xs shadow-sm">
            95% accurate - edit if needed
          </span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2 shadow-sm">
          <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* REGISTRATION FORM */}
      <form
        onSubmit={handleSubmit}
        className={`bg-white rounded-[24px] border border-gray-100 shadow-[0_8px_30px_rgba(0,0,0,0.06)] p-6 space-y-6 transition-all duration-500 ${
          pulseGlow ? 'ring-4 ring-emerald-400 ring-offset-2' : ''
        }`}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Group Picker */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">
              عمرہ / حج گروپ منتخب کریں
            </label>
            <select
              value={form.group_id}
              onChange={(e) => setForm({ ...form, group_id: e.target.value })}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:border-emerald-500"
            >
              <option value="">-- براہ راست رجسٹریشن (کوئی گروپ نہیں) --</option>
              {groups.map((g: any) => (
                <option key={g.id} value={g.id}>
                  {g.group_name} ({g.available_seats} سیٹیں باقی)
                </option>
              ))}
            </select>
          </div>

          {/* Sub Agent / Referral */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">
              سب ایجنٹ / ریفرل پارٹنر (اختیاری)
            </label>
            <select
              value={form.sub_agent_id}
              onChange={(e) => setForm({ ...form, sub_agent_id: e.target.value })}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:border-indigo-500"
            >
              <option value="">-- کوئی سب ایجنٹ نہیں (براہ راست واک اِن) --</option>
              {subAgents.map((a: any) => (
                <option key={a.id} value={a.id}>
                  {a.name} ({a.city || a.location || a.phone || ''} - {getCommissionDisplay(a)})
                </option>
              ))}
            </select>
          </div>

          {/* Visa Status */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">ابتدائی ویزہ سٹیٹس</label>
            <select
              value={form.visa_status}
              onChange={(e) => setForm({ ...form, visa_status: e.target.value })}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:border-emerald-500"
            >
              <option value="document_pending">دستاویزات زیر التواء (Document Pending)</option>
              <option value="in_embassy">سفارت خانے میں (In Embassy)</option>
              <option value="printed">ویزہ پرنٹ شدہ (Printed)</option>
              <option value="returned">واپس موصول (Returned)</option>
            </select>
          </div>

          {/* PNR optional */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5 flex items-center gap-1">
              <Plane className="w-3.5 h-3.5 text-sky-500" />
              ٹکٹ PNR (اگر موجود ہو)
            </label>
            <input
              type="text"
              value={form.pnr}
              onChange={(e) => setForm({ ...form, pnr: e.target.value.toUpperCase() })}
              placeholder="e.g. PK782X"
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:border-sky-500 font-mono"
            />
          </div>

          {/* Full Name */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">
              مکمل نام (بحساب پاسپورٹ) *
            </label>
            <input
              type="text"
              required
              value={form.full_name}
              onChange={(e) => setForm({ ...form, full_name: e.target.value })}
              placeholder="e.g. MUHAMMAD TARIQ"
              className={`w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:border-emerald-500 font-semibold ${
                pulseGlow ? 'bg-emerald-50/70 border-emerald-400' : ''
              }`}
            />
          </div>

          {/* Father Name */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">والد کا نام</label>
            <input
              type="text"
              value={form.father_name}
              onChange={(e) => setForm({ ...form, father_name: e.target.value })}
              placeholder="e.g. ABDUL REHMAN"
              className={`w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:border-emerald-500 ${
                pulseGlow ? 'bg-emerald-50/70 border-emerald-400' : ''
              }`}
            />
          </div>

          {/* Passport No */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">پاسپورٹ نمبر *</label>
            <input
              type="text"
              required
              value={form.passport_no}
              onChange={(e) => setForm({ ...form, passport_no: e.target.value })}
              placeholder="e.g. AB1234567"
              className={`w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:border-emerald-500 font-mono font-bold ${
                pulseGlow ? 'bg-emerald-50/70 border-emerald-400' : ''
              }`}
            />
          </div>

          {/* Passport Expiry */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">
              پاسپورٹ تاریخ تنسیخ (Expiry DD-MM-YYYY)
            </label>
            <input
              type="text"
              value={form.passport_expiry}
              onChange={(e) => setForm({ ...form, passport_expiry: e.target.value })}
              placeholder="DD-MM-YYYY"
              className={`w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:border-emerald-500 ${
                pulseGlow ? 'bg-emerald-50/70 border-emerald-400' : ''
              }`}
            />
          </div>

          {/* CNIC */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">شناختی کارڈ (CNIC)</label>
            <input
              type="text"
              value={form.cnic}
              onChange={(e) => setForm({ ...form, cnic: e.target.value })}
              placeholder="e.g. 35202-1234567-1"
              className={`w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:border-emerald-500 font-mono ${
                pulseGlow ? 'bg-emerald-50/70 border-emerald-400' : ''
              }`}
            />
          </div>

          {/* Phone */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">فون / واٹس ایپ نمبر</label>
            <input
              type="text"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="03001234567"
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Payment Total */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">کل رقم (PKR)</label>
            <input
              type="number"
              value={form.payment_total}
              onChange={(e) => setForm({ ...form, payment_total: e.target.value })}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:border-emerald-500 font-semibold"
            />
          </div>

          {/* Payment Paid (Advance) */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">ادا شدہ ایڈوانس (PKR)</label>
            <input
              type="number"
              value={form.payment_paid}
              onChange={(e) => setForm({ ...form, payment_paid: e.target.value })}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:border-emerald-500 font-semibold"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
          <Link
            href="/dashboard/pilgrims"
            className="px-5 py-2.5 rounded-full border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-50"
          >
            منسوخ کریں
          </Link>
          <button
            type="submit"
            disabled={submitting}
            className="px-7 py-3 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow-lg shadow-emerald-200 transition disabled:opacity-50"
          >
            {submitting ? 'محفوظ ہو رہا ہے...' : '✓ زائر رجسٹر کریں'}
          </button>
        </div>
      </form>
    </div>
  );
}
