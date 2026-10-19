import Link from 'next/link';
import { ArrowRight, Plane, Users, FileText, Building2, ShieldCheck, CheckCircle2, QrCode } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white flex flex-col justify-between">
      {/* Top Navbar */}
      <header className="border-b border-slate-700/60 backdrop-blur-md px-3 sm:px-6 py-4 sticky top-0 z-50 bg-slate-900/90">
        <div className="container mx-auto px-4 md:px-8 lg:px-12 max-w-[1440px]">
          <nav className="flex flex-col lg:flex-row justify-between items-center gap-4">
            <div className="flex items-center justify-between w-full lg:w-auto">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20 font-bold text-slate-900 text-xl">
                  ✈
                </div>
                <div>
                  <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-100 to-emerald-400 bg-clip-text text-transparent">
                    Travel SaaS ERP
                  </span>
                  <span className="block text-xs text-emerald-400 font-medium">100% Market Leader Cloud System</span>
                </div>
              </div>
            </div>

            {/* Desktop / Responsive Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto items-center">
              <Link
                href="/signup"
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white transition shadow-md flex items-center justify-center gap-1.5 text-center"
              >
                + ایجنسی رجسٹر کریں
              </Link>
              <Link
                href="/login"
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition shadow-lg shadow-emerald-500/30 flex items-center justify-center gap-2 text-center"
              >
                <span>ایجنسی لاگ ان (Agency Login)</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/super-admin/login"
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-purple-600/30 hover:bg-purple-600/50 text-purple-200 border border-purple-500/30 transition flex items-center justify-center gap-2 text-center"
              >
                <ShieldCheck className="w-4 h-4 text-purple-400" />
                <span>سپر ایڈمن</span>
              </Link>
            </div>
          </nav>
        </div>
      </header>

      {/* Main Container */}
      <main className="w-full flex-1 flex flex-col justify-center">
        {/* Hero Section - fully responsive, max-w-4xl mx-auto, px-6, text centered */}
        <section className="w-full max-w-4xl mx-auto px-6 py-12 sm:py-16 md:py-20 flex flex-col items-center justify-center text-center">
          {/* Top Badge */}
          <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] sm:text-xs font-semibold mb-6 max-w-full truncate" dir="ltr">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0"></span>
            <span className="truncate">Next.js 14 + Turso LibSQL + Drizzle ORM + WhatsApp Automation</span>
          </div>

          {/* Heading: font-normal, leading-[1.9], text-center, mobile: text-[26px], desktop: text-[42px] */}
          <div className="w-full" dir="rtl">
            <h1
              className="urdu-text font-normal text-[26px] md:text-[42px] leading-[1.9] text-center text-white break-words"
              style={{ transform: 'none' }}
            >
              پاکستان اور خلیجی ممالک کی ٹریول ایجنسیوں کے لیے{' '}
              <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent inline-block" style={{ transform: 'none' }}>
                نمبر 1 کلاؤڈ ساس پلیٹ فارم
              </span>
            </h1>
          </div>

          {/* Subtext: text-[16px] on mobile, text-[18px] on desktop, leading-loose, text-gray-300 */}
          <div className="w-full mt-4 sm:mt-6" dir="rtl">
            <p
              className="urdu-text text-[16px] md:text-[18px] leading-loose text-gray-300 text-center max-w-3xl mx-auto font-normal break-words"
              style={{ transform: 'none' }}
            >
              ٹکٹنگ، ویزہ PNR، عمرہ و حج گروپ مینجمنٹ، انسٹنٹ کیبن ٹریکنگ، ہوٹل و ٹرانسپورٹ، مکمل کھاتہ، QR تصدیقی رسیدیں
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-center justify-center gap-3 w-full max-w-md sm:max-w-2xl px-2" dir="ltr">
            <Link
              href="/signup"
              className="w-full sm:w-auto px-6 sm:px-8 py-3.5 sm:py-4 rounded-2xl text-sm sm:text-base font-bold bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white shadow-xl shadow-indigo-600/30 transition flex items-center justify-center gap-2 sm:gap-3 text-center"
            >
              <span>+ مفت ٹریول ایجنسی رجسٹر کریں (Sign Up)</span>
              <ArrowRight className="w-4 h-4 sm:w-5 h-5 shrink-0" />
            </Link>
            <Link
              href="/login"
              className="w-full sm:w-auto px-6 sm:px-8 py-3.5 sm:py-4 rounded-2xl text-sm sm:text-base font-bold bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 shadow-xl shadow-emerald-500/30 transition flex items-center justify-center gap-2 sm:gap-3 text-center"
            >
              <span>ڈیش بورڈ پر جائیں (Access Portal)</span>
              <ArrowRight className="w-4 h-4 sm:w-5 h-5 shrink-0" />
            </Link>
            <Link
              href="/super-admin/login"
              className="w-full sm:w-auto px-6 sm:px-8 py-3.5 sm:py-4 rounded-2xl text-sm sm:text-base font-bold bg-slate-800 hover:bg-slate-700 text-white border border-slate-600 transition flex items-center justify-center gap-2 sm:gap-3 text-center"
            >
              <ShieldCheck className="w-4 h-4 sm:w-5 h-5 text-purple-400 shrink-0" />
              <span>سپر ایڈمن پورٹل</span>
            </Link>
          </div>
        </section>

        {/* 6 Killer Modules Grid */}
        <section className="container mx-auto px-4 md:px-8 lg:px-12 max-w-[1440px] pb-16 sm:pb-24">
          <div className="text-center mb-10" dir="rtl">
            <h2 className="urdu-text text-xl md:text-3xl font-bold text-white text-center" style={{ transform: 'none' }}>
              ٹریول اور عمرہ ایجنسیوں کے تمام اہم شعبہ جات ایک جگہ
            </h2>
            <p className="urdu-text text-xs md:text-sm text-slate-400 text-center mt-1" style={{ transform: 'none' }}>
              مکمل کلاؤڈ ساس سافٹ ویئر جو آپ کی ایجنسی کے کام کو 10 گنا تیز بناتا ہے
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 w-full text-right" dir="rtl">
            <div className="p-6 rounded-2xl bg-slate-800/50 border border-slate-700/60 backdrop-blur hover:border-emerald-500/40 transition">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mb-4">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="urdu-text text-base md:text-lg font-bold text-white mb-1">1. عمرہ / حج گروپ مینجمنٹ</h3>
              <p className="urdu-text text-xs md:text-sm text-slate-400 leading-[2.1]">سیٹوں کی اوکیوپینسی، کاؤنٹ ڈاؤن، پاسپورٹ سرچ، ون کلک ویزہ سٹیٹس، اور سفارت خانے کے مینی فیسٹ پی ڈی ایف۔</p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-800/50 border border-slate-700/60 backdrop-blur hover:border-emerald-500/40 transition">
              <div className="w-12 h-12 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400 flex items-center justify-center mb-4">
                <Plane className="w-6 h-6" />
              </div>
              <h3 className="urdu-text text-base md:text-lg font-bold text-white mb-1">2. ٹکٹنگ اور PNR مینجمنٹ</h3>
              <p className="urdu-text text-xs md:text-sm text-slate-400 leading-[2.1]">انسٹنٹ PNR سرچ، آٹو منافع کیلکولیشن، زائرین کے ساتھ لنکنگ، اور ایئرلائن وائز پرافٹ اینالیٹکس چارٹس۔</p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-800/50 border border-slate-700/60 backdrop-blur hover:border-emerald-500/40 transition">
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center mb-4">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="urdu-text text-base md:text-lg font-bold text-white mb-1">3. ویزہ ٹریکنگ کنبان</h3>
              <p className="urdu-text text-xs md:text-sm text-slate-400 leading-[2.1]">ڈریگ اینڈ ڈراپ کنبان بورڈ، ویزہ پرنٹ ہونے پر خودکار واٹس ایپ میسج اور 30 دن کی ایکسپائری وارننگ بیج۔</p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-800/50 border border-slate-700/60 backdrop-blur hover:border-emerald-500/40 transition">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mb-4">
                <Building2 className="w-6 h-6" />
              </div>
              <h3 className="urdu-text text-base md:text-lg font-bold text-white mb-1">4. ہوٹل اور ٹرانسپورٹیشن</h3>
              <p className="urdu-text text-xs md:text-sm text-slate-400 leading-[2.1]">مکہ و مدینہ ہوٹل بکنگز، بسیں/GMC روٹس، کیلنڈر روم ایلوکیشن اور فی گروپ منافع کا حساب۔</p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-800/50 border border-slate-700/60 backdrop-blur hover:border-emerald-500/40 transition">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mb-4">
                <QrCode className="w-6 h-6" />
              </div>
              <h3 className="urdu-text text-base md:text-lg font-bold text-white mb-1">5. مکمل کھاتہ / حساب کتاب</h3>
              <p className="urdu-text text-xs md:text-sm text-slate-400 leading-[2.1]">کسٹمر و سپلائر لیجر، خودکار ریمیننگ بیلنس، واٹس ایپ رسید اور لائیو کیو آر کوڈ ویریفکیشن۔</p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-800/50 border border-slate-700/60 backdrop-blur hover:border-emerald-500/40 transition">
              <div className="w-12 h-12 rounded-xl bg-pink-500/10 border border-pink-500/20 text-pink-400 flex items-center justify-center mb-4">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="urdu-text text-base md:text-lg font-bold text-white mb-1">6. اخراجات و آٹو برانڈنگ</h3>
              <p className="urdu-text text-xs md:text-sm text-slate-400 leading-[2.1]">ڈیلی 9PM مالک کو خلاصہ بذریعہ واٹس ایپ، AI پاسپورٹ ایکسپائری الرٹس، اور 100% متحرک ایجنسی برانڈنگ۔</p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-6 text-center text-xs text-slate-400">
        <p>© 2026 Travel Agency SaaS ERP. All rights reserved. Turso Database + Drizzle ORM powered.</p>
      </footer>
    </div>
  );
}
