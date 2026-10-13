'use client';

import { useState, useRef } from 'react';
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
  MessageCircle,
  MapPin,
  Send,
  Camera,
  Loader2,
  CheckCircle2,
} from 'lucide-react';
import { formatDate, formatCurrency } from '@/lib/utils';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function GroupDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const groupId = params.groupId as string;
  const { agency } = useAgency();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data, mutate, isLoading } = useSWR(`/api/groups/${groupId}`, fetcher);
  const [activeTab, setActiveTab] = useState<'pilgrims' | 'documents' | 'accounts'>('pilgrims');
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showWhatsAppModal, setShowWhatsAppModal] = useState(false);
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
  const [scanning, setScanning] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Bulk WhatsApp State
  const [waBroadcast, setWaBroadcast] = useState({
    airport: 'علامہ اقبال انٹرنیشنل ایئرپورٹ لاہور',
    flight_time: 'کل رات 9:00 بجے',
    bus_no: 'BUS-786',
    custom_note: 'تمام زائرین وقت کی پابندی کریں اور اصل پاسپورٹ ہمراہ لائیں۔',
    location_link: 'https://maps.google.com/?q=Swissotel+Makkah',
  });
  const [sendingWa, setSendingWa] = useState(false);
  const [waSuccessMsg, setWaSuccessMsg] = useState('');

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

  const handleAiPassportScan = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setScanning(true);
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = reader.result as string;
        const res = await fetch('/api/ai/passport-scan', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image: base64, fileName: file.name }),
        });
        const scanRes = await res.json();
        if (res.ok && scanRes.data) {
          setFormData((prev) => ({
            ...prev,
            full_name: scanRes.data.full_name || prev.full_name,
            father_name: scanRes.data.father_name || prev.father_name,
            passport_no: scanRes.data.passport_no || prev.passport_no,
            passport_expiry: scanRes.data.expiry || prev.passport_expiry,
            cnic: scanRes.data.cnic || prev.cnic,
          }));
        }
        setScanning(false);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      setScanning(false);
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
      mutate();
    } catch (err: any) {
      setErrorMsg(err.message || 'نیٹ ورک خرابی');
    } finally {
      setSubmitting(false);
    }
  };

  const handleBulkWhatsAppSend = async () => {
    setSendingWa(true);
    setWaSuccessMsg('');
    try {
      const res = await fetch('/api/whatsapp/bulk-send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          group_id: groupId,
          ...waBroadcast,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setWaSuccessMsg(`✅ مبارک ہو! پورے گروپ کے ${data.sent_count} زائرین کو WhatsApp روانگی شیڈول بمعہ لوکیشن کامیابی سے بھیج دیا گیا!`);
      } else {
        alert(data.error || 'واٹس ایپ بھیجنے میں خرابی ہوئی');
      }
    } catch (err: any) {
      alert(err.message || 'خرابی پیش آگئی');
    } finally {
      setSendingWa(false);
    }
  };

  const handleExportEmbassyPdf = async () => {
    try {
      const res = await fetch(`/api/groups/${groupId}/pdf`);
      if (!res.ok) throw new Error('PDF Generation failed');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `embassy-manifest-${group?.group_name || 'group'}.pdf`;
      a.click();
    } catch (err) {
      console.error('PDF export error:', err);
    }
  };

  const filteredPilgrims = pilgrims.filter(
    (p: any) =>
      p.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      p.passport_no?.toLowerCase().includes(search.toLowerCase()) ||
      p.cnic?.includes(search) ||
      p.phone?.includes(search)
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Back button and Group Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white border border-gray-100 p-6 rounded-[24px] shadow-[0_8px_30px_rgba(0,0,0,0.06)]">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard/groups"
            className="w-10 h-10 rounded-xl bg-gray-50 border border-gray-200 text-gray-600 hover:text-gray-900 flex items-center justify-center transition shadow-sm"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                {group?.group_name || 'گروپ تفصیلات'}
              </h1>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
                {pilgrims.length} / {group?.total_seats || 40} زائرین
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              روانگی: {formatDate(group?.departure_date)} | ایئرلائن: {group?.airline || 'Scheduled'} | مکہ: {group?.makkah_hotel}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* FEATURE 2 BUTTON: BULK GROUP WHATSAPP */}
          <button
            onClick={() => {
              setWaSuccessMsg('');
              setShowWhatsAppModal(true);
            }}
            className="px-4 py-2.5 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold shadow-md shadow-emerald-200 transition flex items-center gap-2"
          >
            <MessageCircle className="w-4 h-4" />
            📢 پورے گروپ کو WhatsApp
          </button>

          <button
            onClick={handleExportEmbassyPdf}
            className="px-4 py-2.5 rounded-full bg-white hover:bg-gray-50 text-purple-700 border border-purple-200 text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
          >
            <FileDown className="w-4 h-4" />
            سفارت خانہ لسٹ (PDF)
          </button>

          <Link
            href={`/dashboard/groups/${groupId}/profit`}
            className="px-4 py-2.5 rounded-full bg-white hover:bg-gray-50 text-teal-700 border border-teal-200 text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
          >
            <span>💰</span> گروپ منافع
          </Link>
        </div>
      </div>

      {/* TABS NAVIGATION */}
      <div className="flex items-center gap-2 border-b border-gray-200 pb-2">
        <button
          onClick={() => setActiveTab('pilgrims')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeTab === 'pilgrims'
              ? 'bg-emerald-500 text-white shadow-md shadow-emerald-200'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
          }`}
        >
          <Users className="w-4 h-4" />
          زائرین لسٹ ({pilgrims.length})
        </button>

        <button
          onClick={() => setActiveTab('documents')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeTab === 'documents'
              ? 'bg-emerald-500 text-white shadow-md shadow-emerald-200'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
          }`}
        >
          <FileText className="w-4 h-4" />
          دستاویزات اور پاسپورٹ اسکینز
        </button>

        <button
          onClick={() => setActiveTab('accounts')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeTab === 'accounts'
              ? 'bg-emerald-500 text-white shadow-md shadow-emerald-200'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
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
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="زائر کا نام، پاسپورٹ یا شناختی کارڈ..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:border-emerald-500 shadow-sm"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={() => setShowAddModal(true)}
                className="px-4 py-2 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow-md shadow-emerald-200 transition flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                + نیا زائر شامل کریں
              </button>
            </div>
          </div>

          {/* TABLE */}
          <div className="rounded-[24px] border border-gray-100 bg-white overflow-x-auto shadow-[0_8px_30px_rgba(0,0,0,0.06)]">
            <table className="w-full text-left text-xs text-gray-700">
              <thead className="bg-gray-50/80 text-gray-500 border-b border-gray-100 uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="p-4">نام زائر</th>
                  <th className="p-4">والد کا نام</th>
                  <th className="p-4">پاسپورٹ نمبر</th>
                  <th className="p-4">میعاد</th>
                  <th className="p-4">ویزہ سٹیٹس (ون کلک)</th>
                  <th className="p-4">ادائیگی خلاصہ</th>
                  <th className="p-4 text-center">دعا کارڈ PDF</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredPilgrims.map((p: any) => (
                  <tr key={p.id} className="hover:bg-gray-50/60 transition">
                    <td className="p-4 font-bold text-gray-900">{p.full_name}</td>
                    <td className="p-4 text-gray-500">{p.father_name || '-'}</td>
                    <td className="p-4 font-mono text-emerald-700 font-bold">{p.passport_no}</td>
                    <td className="p-4 text-gray-500">{formatDate(p.passport_expiry)}</td>
                    <td className="p-4">
                      <select
                        disabled={updatingId === p.id}
                        value={p.visa_status || 'document_pending'}
                        onChange={(e) => handleVisaStatusChange(p.id, e.target.value)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold border ${
                          p.visa_status === 'printed'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : p.visa_status === 'in_embassy'
                            ? 'bg-sky-50 text-sky-700 border-sky-200'
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}
                      >
                        <option value="document_pending">دستاویزات جمع (Pending)</option>
                        <option value="in_embassy">سفارت خانے میں (In Embassy)</option>
                        <option value="printed">ویزہ جاری (Printed)</option>
                        <option value="returned">واپس موصول (Returned)</option>
                      </select>
                    </td>
                    <td className="p-4">
                      <span className="font-bold text-gray-900">{formatCurrency(p.payment_paid)}</span>
                      <span className="text-[10px] text-gray-400 block">
                        بقایا: {formatCurrency((p.payment_total || 0) - (p.payment_paid || 0))}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <a
                        href={`/api/pdf/dua-card/${p.id}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-[11px] font-bold border border-emerald-200"
                      >
                        دعا کارڈ
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: DOCUMENTS */}
      {activeTab === 'documents' && (
        <div className="bg-white rounded-[24px] border border-gray-100 p-6 space-y-4 shadow-[0_8px_30px_rgba(0,0,0,0.06)]">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-gray-900">پاسپورٹ اسکینز اور دستاویزات</h3>
            <span className="text-xs text-gray-500">کل زائرین: {pilgrims.length}</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-2">
            {pilgrims.map((p: any) => (
              <div key={p.id} className="p-4 rounded-2xl bg-gray-50 border border-gray-100 text-xs space-y-2">
                <span className="font-bold text-gray-900 block truncate">{p.full_name}</span>
                <span className="text-gray-500 font-mono block">پاسپورٹ: {p.passport_no}</span>
                <span className="text-emerald-700 font-medium block">
                  اسکین محفوظ ہے
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: ACCOUNTS */}
      {activeTab === 'accounts' && (
        <div className="p-8 rounded-[24px] bg-white border border-gray-100 shadow-[0_8px_30px_rgba(0,0,0,0.06)] space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-gray-900">گروپ مالیاتی کھاتہ اور منافع</h3>
              <p className="text-xs text-gray-500">زائرین سے وصولی اور آپریٹنگ اخراجات کا خلاصہ</p>
            </div>
            <Link
              href={`/dashboard/groups/${groupId}/profit`}
              className="px-5 py-2.5 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow-md shadow-emerald-200"
            >
              مکمل منافع کیلکولیٹر کھولیں →
            </Link>
          </div>
        </div>
      )}

      {/* MODAL 1: BULK WHATSAPP GROUP SENDER WITH LIVE LOCATION */}
      {showWhatsAppModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-xl bg-white border border-gray-100 rounded-[28px] p-6 sm:p-8 shadow-2xl my-8">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-6">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                  <MessageCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">📢 پورے گروپ کو WhatsApp نشر کریں</h3>
                  <p className="text-xs text-gray-500">تمام {pilgrims.length} زائرین کو ایک کلک میں لائیو روانگی شیڈول</p>
                </div>
              </div>
              <button
                onClick={() => setShowWhatsAppModal(false)}
                className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center text-sm font-bold"
              >
                ✕
              </button>
            </div>

            {waSuccessMsg && (
              <div className="mb-4 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                <span>{waSuccessMsg}</span>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">ایئرپورٹ (Airport)</label>
                <input
                  type="text"
                  value={waBroadcast.airport}
                  onChange={(e) => setWaBroadcast({ ...waBroadcast, airport: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">وقت / تاریخ روانگی</label>
                  <input
                    type="text"
                    value={waBroadcast.flight_time}
                    onChange={(e) => setWaBroadcast({ ...waBroadcast, flight_time: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">بس نمبر (Bus No)</label>
                  <input
                    type="text"
                    value={waBroadcast.bus_no}
                    onChange={(e) => setWaBroadcast({ ...waBroadcast, bus_no: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  📍 ہوٹل لائیو لوکیشن لنک (Google Maps URL)
                </label>
                <input
                  type="text"
                  value={waBroadcast.location_link}
                  onChange={(e) => setWaBroadcast({ ...waBroadcast, location_link: e.target.value })}
                  placeholder="https://maps.google.com/?q=..."
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">خصوصی ہدایات / نوٹ</label>
                <textarea
                  rows={2}
                  value={waBroadcast.custom_note}
                  onChange={(e) => setWaBroadcast({ ...waBroadcast, custom_note: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800"
                />
              </div>

              {/* Template Preview Box */}
              <div className="p-3.5 bg-emerald-50/60 border border-emerald-200 rounded-2xl text-xs text-emerald-900 space-y-1">
                <span className="font-bold block text-[11px] text-emerald-800">پیش نظارہ (Message Preview):</span>
                <p className="font-sans whitespace-pre-line text-[11px] leading-relaxed text-gray-700">
                  السلام علیکم [نام زائر]!
                  گروپ: {group?.group_name}
                  روانگی: {waBroadcast.flight_time} بمقام {waBroadcast.airport}
                  مکہ ہوٹل: {group?.makkah_hotel || 'فندق مکہ'}
                  مدینہ ہوٹل: {group?.madina_hotel || 'فندق مدینہ'}
                  بس نمبر: {waBroadcast.bus_no}
                  رابطہ: {agency?.phone} ({agency?.name})
                  📍 لوکیشن: {waBroadcast.location_link}
                </p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowWhatsAppModal(false)}
                  className="px-5 py-2.5 rounded-full border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-50"
                >
                  بند کریں
                </button>
                <button
                  type="button"
                  disabled={sendingWa}
                  onClick={handleBulkWhatsAppSend}
                  className="px-6 py-2.5 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow-lg shadow-emerald-200 transition flex items-center gap-2 disabled:opacity-50"
                >
                  {sendingWa ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      پیغام بھیجا جا رہا ہے...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      تمام {pilgrims.length} زائرین کو بھیجیں
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: ADD PILGRIM MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-lg bg-white border border-gray-100 rounded-[28px] p-6 sm:p-8 shadow-2xl my-8">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-6">
              <h3 className="text-lg font-bold text-gray-900">+ نیا زائر شامل کریں</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center text-sm font-bold"
              >
                ✕
              </button>
            </div>

            {/* AI Quick Scan Trigger inside Modal */}
            <div className="mb-4 p-3 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 flex items-center justify-between">
              <div className="text-xs text-emerald-900">
                <span className="font-bold block">📸 فوری AI پاسپورٹ اسکین</span>
                <span className="text-[11px] text-emerald-700">تصویر اپلوڈ کریں اور فارم خود بھریں</span>
              </div>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleAiPassportScan}
                accept="image/*"
                className="hidden"
              />
              <button
                type="button"
                disabled={scanning}
                onClick={() => fileInputRef.current?.click()}
                className="px-3.5 py-1.5 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow transition flex items-center gap-1.5"
              >
                {scanning ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Camera className="w-3.5 h-3.5" />}
                اسکین AI
              </button>
            </div>

            {errorMsg && (
              <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleAddPilgrim} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">نام (Full Name)*</label>
                  <input
                    type="text"
                    required
                    placeholder="محمد علی"
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">والد / شوہر کا نام</label>
                  <input
                    type="text"
                    placeholder="علی احمد"
                    value={formData.father_name}
                    onChange={(e) => setFormData({ ...formData, father_name: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">پاسپورٹ نمبر*</label>
                  <input
                    type="text"
                    required
                    placeholder="AK1234567"
                    value={formData.passport_no}
                    onChange={(e) => setFormData({ ...formData, passport_no: e.target.value.toUpperCase() })}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-xs font-mono uppercase focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">میعاد (Expiry DD-MM-YYYY)</label>
                  <input
                    type="text"
                    placeholder="12-08-2030"
                    value={formData.passport_expiry}
                    onChange={(e) => setFormData({ ...formData, passport_expiry: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">شناختی کارڈ (CNIC)</label>
                  <input
                    type="text"
                    placeholder="35202-0000000-0"
                    value={formData.cnic}
                    onChange={(e) => setFormData({ ...formData, cnic: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">فون نمبر (WhatsApp)</label>
                  <input
                    type="text"
                    placeholder="03001234567"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">کل پیکیج قیمت (PKR)</label>
                  <input
                    type="number"
                    value={formData.payment_total}
                    onChange={(e) => setFormData({ ...formData, payment_total: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">وصول شدہ رقم (Advance PKR)</label>
                  <input
                    type="number"
                    value={formData.payment_paid}
                    onChange={(e) => setFormData({ ...formData, payment_paid: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-full border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-50"
                >
                  منسوخ کریں
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow-md shadow-emerald-200 disabled:opacity-50"
                >
                  {submitting ? 'محفوظ ہو رہا ہے...' : 'زائر شامل کریں'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
