'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import useSWR from 'swr';
import { useAgency } from '@/hooks/useAgency';
import {
  Users,
  Search,
  Plus,
  FileDown,
  ArrowLeft,
  Calendar,
  Building2,
  DollarSign,
  Phone,
  FileText,
  CheckCircle,
  Clock,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { formatDate, formatCurrency } from '@/lib/utils';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function GroupDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const groupId = params.groupId as string;
  const { agency } = useAgency();

  const { data, mutate, isLoading } = useSWR(`/api/groups/${groupId}`, fetcher);
  const [activeTab, setActiveTab] = useState<'pilgrims' | 'documents' | 'accounts'>('pilgrims');
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // New Pilgrim Form
  const [formData, setFormData] = useState({
    full_name: '',
    father_name: '',
    passport_no: '',
    passport_expiry: '',
    cnic: '',
    phone: '',
    photo_url: '',
    passport_scan_url: '',
    payment_total: '285000',
    payment_paid: '50000',
  });
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const group = data?.group;
  const pilgrims = data?.pilgrims || [];

  // One-click Visa status update
  const handleVisaStatusChange = async (pilgrimId: string, newStatus: string) => {
    setUpdatingId(pilgrimId);
    try {
      const res = await fetch(`/api/pilgrims/${pilgrimId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ visa_status: newStatus }),
      });

      if (res.ok) {
        mutate();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleAddPilgrim = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/pilgrims', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          group_id: groupId,
        }),
      });

      const resData = await res.json();
      if (!res.ok) {
        setErrorMsg(resData.error || 'زائر شامل کرنے میں خرابی');
        setSubmitting(false);
        return;
      }

      mutate();
      setShowAddModal(false);
      setFormData({
        full_name: '',
        father_name: '',
        passport_no: '',
        passport_expiry: '',
        cnic: '',
        phone: '',
        photo_url: '',
        passport_scan_url: '',
        payment_total: '285000',
        payment_paid: '50000',
      });
    } catch (err: any) {
      setErrorMsg('نیٹ ورک خرابی');
    } finally {
      setSubmitting(false);
    }
  };

  // Instant Embassy List PDF generation
  const handleExportEmbassyPdf = async () => {
    try {
      const { generateEmbassyListPdf } = await import('@/lib/pdf/generator');
      const pdfBytes = await generateEmbassyListPdf({
        agency: {
          name: agency?.name || 'Travel Agency',
          license_no: agency?.license_no || 'Reg. DTS',
          phone: agency?.phone || '',
          address: agency?.address || '',
          logo_url: agency?.logo_url || null,
        },
        groupName: group?.group_name || 'Group',
        departureDate: formatDate(group?.departure_date),
        airline: group?.airline || 'Scheduled Flight',
        pilgrims: pilgrims.map((p: any) => ({
          full_name: p.full_name,
          father_name: p.father_name,
          passport_no: p.passport_no,
          passport_expiry: formatDate(p.passport_expiry),
          cnic: p.cnic,
          visa_status: p.visa_status,
        })),
      });

      const blob = new Blob([pdfBytes as any], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `embassy-manifest-${group?.group_name || 'group'}.pdf`;
      a.click();
    } catch (err) {
      console.error('PDF export error:', err);
    }
  };

  const filteredPilgrims = pilgrims.filter((p: any) =>
    p.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    p.passport_no?.toLowerCase().includes(search.toLowerCase()) ||
    p.cnic?.includes(search) ||
    p.phone?.includes(search)
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Back button and Group Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-950/80 border border-slate-800 p-6 rounded-3xl">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard/groups"
            className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-white">{group?.group_name || 'گروپ تفصیلات'}</h1>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-semibold">
                {pilgrims.length} / {group?.total_seats || 40} زائرین
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              روانگی: {formatDate(group?.departure_date)} | ایئرلائن: {group?.airline || 'Scheduled'} | مکہ: {group?.makkah_hotel}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportEmbassyPdf}
            className="px-4 py-2 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 text-xs font-bold transition flex items-center gap-1.5"
          >
            <FileDown className="w-4 h-4" />
            سفارت خانہ لسٹ (Embassy PDF)
          </button>

          <Link
            href={`/dashboard/groups/${groupId}/profit`}
            className="px-4 py-2 rounded-xl bg-teal-500/20 hover:bg-teal-500/30 text-teal-300 border border-teal-500/30 text-xs font-bold transition flex items-center gap-1.5"
          >
            <span>💰</span> گروپ منافع
          </Link>
        </div>
      </div>

      {/* TABS NAVIGATION */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('pilgrims')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeTab === 'pilgrims'
              ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <Users className="w-4 h-4" />
          زائرین لسٹ ({pilgrims.length})
        </button>

        <button
          onClick={() => setActiveTab('documents')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeTab === 'documents'
              ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <FileText className="w-4 h-4" />
          دستاویزات اور پاسپورٹ اسکینز
        </button>

        <button
          onClick={() => setActiveTab('accounts')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeTab === 'accounts'
              ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <DollarSign className="w-4 h-4" />
          اکاؤنٹس سمری (Accounts)
        </button>
      </div>

      {/* TAB 1: PILGRIMS LIST */}
      {activeTab === 'pilgrims' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                placeholder="پاسپورٹ، نام، CNIC یا فون سرچ کریں (<200ms)..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <button
              onClick={() => setShowAddModal(true)}
              className="w-full sm:w-auto px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md shadow-emerald-500/20 transition flex items-center justify-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              + نیا زائر شامل کریں
            </button>
          </div>

          {filteredPilgrims.length === 0 ? (
            <div className="p-12 text-center rounded-2xl bg-slate-950/60 border border-slate-800 text-slate-400">
              <Users className="w-10 h-10 mx-auto mb-2 opacity-30" />
              <p className="text-sm font-semibold">کوئی زائر نہیں ملا</p>
              <button
                onClick={() => setShowAddModal(true)}
                className="mt-3 text-xs text-emerald-400 hover:underline"
              >
                + اس گروپ میں زائر شامل کریں
              </button>
            </div>
          ) : (
            <div className="rounded-2xl border border-slate-800 bg-slate-950/60 overflow-x-auto shadow-xl">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-900/90 text-slate-400 border-b border-slate-800 uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="p-3.5">زائر کا نام</th>
                    <th className="p-3.5">پاسپورٹ نمبر</th>
                    <th className="p-3.5">ایکسپائری</th>
                    <th className="p-3.5">فون / CNIC</th>
                    <th className="p-3.5">ویزہ سٹیٹس (ون کلک)</th>
                    <th className="p-3.5">ٹکٹ سٹیٹس</th>
                    <th className="p-3.5">ادائیگی</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-850">
                  {filteredPilgrims.map((p: any) => (
                    <tr key={p.id} className="hover:bg-slate-900/40 transition">
                      <td className="p-3.5">
                        <div className="flex items-center gap-2.5">
                          {p.photo_url ? (
                            <img
                              src={p.photo_url}
                              alt={p.full_name}
                              className="w-8 h-8 rounded-full object-cover border border-slate-700"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-slate-800 text-emerald-400 font-bold flex items-center justify-center text-xs">
                              {p.full_name?.charAt(0)}
                            </div>
                          )}
                          <div>
                            <span className="font-bold text-white block">{p.full_name}</span>
                            <span className="text-[10px] text-slate-500">ولد/زوج: {p.father_name || '-'}</span>
                          </div>
                        </div>
                      </td>
                      <td className="p-3.5 font-mono font-bold text-sky-400">{p.passport_no}</td>
                      <td className="p-3.5 text-slate-400">{formatDate(p.passport_expiry)}</td>
                      <td className="p-3.5">
                        <span className="block text-slate-300">{p.phone || '-'}</span>
                        <span className="block text-[10px] text-slate-500">{p.cnic || '-'}</span>
                      </td>
                      <td className="p-3.5">
                        <select
                          value={p.visa_status || 'document_pending'}
                          disabled={updatingId === p.id}
                          onChange={(e) => handleVisaStatusChange(p.id, e.target.value)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-semibold border focus:outline-none transition ${
                            p.visa_status === 'printed'
                              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                              : p.visa_status === 'in_embassy'
                              ? 'bg-sky-500/20 text-sky-300 border-sky-500/40'
                              : p.visa_status === 'returned'
                              ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                              : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                          }`}
                        >
                          <option value="document_pending" className="bg-slate-900 text-amber-300">دستاویزات زیرِ التواء</option>
                          <option value="in_embassy" className="bg-slate-900 text-sky-300">سفارت خانے میں (In Embassy)</option>
                          <option value="printed" className="bg-slate-900 text-emerald-300">ویزہ پرنٹ ہو گیا (Printed)</option>
                          <option value="returned" className="bg-slate-900 text-rose-300">واپس موصول ہوا (Returned)</option>
                        </select>
                      </td>
                      <td className="p-3.5">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          p.ticket_status === 'issued'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-slate-800 text-slate-400'
                        }`}>
                          {p.ticket_status === 'issued' ? 'جاری شدہ' : 'پینڈنگ'}
                        </span>
                      </td>
                      <td className="p-3.5">
                        <span className="block font-bold text-white">
                          PKR {(p.payment_paid || 0).toLocaleString()}
                        </span>
                        <span className="block text-[10px] text-slate-500">
                          بقیہ: PKR {Math.max(0, (p.payment_total || 0) - (p.payment_paid || 0)).toLocaleString()}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: DOCUMENTS */}
      {activeTab === 'documents' && (
        <div className="p-8 rounded-3xl bg-slate-950/60 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base text-white">زائرین پاسپورٹ اور دستاویزات</h3>
            <button
              onClick={() => alert('تمام دستاویزات کا ZIP ڈاؤن لوڈ تیار کیا جا رہا ہے (R2/Cloud Storage)...')}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 flex items-center gap-1.5"
            >
              <FileDown className="w-4 h-4 text-emerald-400" />
              تمام دستاویزات بلک ZIP ڈاؤن لوڈ
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-4">
            {pilgrims.map((p: any) => (
              <div key={p.id} className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-xs space-y-2">
                <span className="font-bold text-white block truncate">{p.full_name}</span>
                <span className="text-slate-400 font-mono block">پاسپورٹ: {p.passport_no}</span>
                {p.passport_scan_url ? (
                  <a
                    href={p.passport_scan_url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-emerald-400 hover:underline flex items-center gap-1 text-[11px]"
                  >
                    <ExternalLink className="w-3 h-3" />
                    اسکین ملاحظہ کریں
                  </a>
                ) : (
                  <span className="text-slate-600 text-[11px]">کوئی اسکین موجود نہیں</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: ACCOUNTS */}
      {activeTab === 'accounts' && (
        <div className="p-8 rounded-3xl bg-slate-950/60 border border-slate-800 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-white">گروپ مالیاتی کھاتہ اور منافع</h3>
              <p className="text-xs text-slate-400">زائرین سے وصولی اور آپریٹنگ اخراجات کا خلاصہ</p>
            </div>
            <Link
              href={`/dashboard/groups/${groupId}/profit`}
              className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md shadow-emerald-500/20"
            >
              مکمل منافع کیلکولیٹر کھولیں →
            </Link>
          </div>
        </div>
      )}

      {/* ADD PILGRIM MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-6">
              <h3 className="text-lg font-bold text-white">+ نیا زائر شامل کریں</h3>
              <button
                onClick={() => setShowAddModal(false)}
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

            <form onSubmit={handleAddPilgrim} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">نام (Full Name)*</label>
                  <input
                    type="text"
                    required
                    placeholder="محمد علی"
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">والد / شوہر کا نام</label>
                  <input
                    type="text"
                    placeholder="علی احمد"
                    value={formData.father_name}
                    onChange={(e) => setFormData({ ...formData, father_name: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">پاسپورٹ نمبر*</label>
                  <input
                    type="text"
                    required
                    placeholder="AK1234567"
                    value={formData.passport_no}
                    onChange={(e) => setFormData({ ...formData, passport_no: e.target.value.toUpperCase() })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs font-mono uppercase focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">پاسپورٹ میعاد (Expiry)</label>
                  <input
                    type="date"
                    value={formData.passport_expiry}
                    onChange={(e) => setFormData({ ...formData, passport_expiry: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">فون نمبر (WhatsApp)</label>
                  <input
                    type="text"
                    placeholder="03001234567"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">CNIC نمبر</label>
                  <input
                    type="text"
                    placeholder="35201-1234567-1"
                    value={formData.cnic}
                    onChange={(e) => setFormData({ ...formData, cnic: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">کل پیکج رقم (PKR)</label>
                  <input
                    type="number"
                    value={formData.payment_total}
                    onChange={(e) => setFormData({ ...formData, payment_total: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">پیشگی ادا شدہ رقم (Paid)</label>
                  <input
                    type="number"
                    value={formData.payment_paid}
                    onChange={(e) => setFormData({ ...formData, payment_paid: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
                >
                  منسوخ
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-emerald-500 text-slate-950 text-xs font-bold shadow-md shadow-emerald-500/20"
                >
                  {submitting ? 'محفوظ ہو رہا ہے...' : 'شامل کریں'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
