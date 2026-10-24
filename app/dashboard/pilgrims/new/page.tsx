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

function formatMRZDate(yymmdd: string | null | undefined, isExpiry: boolean = false): string {
  if (!yymmdd || yymmdd.length < 6) return '';
  const yy = parseInt(yymmdd.slice(0, 2), 10);
  const mm = yymmdd.slice(2, 4);
  const dd = yymmdd.slice(4, 6);
  if (isNaN(yy)) return '';
  const fullYear = isExpiry
    ? (2000 + yy).toString()
    : (yy > 40 ? 1900 + yy : 2000 + yy).toString();
  return `${dd}-${mm}-${fullYear}`;
}

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
  const [successMsg, setSuccessMsg] = useState('');
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
    dob: '',
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

  // Client-side MRZ Scanner (No AI, No API Key)
  const scanPassportMRZ = async (file: File) => {
    if (!file) return;

    setScanning(true);
    setScanSuccess(false);
    setSuccessMsg('');
    setErrorMsg('');

    try {
      // Dynamic import to keep initial bundle ultra-fast
      const Tesseract = (await import('tesseract.js')).default;
      const { parse } = await import('mrz');

      // Use Tesseract.js to read image: Tesseract.recognize(file, 'eng')
      const { data: { text } } = await Tesseract.recognize(file, 'eng');

      // Find last 2 lines containing P< and <
      const rawLines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
      const candidateLines = rawLines
        .map((l) => l.replace(/\s+/g, '').toUpperCase().replace(/[«‹]/g, '<'))
        .filter((l) => l.includes('<'));

      let mrzLines: string[] = [];
      const pIndex = candidateLines.findIndex((l) => l.includes('P<'));
      if (pIndex !== -1 && candidateLines.length > pIndex + 1) {
        let line1 = candidateLines[pIndex];
        let line2 = candidateLines[pIndex + 1];
        const pSub = line1.indexOf('P<');
        if (pSub > 0) line1 = line1.slice(pSub);
        mrzLines = [line1, line2];
      } else {
        mrzLines = candidateLines.slice(-2);
      }

      if (mrzLines.length < 2) {
        throw new Error('تصویر میں MRZ کوڈ (P<) نہیں ملا۔ آپ ڈیٹا دستی طور پر درج کر سکتے ہیں۔');
      }

      // Normalize lines to 44 characters for TD3
      const normalized = mrzLines.map((l) => {
        if (l.length < 44) return l.padEnd(44, '<');
        if (l.length > 44) return l.slice(0, 44);
        return l;
      });

      // Parse using mrz library: parse(mrzLines)
      let parsedFields: any = null;
      try {
        const parsed = parse(normalized);
        parsedFields = parsed?.fields;
      } catch (parseErr) {
        console.warn('mrz parse warning, using fallback parser:', parseErr);
      }

      let documentNumber = '';
      let firstName = '';
      let lastName = '';
      let birthDate = '';
      let expiryDate = '';
      let nationality = '';
      let sex = '';

      if (parsedFields) {
        documentNumber = (parsedFields.documentNumber || '').replace(/</g, '').trim().toUpperCase();
        firstName = (parsedFields.firstName || '').replace(/</g, ' ').trim().toUpperCase();
        lastName = (parsedFields.lastName || '').replace(/</g, ' ').trim().toUpperCase();
        birthDate = formatMRZDate(parsedFields.birthDate, false);
        expiryDate = formatMRZDate(parsedFields.expirationDate || parsedFields.expiryDate, true);
        nationality = (parsedFields.nationality || parsedFields.issuingState || '').replace(/</g, '').trim().toUpperCase();
        sex = (parsedFields.sex || '').toUpperCase();
      } else {
        // Fallback line slicing
        const line1 = normalized[0];
        const line2 = normalized[1];
        const namePart = line1.slice(5);
        const [lastPart, firstPart] = namePart.split('<<');
        lastName = (lastPart || '').replace(/</g, ' ').trim().toUpperCase();
        firstName = (firstPart || '').replace(/</g, ' ').trim().toUpperCase();
        documentNumber = line2.slice(0, 9).replace(/</g, '').trim().toUpperCase();
        nationality = line2.slice(10, 13).replace(/</g, '').trim().toUpperCase();
        birthDate = formatMRZDate(line2.slice(13, 19), false);
        sex = line2.charAt(20).toUpperCase();
        expiryDate = formatMRZDate(line2.slice(21, 27), true);
      }

      const fullName = [firstName, lastName].filter(Boolean).join(' ').trim();

      if (!documentNumber && !fullName) {
        throw new Error('MRZ ڈیٹا درست طریقے سے نہیں پڑھا جا سکا۔ آپ دستی طور پر اندراج کر سکتے ہیں۔');
      }

      // Auto-fill form fields: passport number, full name, DOB, expiry, father name.
      setForm((prev) => ({
        ...prev,
        passport_no: documentNumber || prev.passport_no,
        full_name: fullName || prev.full_name,
        dob: birthDate || prev.dob,
        passport_expiry: expiryDate || prev.passport_expiry,
        father_name: prev.father_name,
        passport_scan_data: {
          documentNumber,
          firstName,
          lastName,
          birthDate,
          expiryDate,
          nationality,
          sex,
          mrz: normalized.join('\n'),
        },
      }));

      // Show message: "MRZ se data mil gaya" on success.
      setSuccessMsg('MRZ se data mil gaya');
      setScanSuccess(true);
      setPulseGlow(true);
      setTimeout(() => setPulseGlow(false), 4000);
      setScanModalOpen(false);
    } catch (err: any) {
      console.error('MRZ OCR error:', err);
      // Keep manual input if OCR fails.
      setErrorMsg(err.message || 'MRZ اسکین نہیں ہو سکا۔ آپ معلومات خود ہاتھ سے (Manually) درج کر سکتے ہیں۔');
    } finally {
      setScanning(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) scanPassportMRZ(file);
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
            <p className="text-xs text-gray-500 break-words">پاسپورٹ MRZ خودکار اسکین یا دستی اندراج</p>
          </div>
        </div>

        {/* Top Button */}
        <button
          type="button"
          onClick={() => setScanModalOpen(true)}
          className="px-5 py-2.5 rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold text-xs shadow-lg shadow-emerald-200 hover:from-emerald-600 hover:to-teal-700 flex items-center gap-2 transition"
        >
          <Camera className="w-4 h-4" />
          🛂 Passport MRZ Scan - Photo se Data Auto
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
                <h3 className="font-bold text-base text-gray-900">پاسپورٹ MRZ اسکینر</h3>
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
                  if (f) scanPassportMRZ(f);
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
                <p className="font-bold text-gray-800 text-sm">
                  {scanning ? 'MRZ پڑھا جا رہا ہے...' : 'Passport photo yahan daalein'}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {scanning ? 'براہ کرم انتظار فرمائیں، Tesseract OCR سے پاسپورٹ پڑھا جا رہا ہے...' : 'یا کلک کر کے اپنے کمپیوٹر / موبائل سے تصویر منتخب کریں'}
                </p>
              </div>
              <span className="inline-block px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold">
                100% لوکل MRZ ریکگنیشن
              </span>
            </div>

            <div className="text-xs text-gray-500 text-center">
              پاسپورٹ نمبر، نام، تاریخ پیدائش، اور ایکسپائری خودکار طور پر درج ہو جائے گی۔
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
              <span className="font-bold block">{successMsg || 'MRZ se data mil gaya'}</span>
              <span className="text-[11px] text-emerald-700">فارم کے خانے خودکار طور پر بھر دیے گئے ہیں۔ (MRZ se data mil gaya)</span>
            </div>
          </div>
          <span className="px-3 py-1 rounded-full bg-emerald-600 text-white font-bold text-xs shadow-sm">
            MRZ Success
          </span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2 shadow-sm">
          <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* REGISTRATION FORM (Manual Input Always Available) */}
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

          {/* Date of Birth (DOB) */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">
              تاریخ پیدائش (DOB DD-MM-YYYY)
            </label>
            <input
              type="text"
              value={form.dob}
              onChange={(e) => setForm({ ...form, dob: e.target.value })}
              placeholder="DD-MM-YYYY"
              className={`w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:border-emerald-500 ${
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
