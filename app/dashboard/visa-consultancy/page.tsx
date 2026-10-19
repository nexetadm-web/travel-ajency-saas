'use client';

import { useState } from 'react';
import useSWR from 'swr';
import {
  Globe2,
  FileCheck2,
  CheckCircle2,
  Clock,
  AlertCircle,
  Plus,
  Filter,
  Search,
  DollarSign,
  Download,
  MessageCircle,
  ChevronRight,
  GraduationCap,
  Briefcase,
  Plane,
  Building,
  User,
  Calendar,
  Layers,
} from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';
import { useAgency } from '@/hooks/useAgency';
import PremiumCard from '@/components/ui/premium-card';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const KANBAN_COLUMNS = [
  { id: 'inquiry', title: 'انکوائری (Inquiry)', border: 'border-l-4 border-l-indigo-400', badge: 'border-indigo-200 bg-indigo-50 text-indigo-700' },
  { id: 'documents_pending', title: 'دستاویزات جمع (Pending)', border: 'border-l-4 border-l-blue-400', badge: 'border-blue-200 bg-blue-50 text-blue-700' },
  { id: 'applied', title: 'درخواست جمع (Applied)', border: 'border-l-4 border-l-amber-400', badge: 'border-amber-200 bg-amber-50 text-amber-700' },
  { id: 'in_embassy', title: 'سفارت خانے میں (Embassy)', border: 'border-l-4 border-l-purple-400', badge: 'border-purple-200 bg-purple-50 text-purple-700' },
  { id: 'approved', title: 'منظور شدہ (Approved 🎉)', border: 'border-l-4 border-l-emerald-400', badge: 'border-emerald-200 bg-emerald-50 text-emerald-700' },
  { id: 'rejected', title: 'مسترد (Rejected)', border: 'border-l-4 border-l-rose-400', badge: 'border-rose-200 bg-rose-50 text-rose-700' },
];

