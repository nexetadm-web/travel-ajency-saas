'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Building2,
  User,
  Phone,
  Mail,
  Lock,
  Eye,
  EyeOff,
  MapPin,
  FileBadge2,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Sparkles,
} from 'lucide-react';

export default function AgencySignupPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    agency_name: '',
    owner_name: '',
    phone: '',
    email: '',
    password: '',
    confirm_password: '',
    license_no: '',
    city: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (formData.password !== formData.confirm_password) {
      setError('پاسورڈ اور تصدیقی پاسورڈ مماثل نہیں ہیں (Passwords do not match)');
      return;
    }

    if (formData.password.length < 6) {
      setError('پاسورڈ کم از کم 6 حروف پر مشتمل ہونا چاہیے');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/agencies/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.agency_name,
          owner_name: formData.owner_name,
          phone: formData.phone,
          email: formData.email,
          password: formData.password,
          license_no: formData.license_no,
          city: formData.city,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'رجسٹریشن مکمل نہیں ہو سکی');
        setLoading(false);
        return;
      }

      setSuccess(data.message || 'Agency created successfully! Redirecting to login...');
      setTimeout(() => {
        router.push(data.redirect || '/login');
      }, 1500);
    } catch (err: any) {
      setError('کنکشن میں خرابی: براہ کرم انٹرنیٹ چیک کر کے دوبارہ کوشش کریں');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-indigo-50 flex items-center justify-center p-4 sm:p-6 py-12">
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-gray-100 p-6 sm:p-8">
        {/* Header Branding */}
        <div className="text-center mb-6">
          <img
            src="/logo.png"
            alt="Al-Haram Logo"
            className="w-16 h-16 rounded-2xl mx-auto shadow-lg shadow-indigo-500/20 mb-3 object-cover border border-indigo-100"
          />
          <span className="px-3 py-1 rounded-full bg-violet-100 text-violet-700 text-xs font-bold inline-flex items-center gap-1 mb-2">
            <Sparkles className="w-3.5 h-3.5 text-violet-600" />
            100% کلاؤڈ ساس پلیٹ فارم
          </span>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">
            اپنی ٹریول ایجنسی رجسٹر کریں
          </h1>
          <p className="text-xs text-gray-500 mt-1 font-medium">
            Register Your Travel Agency • Start Managing Umrah, Visas & Tours
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        {/* Success Alert */}
        {success && (
          <div className="mb-5 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2.5 font-medium animate-pulse">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-600" />
            <span>{success}</span>
          </div>
        )}

        {/* Signup Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Agency Name */}
            <div>
              <label className="block text-[11px] font-bold text-gray-700 mb-1">
                ٹریول ایجنسی کا نام (Agency Name) *
              </label>
              <div className="relative">
                <Building2 className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  name="agency_name"
                  required
                  value={formData.agency_name}
                  onChange={handleChange}
                  placeholder="مثال: Al-Haram Travels"
                  className="w-full pl-9 pr-3 h-11 bg-white border border-gray-200 rounded-xl text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500 transition"
                />
              </div>
            </div>

            {/* Owner Name */}
            <div>
              <label className="block text-[11px] font-bold text-gray-700 mb-1">
                مالک کا نام (Owner Name) *
              </label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  name="owner_name"
                  required
                  value={formData.owner_name}
                  onChange={handleChange}
                  placeholder="مثال: حاجی عبد الرحمن"
                  className="w-full pl-9 pr-3 h-11 bg-white border border-gray-200 rounded-xl text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500 transition"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Phone */}
            <div>
              <label className="block text-[11px] font-bold text-gray-700 mb-1">
                فون نمبر (Phone / WhatsApp) *
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="tel"
                  name="phone"
                  required
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+92 300 1234567"
                  className="w-full pl-9 pr-3 h-11 bg-white border border-gray-200 rounded-xl text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500 transition"
                />
              </div>
            </div>

            {/* City */}
            <div>
              <label className="block text-[11px] font-bold text-gray-700 mb-1">
                شہر (City)
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="لاہور / اسلام آباد / کراچی"
                  className="w-full pl-9 pr-3 h-11 bg-white border border-gray-200 rounded-xl text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500 transition"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Email */}
            <div>
              <label className="block text-[11px] font-bold text-gray-700 mb-1">
                ای میل ایڈریس (Email / Login ID) *
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="agency@gmail.com"
                  className="w-full pl-9 pr-3 h-11 bg-white border border-gray-200 rounded-xl text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500 transition"
                />
              </div>
            </div>

            {/* License No */}
            <div>
              <label className="block text-[11px] font-bold text-gray-700 mb-1">
                لائسنس نمبر (License No - Optional)
              </label>
              <div className="relative">
                <FileBadge2 className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  name="license_no"
                  value={formData.license_no}
                  onChange={handleChange}
                  placeholder="DTS-LHR-2026"
                  className="w-full pl-9 pr-3 h-11 bg-white border border-gray-200 rounded-xl text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500 transition"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Password */}
            <div>
              <label className="block text-[11px] font-bold text-gray-700 mb-1">
                پاس ورڈ (Password) *
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="کم از کم 6 ہندسے"
                  className="w-full pl-9 pr-9 h-11 bg-white border border-gray-200 rounded-xl text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500 transition"
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

            {/* Confirm Password */}
            <div>
              <label className="block text-[11px] font-bold text-gray-700 mb-1">
                پاس ورڈ کی تصدیق (Confirm Password) *
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirm_password"
                  required
                  value={formData.confirm_password}
                  onChange={handleChange}
                  placeholder="پاس ورڈ دوبارہ درج کریں"
                  className="w-full pl-9 pr-9 h-11 bg-white border border-gray-200 rounded-xl text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full h-12 rounded-xl bg-gradient-to-r from-violet-600 via-indigo-600 to-indigo-700 hover:from-violet-500 hover:to-indigo-600 text-white font-bold text-sm transition shadow-lg shadow-indigo-500/25 disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
          >
            {loading ? (
              <span className="inline-flex items-center gap-2">
                <span className="animate-spin text-base">⏳</span> اکاؤنٹ تیار ہو رہا ہے...
              </span>
            ) : (
              <>
                <span>رجسٹر کریں (Create Agency Account)</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Footer Links & Terms */}
        <div className="mt-6 pt-5 border-t border-gray-100 text-center space-y-2">
          <p className="text-xs text-gray-600">
            پہلے سے اکاؤنٹ موجود ہے؟{' '}
            <Link
              href="/login"
              className="text-violet-600 font-bold hover:text-violet-700 hover:underline"
            >
              لاگ ان کریں (Sign In)
            </Link>
          </p>
          <p className="text-[10px] text-gray-400">
            By signing up, you agree to our Terms of Service & Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  );
}
