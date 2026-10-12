'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ShieldCheck, Lock, Mail, ArrowRight, AlertCircle, Sparkles } from 'lucide-react';

export default function SuperAdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('mnuhbhatti333@gmail.com');
  const [password, setPassword] = useState('');
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
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-slate-900/90 border border-purple-500/30 backdrop-blur-xl rounded-3xl p-8 shadow-2xl shadow-purple-950/60">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-500 mx-auto flex items-center justify-center shadow-lg shadow-purple-500/30 mb-4 text-white">
            <ShieldCheck className="w-9 h-9" />
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Master Super Admin Portal</span>
          </div>
          <h2 className="text-2xl font-black text-white">سپر ایڈمن پورٹل لاگ ان</h2>
          <p className="text-xs text-slate-400 mt-1">
            مجاز ایڈمنسٹریٹرز: mnuhbhatti333@gmail.com / mnuhbhattii333@gmail.com
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-sm flex items-center gap-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-400" />
            <span className="font-semibold">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-purple-200 mb-2">
              سپر ایڈمن ای میل (Super Admin Email)
            </label>
            <div className="relative">
              <Mail className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="mnuhbhatti333@gmail.com"
                className="w-full pl-11 pr-4 py-3 bg-slate-800/80 border border-purple-500/30 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-purple-200 mb-2">
              سپر ایڈمن پاس ورڈ (Password)
            </label>
            <div className="relative">
              <Lock className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-11 pr-4 py-3 bg-slate-800/80 border border-purple-500/30 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition text-sm"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold transition shadow-lg shadow-purple-600/30 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <span className="inline-block animate-spin mr-2">⏳</span>
            ) : (
              <>
                سپر ایڈمن لاگ ان (Sign In as Super Admin)
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-800/80 text-center flex flex-col gap-3">
          <Link
            href="/login"
            className="text-xs text-emerald-400 hover:text-emerald-300 inline-flex items-center justify-center gap-1.5 transition"
          >
            ایجنسی لاگ ان پورٹل پر جائیں (Agency Login)
          </Link>
          <Link href="/" className="text-xs text-slate-500 hover:text-slate-400 transition">
            ← مین ہوم پیج پر واپس جائیں
          </Link>
        </div>
      </div>
    </div>
  );
}
