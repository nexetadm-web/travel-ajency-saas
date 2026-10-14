'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ShieldCheck,
  Plus,
  Building2,
  User,
  Phone,
  Mail,
  MapPin,
  ExternalLink,
  LogOut,
  Search,
  CheckCircle2,
  Ban,
  Trash2,
  Edit,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  Globe2,
  Check,
  X,
  CreditCard,
  FileBadge2,
} from 'lucide-react';
import PremiumCard from '@/components/ui/premium-card';
import { formatCurrency } from '@/lib/utils';

interface AgencyItem {
  id: string;
  name: string;
  owner_name: string;
  email: string;
  phone: string;
  logo_url?: string | null;
  license_no?: string | null;
  address?: string | null;
  city?: string | null;
  status?: string | null;
  plan?: string | null;
  monthly_fee?: number | null;
  last_login?: string | null;
  role: string;
  created_at?: string;
}

export default function SuperAdminPortalPage() {
  const router = useRouter();
  const [agencies, setAgencies] = useState<AgencyItem[]>([]);
  const [stats, setStats] = useState({
    totalAgencies: 0,
    activeAgencies: 0,
    disabledAgencies: 0,
    totalRevenue: 0,
    pendingAgencies: 0,
  });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'disabled'>('all');

  // Modals state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editAgency, setEditAgency] = useState<AgencyItem | null>(null);
  const [deleteAgencyItem, setDeleteAgencyItem] = useState<AgencyItem | null>(null);

  // Notifications
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  // Create Form State
  const [formData, setFormData] = useState({
    name: '',
    owner_name: '',
    phone: '',
    email: '',
    password: '',
    city: '',
    license_no: '',
    address: '',
    plan: 'starter',
    monthly_fee: 3000,
  });
  const [submitting, setSubmitting] = useState(false);

  const showNotification = (text: string, type: 'success' | 'error' = 'success') => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 4000);
  };

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
        if (data.stats) {
          setStats(data.stats);
        }
      }
    } catch (err) {
      console.error(err);
      showNotification('ایجنسیاں لوڈ کرنے میں خرابی', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAgencies();
  }, []);

  // Impersonate Agency
  const handleImpersonate = async (agencyId: string) => {
    setActionLoadingId(agencyId);
    try {
      const res = await fetch('/api/super-admin/impersonate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agency_id: agencyId }),
      });
      const data = await res.json();
      if (res.ok && data.redirect) {
        router.push(data.redirect);
      } else {
        showNotification(data.error || 'ڈیش بورڈ اوپن کرنے میں ناکامی', 'error');
      }
    } catch {
      showNotification('کنکشن کی خرابی', 'error');
    } finally {
      setActionLoadingId(null);
    }
  };

  // Toggle Agency Status (Active / Disabled)
  const handleToggleStatus = async (agency: AgencyItem) => {
    const newStatus = agency.status === 'disabled' ? 'active' : 'disabled';
    setActionLoadingId(agency.id);
    try {
      const res = await fetch(`/api/super-admin/agencies/${agency.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (res.ok) {
        showNotification(
          newStatus === 'active'
            ? `ایجنسی "${agency.name}" اب فعال (Active) ہے`
            : `ایجنسی "${agency.name}" غیر فعال (Disabled) کر دی گئی ہے`,
          'success'
        );
        fetchAgencies();
      } else {
        showNotification(data.error || 'اسٹیٹس تبدیل کرنے میں ناکامی', 'error');
      }
    } catch {
      showNotification('کنکشن کی خرابی', 'error');
    } finally {
      setActionLoadingId(null);
    }
  };

  // Delete Agency
  const handleDeleteConfirm = async () => {
    if (!deleteAgencyItem) return;
    setActionLoadingId(deleteAgencyItem.id);
    try {
      const res = await fetch(`/api/super-admin/agencies/${deleteAgencyItem.id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (res.ok) {
        showNotification(data.message || 'ایجنسی کامیابی سے ڈیلیٹ ہو گئی', 'success');
        setDeleteAgencyItem(null);
        fetchAgencies();
      } else {
        showNotification(data.error || 'ڈیلیٹ کرنے میں خرابی', 'error');
      }
    } catch {
      showNotification('کنکشن کی خرابی', 'error');
    } finally {
      setActionLoadingId(null);
    }
  };

  // Edit Agency
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editAgency) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/super-admin/agencies/${editAgency.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editAgency.name,
          owner_name: editAgency.owner_name,
          phone: editAgency.phone,
          city: editAgency.city,
          license_no: editAgency.license_no,
          plan: editAgency.plan,
          monthly_fee: editAgency.monthly_fee,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        showNotification('ایجنسی کامیابی سے اپڈیٹ ہو گئی', 'success');
        setEditAgency(null);
        fetchAgencies();
      } else {
        showNotification(data.error || 'اپڈیٹ میں خرابی', 'error');
      }
    } catch {
      showNotification('کنکشن کی خرابی', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Create Agency
  const handleCreateAgency = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch('/api/super-admin/agencies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (res.ok) {
        showNotification(data.message || 'ایجنسی کامیابی سے بنا دی گئی ہے', 'success');
        setFormData({
          name: '',
          owner_name: '',
          phone: '',
          email: '',
          password: '',
          city: '',
          license_no: '',
          address: '',
          plan: 'starter',
          monthly_fee: 3000,
        });
        setShowCreateModal(false);
        fetchAgencies();
      } else {
        showNotification(data.error || 'ایجنسی بنانے میں خرابی', 'error');
      }
    } catch {
      showNotification('کنکشن کی خرابی', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Filter agencies by search and status
  const filteredAgencies = agencies.filter((a) => {
    const q = search.toLowerCase().trim();
    const matchesSearch =
      !q ||
      a.name.toLowerCase().includes(q) ||
      a.owner_name.toLowerCase().includes(q) ||
      a.email.toLowerCase().includes(q) ||
      a.phone.toLowerCase().includes(q) ||
      (a.city && a.city.toLowerCase().includes(q)) ||
      (a.license_no && a.license_no.toLowerCase().includes(q));

    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'active' && (a.status === 'active' || !a.status)) ||
      (statusFilter === 'disabled' && a.status === 'disabled');

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-[#f8fafc] text-gray-900 flex flex-col">
      {/* Top Navbar */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center shadow-md shadow-violet-500/20 text-white font-black text-xl">
              🛡️
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-black text-gray-900">Master SaaS Administration</h1>
                <span className="px-2.5 py-0.5 rounded-full bg-violet-100 text-violet-700 text-xs font-bold border border-violet-200">
                  سپر ایڈمن کنٹرول
                </span>
              </div>
              <p className="text-xs text-gray-500">تمام ٹریول ایجنسیوں کا مرکزی انتظام، سبسکرپشن اور مانیٹرنگ</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 transition flex items-center gap-1.5"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              لائیو ڈیش بورڈ
            </Link>
            <button
              onClick={async () => {
                await fetch('/api/auth/logout', { method: 'POST' });
                router.push('/super-admin/login');
              }}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-200 transition flex items-center gap-1.5"
            >
              <LogOut className="w-3.5 h-3.5" />
              لاگ آؤٹ
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 flex-1 w-full space-y-6">
        {/* Floating Notification */}
        {message && (
          <div
            className={`p-4 rounded-2xl border text-sm flex items-center justify-between shadow-sm transition-all ${
              message.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-rose-50 border-rose-200 text-rose-800'
            }`}
          >
            <div className="flex items-center gap-2.5 font-medium">
              {message.type === 'success' ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-rose-600 flex-shrink-0" />
              )}
              <span>{message.text}</span>
            </div>
            <button onClick={() => setMessage(null)} className="text-xs opacity-70 hover:opacity-100">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Header Action Card */}
        <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-600 via-indigo-600 to-indigo-700 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
              <Building2 className="w-7 h-7" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-violet-600">
                Multi-Tenant Cloud SaaS
              </span>
              <h2 className="text-2xl font-black text-gray-900 mt-0.5">
                ماسٹر ایڈمنسٹریشن پینل
              </h2>
              <p className="text-xs text-gray-500 mt-1 max-w-xl">
                یہاں سے نئی ایجنسیاں بنائیں، اکاؤنٹس معطل یا فعال کریں اور ہر ایجنسی کے پورٹل میں براہ راست داخل ہوں۔
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white rounded-xl px-5 py-2.5 text-xs font-bold shadow-md shadow-indigo-500/20 transition flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              + نئی ایجنسی شامل کریں (Create Agency)
            </button>
          </div>
        </div>

        {/* 4 STATS CARDS ROW (Compact & Colorful) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <PremiumCard
            title="کل ایجنسیاں (Total Agencies)"
            value={stats.totalAgencies}
            subtitle="رجسٹرڈ ٹریول پارٹنرز"
            icon={Building2}
            gradient="violet"
            trend="100% کلاؤڈ ساس"
          />
          <PremiumCard
            title="فعال ایجنسیاں (Active Agencies)"
            value={stats.activeAgencies}
            subtitle="لائیو اور آپریشنل"
            icon={CheckCircle2}
            gradient="emerald"
            trend="ایکٹو سبسکرپشنز"
          />
          <PremiumCard
            title="ماہانہ ساس ریونیو (SaaS Revenue)"
            value={formatCurrency(stats.totalRevenue)}
            subtitle="ماہانہ سافٹ ویئر فیس کلیکشن"
            icon={DollarSign}
            gradient="amber"
            trend="تخمینی آمدن"
          />
          <PremiumCard
            title="معطل / پینڈنگ (Pending / Disabled)"
            value={stats.disabledAgencies}
            subtitle="غیر فعال ایجنسی اکاؤنٹس"
            icon={Ban}
            gradient="rose"
            trend={stats.disabledAgencies > 0 ? 'توجہ طلب' : 'زیرو پینڈنگ'}
            trendUp={false}
          />
        </div>

        {/* Filter & Search Bar */}
        <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                statusFilter === 'all'
                  ? 'bg-violet-600 text-white shadow-sm'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              تمام ({agencies.length})
            </button>
            <button
              onClick={() => setStatusFilter('active')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                statusFilter === 'active'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              فعال ({stats.activeAgencies})
            </button>
            <button
              onClick={() => setStatusFilter('disabled')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                statusFilter === 'disabled'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              غیر فعال ({stats.disabledAgencies})
            </button>
          </div>

          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="ایجنسی، مالک، شہر، ای میل یا لائسنس..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 h-11 bg-white border border-gray-200 rounded-xl text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500 shadow-sm"
            />
          </div>
        </div>

        {/* Agencies Grid */}
        {loading ? (
          <div className="py-20 text-center text-gray-400">
            <div className="inline-block animate-spin text-3xl mb-3">⏳</div>
            <p className="text-xs font-medium">ایجنسیاں لوڈ ہو رہی ہیں...</p>
          </div>
        ) : filteredAgencies.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-white border border-gray-200/80 text-gray-400 shadow-sm">
            <Building2 className="w-12 h-12 mx-auto mb-3 opacity-30 text-violet-600" />
            <p className="text-sm font-bold text-gray-800">کوئی ایجنسی نہیں ملی</p>
            <p className="text-xs text-gray-400 mt-1">تلاش تبدیل کریں یا نئی ایجنسی شامل کریں۔</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredAgencies.map((agency) => {
              const isDisabled = agency.status === 'disabled';
              const isSuper = agency.role === 'super_admin';

              return (
                <div
                  key={agency.id}
                  className={`bg-white rounded-2xl border p-5 transition-all shadow-sm hover:shadow-md flex flex-col justify-between ${
                    isDisabled
                      ? 'border-rose-200 bg-rose-50/20 opacity-90'
                      : 'border-gray-200/80 hover:border-violet-300'
                  }`}
                >
                  <div>
                    {/* Agency Card Top Header */}
                    <div className="flex items-start justify-between gap-3 mb-4">
                      <div className="flex items-center gap-3">
                        {agency.logo_url ? (
                          <img
                            src={agency.logo_url}
                            alt={agency.name}
                            className="w-12 h-12 rounded-xl object-cover border border-gray-200 shadow-sm"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-violet-600 via-indigo-600 to-teal-500 text-white font-black text-sm flex items-center justify-center shadow-md uppercase">
                            {agency.name ? agency.name.slice(0, 2) : 'AG'}
                          </div>
                        )}
                        <div>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <h4 className="font-bold text-gray-900 text-base leading-snug">
                              {agency.name}
                            </h4>
                          </div>
                          <span className="text-[11px] text-gray-500 font-medium block mt-0.5">
                            🪪 لائسنس: {agency.license_no || 'DTS-LHR-2026'}
                          </span>
                        </div>
                      </div>

                      {/* Status & Role Badges */}
                      <div className="flex flex-col items-end gap-1">
                        {isSuper ? (
                          <span className="px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-700 text-[10px] font-black border border-purple-200">
                            Super Admin
                          </span>
                        ) : isDisabled ? (
                          <span className="px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-700 text-[10px] font-bold border border-rose-200 flex items-center gap-1">
                            <Ban className="w-3 h-3 text-rose-600" />
                            Disabled
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold border border-emerald-200 flex items-center gap-1">
                            <Check className="w-3 h-3 text-emerald-600" />
                            Active
                          </span>
                        )}
                        <span className="text-[10px] text-gray-400 uppercase font-semibold">
                          {agency.plan || 'Starter'}
                        </span>
                      </div>
                    </div>

                    {/* Agency Details */}
                    <div className="space-y-2 py-3 border-y border-gray-100 text-xs text-gray-600">
                      <div className="flex items-center gap-2">
                        <User className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                        <span className="truncate">
                          مالک: <strong className="text-gray-800">{agency.owner_name}</strong>
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Phone className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                        <span className="text-gray-700 font-medium">{agency.phone}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Mail className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                        <span className="truncate text-gray-700">{agency.email}</span>
                      </div>

                      {agency.city && (
                        <div className="flex items-center gap-2">
                          <MapPin className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                          <span className="text-gray-700 font-medium">شہر: {agency.city}</span>
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-1 text-[11px] text-gray-500">
                        <span>ماہانہ فیس:</span>
                        <strong className="text-emerald-700 font-bold">
                          {formatCurrency(agency.monthly_fee || 3000)}/ماہ
                        </strong>
                      </div>
                    </div>
                  </div>

                  {/* Card Footer Actions */}
                  <div className="mt-4 pt-3 border-t border-gray-100">
                    <div className="flex items-center justify-between text-[11px] text-gray-400 mb-3">
                      <span>تاریخ: {agency.created_at ? agency.created_at.slice(0, 10) : 'Live'}</span>
                      <button
                        onClick={() => setEditAgency(agency)}
                        className="text-violet-600 hover:text-violet-700 font-bold flex items-center gap-1"
                      >
                        <Edit className="w-3 h-3" />
                        تبدیل کریں (Edit)
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* View Dashboard Button */}
                      <button
                        onClick={() => handleImpersonate(agency.id)}
                        disabled={actionLoadingId === agency.id}
                        className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-sm disabled:opacity-50"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        {actionLoadingId === agency.id ? 'لوڈنگ...' : 'View Dashboard'}
                      </button>

                      {/* Disable / Enable Button */}
                      {!isSuper && (
                        <button
                          onClick={() => handleToggleStatus(agency)}
                          disabled={actionLoadingId === agency.id}
                          className={`py-2 px-3 rounded-xl text-xs font-bold transition border flex items-center gap-1 ${
                            isDisabled
                              ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-300'
                              : 'bg-amber-50 hover:bg-amber-100 text-amber-700 border-amber-300'
                          }`}
                          title={isDisabled ? 'فعال کریں' : 'معطل کریں'}
                        >
                          <Ban className="w-3.5 h-3.5" />
                          {isDisabled ? 'Enable' : 'Disable'}
                        </button>
                      )}

                      {/* Delete Button */}
                      {!isSuper && (
                        <button
                          onClick={() => setDeleteAgencyItem(agency)}
                          className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 transition"
                          title="ڈیلیٹ کریں"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* CREATE AGENCY MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-xl bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-2xl my-8">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-violet-100 text-violet-700 flex items-center justify-center font-bold">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-gray-900">نئی ٹریول ایجنسی بنائیں</h3>
                  <p className="text-xs text-gray-500">سپر ایڈمن کے ذریعے نئی ایجنسی اکاؤنٹ درج کریں</p>
                </div>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-500 flex items-center justify-center text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateAgency} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    ایجنسی کا نام (Agency Name) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: Al-Haram Travels"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-gray-900 text-xs placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    مالک کا نام (Owner Name) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="حاجی عبد الرحمن"
                    value={formData.owner_name}
                    onChange={(e) => setFormData({ ...formData, owner_name: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-gray-900 text-xs placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    فون نمبر (Phone) *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="+92 300 1234567"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-gray-900 text-xs placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    شہر (City)
                  </label>
                  <input
                    type="text"
                    placeholder="لاہور"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-gray-900 text-xs placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    ای میل ایڈریس (Email / Login) *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="owner@agency.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-gray-900 text-xs placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    لاگ ان پاس ورڈ (Password) *
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-gray-900 text-xs placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    لائسنس نمبر (License No)
                  </label>
                  <input
                    type="text"
                    placeholder="DTS-LHR-2026"
                    value={formData.license_no}
                    onChange={(e) => setFormData({ ...formData, license_no: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-gray-900 text-xs placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    ماہانہ فیس (Monthly Fee PKR)
                  </label>
                  <input
                    type="number"
                    value={formData.monthly_fee}
                    onChange={(e) => setFormData({ ...formData, monthly_fee: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-gray-900 text-xs placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  دفتر کا پتہ (Address)
                </label>
                <textarea
                  rows={2}
                  placeholder="سوٹ نمبر 10، مین بلیوارڈ، گلبرگ لاہور"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3.5 py-2 bg-white border border-gray-200 rounded-xl text-gray-900 text-xs placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold"
                >
                  منسوخ کریں
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-500/25 disabled:opacity-50"
                >
                  {submitting ? 'تخلیق ہو رہی ہے...' : 'ایجنسی بنائیں (Create)'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT AGENCY MODAL */}
      {editAgency && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-lg bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-2xl my-8">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-5">
              <h3 className="text-lg font-black text-gray-900 flex items-center gap-2">
                <Edit className="w-5 h-5 text-violet-600" />
                ایجنسی کی تفصیلات اپڈیٹ کریں
              </h3>
              <button
                onClick={() => setEditAgency(null)}
                className="w-8 h-8 rounded-lg bg-gray-100 text-gray-500 flex items-center justify-center text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">ایجنسی نام</label>
                <input
                  type="text"
                  value={editAgency.name}
                  onChange={(e) => setEditAgency({ ...editAgency, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-xs text-gray-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">مالک کا نام</label>
                  <input
                    type="text"
                    value={editAgency.owner_name}
                    onChange={(e) => setEditAgency({ ...editAgency, owner_name: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-xs text-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">فون نمبر</label>
                  <input
                    type="text"
                    value={editAgency.phone}
                    onChange={(e) => setEditAgency({ ...editAgency, phone: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-xs text-gray-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">شہر</label>
                  <input
                    type="text"
                    value={editAgency.city || ''}
                    onChange={(e) => setEditAgency({ ...editAgency, city: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-xs text-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">لائسنس</label>
                  <input
                    type="text"
                    value={editAgency.license_no || ''}
                    onChange={(e) => setEditAgency({ ...editAgency, license_no: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-xs text-gray-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">پلان (Plan)</label>
                  <select
                    value={editAgency.plan || 'starter'}
                    onChange={(e) => setEditAgency({ ...editAgency, plan: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-xs text-gray-900"
                  >
                    <option value="starter">Starter</option>
                    <option value="pro">Pro Agency</option>
                    <option value="enterprise">Enterprise</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">ماہانہ فیس (PKR)</label>
                  <input
                    type="number"
                    value={editAgency.monthly_fee || 3000}
                    onChange={(e) => setEditAgency({ ...editAgency, monthly_fee: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-xs text-gray-900"
                  />
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setEditAgency(null)}
                  className="px-4 py-2.5 rounded-xl bg-gray-100 text-gray-700 text-xs font-bold"
                >
                  منسوخ
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold shadow-md"
                >
                  محفوظ کریں (Save)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deleteAgencyItem && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white border border-gray-200 rounded-3xl p-6 shadow-2xl text-center">
            <div className="w-14 h-14 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-black text-gray-900">
              کیا آپ واقعی ڈیلیٹ کرنا چاہتے ہیں؟
            </h3>
            <p className="text-xs text-gray-500 mt-2">
              ایجنسی <strong>&quot;{deleteAgencyItem.name}&quot;</strong> کو مکمل طور پر سسٹم سے ہٹایا جا رہا ہے۔
              یہ عمل ناقابل واپسی ہے۔
            </p>

            <div className="mt-6 flex items-center justify-center gap-3">
              <button
                onClick={() => setDeleteAgencyItem(null)}
                className="px-5 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold"
              >
                منسوخ کریں (Cancel)
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md shadow-rose-600/30"
              >
                ہاں، ڈیلیٹ کریں (Delete)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
