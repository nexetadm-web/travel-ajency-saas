'use client';

import { useState, useEffect } from 'react';
import { useAgency } from '@/hooks/useAgency';
import {
  Building2,
  User,
  Phone,
  Mail,
  Lock,
  MapPin,
  CheckCircle2,
  Image as ImageIcon,
  Save,
  Sparkles,
} from 'lucide-react';

export default function AgencySettingsPage() {
  const { agency, mutate, isLoading } = useAgency();

  const [formData, setFormData] = useState({
    name: '',
    owner_name: '',
    phone: '',
    license_no: '',
    address: '',
    logo_url: '',
    password: '',
  });

  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (agency) {
      setFormData({
        name: agency.name || '',
        owner_name: agency.owner_name || '',
        phone: agency.phone || '',
        license_no: agency.license_no || '',
        address: agency.address || '',
        logo_url: agency.logo_url || '',
        password: '',
      });
    }
  }, [agency]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg('');
    setErrorMsg('');

    try {
      const res = await fetch('/api/agency/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const resData = await res.json();
      if (!res.ok) {
        setErrorMsg(resData.error || 'اپ ڈیٹ میں خرابی');
        setSaving(false);
        return;
      }

      // Invalidate SWR cache so changes reflect instantly everywhere
      await mutate();
      setSuccessMsg('ایجنسی کی ترتیبات کامیابی سے محفوظ ہو گئیں اور تمام پی ڈی ایف میں فوری اپ ڈیٹ ہو گئیں۔');
    } catch (err: any) {
      setErrorMsg('نیٹ ورک کی خرابی: براہ کرم دوبارہ کوشش کریں');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="w-full max-w-full overflow-x-hidden space-y-6 max-w-4xl mx-auto px-2 sm:px-4">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 flex-wrap">
          <h1 className="font-urdu text-[20px] sm:text-[24px] font-black text-gray-900 tracking-tight break-words">ایجنسی سیٹنگز اور برانڈنگ (Agency Branding)</h1>
          <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200 shrink-0">
            100% متحرک
          </span>
        </div>
        <p className="text-xs text-gray-500 mt-1 break-words leading-relaxed">
          یہاں اپنی ٹریول ایجنسی کا نام، لوگو اور رابطہ تبدیل کریں۔ یہ تبدیلیاں تمام پی ڈی ایف رسیدوں، ویزہ لسٹوں اور ہیڈر میں فوری لاگو ہوں گی۔
        </p>
      </div>

      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 text-xs flex items-center gap-2.5">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-700 text-xs">
          {errorMsg}
        </div>
      )}

      {/* Main Settings Card */}
      <div className="p-4 sm:p-6 md:p-8 rounded-2xl sm:rounded-3xl bg-slate-950/80 border border-slate-800 shadow-2xl overflow-hidden">
        {/* Current Branding Preview */}
        <div className="flex items-center gap-4 pb-6 mb-6 border-b border-slate-850">
          {formData.logo_url ? (
            <img
              src={formData.logo_url}
              alt="Logo Preview"
              className="w-16 h-16 rounded-2xl object-cover border border-emerald-500/30 shadow-md"
            />
          ) : (
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white font-black text-2xl flex items-center justify-center shadow-lg shadow-emerald-600/20 uppercase">
              {formData.name ? formData.name.charAt(0) : 'T'}
            </div>
          )}
          <div>
            <h3 className="font-extrabold text-lg text-white">{formData.name || 'ایجنسی کا نام'}</h3>
            <p className="text-xs text-slate-400">
              لائسنس: {formData.license_no || 'DTS Reg'} | فون: {formData.phone || '-'}
            </p>
            <span className="inline-block mt-1 text-[11px] text-emerald-400 font-medium">
              ★ لائیو برانڈنگ پری ویو (PDF & System Header)
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                ایجنسی کا نام (Agency Name)*
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                مالک کا نام (Owner Name)*
              </label>
              <input
                type="text"
                required
                value={formData.owner_name}
                onChange={(e) => setFormData({ ...formData, owner_name: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                فون نمبر (Official Phone)*
              </label>
              <input
                type="text"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                حکومتی لائسنس نمبر (Govt License No)
              </label>
              <input
                type="text"
                value={formData.license_no}
                onChange={(e) => setFormData({ ...formData, license_no: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              لوگو تصویر URL (Logo URL - R2 / Cloud)
            </label>
            <input
              type="url"
              placeholder="https://..."
              value={formData.logo_url}
              onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              دفتر کا مکمل پتہ (Official Address)
            </label>
            <textarea
              rows={2}
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              نیا پاس ورڈ تبدیل کریں (Change Password - خالی چھوڑیں اگر تبدیل نہیں کرنا)
            </label>
            <input
              type="password"
              placeholder="کم از کم 6 ہندسے"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 transition flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              {saving ? 'محفوظ ہو رہا ہے...' : 'سیٹنگز محفوظ کریں (Save Settings)'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
