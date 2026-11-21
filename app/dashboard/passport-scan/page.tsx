'use client';

import React, { useState } from 'react';
import {
  Camera,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Keyboard,
  FileCheck2,
  User,
  Calendar,
  CreditCard,
  Globe,
  Copy,
  Check,
} from 'lucide-react';
import ContentCard from '@/components/ui/content-card';
import PremiumCard from '@/components/ui/premium-card';
import PassportScannerModal, { PassportScanButton, PassportScanData } from '@/components/passport/passport-scanner-modal';
import { parseMRZLines } from '@/lib/mrz';

export default function PassportScanPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [scanResult, setScanResult] = useState<PassportScanData | null>(null);

  // Form fields for auto-fill testing
  const [formData, setFormData] = useState({
    passport_no: '',
    surname: '',
    given_name: '',
    full_name: '',
    dob: '',
    gender: 'M',
    nationality: 'PAK',
    expiry: '',
  });

  const [copied, setCopied] = useState(false);

  // Manual MRZ test lines
  const [testLine1, setTestLine1] = useState('P<PAKAHMED<<ALI<<<<<<<<<<<<<<<<<<<<<<<<<<<<');
  const [testLine2, setTestLine2] = useState('PK12345678PAK9001015M3001015<<<<<<<<<<<<<<');

  const handleApplyResult = (data: PassportScanData) => {
    setScanResult(data);
    setFormData({
      passport_no: data.passport_no,
      surname: data.surname,
      given_name: data.given_name,
      full_name: data.full_name,
      dob: data.dob,
      gender: data.gender,
      nationality: data.nationality,
      expiry: data.expiry,
    });
  };

  const handleTestSampleMRZ = () => {
    const parsed = parseMRZLines(testLine1, testLine2);
    const result: PassportScanData = {
      ...parsed,
      confidence: 100,
    };
    handleApplyResult(result);
  };

  const handleResetForm = () => {
    setScanResult(null);
    setFormData({
      passport_no: '',
      surname: '',
      given_name: '',
      full_name: '',
      dob: '',
      gender: 'M',
      nationality: 'PAK',
      expiry: '',
    });
  };

  const handleCopyJSON = () => {
    navigator.clipboard.writeText(JSON.stringify(formData, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full max-w-full overflow-x-hidden space-y-6 max-w-7xl mx-auto px-2 sm:px-4">
      {/* Top Header */}
      <div className="bg-white rounded-2xl p-4 md:p-5 shadow-sm border border-gray-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div dir="rtl" className="text-right">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="font-urdu text-[22px] md:text-[24px] font-bold text-gray-900 leading-[1.6]">
              مفت پاسپورٹ اسکینر (Tesseract.js + MRZ)
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
              100% Free • No API Key • Client-side
            </span>
          </div>
          <p className="font-urdu text-[12px] text-gray-500 mt-1">
            آٹو کروپ (30% نیچے کا حصہ)، کنٹراسٹ اور بلیک اینڈ وائٹ پروسیسنگ، اور فوری MRZ آٹو فِل
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <PassportScanButton onClick={() => setModalOpen(true)} className="py-2.5 px-4 text-xs" />
        </div>
      </div>

      {/* Stats / Info Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <PremiumCard
          title="ٹیکنالوجی"
          value="Tesseract.js"
          subtitle="اوپن سورس OCR انجن"
          icon={Camera}
          gradient="emerald"
        />
        <PremiumCard
          title="معیار"
          value="ICAO Doc 9303"
          subtitle="TD3 پاسپورٹ فارمیٹ"
          icon={FileCheck2}
          gradient="cyan"
        />
        <PremiumCard
          title="قیمت"
          value="Rs. 0 / ماہانہ"
          subtitle="کوئی Mindee یا پیڈ API نہیں"
          icon={CheckCircle2}
          gradient="violet"
        />
        <PremiumCard
          title="سپیڈ"
          value="3-4 سیکنڈ"
          subtitle="براؤزر سائیڈ پروسیسنگ"
          icon={Sparkles}
          gradient="amber"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Form: Auto-filled Fields */}
        <div className="lg:col-span-7 space-y-4">
          <ContentCard>
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <FileCheck2 className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-sm text-gray-900">پاسپورٹ فارم فیلڈز (Auto-filled Form)</h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleResetForm}
                  className="p-1.5 rounded-lg text-gray-500 hover:text-rose-600 hover:bg-gray-100 transition"
                  title="ری سیٹ کریں"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={handleCopyJSON}
                  className="px-2.5 py-1 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold transition flex items-center gap-1"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'کاپی ہو گیا' : 'JSON کاپی'}</span>
                </button>
              </div>
            </div>

            {/* Notification / Warnings */}
            {scanResult && scanResult.warnings && scanResult.warnings.length > 0 && (
              <div className="mb-4 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs space-y-1">
                <div className="flex items-center gap-1.5 font-bold">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <span>چیک ڈیجٹ الرٹ:</span>
                </div>
                {scanResult.warnings.map((w, i) => (
                  <p key={i} className="text-[11px] mr-5">• {w}</p>
                ))}
              </div>
            )}

            <form onSubmit={(e) => e.preventDefault()} className="space-y-4" dir="rtl">
              {/* Scan Button placed just above Passport Number field */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-gray-700 text-right">
                    پاسپورٹ نمبر (Passport Number) *
                  </label>
                  <PassportScanButton onClick={() => setModalOpen(true)} />
                </div>
                <input
                  type="text"
                  required
                  placeholder="PK12345678"
                  value={formData.passport_no}
                  onChange={(e) => setFormData({ ...formData, passport_no: e.target.value.toUpperCase() })}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm font-mono uppercase font-black focus:outline-none focus:border-emerald-500 text-left"
                  dir="ltr"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1 text-right">
                    خاندانی نام (Surname)
                  </label>
                  <input
                    type="text"
                    placeholder="AHMED"
                    value={formData.surname}
                    onChange={(e) => setFormData({ ...formData, surname: e.target.value.toUpperCase() })}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-xs font-bold focus:outline-none focus:border-emerald-500 text-left"
                    dir="ltr"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1 text-right">
                    ذاتی نام (Given Name)
                  </label>
                  <input
                    type="text"
                    placeholder="ALI"
                    value={formData.given_name}
                    onChange={(e) => setFormData({ ...formData, given_name: e.target.value.toUpperCase() })}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-xs font-bold focus:outline-none focus:border-emerald-500 text-left"
                    dir="ltr"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1 text-right">
                  مکمل نام (Full Name)
                </label>
                <input
                  type="text"
                  placeholder="AHMED ALI"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value.toUpperCase() })}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-xs font-bold focus:outline-none focus:border-emerald-500 text-left"
                  dir="ltr"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1 text-right">
                    تاریخ پیدائش (DOB: DD-MM-YYYY)
                  </label>
                  <input
                    type="text"
                    placeholder="01-01-1990"
                    value={formData.dob}
                    onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-xs font-mono text-left"
                    dir="ltr"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1 text-right">
                    تاریخ تنسیخ (Expiry: DD-MM-YYYY)
                  </label>
                  <input
                    type="text"
                    placeholder="01-01-2030"
                    value={formData.expiry}
                    onChange={(e) => setFormData({ ...formData, expiry: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-xs font-mono text-left"
                    dir="ltr"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1 text-right">
                    جنس (Sex)
                  </label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-xs font-bold"
                  >
                    <option value="M">مرد (Male - M)</option>
                    <option value="F">عورت (Female - F)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1 text-right">
                  قومیت (Nationality)
                </label>
                <input
                  type="text"
                  placeholder="PAK"
                  value={formData.nationality}
                  onChange={(e) => setFormData({ ...formData, nationality: e.target.value.toUpperCase() })}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-xs font-mono uppercase font-bold text-left"
                  dir="ltr"
                />
              </div>
            </form>
          </ContentCard>
        </div>

        {/* Right Card: Sample MRZ Quick Test & Parser Runner */}
        <div className="lg:col-span-5 space-y-4">
          <ContentCard>
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <Keyboard className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-sm text-gray-900">سیمپل MRZ ٹیسٹنگ (Instant Test)</h3>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-[10px] font-bold border border-indigo-200">
                Official Sample
              </span>
            </div>

            <p className="text-xs text-gray-500 mb-3" dir="rtl">
              اس ٹیسٹ باکس کے ذریعے آپ دیے گئے آفیشل ٹیسٹ کیس کا فوری تجزیہ کر سکتے ہیں:
            </p>

            <div className="space-y-3 font-mono">
              <div>
                <label className="block text-[11px] font-bold text-gray-700 mb-1">
                  Line 1 (44 Chars):
                </label>
                <input
                  type="text"
                  value={testLine1}
                  onChange={(e) => setTestLine1(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-mono text-left tracking-wide focus:outline-none focus:border-indigo-500"
                  dir="ltr"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-700 mb-1">
                  Line 2 (44 Chars):
                </label>
                <input
                  type="text"
                  value={testLine2}
                  onChange={(e) => setTestLine2(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-mono text-left tracking-wide focus:outline-none focus:border-indigo-500"
                  dir="ltr"
                />
              </div>

              <button
                type="button"
                onClick={handleTestSampleMRZ}
                className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>سیمپل MRZ پارس اور فِل کریں</span>
              </button>
            </div>

            {/* Test Case Expected Verification Output */}
            <div className="mt-4 p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs space-y-1.5" dir="ltr">
              <span className="font-bold text-gray-700 block">متوقع نتیجہ (Expected Outcome):</span>
              <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
                <div>Passport: <strong className="text-emerald-700">PK12345678</strong></div>
                <div>Name: <strong className="text-emerald-700">AHMED ALI</strong></div>
                <div>DOB: <strong className="text-emerald-700">01-01-1990</strong></div>
                <div>Expiry: <strong className="text-emerald-700">01-01-2030</strong></div>
              </div>
            </div>
          </ContentCard>
        </div>
      </div>

      {/* Passport Scanner Modal */}
      <PassportScannerModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onScanComplete={handleApplyResult}
      />
    </div>
  );
}
