import Link from 'next/link';
import { ArrowRight, Plane, Users, FileText, Building2, ShieldCheck, CheckCircle2, QrCode } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white flex flex-col justify-between">
      {/* Top Navbar */}
      <header className="border-b border-slate-700/60 backdrop-blur-md px-6 py-4 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
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
          <div className="flex items-center gap-3">
            <Link
              href="/signup"
              className="px-4 py-2 rounded-xl text-sm font-semibold bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white transition shadow-md flex items-center gap-1.5"
            >
              + ایجنسی رجسٹر کریں
            </Link>
            <Link
              href="/login"
              className="px-4 py-2 rounded-xl text-sm font-semibold bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition shadow-lg shadow-emerald-500/30 flex items-center gap-2"
            >
              ایجنسی لاگ ان (Agency Login)
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/super-admin/login"
              className="px-4 py-2 rounded-xl text-sm font-semibold bg-purple-600/30 hover:bg-purple-600/50 text-purple-200 border border-purple-500/30 transition flex items-center gap-2"
            >
              <ShieldCheck className="w-4 h-4 text-purple-400" />
              سپر ایڈمن
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-6 py-16 flex-1 flex flex-col items-center justify-center text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold mb-6">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          Next.js 14 + Turso LibSQL + Drizzle ORM + WhatsApp Automation
        </div>
        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight max-w-4xl leading-tight">
          پاکستان اور خلیجی ممالک کی ٹریول ایجنسیوں کے لیے{' '}
          <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
            نمبر 1 کلاؤڈ ساس پلیٹ فارم
          </span>
        </h1>
        <p className="mt-6 text-lg sm:text-xl text-slate-300 max-w-2xl font-light">
          عمرہ و حج گروپ مینجمنٹ، انسٹنٹ PNR ٹکٹنگ، ویزہ کنبان ٹریکنگ، ہوٹل و ٹرانسپورٹ، مکمل کھاتہ بمعہ ڈائنامک واٹس ایپ اور QR تصدیقی رسیدیں۔
        </p>

        {/* CTA Buttons */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/signup"
            className="px-8 py-4 rounded-2xl text-base font-bold bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white shadow-xl shadow-indigo-600/30 transition transform hover:-translate-y-0.5 flex items-center gap-3"
          >
            + مفت ٹریول ایجنسی رجسٹر کریں (Sign Up)
            <ArrowRight className="w-5 h-5" />
          </Link>
          <Link
            href="/login"
            className="px-8 py-4 rounded-2xl text-base font-bold bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 shadow-xl shadow-emerald-500/30 transition transform hover:-translate-y-0.5 flex items-center gap-3"
          >
            ڈیش بورڈ پر جائیں (Access Portal)
            <ArrowRight className="w-5 h-5" />
          </Link>
          <Link
            href="/super-admin/login"
            className="px-8 py-4 rounded-2xl text-base font-bold bg-slate-800 hover:bg-slate-700 text-white border border-slate-600 transition flex items-center gap-3"
          >
            <ShieldCheck className="w-5 h-5 text-purple-400" />
            سپر ایڈمن پورٹل (Super Admin)
          </Link>
        </div>

        {/* 6 Killer Modules Grid */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full text-left">
          <div className="p-6 rounded-2xl bg-slate-800/50 border border-slate-700/60 backdrop-blur hover:border-emerald-500/40 transition">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mb-4">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">1. عمرہ / حج گروپ مینجمنٹ</h3>
            <p className="text-sm text-slate-400">سیٹوں کی اوکیوپینسی، کاؤنٹ ڈاؤن، پاسپورٹ سرچ، ون کلک ویزہ سٹیٹس، اور سفارت خانے کے مینی فیسٹ پی ڈی ایف۔</p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-800/50 border border-slate-700/60 backdrop-blur hover:border-emerald-500/40 transition">
            <div className="w-12 h-12 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400 flex items-center justify-center mb-4">
              <Plane className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">2. ٹکٹنگ اور PNR مینجمنٹ</h3>
            <p className="text-sm text-slate-400">انسٹنٹ PNR سرچ، آٹو منافع کیلکولیشن، زائرین کے ساتھ لنکنگ، اور ایئرلائن وائز پرافٹ اینالیٹکس چارٹس۔</p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-800/50 border border-slate-700/60 backdrop-blur hover:border-emerald-500/40 transition">
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center mb-4">
              <FileText className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">3. ویزہ ٹریکنگ کنبان</h3>
            <p className="text-sm text-slate-400">ڈریگ اینڈ ڈراپ کنبان بورڈ، ویزہ پرنٹ ہونے پر خودکار واٹس ایپ میسج اور 30 دن کی ایکسپائری وارننگ بیج۔</p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-800/50 border border-slate-700/60 backdrop-blur hover:border-emerald-500/40 transition">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mb-4">
              <Building2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">4. ہوٹل اور ٹرانسپورٹیشن</h3>
            <p className="text-sm text-slate-400">مکہ و مدینہ ہوٹل بکنگز، بسیں/GMC روٹس، کیلنڈر روم ایلوکیشن اور فی گروپ منافع کا حساب۔</p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-800/50 border border-slate-700/60 backdrop-blur hover:border-emerald-500/40 transition">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mb-4">
              <QrCode className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">5. مکمل کھاتہ / حساب کتاب</h3>
            <p className="text-sm text-slate-400">کسٹمر و سپلائر لیجر، خودکار ریمیننگ بیلنس، واٹس ایپ رسید اور لائیو کیو آر کوڈ ویریفکیشن۔</p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-800/50 border border-slate-700/60 backdrop-blur hover:border-emerald-500/40 transition">
            <div className="w-12 h-12 rounded-xl bg-pink-500/10 border border-pink-500/20 text-pink-400 flex items-center justify-center mb-4">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">6. اخراجات و آٹو برانڈنگ</h3>
            <p className="text-sm text-slate-400">ڈیلی 9PM مالک کو خلاصہ بذریعہ واٹس ایپ، AI پاسپورٹ ایکسپائری الرٹس، اور 100% متحرک ایجنسی برانڈنگ۔</p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-6 text-center text-xs text-slate-400">
        <p>© 2026 Travel Agency SaaS ERP. All rights reserved. Turso Database + Drizzle ORM powered.</p>
      </footer>
    </div>
  );
}
