'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Building2,
  Lock,
  Mail,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  Eye,
  EyeOff,
  Sparkles,
  UserPlus,
} from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'لاگ ان میں خرابی پیش آگئی');
        setLoading(false);
        return;
      }

      // Persist to localStorage for client-side multi-tenancy & quick references
      if (typeof window !== 'undefined' && data.agency) {
        localStorage.setItem('agency_id', data.agency.id);
        localStorage.setItem('agency_name', data.agency.name);
        localStorage.setItem('agency_email', data.agency.email);
        localStorage.setItem('agency_role', data.agency.role);
      }

      router.push(data.redirect || '/dashboard');
      router.refresh();
    } catch (err: any) {
      setError('کنکشن میں خرابی: براہ کرم انٹرنیٹ چیک کر کے دوبارہ کوشش کریں');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-indigo-50 flex items-center justify-center p-3 sm:p-6 w-full max-w-full overflow-x-hidden">
      <div className="w-full max-w-md bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-8 shadow-2xl border border-gray-100 overflow-hidden">
        {/* Brand Header */}
        <div className="text-center mb-6">
          <img
            src="/logo.png"
            alt="Al-Haram Logo"
            className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl mx-auto shadow-lg shadow-emerald-500/20 mb-3 object-cover border border-emerald-100"
          />
          <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200 inline-flex items-center gap-1 mb-2">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            ٹریول ایجنسی مینجمنٹ سسٹم
          </span>
          <h2 className="font-urdu text-[20px] sm:text-[24px] font-black text-gray-900 tracking-tight break-words">ایجنسی لاگ ان پورٹل</h2>
          <p className="text-xs text-gray-500 mt-1 font-medium break-words">
            Agency Portal Login • Manage Hujjaj, Visas & Ledger
          </p>
        </div>

        {error && (
          <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[11px] font-bold text-gray-700 mb-1.5">
              ای میل ایڈریس (Email Address)
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="agency@example.com"
                className="w-full pl-10 pr-4 h-11 bg-white border border-gray-200 rounded-xl text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-gray-700 mb-1.5">
              پاس ورڈ (Password)
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-10 h-11 bg-white border border-gray-200 rounded-xl text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-12 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold text-xs transition shadow-lg shadow-emerald-500/25 disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
          >
            {loading ? (
              <span className="inline-flex items-center gap-2">
                <span className="animate-spin text-base">⏳</span> تصدیق ہو رہی ہے...
              </span>
            ) : (
              <>
                <span>لاگ ان کریں (Sign In)</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Register Agency CTA */}
        <div className="mt-5 p-3.5 bg-gradient-to-r from-violet-50 to-indigo-50 border border-violet-100 rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-violet-900 block">نئی ایجنسی رجسٹر کریں؟</span>
            <span className="text-[10px] text-violet-600">نیا اکاؤنٹ صرف 1 منٹ میں</span>
          </div>
          <Link
            href="/signup"
            className="px-3.5 py-1.5 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1 shadow-sm"
          >
            <UserPlus className="w-3.5 h-3.5" />
            رجسٹر کریں
          </Link>
        </div>

        <div className="mt-6 pt-5 border-t border-gray-100 text-center flex flex-col gap-2">
          <Link
            href="/super-admin/login"
            className="text-xs text-purple-600 hover:text-purple-700 font-semibold inline-flex items-center justify-center gap-1.5 transition"
          >
            <ShieldCheck className="w-4 h-4 text-purple-600" />
            سپر ایڈمن پورٹل لاگ ان (Super Admin Portal)
          </Link>
          <Link href="/" className="text-xs text-gray-400 hover:text-gray-600 transition">
            ← مین ہوم پیج پر واپس جائیں
          </Link>
        </div>
      </div>
    </div>
  );
}
