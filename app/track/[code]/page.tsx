'use client';

import { useState } from 'react';
import useSWR from 'swr';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  CheckCircle2,
  Clock,
  Plane,
  Building2,
  FileCheck2,
  UserCheck,
  Phone,
  MessageCircle,
  Download,
  AlertCircle,
  ShieldCheck,
  Share2,
  Copy,
  ExternalLink,
  MapPin,
  Calendar,
  Sparkles,
} from 'lucide-react';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function PublicHajiTrackingPage() {
  const params = useParams();
  const code = params.code as string;

  const { data, error, isLoading } = useSWR(`/api/track/${code}`, fetcher, {
    revalidateOnFocus: false,
  });

  const [copied, setCopied] = useState(false);

  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F8FAFF] flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <h2 className="text-base font-bold text-gray-700">عمرہ و حج ٹریکنگ ڈیٹا لوڈ ہو رہا ہے...</h2>
          <p className="text-xs text-gray-400">براہ کرم چند سیکنڈ انتظار فرمائیں</p>
        </div>
      </div>
    );
  }

  if (error || !data || !data.success) {
    return (
      <div className="min-h-screen bg-[#F8FAFF] flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 max-w-md w-full text-center shadow-xl border border-gray-100 space-y-4">
          <div className="w-16 h-16 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center mx-auto">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">ریکارڈ نہیں ملا</h2>
          <p className="text-xs text-gray-500">
            {data?.error || 'اس ٹریکنگ کوڈ یا پاسپورٹ نمبر کا کوئی ڈیٹا موصول نہیں ہوا۔'}
          </p>
          <div className="pt-2">
            <Link
              href="/"
              className="inline-block px-6 py-2.5 rounded-full bg-emerald-500 text-white text-xs font-bold hover:bg-emerald-600 transition"
            >
              دوبارہ کوشش کریں
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const { pilgrim, agency, group, steps, progress } = data;

  return (
    <div className="min-h-screen bg-[#F8FAFF] py-6 sm:py-8 px-2 sm:px-4 flex flex-col items-center justify-start text-slate-800 antialiased w-full max-w-full overflow-x-hidden">
      {/* Light Shell Centered Card (max-w-2xl) */}
      <div className="max-w-2xl w-full bg-white rounded-2xl sm:rounded-[28px] shadow-[0_12px_40px_rgba(0,0,0,0.08)] border border-gray-100 overflow-hidden">
        {/* Top Header Card */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white p-4 sm:p-6 md:p-8 relative overflow-hidden">
          <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-5 text-center sm:text-left">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-3 sm:gap-4">
              {pilgrim.photo_url ? (
                <img
                  src={pilgrim.photo_url}
                  alt={pilgrim.full_name}
                  className="w-16 h-16 rounded-2xl object-cover border-2 border-emerald-400 shadow-lg shrink-0"
                />
              ) : (
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white font-black text-2xl flex items-center justify-center shadow-lg uppercase shrink-0">
                  {pilgrim.full_name?.charAt(0) || 'H'}
                </div>
              )}
              <div>
                <span className="text-[11px] font-bold tracking-wider text-emerald-400 uppercase flex items-center justify-center sm:justify-start gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  تصدیق شدہ مسافر ٹریکنگ
                </span>
                <h1 className="font-urdu text-lg sm:text-2xl font-black text-white mt-0.5 break-words">
                  {pilgrim.full_name}
                </h1>
                <p className="text-xs text-slate-300 mt-0.5 break-words">
                  پاسپورٹ: <span className="font-mono font-bold text-white">{pilgrim.passport_no}</span> | کوڈ: <span className="font-mono text-emerald-300 font-bold">{pilgrim.tracking_code}</span>
                </p>
              </div>
            </div>

            {/* Agency Badge */}
            <div className="bg-white/10 backdrop-blur rounded-2xl p-3 border border-white/10 text-center sm:text-right w-full sm:w-auto">
              <span className="text-[10px] text-slate-400 block">مجاز ٹریول ایجنسی:</span>
              <strong className="text-xs text-emerald-300 block truncate max-w-full sm:max-w-[170px]">
                {agency.name}
              </strong>
              <span className="text-[10px] text-slate-300 block">لائسنس: {agency.license_no}</span>
            </div>
          </div>

          {/* Quick Share Link Button */}
          <div className="mt-5 pt-4 border-t border-white/10 flex items-center justify-between">
            <span className="text-xs text-slate-300 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              لائیو ٹریکنگ پروگریس
            </span>
            <button
              onClick={handleCopyLink}
              className="px-3.5 py-1.5 rounded-full bg-white/15 hover:bg-white/25 text-white text-xs font-bold transition flex items-center gap-1.5"
            >
              {copied ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  لنک کاپی ہو گیا!
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  لنک کاپی کریں (Share)
                </>
              )}
            </button>
          </div>
        </div>

        {/* Progress Bar (0 - 100%) */}
        <div className="p-6 sm:p-8 border-b border-gray-100 bg-emerald-50/30">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-gray-700">
              سفر کی مجموعی تکمیل: <strong className="text-emerald-600">{progress}%</strong>
            </span>
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-100 text-emerald-800">
              {progress >= 80 ? 'روانگی کے قریب' : progress >= 40 ? 'ویزا و ٹکٹ کا مرحلہ' : 'رجسٹریشن مکمل'}
            </span>
          </div>
          <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden shadow-inner">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-1000 shadow-sm"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* 8-Step Vertical Timeline */}
        <div className="p-6 sm:p-8 space-y-6">
          <h2 className="text-sm font-bold uppercase tracking-wider text-gray-500 flex items-center gap-2">
            <span>🕋</span> سفرِ حرمین کی لائیو ٹائم لائن (Live Pilgrimage Journey)
          </h2>

          <div className="relative pl-6 space-y-8 before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-200">
            {/* Step 1: Registration */}
            <div className="relative flex items-start gap-4">
              <div className="absolute -left-6 mt-1 w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center ring-4 ring-white shadow-sm">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-gray-900">1. رجسٹریشن مکمل (Registration)</h3>
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    مکمل ہو چکا ✓
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  ایجنسی ریکارڈ میں حاجی کا باضابطہ اندراج اور اکاؤنٹ اوپن کر دیا گیا ہے۔
                </p>
              </div>
            </div>

            {/* Step 2: Passport Collected */}
            <div className="relative flex items-start gap-4">
              <div className="absolute -left-6 mt-1 w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center ring-4 ring-white shadow-sm">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-gray-900">2. پاسپورٹ وصول شدہ (Passport Collected)</h3>
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    مکمل ہو چکا ✓
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  پاسپورٹ اور شناختی دستاویزات ایجنسی ہیڈ آفس کو موصول ہو چکے ہیں۔
                </p>
              </div>
            </div>

            {/* Step 3: Visa Applied */}
            <div className="relative flex items-start gap-4">
              <div className={`absolute -left-6 mt-1 w-6 h-6 rounded-full flex items-center justify-center ring-4 ring-white shadow-sm ${
                steps.visaApplied.done ? 'bg-emerald-500 text-white' : 'bg-gray-300 text-gray-600'
              }`}>
                {steps.visaApplied.done ? <CheckCircle2 className="w-4 h-4" /> : <Clock className="w-3.5 h-3.5" />}
              </div>
              <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-gray-900">3. ویزا اپلائیڈ (Visa Applied)</h3>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                    steps.visaApplied.done ? 'text-emerald-600 bg-emerald-50 border-emerald-200' : 'text-gray-500 bg-gray-100 border-gray-200'
                  }`}>
                    {steps.visaApplied.done ? 'سفارت خانے میں جمع ✓' : 'زیر کارروائی'}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  سعودی وزارت حج و عمرہ / سفارت خانہ میں ویزہ اپروول کے لیے فائل پروسیسنگ میں ہے۔
                </p>
              </div>
            </div>

            {/* Step 4: Visa Approved */}
            <div className="relative flex items-start gap-4">
              <div className={`absolute -left-6 mt-1 w-6 h-6 rounded-full flex items-center justify-center ring-4 ring-white shadow-sm ${
                steps.visaApproved.done ? 'bg-emerald-500 text-white' : 'bg-gray-300 text-gray-600'
              }`}>
                {steps.visaApproved.done ? <CheckCircle2 className="w-4 h-4" /> : <Clock className="w-3.5 h-3.5" />}
              </div>
              <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-gray-900">4. ویزا منظور شدہ (Visa Approved)</h3>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                    steps.visaApproved.done ? 'text-emerald-700 bg-emerald-100 border-emerald-300' : 'text-gray-500 bg-gray-100 border-gray-200'
                  }`}>
                    {steps.visaApproved.done ? 'مبارک ہو! ویزا جاری ✓' : 'انتظار'}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  ای-ویزا جاری ہونے کے بعد یہاں سے پی ڈی ایف کاپی ڈاؤن لوڈ کی جا سکتی ہے۔
                </p>
                {steps.visaApproved.done && (
                  <div className="mt-3">
                    <a
                      href={steps.visaApproved.downloadUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 shadow-sm"
                    >
                      <Download className="w-3.5 h-3.5" />
                      ویزا سلپ ڈاؤن لوڈ کریں (PDF)
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Step 5: Ticket Confirmed */}
            <div className="relative flex items-start gap-4">
              <div className={`absolute -left-6 mt-1 w-6 h-6 rounded-full flex items-center justify-center ring-4 ring-white shadow-sm ${
                steps.ticketConfirmed.done ? 'bg-emerald-500 text-white' : 'bg-gray-300 text-gray-600'
              }`}>
                {steps.ticketConfirmed.done ? <CheckCircle2 className="w-4 h-4" /> : <Plane className="w-3.5 h-3.5" />}
              </div>
              <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-gray-900">5. ٹکٹ کنفرم (Ticket Confirmed)</h3>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                    steps.ticketConfirmed.done ? 'text-sky-700 bg-sky-50 border-sky-200' : 'text-gray-500 bg-gray-100 border-gray-200'
                  }`}>
                    {steps.ticketConfirmed.done ? 'کنفرم بکنگ ✓' : 'سیٹ ریزرویشن'}
                  </span>
                </div>
                <div className="mt-2 text-xs space-y-1 text-gray-600">
                  <div>ایئرلائن PNR: <strong className="font-mono text-gray-900">{steps.ticketConfirmed.pnr}</strong></div>
                  <div>فلائٹ تاریخ: <strong className="text-gray-900">{steps.ticketConfirmed.flightDate}</strong></div>
                </div>
                {steps.ticketConfirmed.done && (
                  <div className="mt-3">
                    <Link
                      href={steps.ticketConfirmed.downloadUrl}
                      className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-sky-600 text-white text-xs font-bold hover:bg-sky-700 shadow-sm"
                    >
                      <Download className="w-3.5 h-3.5" />
                      ایئر ٹکٹ ڈاؤن لوڈ (E-Ticket)
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {/* Step 6: Hotel */}
            <div className="relative flex items-start gap-4">
              <div className={`absolute -left-6 mt-1 w-6 h-6 rounded-full flex items-center justify-center ring-4 ring-white shadow-sm ${
                steps.hotel.done ? 'bg-emerald-500 text-white' : 'bg-gray-300 text-gray-600'
              }`}>
                {steps.hotel.done ? <CheckCircle2 className="w-4 h-4" /> : <Building2 className="w-3.5 h-3.5" />}
              </div>
              <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-gray-900">6. ہوٹل واؤچر (Hotel Accommodation)</h3>
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    ریزروڈ ✓
                  </span>
                </div>
                <div className="mt-2 text-xs space-y-1.5 text-gray-700">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                    <strong>مکہ مکرمہ:</strong> {steps.hotel.makkah}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-teal-600" />
                    <strong>مدینہ منورہ:</strong> {steps.hotel.madinah}
                  </div>
                </div>
              </div>
            </div>

            {/* Step 7: Group Leader */}
            <div className="relative flex items-start gap-4">
              <div className="absolute -left-6 mt-1 w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center ring-4 ring-white shadow-sm">
                <UserCheck className="w-4 h-4" />
              </div>
              <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-gray-900">7. گروپ لیڈر و رہنمائی (Group Leader)</h3>
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    دستیاب
                  </span>
                </div>
                <p className="text-xs text-gray-600 mt-1">
                  نام: <strong className="text-gray-900">{steps.groupLeader.name}</strong> | فون: {steps.groupLeader.phone}
                </p>
                <div className="mt-3">
                  <a
                    href={steps.groupLeader.waLink}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#25D366] text-white text-xs font-bold hover:bg-[#1ebd5a] shadow-sm transition"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    واٹس ایپ پر رابطہ کریں (WhatsApp)
                  </a>
                </div>
              </div>
            </div>

            {/* Step 8: Departure */}
            <div className="relative flex items-start gap-4">
              <div className={`absolute -left-6 mt-1 w-6 h-6 rounded-full flex items-center justify-center ring-4 ring-white shadow-sm ${
                steps.departure.done ? 'bg-emerald-500 text-white' : 'bg-gray-300 text-gray-600'
              }`}>
                {steps.departure.done ? <CheckCircle2 className="w-4 h-4" /> : <Calendar className="w-3.5 h-3.5" />}
              </div>
              <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-gray-900">8. روانگی مبارک (Departure)</h3>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                    steps.departure.done ? 'text-emerald-700 bg-emerald-100 border-emerald-300' : 'text-gray-500 bg-gray-100 border-gray-200'
                  }`}>
                    {steps.departure.done ? 'روانہ ہو چکے ✓' : 'شیڈولڈ'}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  روانگی متوقع تاریخ: <strong className="text-gray-900">{steps.departure.date}</strong>۔ اللہ تعالیٰ آپ کا حج و عمرہ قبول فرمائے۔
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 bg-gray-50 border-t border-gray-100 text-center text-xs text-gray-500 space-y-1">
          <p>© {new Date().getFullYear()} {agency.name} | سسٹم پاورڈ از الحرم ٹریول مینجمنٹ سسٹم</p>
          <p className="text-[11px] text-gray-400">تمام کوائف سرکاری ریکارڈ اور ویزا سسٹم کے مطابق ہیں</p>
        </div>
      </div>
    </div>
  );
}