export default function VisaConsultancyPage() {
  const { agency } = useAgency();
  const [selectedCountry, setSelectedCountry] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [search, setSearch] = useState('');
  const [showNewModal, setShowNewModal] = useState(false);
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);

  // New Case Form
  const [newCase, setNewCase] = useState({
    client_name: '',
    father_name: '',
    passport_no: '',
    phone: '',
    visa_type: 'study',
    country: 'UK',
    total_fee: '250000',
    paid: '50000',
    university_name: '',
    employer_name: '',
  });
  const [creating, setCreating] = useState(false);

  const { data, mutate, isLoading } = useSWR(
    `/api/visa-consultancy?country=${selectedCountry}&visa_type=${selectedType}&q=${encodeURIComponent(search)}`,
    fetcher
  );

  // Case Detail SWR
  const { data: detailData, mutate: mutateDetail } = useSWR(
    selectedCaseId ? `/api/visa-consultancy/${selectedCaseId}` : null,
    fetcher
  );

  const cases = data?.cases || [];
  const stats = data?.stats || { totalCases: 0, approvedCases: 0, pendingCases: 0, totalRevenue: 0 };

  const handleCreateCase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCase.client_name) return;

    setCreating(true);
    try {
      const res = await fetch('/api/visa-consultancy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCase),
      });

      if (res.ok) {
        setShowNewModal(false);
        setNewCase({
          client_name: '',
          father_name: '',
          passport_no: '',
          phone: '',
          visa_type: 'study',
          country: 'UK',
          total_fee: '250000',
          paid: '50000',
          university_name: '',
          employer_name: '',
        });
        mutate();
      } else {
        const err = await res.json();
        alert(err.error || 'کیس بنانے میں خرابی');
      }
    } catch (err: any) {
      alert(err.message || 'نیٹ ورک خرابی');
    } finally {
      setCreating(false);
    }
  };

  const handleUpdateStatus = async (caseId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/visa-consultancy/${caseId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        mutate();
        if (selectedCaseId === caseId) mutateDetail();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleDocStatus = async (docId: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'verified' ? 'pending' : currentStatus === 'received' ? 'verified' : 'received';
    try {
      await fetch(`/api/visa-consultancy/${selectedCaseId}/documents`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ doc_id: docId, status: nextStatus }),
      });
      mutateDetail();
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddPayment = async (caseId: string, currentPaid: number) => {
    const amountStr = prompt('وصول شدہ رقم (PKR) درج کریں:', '50000');
    if (!amountStr) return;
    const added = Number(amountStr);
    if (isNaN(added) || added <= 0) return;

    const newPaid = currentPaid + added;
    try {
      await fetch(`/api/visa-consultancy/${caseId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paid: newPaid, note: `رقم ₨ ${added.toLocaleString()} وصول کی گئی` }),
      });
      mutate();
      if (selectedCaseId === caseId) mutateDetail();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="w-full max-w-full overflow-x-hidden space-y-6 max-w-7xl mx-auto px-2 sm:px-4">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-4 sm:p-6 rounded-[24px] border border-gray-100 shadow-[0_8px_30px_rgba(0,0,0,0.06)] overflow-hidden transform-none" style={{ transform: 'none' }}>
        <div dir="rtl" className="text-right transform-none" style={{ transform: 'none' }}>
          <h1 className="font-urdu text-[28px] md:text-[32px] font-bold text-right leading-[2.2] transform-none rotate-0 not-italic" dir="rtl" style={{ transform: 'none', fontStyle: 'normal' }}>
            ویزہ کنسلٹنسی پورٹل
          </h1>
          <p className="font-urdu text-sm text-gray-600 text-right transform-none" dir="rtl">
            کل کیسز: {stats.totalCases} <span className="font-english text-xs text-indigo-600 font-semibold">(Study, Visit & Work Visas)</span>
          </p>
          <p className="text-xs text-gray-500 mt-1 break-words leading-relaxed transform-none">
            برطانیہ، کینیڈا، شینگن، دبئی، آسٹریلیا اور امریکہ ویزا فائلنگ، ایمبیسی چیک لسٹ اور کنبان ٹریکر
          </p>
        </div>

        <button
          onClick={() => setShowNewModal(true)}
          className="font-urdu bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-full flex items-center gap-2 transform-none shadow-md transition"
          style={{ transform: 'none' }}
        >
          <span>+</span> <span>نیا ویزہ کیس</span> <span className="font-english text-xs">(New Case)</span>
        </button>
      </div>

      {/* TOP 4 METRICS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <PremiumCard
          title="کل ویزہ کیسز"
          value={stats.totalCases}
          subtitle="تمام ممالک کے سٹوڈنٹ و وزٹ"
          icon={Globe2}
          gradient="violet"
          trend="کل کیسز"
        />
        <PremiumCard
          title="منظور شدہ ویزے"
          value={stats.approvedCases}
          subtitle="100% کامیاب ریٹ"
          icon={CheckCircle2}
          gradient="emerald"
          trend="کامیاب"
        />
        <PremiumCard
          title="سفارت خانے میں زیرِ التواء"
          value={stats.pendingCases}
          subtitle="پراسیسنگ مرحلے میں"
          icon={Clock}
          gradient="amber"
          trend="پینڈنگ"
        />
        <PremiumCard
          title="کنسلٹنسی ریونیو"
          value={formatCurrency(stats.totalRevenue)}
          subtitle="وصول شدہ سروس چارجز"
          icon={DollarSign}
          gradient="cyan"
          trend="آمدن"
        />
      </div>

      {/* FILTERS & SEARCH */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap">
          <Filter className="w-4 h-4 text-gray-400" />
          {/* Country Filter */}
          <select
            value={selectedCountry}
            onChange={(e) => setSelectedCountry(e.target.value)}
            className="px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs text-gray-700 shadow-sm font-semibold"
          >
            <option value="all">تمام ممالک (All Countries)</option>
            <option value="UK">برطانیہ (UK)</option>
            <option value="Canada">کینیڈا (Canada)</option>
            <option value="Schengen">یورپ شینگن (Schengen)</option>
            <option value="USA">امریکہ (USA)</option>
            <option value="Dubai">دبئی / یو اے ای (Dubai)</option>
            <option value="Australia">آسٹریلیا (Australia)</option>
            <option value="Turkey">ترکیہ (Turkey)</option>
            <option value="Saudi Arabia">سعودی عرب (Saudi)</option>
          </select>

          {/* Visa Type Filter */}
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs text-gray-700 shadow-sm font-semibold"
          >
            <option value="all">تمام ویزہ اقسام (All Types)</option>
            <option value="study">اسٹڈی ویزہ (Study Visa)</option>
            <option value="visit">وزٹ ویزہ (Visit Visa)</option>
            <option value="work">ورک ویزہ (Work Visa)</option>
            <option value="tourist">ٹورسٹ ویزہ (Tourist)</option>
            <option value="business">بزنس ویزہ (Business)</option>
            <option value="family">فیملی ویزہ (Family)</option>
          </select>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="کلائنٹ نام یا پاسپورٹ تلاش کریں..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-xs text-gray-800 placeholder-gray-400 shadow-sm"
          />
        </div>
      </div>

      {/* KANBAN BOARD */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 items-start">
        {KANBAN_COLUMNS.map((col) => {
          const colCases = cases.filter((c: any) => c.status === col.id);
          return (
            <div
              key={col.id}
              className={`bg-white rounded-2xl border border-gray-100 p-4 shadow-sm flex flex-col min-h-[480px] ${col.border}`}
            >
              {/* Column Header */}
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-gray-100 gap-1">
                <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold border ${col.badge} truncate`}>
                  {col.title}
                </span>
                <span className="w-5 h-5 rounded-full bg-gray-50 border border-gray-200 text-gray-700 text-[11px] font-bold flex items-center justify-center flex-shrink-0">
                  {colCases.length}
                </span>
              </div>

              {/* Cards in this column */}
              <div className="space-y-3 flex-1 overflow-y-auto">
                {colCases.map((c: any) => (
                  <div
                    key={c.id}
                    onClick={() => setSelectedCaseId(c.id)}
                    className="p-3.5 rounded-2xl bg-white border border-gray-200 hover:border-indigo-400 hover:shadow-md transition cursor-pointer space-y-2 group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 font-bold text-[10px]">
                        {c.country}
                      </span>
                      <span className="text-[10px] font-bold text-gray-500 uppercase">
                        {c.visa_type}
                      </span>
                    </div>

                    <h4 className="font-bold text-gray-900 text-xs group-hover:text-indigo-600 transition truncate">
                      {c.client_name}
                    </h4>

                    <div className="text-[11px] text-gray-500 space-y-0.5">
                      <span className="block font-mono">پاسپورٹ: {c.passport_no || 'Pending'}</span>
                      <span className="block">فیس: {formatCurrency(c.paid)} / {formatCurrency(c.total_fee)}</span>
                    </div>

                    {/* Quick Move Status Dropdown */}
                    <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
                      <select
                        value={c.status}
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) => handleUpdateStatus(c.id, e.target.value)}
                        className="text-[10px] font-bold bg-gray-50 border border-gray-200 rounded-lg px-2 py-1 text-gray-700"
                      >
                        <option value="inquiry">انکوائری</option>
                        <option value="documents_pending">دستاویزات</option>
                        <option value="applied">اپلائیڈ</option>
                        <option value="in_embassy">ایمبیسی</option>
                        <option value="approved">منظور 🎉</option>
                        <option value="rejected">مسترد</option>
                      </select>

                      <ChevronRight className="w-3.5 h-3.5 text-gray-400 group-hover:translate-x-0.5 transition" />
                    </div>
                  </div>
                ))}

                {colCases.length === 0 && (
                  <div className="py-12 text-center text-gray-400 text-xs">
                    کوئی کیس نہیں
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* MODAL 1: NEW VISA CASE */}
      {showNewModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-lg bg-white border border-gray-100 rounded-[28px] p-6 sm:p-8 shadow-2xl my-8">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-6">
              <h3 className="text-lg font-bold text-gray-900">+ نیا ویزہ کیس درج کریں</h3>
              <button
                onClick={() => setShowNewModal(false)}
                className="w-8 h-8 rounded-lg bg-gray-100 text-gray-500 hover:text-gray-900 flex items-center justify-center text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateCase} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">کلائنٹ کا نام *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. احمد حسن"
                    value={newCase.client_name}
                    onChange={(e) => setNewCase({ ...newCase, client_name: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-xs focus:outline-none focus:border-indigo-500 font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">والد کا نام</label>
                  <input
                    type="text"
                    placeholder="حسن اختر"
                    value={newCase.father_name}
                    onChange={(e) => setNewCase({ ...newCase, father_name: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">ملک (Country)</label>
                  <select
                    value={newCase.country}
                    onChange={(e) => setNewCase({ ...newCase, country: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-xs focus:outline-none focus:border-indigo-500 font-semibold"
                  >
                    <option value="UK">برطانیہ (UK)</option>
                    <option value="Canada">کینیڈا (Canada)</option>
                    <option value="Schengen">یورپ شینگن (Schengen)</option>
                    <option value="USA">امریکہ (USA)</option>
                    <option value="Dubai">دبئی (Dubai)</option>
                    <option value="Australia">آسٹریلیا (Australia)</option>
                    <option value="Turkey">ترکیہ (Turkey)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">ویزہ کیٹیگری</label>
                  <select
                    value={newCase.visa_type}
                    onChange={(e) => setNewCase({ ...newCase, visa_type: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-xs focus:outline-none focus:border-indigo-500 font-semibold"
                  >
                    <option value="study">اسٹڈی ویزہ (Study)</option>
                    <option value="visit">وزٹ ویزہ (Visit)</option>
                    <option value="work">ورک ویزہ (Work)</option>
                    <option value="tourist">ٹورسٹ ویزہ (Tourist)</option>
                    <option value="business">بزنس ویزہ (Business)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">پاسپورٹ نمبر</label>
                  <input
                    type="text"
                    placeholder="AK1234567"
                    value={newCase.passport_no}
                    onChange={(e) => setNewCase({ ...newCase, passport_no: e.target.value.toUpperCase() })}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-xs font-mono uppercase focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">فون نمبر (WhatsApp)</label>
                  <input
                    type="text"
                    placeholder="03001234567"
                    value={newCase.phone}
                    onChange={(e) => setNewCase({ ...newCase, phone: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {newCase.visa_type === 'study' ? (
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">یونیورسٹی / کالج نام</label>
                  <input
                    type="text"
                    placeholder="University of Hertfordshire, UK"
                    value={newCase.university_name}
                    onChange={(e) => setNewCase({ ...newCase, university_name: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-xs"
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">کمپنی / ایمپلائر نام (اختیاری)</label>
                  <input
                    type="text"
                    placeholder="Employer / Sponsor Name"
                    value={newCase.employer_name}
                    onChange={(e) => setNewCase({ ...newCase, employer_name: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-xs"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">کنسلٹنسی کل فیس (PKR)</label>
                  <input
                    type="number"
                    value={newCase.total_fee}
                    onChange={(e) => setNewCase({ ...newCase, total_fee: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">وصول شدہ ایڈوانس (PKR)</label>
                  <input
                    type="number"
                    value={newCase.paid}
                    onChange={(e) => setNewCase({ ...newCase, paid: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-xs font-bold text-emerald-600"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowNewModal(false)}
                  className="px-5 py-2.5 rounded-full border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-50"
                >
                  منسوخ کریں
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-6 py-2.5 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow-md shadow-emerald-200 disabled:opacity-50"
                >
                  {creating ? 'کیس بنایا جا رہا ہے...' : '✓ کیس درج کریں'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: CASE DETAILS & DOCUMENT CHECKLIST & TIMELINE */}
      {selectedCaseId && detailData?.case && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-3xl bg-white border border-gray-100 rounded-[28px] p-6 sm:p-8 shadow-2xl my-8 space-y-6">
            <div className="flex items-start justify-between pb-4 border-b border-gray-100">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-bold text-gray-900">{detailData.case.client_name}</h3>
                  <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-bold text-xs">
                    {detailData.case.country} - {detailData.case.visa_type.toUpperCase()}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  پاسپورٹ: <strong className="font-mono text-gray-800">{detailData.case.passport_no || 'N/A'}</strong> | فون: {detailData.case.phone || 'N/A'}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={`/api/pdf/visa-checklist/${detailData.case.id}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2 rounded-full bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs border border-indigo-200 flex items-center gap-1.5 transition"
                >
                  <Download className="w-3.5 h-3.5" />
                  ایمبیسی چیک لسٹ PDF
                </a>
                <button
                  onClick={() => setSelectedCaseId(null)}
                  className="w-8 h-8 rounded-lg bg-gray-100 text-gray-500 hover:text-gray-900 flex items-center justify-center text-sm font-bold"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Fee summary card */}
            <div className="grid grid-cols-3 gap-3 p-4 bg-gray-50 rounded-2xl border border-gray-100 text-xs">
              <div>
                <span className="text-gray-400 block">کل طے شدہ فیس:</span>
                <strong className="text-sm font-bold text-gray-800">{formatCurrency(detailData.case.total_fee)}</strong>
              </div>
              <div>
                <span className="text-gray-400 block">ادا شدہ فیس:</span>
                <strong className="text-sm font-bold text-emerald-600">{formatCurrency(detailData.case.paid)}</strong>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-gray-400 block">بقایا واجب الادا:</span>
                  <strong className="text-sm font-bold text-rose-600">
                    {formatCurrency((detailData.case.total_fee || 0) - (detailData.case.paid || 0))}
                  </strong>
                </div>
                <button
                  onClick={() => handleAddPayment(detailData.case.id, detailData.case.paid || 0)}
                  className="px-3 py-1 rounded-lg bg-emerald-500 text-white text-[10px] font-bold shadow hover:bg-emerald-600"
                >
                  + ادائیگی
                </button>
              </div>
            </div>

            {/* Document Checklist with Status Toggles */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-700 flex items-center gap-1.5">
                <FileCheck2 className="w-4 h-4 text-indigo-600" />
                ایمبیسی دستاویزات چیک لسٹ (Click to Toggle Status: Pending ➔ Received ➔ Verified)
              </h4>

              <div className="divide-y divide-gray-100 border border-gray-200 rounded-2xl overflow-hidden">
                {(detailData.documents || []).map((doc: any) => (
                  <div
                    key={doc.id}
                    onClick={() => handleToggleDocStatus(doc.id, doc.status)}
                    className="p-3.5 flex items-center justify-between hover:bg-gray-50 transition cursor-pointer"
                  >
                    <span className="text-xs font-semibold text-gray-800">{doc.doc_name}</span>
                    <span
                      className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${
                        doc.status === 'verified'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : doc.status === 'received'
                          ? 'bg-blue-100 text-blue-800 border border-blue-300'
                          : 'bg-amber-100 text-amber-800 border border-amber-300'
                      }`}
                    >
                      {doc.status === 'verified' ? '✓ تصدیق شدہ (Verified)' : doc.status === 'received' ? 'موصل (Received)' : 'زیر التواء (Pending)'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Timeline */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-700">
                کیس ٹائم لائن اور پیش رفت (Timeline)
              </h4>
              <div className="max-h-36 overflow-y-auto space-y-1.5 bg-gray-50 p-3 rounded-2xl border border-gray-100 text-xs">
                {(detailData.timeline || []).map((t: any) => (
                  <div key={t.id} className="flex items-center justify-between text-[11px] text-gray-600">
                    <span>{t.note || `تبدیلی: ${t.status_to}`}</span>
                    <span className="text-[10px] text-gray-400 font-mono">{formatDate(t.created_at)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Bar */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">موجودہ اسٹیٹس:</span>
                <select
                  value={detailData.case.status}
                  onChange={(e) => handleUpdateStatus(detailData.case.id, e.target.value)}
                  className="text-xs font-bold px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900"
                >
                  <option value="inquiry">انکوائری (Inquiry)</option>
                  <option value="documents_pending">دستاویزات زیر التواء</option>
                  <option value="applied">درخواست جمع (Applied)</option>
                  <option value="in_embassy">سفارت خانے میں (In Embassy)</option>
                  <option value="approved">منظور شدہ (Approved 🎉)</option>
                  <option value="rejected">مسترد (Rejected)</option>
                </select>
              </div>

              <button
                onClick={() => setSelectedCaseId(null)}
                className="px-6 py-2.5 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold"
              >
                بند کریں
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
