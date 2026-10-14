'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ShieldCheck,
  Lock,
  Mail,
  ArrowRight,
  AlertCircle,
  Sparkles,
  Eye,
  EyeOff,
  Building2,
} from 'lucide-react';

export default function SuperAdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('mnuhbhatti333@gmail.com');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/super-admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'لاگ ان ناکام رہا');
        setLoading(false);
        return;
      }

      router.push(data.redirect || '/super-admin');
      router.refresh();
    } catch (err: any) {
      setError('کنکشن میں خرابی: دوبارہ کوشش کریں');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-indigo-50 flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-md bg-white border border-gray-100 rounded-3xl p-6 sm:p-8 shadow-2xl">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-violet-600 to-indigo-600 mx-auto flex items-center justify-center shadow-lg shadow-violet-500/25 mb-3 text-white">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-100 text-violet-700 text-xs font-bold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Master Super Admin Portal</span>
          </div>
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">
            سپر ایڈمن پورٹل لاگ ان
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            مجاز ایڈمنسٹریٹرز: mnuhbhatti333@gmail.com / mnuhbhattii333@gmail.com
          </p>
        </div>

        {error && (
          <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600" />
            <span className="font-semibold">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[11px] font-bold text-gray-700 mb-1.5">
              سپر ایڈمن ای میل (Super Admin Email)
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="mnuhbhatti333@gmail.com"
                className="w-full pl-10 pr-4 h-11 bg-white border border-gray-200 rounded-xl text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500 transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-gray-700 mb-1.5">
              سپر ایڈمن پاس ورڈ (Password)
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-10 h-11 bg-white border border-gray-200 rounded-xl text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500 transition"
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
            className="w-full h-12 rounded-xl bg-gradient-to-r from-violet-600 via-indigo-600 to-indigo-700 hover:from-violet-500 hover:to-indigo-600 text-white font-bold text-xs transition shadow-lg shadow-indigo-500/25 disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
          >
            {loading ? (
              <span className="inline-flex items-center gap-2">
                <span className="animate-spin text-base">⏳</span> تصدیق ہو رہی ہے...
              </span>
            ) : (
              <>
                <span>سپر ایڈمن لاگ ان (Sign In as Super Admin)</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 pt-5 border-t border-gray-100 text-center flex flex-col gap-2">
          <Link
            href="/login"
            className="text-xs text-emerald-600 hover:text-emerald-700 font-bold inline-flex items-center justify-center gap-1.5 transition"
          >
            <Building2 className="w-4 h-4" />
            ایجنسی لاگ ان پورٹل پر جائیں (Agency Login)
          </Link>
          <Link href="/" className="text-xs text-gray-400 hover:text-gray-600 transition">
            ← مین ہوم پیج پر واپس جائیں
          </Link>
        </div>
      </div>
    </div>
  );
}
