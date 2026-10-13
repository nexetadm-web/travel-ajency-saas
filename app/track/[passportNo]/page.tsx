'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import useSWR from 'swr';
import Link from 'next/link';
import QRCode from 'qrcode';
import {
  Compass,
  CheckCircle2,
  Clock,
  Plane,
  Building2,
  Phone,
  Calendar,
  CreditCard,
  Share2,
  Copy,
  Check,
  Send,
  Download,
  AlertCircle,
  Loader2,
  ShieldCheck,
  MapPin,
} from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function ClientTrackPage() {
  const params = useParams();
  const passportNo = params.passportNo as string;

  const { data, error, isLoading } = useSWR(
    passportNo ? `/api/track/${passportNo}` : null,
    fetcher
  );

  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && passportNo) {
      const currentUrl = window.location.href;
      QRCode.toDataURL(currentUrl, { width: 180, margin: 1, color: { dark: '#065F46', light: '#FFFFFF' } })
        .then((url) => setQrCodeUrl(url))
        .catch((err) => console.error('QR code error', err));
    }
  }, [passportNo]);

  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F8FAFF] flex flex-col items-center justify-center p-4">
        <Loader2 className="w-10 h-10 animate-spin text-emerald-600 mb-3" />
        <p className="text-sm font-bold text-gray-700">ٹریکنگ تفصیلات لوڈ ہو رہی ہیں...</p>
        <p className="text-xs text-gray-400 mt-1">پاسپورٹ: {passportNo}</p>
      </div>
    );
  }

  if (error || !data || !data.pilgrim) {
    return (
      <div className="min-h-screen bg-[#F8FAFF] flex flex-col items-center justify-center p-4">
        <div className="bg-white rounded-[24px] shadow-xl border border-gray-100 p-8 max-w-md w-full text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto text-2xl font-bold">
            ⚠️
          </div>
          <h2 className="text-xl font-black text-gray-900">کوئی ریکارڈ نہیں ملا</h2>
          <p className="text-xs text-gray-500">
            پاسپورٹ نمبر <span className="font-mono font-bold text-gray-800">{passportNo}</span> کا کوئی
            ریکارڈ سسٹم میں نہیں ملا۔ براہ کرم اپنی ٹریول ایجنسی سے رابطہ فرمائیں۔
          </p>
          <a
            href="/"
            className="inline-block px-6 py-2.5 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold shadow-lg shadow-emerald-200 transition"
          >
            ہوم پیج پر جائیں
          </a>
        </div>
      </div>
    );
  }

  const { pilgrim, agency, group, payment, timeline, tickets } = data;

  const whatsappMessage = encodeURIComponent(
    `السلام علیکم! میں اپنے عمرہ / حج کیس کے حوالے سے معلومات حاصل کرنا چاہتا ہوں۔\nنام: ${pilgrim.full_name}\nپاسپورٹ: ${pilgrim.passport_no}\nلنک: ${typeof window !== 'undefined' ? window.location.href : ''}`
  );

  return (
    <div className="min-h-screen bg-[#F8FAFF] text-gray-900 font-sans pb-16">
      {/* TOP AGENCY BRANDING HEADER */}
      <header className="bg-white border-b border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {agency.logo_url ? (
              <img
                src={agency.logo_url}
                alt={agency.name}
                className="w-12 h-12 rounded-2xl object-cover shadow-sm border border-gray-100"
              />
            ) : (
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center text-xl font-black shadow-md shadow-emerald-100">
                {agency.name ? agency.name.charAt(0) : '🕋'}
              </div>
            )}
            <div>
              <h1 className="text-lg font-black text-gray-900 leading-tight">{agency.name}</h1>
              <p className="text-[11px] text-gray-500 flex items-center gap-2">
                <span>لائسنس: {agency.license_no || 'تصدیق شدہ ٹور آپریٹر'}</span>
                {agency.phone && (
                  <span className="font-mono text-emerald-600 font-bold">{agency.phone}</span>
                )}
              </p>
            </div>
          </div>

          <a
            href={`https://wa.me/${(agency.phone || '').replace(/[^0-9]/g, '')}?text=${whatsappMessage}`}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 text-xs font-bold transition shadow-sm"
          >
            <Send className="w-3.5 h-3.5" />
            <span>WhatsApp رابطہ</span>
          </a>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* PILGRIM HERO CARD */}
        <div className="bg-gradient-to-br from-emerald-600 via-teal-700 to-emerald-800 rounded-[28px] p-6 sm:p-8 text-white shadow-[0_12px_40px_rgba(5,150,105,0.22)] relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-6 -mr-6 w-36 h-36 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-emerald-100 text-xs font-semibold mb-3">
                <Compass className="w-3.5 h-3.5 animate-spin-slow" />
                <span>لائیو عمرہ و حج پورٹل</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black">{pilgrim.full_name}</h2>
              {pilgrim.father_name && (
                <p className="text-xs text-emerald-100 mt-1">ولد: {pilgrim.father_name}</p>
              )}
              <div className="flex flex-wrap items-center gap-3 mt-3 text-xs">
                <span className="px-3 py-1 rounded-lg bg-white/20 backdrop-blur-md font-mono font-bold tracking-wider">
                  پاسپورٹ: {pilgrim.passport_no}
                </span>
                {group && (
                  <span className="px-3 py-1 rounded-lg bg-emerald-950/40 text-emerald-200 font-semibold">
                    گروپ: {group.group_name}
                  </span>
                )}
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 text-center sm:text-right min-w-[160px] self-stretch sm:self-auto flex flex-col justify-center">
              <span className="text-[11px] text-emerald-100 block">موجودہ ویزہ سٹیٹس</span>
              <span className="text-lg font-black mt-1 capitalize text-white">
                {pilgrim.visa_status === 'printed' ? 'ویزہ پرنٹ شدہ ✅' : pilgrim.visa_status === 'in_embassy' ? 'سفارت خانے میں ⏳' : 'دستاویزات زیرِ جائزہ 📋'}
              </span>
              <span className="text-[10px] text-emerald-200 mt-1 block">
                مصدقہ بذریعہ {agency.name}
              </span>
            </div>
          </div>
        </div>

        {/* 5-STEP VISUAL TIMELINE */}
        <div className="bg-white rounded-[24px] shadow-[0_8px_30px_rgba(0,0,0,0.06)] border border-gray-100 p-6 sm:p-8">
          <div className="flex items-center justify-between mb-6 border-b border-gray-100 pb-4">
            <div>
              <h3 className="text-lg font-black text-gray-900">سفر کی پیش رفت (ٹائم لائن)</h3>
              <p className="text-xs text-gray-500 mt-0.5">ویزہ، ہوٹل اور ٹکٹ کی مکمل تصدیق</p>
            </div>
            <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
              5 میں سے {timeline.filter((t: any) => t.completed).length} مراحل مکمل
            </span>
          </div>

          <div className="relative pl-6 sm:pl-8 space-y-8 before:absolute before:left-3 sm:before:left-4 before:top-3 before:bottom-3 before:w-0.5 before:bg-gray-200">
            {timeline.map((step: any) => (
              <div key={step.step} className="relative flex items-start gap-4">
                {/* Circle Badge */}
                <div
                  className={`absolute -left-6 sm:-left-8 mt-0.5 w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center text-xs font-black shadow-sm transition-all ${
                    step.completed
                      ? 'bg-emerald-500 text-white shadow-emerald-200 ring-4 ring-emerald-50'
                      : step.active
                      ? 'bg-indigo-600 text-white ring-4 ring-indigo-50 animate-pulse'
                      : 'bg-gray-100 text-gray-400 border border-gray-200'
                  }`}
                >
                  {step.completed ? (
                    <CheckCircle2 className="w-4 h-4 text-white" />
                  ) : (
                    <span>{step.step}</span>
                  )}
                </div>

                <div className="flex-1 bg-gray-50/60 hover:bg-gray-50 p-4 rounded-2xl border border-gray-100 transition">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <h4
                      className={`font-bold text-sm ${
                        step.completed
                          ? 'text-emerald-900'
                          : step.active
                          ? 'text-indigo-900 font-black'
                          : 'text-gray-500'
                      }`}
                    >
                      {step.title}
                    </h4>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full w-fit ${
                        step.completed
                          ? 'bg-emerald-100 text-emerald-800'
                          : step.active
                          ? 'bg-indigo-100 text-indigo-800'
                          : 'bg-gray-100 text-gray-400'
                      }`}
                    >
                      {step.completed ? 'مکمل شدہ' : step.active ? 'زیرِ عمل' : 'پینڈنگ'}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{step.subtitle}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* PAYMENT HISAB CARD */}
        <div className="bg-white rounded-[24px] shadow-[0_8px_30px_rgba(0,0,0,0.06)] border border-gray-100 p-6 sm:p-8 space-y-5">
          <div className="flex items-center justify-between border-b border-gray-100 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-lg font-bold">
                💳
              </div>
              <div>
                <h3 className="text-base font-black text-gray-900">ادائیگی کا کھاتہ و حساب</h3>
                <p className="text-xs text-gray-500">پیکیج فیس اور وصول شدہ رقم</p>
              </div>
            </div>
            <span className="text-xs font-bold text-emerald-600 font-mono">
              {payment.percentPaid}% ادا شدہ
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100">
              <span className="text-xs text-gray-500 font-semibold block">کل پیکیج رقم</span>
              <span className="text-2xl font-black text-gray-900 mt-1 block">
                {formatCurrency(payment.total)}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-100">
              <span className="text-xs text-emerald-700 font-semibold block">وصول شدہ رقم</span>
              <span className="text-2xl font-black text-emerald-700 mt-1 block">
                {formatCurrency(payment.paid)}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-rose-50/70 border border-rose-100">
              <span className="text-xs text-rose-700 font-semibold block">باقی واجب الادا رقم</span>
              <span className="text-2xl font-black text-rose-700 mt-1 block">
                {formatCurrency(payment.remaining)}
              </span>
            </div>
          </div>

          {/* Progress Bar */}
          <div>
            <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden shadow-inner">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-500"
                style={{ width: `${payment.percentPaid}%` }}
              />
            </div>
            <div className="flex justify-between items-center text-[11px] text-gray-400 mt-2 font-medium">
              <span>0 Rs</span>
              <span>باقی: {formatCurrency(payment.remaining)}</span>
              <span>{formatCurrency(payment.total)}</span>
            </div>
          </div>
        </div>

        {/* TRAVEL ITINERARY & HOTELS */}
        {group && (
          <div className="bg-white rounded-[24px] shadow-[0_8px_30px_rgba(0,0,0,0.06)] border border-gray-100 p-6 sm:p-8 space-y-5">
            <div className="flex items-center gap-2.5 border-b border-gray-100 pb-4">
              <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-lg font-bold">
                🕋
              </div>
              <div>
                <h3 className="text-base font-black text-gray-900">سفر و رہائش کی تفصیلات</h3>
                <p className="text-xs text-gray-500">مکہ مکرمہ و مدینہ منورہ کے ہوٹلز</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50/40 border border-amber-100">
                <div className="flex items-center gap-2 text-amber-800 font-bold text-xs">
                  <Building2 className="w-4 h-4" />
                  <span>مکہ مکرمہ ہوٹل</span>
                </div>
                <div className="text-base font-black text-gray-900 mt-1.5">
                  {group.makkah_hotel || 'معیاری 3/4 سٹار ہوٹل نزد حرم'}
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50/40 border border-emerald-100">
                <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs">
                  <Building2 className="w-4 h-4" />
                  <span>مدینہ منورہ ہوٹل</span>
                </div>
                <div className="text-base font-black text-gray-900 mt-1.5">
                  {group.madinah_hotel || 'مرکزیہ شمالی / جنوبی ہوٹل'}
                </div>
              </div>

              {group.departure_date && (
                <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100">
                  <div className="flex items-center gap-2 text-gray-600 font-bold text-xs">
                    <Calendar className="w-4 h-4 text-emerald-600" />
                    <span>تاریخ روانگی</span>
                  </div>
                  <div className="text-sm font-bold text-gray-900 mt-1">
                    {formatDate(group.departure_date)}
                  </div>
                </div>
              )}

              {group.airline && (
                <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100">
                  <div className="flex items-center gap-2 text-gray-600 font-bold text-xs">
                    <Plane className="w-4 h-4 text-indigo-600" />
                    <span>ایئرلائن</span>
                  </div>
                  <div className="text-sm font-bold text-gray-900 mt-1 font-mono">
                    {group.airline}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* SHARE & QR CODE VERIFICATION */}
        <div className="bg-white rounded-[24px] shadow-[0_8px_30px_rgba(0,0,0,0.06)] border border-gray-100 p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-3 text-center sm:text-right">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold">
              <ShieldCheck className="w-4 h-4" />
              <span>مصدقہ پورٹل و کیو آر تصدیق</span>
            </div>
            <h4 className="text-base font-black text-gray-900">
              یہ ٹریکنگ لنک فیملی ممبرز کے ساتھ شیئر کریں
            </h4>
            <p className="text-xs text-gray-500 max-w-md">
              کسی بھی وقت اپنے موبائل سے اس QR کوڈ کو اسکین کر کے تازہ ترین ویزا اور پرواز سٹیٹس دیکھ سکتے ہیں۔
            </p>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 pt-1">
              <button
                onClick={handleCopyLink}
                className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold transition flex items-center gap-2"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'لنک کاپی ہو گیا!' : 'لنک کاپی کریں'}</span>
              </button>

              <a
                href={`https://wa.me/?text=${encodeURIComponent(`السلام علیکم! میرے عمرہ/حج کیس کا لائیو ٹریکنگ لنک درج ذیل ہے:\n${typeof window !== 'undefined' ? window.location.href : ''}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold shadow-md shadow-emerald-100 transition flex items-center gap-2"
              >
                <Share2 className="w-4 h-4" />
                <span>WhatsApp پر شیئر کریں</span>
              </a>

              <a
                href={`/api/pdf/dua-card/${pilgrim.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-bold transition flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                <span>دعا کارڈ PDF</span>
              </a>
            </div>
          </div>

          {qrCodeUrl && (
            <div className="bg-gray-50 p-3 rounded-2xl border border-gray-200 flex flex-col items-center flex-shrink-0">
              <img src={qrCodeUrl} alt="QR Verification" className="w-32 h-32 rounded-lg" />
              <span className="text-[10px] text-gray-500 font-mono mt-1 font-bold">QR تصدیق</span>
            </div>
          )}
        </div>
      </main>

      {/* FLOATING WHATSAPP BUTTON FOR MOBILE */}
      <div className="fixed bottom-4 left-4 right-4 sm:hidden z-50">
        <a
          href={`https://wa.me/${(agency.phone || '').replace(/[^0-9]/g, '')}?text=${whatsappMessage}`}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full py-3.5 px-6 rounded-2xl bg-emerald-600 text-white font-black text-sm shadow-xl shadow-emerald-300 flex items-center justify-center gap-2 transition"
        >
          <Send className="w-4 h-4" />
          <span>ایجنسی سے WhatsApp رابطہ کریں</span>
        </a>
      </div>
    </div>
  );
}
