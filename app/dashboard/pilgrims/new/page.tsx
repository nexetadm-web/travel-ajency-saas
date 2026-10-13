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
} from 'lucide-react';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function NewPilgrimPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: groupsData } = useSWR('/api/groups', fetcher);
  const groups = groupsData?.groups || [];

  const { data: subAgentsData } = useSWR('/api/sub-agents', fetcher);
  const subAgents = subAgentsData?.subAgents || [];

  const [scanning, setScanning] = useState(false);
  const [scanSuccess, setScanSuccess] = useState(false);
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
    photo_url: '',
    passport_scan_url: '',
    visa_status: 'document_pending',
    payment_total: '285000',
    payment_paid: '50000',
  });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setScanning(true);
    setScanSuccess(false);
    setErrorMsg('');

    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = reader.result as string;
        const res = await fetch('/api/ai/passport-scan', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image: base64, fileName: file.name }),
        });

        const data = await res.json();
        if (res.ok && data.data) {
          // Auto-fill form fields with optimistic UI
          setForm((prev) => ({
            ...prev,
            full_name: data.data.full_name || prev.full_name,
            father_name: data.data.father_name || prev.father_name,
            passport_no: data.data.passport_no || prev.passport_no,
            passport_expiry: data.data.expiry || prev.passport_expiry,
            cnic: data.data.cnic || prev.cnic,
            photo_url: data.data.photo_url || prev.photo_url,
          }));
          setScanSuccess(true);
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
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/pilgrims"
            className="p-2 rounded-xl bg-white border border-gray-200 text-gray-600 hover:text-gray-900 shadow-sm"
          >
            <ArrowRight className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">نیا زائر شامل کریں (New Pilgrim)</h1>
            <p className="text-xs text-gray-500">پاسپورٹ AI خودکار اسکین یا دستی اندراج</p>
          </div>
        </div>
      </div>

      {/* AI PASSPORT SCAN HERO BOX */}
      <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-[24px] p-6 text-white shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-center sm:text-left">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-bold backdrop-blur">
            <Sparkles className="w-3.5 h-3.5" />
            Gemini Vision AI Engine
          </div>
          <h2 className="text-xl font-bold">پاسپورٹ تصویر اپلوڈ کریں اور 1 سیکنڈ میں خودکار فارم بھریں</h2>
          <p className="text-xs text-emerald-100 max-w-xl">
            نام، والد کا نام، پاسپورٹ نمبر، تاریخ تنسیخ (Expiry)، اور شناختی کارڈ خود بخود خودکار الگورتھم کے ذریعے نکال لیے جائیں گے۔
          </p>
        </div>

        <div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept="image/*"
            className="hidden"
          />
          <button
            type="button"
            disabled={scanning}
            onClick={() => fileInputRef.current?.click()}
            className="px-6 py-3.5 rounded-full bg-white text-emerald-800 font-extrabold text-sm shadow-lg hover:bg-emerald-50 transition flex items-center gap-2 whitespace-nowrap active:scale-95 disabled:opacity-75"
          >
            {scanning ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin text-emerald-600" />
                AI اسکین جاری ہے...
              </>
            ) : (
              <>
                <Camera className="w-5 h-5 text-emerald-600" />
                📸 پاسپورٹ اسکین کریں (AI)
              </>
            )}
          </button>
        </div>
      </div>

      {scanSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 shadow-sm">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <span>پاسپورٹ ڈیٹا کامیابی سے AI کے ذریعے نکال کر نیچے فارم میں بھر دیا گیا ہے! آپ ضرورت کے مطابق ترمیم کر سکتے ہیں۔</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2 shadow-sm">
          <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* REGISTRATION FORM */}
      <form onSubmit={handleSubmit} className="bg-white rounded-[24px] border border-gray-100 shadow-[0_8px_30px_rgba(0,0,0,0.06)] p-6 space-y-6">
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
                  {a.name} ({a.city || a.phone} - کمیشن:{' '}
                  {a.commissionType === 'percent' ? `${a.commissionValue}%` : `Rs. ${a.commissionValue}`})
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
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:border-emerald-500 font-semibold"
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
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:border-emerald-500"
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
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:border-emerald-500 font-mono font-bold"
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
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:border-emerald-500"
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
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:border-emerald-500 font-mono"
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
