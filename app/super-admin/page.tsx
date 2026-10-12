'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShieldCheck, Plus, Building2, User, Phone, Mail, Lock, FileText, MapPin, Image as ImageIcon, ArrowLeft, LogOut, CheckCircle, Search, ExternalLink } from 'lucide-react';

interface AgencyItem {
  id: string;
  name: string;
  owner_name: string;
  email: string;
  phone: string;
  logo_url?: string | null;
  license_no?: string | null;
  address?: string | null;
  role: string;
  created_at?: string;
}

export default function SuperAdminPortalPage() {
  const router = useRouter();
  const [agencies, setAgencies] = useState<AgencyItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    owner_name: '',
    phone: '',
    email: '',
    password: '',
    logo_url: '',
    license_no: '',
    address: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchAgencies = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/super-admin/agencies');
      if (res.status === 403 || res.status === 401) {
        router.push('/super-admin/login');
        return;
      }
      const data = await res.json();
      if (data.agencies) {
        setAgencies(data.agencies);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAgencies();
  }, []);

  const handleCreateAgency = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await fetch('/api/super-admin/agencies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || 'ایجنسی بنانے میں خرابی');
        setSubmitting(false);
        return;
      }

      setSuccessMsg(data.message || 'ایجنسی کامیابی سے بنا دی گئی ہے');
      setFormData({
        name: '',
        owner_name: '',
        phone: '',
        email: '',
        password: '',
        logo_url: '',
        license_no: '',
        address: '',
      });
      setShowModal(false);
      fetchAgencies();
    } catch (err: any) {
      setErrorMsg('نیٹ ورک کی خرابی: براہ کرم دوبارہ کوشش کریں');
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = agencies.filter((a) =>
    a.name.toLowerCase().includes(search.toLowerCase()) ||
    a.owner_name.toLowerCase().includes(search.toLowerCase()) ||
    a.email.toLowerCase().includes(search.toLowerCase()) ||
    (a.license_no && a.license_no.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Top Navbar */}
      <header className="border-b border-purple-500/20 bg-slate-900/80 backdrop-blur-md px-6 py-4 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-purple-500/30 text-white font-black text-xl">
              🛡️
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-black text-white">سپر ایڈمن پورٹل</h1>
                <span className="px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-xs font-semibold border border-purple-500/30">
                  Master Management
                </span>
              </div>
              <p className="text-xs text-slate-400">تمام ٹریول ایجنسیوں کا مرکزی کنٹرول اور تخلیق</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 transition flex items-center gap-1.5"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              ڈیش بورڈ پر جائیں
            </Link>
            <button
              onClick={async () => {
                await fetch('/api/auth/logout', { method: 'POST' });
                router.push('/super-admin/login');
              }}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition flex items-center gap-1.5"
            >
              <LogOut className="w-3.5 h-3.5" />
              لاگ آؤٹ
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-6 py-8 flex-1 w-full">
        {/* Banner with Stats & Action */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-purple-900/60 via-indigo-900/40 to-slate-900 border border-purple-500/30 p-8 mb-8 shadow-2xl">
          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-purple-400">Master SaaS Administration</span>
              <h2 className="text-3xl font-extrabold text-white mt-1">نئی ٹریول ایجنسی رجسٹر کریں</h2>
              <p className="text-sm text-purple-200/80 mt-1 max-w-xl">
                یہاں سے آپ نئی ٹریول ایجنسی کا اکاؤنٹ، لوگو، لائسنس اور ایڈریس درج کر کے فوری پورٹل رسائی دے سکتے ہیں۔
              </p>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold shadow-lg shadow-purple-600/30 transition flex items-center gap-2 transform hover:-translate-y-0.5"
            >
              <Plus className="w-5 h-5" />
              + نئی ایجنسی شامل کریں (Create Agency)
            </button>
          </div>
        </div>

        {successMsg && (
          <div className="mb-6 p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-sm flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Agency List Header with Search */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-purple-400" />
            <h3 className="text-lg font-bold text-white">رجسٹرڈ ایجنسیاں ({agencies.length})</h3>
          </div>
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="ایجنسی، مالک یا لائسنس تلاش کریں..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
            />
          </div>
        </div>

        {/* Agencies Grid */}
        {loading ? (
          <div className="py-20 text-center text-slate-500">
            <div className="inline-block animate-spin text-3xl mb-3">⏳</div>
            <p>ایجنسیاں لوڈ ہو رہی ہیں...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center rounded-3xl bg-slate-900/50 border border-slate-800 text-slate-400">
            <Building2 className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-base font-semibold">کوئی ایجنسی نہیں ملی</p>
            <p className="text-xs text-slate-500 mt-1">اوپر دیے گئے بٹن پر کلک کر کے نئی ایجنسی کا اندراج کریں۔</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((agency) => (
              <div
                key={agency.id}
                className="rounded-3xl bg-slate-900/80 border border-slate-800 p-6 hover:border-purple-500/40 transition shadow-xl flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3">
                      {agency.logo_url ? (
                        <img
                          src={agency.logo_url}
                          alt={agency.name}
                          className="w-12 h-12 rounded-2xl object-cover border border-slate-700"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-700 to-indigo-600 text-white font-black text-base flex items-center justify-center shadow">
                          {agency.name.slice(0, 2).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <h4 className="font-bold text-white text-base leading-snug">{agency.name}</h4>
                        <span className="text-xs text-purple-400 font-medium">لائسنس: {agency.license_no || 'جاری شدہ'}</span>
                      </div>
                    </div>
                    {agency.role === 'super_admin' && (
                      <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-[10px] font-bold border border-purple-500/40">
                        Admin
                      </span>
                    )}
                  </div>

                  <div className="space-y-2 py-3 border-y border-slate-800/80 text-xs text-slate-300">
                    <div className="flex items-center gap-2">
                      <User className="w-3.5 h-3.5 text-slate-500" />
                      <span>مالک: <strong>{agency.owner_name}</strong></span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-slate-500" />
                      <span>{agency.phone}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-slate-500" />
                      <span className="truncate">{agency.email}</span>
                    </div>
                    {agency.address && (
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
                        <span className="truncate">{agency.address}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-4 pt-3 flex items-center justify-between text-[11px] text-slate-500">
                  <span>رجسٹریشن: {agency.created_at ? agency.created_at.slice(0, 10) : 'Active'}</span>
                  <Link
                    href="/dashboard"
                    className="text-purple-400 hover:text-purple-300 font-semibold inline-flex items-center gap-1"
                  >
                    ڈیش بورڈ ملاحظہ کریں →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* CREATE AGENCY MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-xl bg-slate-900 border border-purple-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-600/20 text-purple-400 flex items-center justify-center font-bold">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">نئی ٹریول ایجنسی بنائیں</h3>
                  <p className="text-xs text-slate-400">سپر ایڈمن کے ذریعے ایجنسی کی مکمل معلومات درج کریں</p>
                </div>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 flex items-center justify-center text-sm"
              >
                ✕
              </button>
            </div>

            {errorMsg && (
              <div className="mb-4 p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleCreateAgency} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    ایجنسی کا نام (Agency Name)*
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: Al-Haram Travels"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-800/90 border border-slate-700 rounded-xl text-white text-xs placeholder-slate-500 focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    مالک کا نام (Owner Name)*
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: محمد احمد"
                    value={formData.owner_name}
                    onChange={(e) => setFormData({ ...formData, owner_name: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-800/90 border border-slate-700 rounded-xl text-white text-xs placeholder-slate-500 focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    فون نمبر (Phone)*
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="+92 300 1234567"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-800/90 border border-slate-700 rounded-xl text-white text-xs placeholder-slate-500 focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    لائسنس نمبر (Govt License No)
                  </label>
                  <input
                    type="text"
                    placeholder="DTS-4521"
                    value={formData.license_no}
                    onChange={(e) => setFormData({ ...formData, license_no: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-800/90 border border-slate-700 rounded-xl text-white text-xs placeholder-slate-500 focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    ای میل ایڈریس (Email / Login)*
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="owner@alharam.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-800/90 border border-slate-700 rounded-xl text-white text-xs placeholder-slate-500 focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    لاگ ان پاس ورڈ (Password)*
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-800/90 border border-slate-700 rounded-xl text-white text-xs placeholder-slate-500 focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  لوگو URL (Logo Image URL - UploadThing/R2)
                </label>
                <input
                  type="url"
                  placeholder="https://example.com/logo.png"
                  value={formData.logo_url}
                  onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-800/90 border border-slate-700 rounded-xl text-white text-xs placeholder-slate-500 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  دفتر کا مکمل پتہ (Official Address)
                </label>
                <textarea
                  rows={2}
                  placeholder="سوٹ نمبر 4، مین مال روڈ، لاہور، پاکستان"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-800/90 border border-slate-700 rounded-xl text-white text-xs placeholder-slate-500 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                >
                  منسوخ کریں
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-purple-600/30 disabled:opacity-50"
                >
                  {submitting ? 'تخلیق ہو رہی ہے...' : 'ایجنسی بنائیں (Create)'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
