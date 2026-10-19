'use client';

import { useState } from 'react';
import useSWR from 'swr';
import {
  FileCheck2,
  Plus,
  Search,
  AlertTriangle,
  Clock,
  CheckCircle,
  Building2,
  Calendar,
  FileText,
  User,
  List,
  Columns,
} from 'lucide-react';
import { DndContext, useDroppable, useDraggable, DragEndEvent } from '@dnd-kit/core';
import dayjs from 'dayjs';
import { formatDate } from '@/lib/utils';
import PremiumCard from '@/components/ui/premium-card';
import ContentCard from '@/components/ui/content-card';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const COLUMNS = [
  { id: 'document_pending', title: 'دستاویزات زیرِ التواء', color: 'border-amber-200 text-amber-800 bg-amber-50' },
  { id: 'in_embassy', title: 'سفارت خانے میں (In Embassy)', color: 'border-sky-200 text-sky-800 bg-sky-50' },
  { id: 'printed', title: 'ویزہ پرنٹ ہو گیا (Printed)', color: 'border-emerald-200 text-emerald-800 bg-emerald-50' },
  { id: 'returned', title: 'پاسپورٹ موصول (Returned)', color: 'border-purple-200 text-purple-800 bg-purple-50' },
];

function KanbanCard({ visa }: { visa: any }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: visa.id,
    data: { visa },
  });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        zIndex: 99,
      }
    : undefined;

  // Check if expiry date is within 30 days
  const isExpiringSoon = visa.expiry_date
    ? dayjs(visa.expiry_date).diff(dayjs(), 'day') <= 30 && dayjs(visa.expiry_date).diff(dayjs(), 'day') >= 0
    : false;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`p-4 rounded-2xl bg-white border border-gray-200 shadow-sm transition cursor-grab active:cursor-grabbing hover:border-gray-300 select-none space-y-2.5 ${
        isDragging ? 'opacity-50 ring-2 ring-emerald-500' : ''
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <span className="font-mono text-xs font-black text-sky-700 bg-sky-50 px-2 py-0.5 rounded-md border border-sky-200">
          {visa.passport_no}
        </span>

        {isExpiringSoon && (
          <span className="px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 text-[10px] font-bold flex items-center gap-1 animate-pulse">
            <AlertTriangle className="w-3 h-3" />
            30 دن میعاد
          </span>
        )}
      </div>

      <div className="text-xs text-gray-700 space-y-1">
        <div className="flex items-center gap-1.5 text-gray-500">
          <Building2 className="w-3.5 h-3.5" />
          <span>سفارت خانہ: <strong className="text-gray-800">{visa.embassy || 'سعودی سفارت خانہ'}</strong></span>
        </div>
        {visa.visa_number && (
          <div className="flex items-center gap-1.5 text-emerald-700">
            <FileText className="w-3.5 h-3.5" />
            <span className="font-mono text-[11px]">ویزہ نمبر: {visa.visa_number}</span>
          </div>
        )}
        {visa.expiry_date && (
          <div className="flex items-center gap-1.5 text-gray-500 text-[11px]">
            <Calendar className="w-3 h-3" />
            <span>میعاد: {formatDate(visa.expiry_date)}</span>
          </div>
        )}
      </div>
    </div>
  );
}

function KanbanColumn({ col, visas }: { col: any; visas: any[] }) {
  const { setNodeRef, isOver } = useDroppable({
    id: col.id,
  });

  return (
    <div
      ref={setNodeRef}
      className={`rounded-2xl border border-gray-100 bg-white shadow-sm p-4 min-h-[500px] flex flex-col justify-between transition ${
        isOver ? 'ring-2 ring-emerald-500 bg-emerald-50/10' : ''
      }`}
    >
      <div>
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-gray-100">
          <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${col.color}`}>
            {col.title}
          </span>
          <span className="w-6 h-6 rounded-full bg-gray-50 border border-gray-200 text-xs font-bold flex items-center justify-center text-gray-700 shadow-sm">
            {visas.length}
          </span>
        </div>

        <div className="space-y-3">
          {visas.map((v) => (
            <KanbanCard key={v.id} visa={v} />
          ))}

          {visas.length === 0 && (
            <div className="py-12 text-center text-gray-400 text-xs font-medium">
              کوئی ویزہ درخواست نہیں
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function VisasPage() {
  const { data, mutate, isLoading } = useSWR('/api/visas', fetcher);
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const [formData, setFormData] = useState({
    passport_no: '',
    visa_type: 'umrah',
    embassy: 'سعودی قونصل خانہ کراچی',
    visa_number: '',
    issue_date: '',
    expiry_date: '',
    status: 'document_pending',
    agent_fee: '15000',
    embassy_fee: '85000',
  });

  const visas = data?.visas || [];

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    const visaId = active.id as string;
    const newStatus = over.id as string;

    const currentVisa = visas.find((v: any) => v.id === visaId);
    if (!currentVisa || currentVisa.status === newStatus) return;

    // Optimistic Update
    mutate(
      {
        ...data,
        visas: visas.map((v: any) =>
          v.id === visaId ? { ...v, status: newStatus } : v
        ),
      },
      false
    );

    try {
      await fetch(`/api/visas/${visaId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      mutate();
    } catch (err) {
      console.error(err);
      mutate();
    }
  };

  const handleCreateVisa = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/visas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const err = await res.json();
        setErrorMsg(err.error || 'ویزہ محفوظ کرنے میں خرابی');
        setSubmitting(false);
        return;
      }

      setShowModal(false);
      setFormData({
        passport_no: '',
        visa_type: 'umrah',
        embassy: 'سعودی قونصل خانہ کراچی',
        visa_number: '',
        issue_date: '',
        expiry_date: '',
        status: 'document_pending',
        agent_fee: '15000',
        embassy_fee: '85000',
      });
      mutate();
    } catch (err: any) {
      setErrorMsg('نیٹ ورک ایرر: دوبارہ کوشش کریں');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredVisas = visas.filter((v: any) =>
    v.passport_no?.toLowerCase().includes(search.toLowerCase()) ||
    v.visa_number?.toLowerCase().includes(search.toLowerCase())
  );

  const docsReceived = visas.filter((v: any) => (v.status || 'document_pending') === 'document_pending').length;
  const inEmbassy = visas.filter((v: any) => v.status === 'in_embassy').length;
  const printed = visas.filter((v: any) => v.status === 'printed').length;
  const returned = visas.filter((v: any) => v.status === 'returned').length;

  return (
    <div className="w-full max-w-full overflow-x-hidden space-y-6 max-w-7xl mx-auto px-2 sm:px-4">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-4 sm:p-6 rounded-[24px] border border-gray-100 shadow-[0_8px_30px_rgba(0,0,0,0.06)] overflow-hidden">
        <div dir="rtl" className="text-right" style={{ transform: 'none' }}>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="font-urdu text-[24px] md:text-[28px] font-bold leading-[1.8] break-words text-gray-900" style={{ transform: 'none' }}>
              عمرہ ویزہ ٹریکنگ کنبان
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 text-xs font-bold border border-purple-200 shrink-0">
              ڈریگ اینڈ ڈراپ فعال
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1 break-words leading-relaxed">
            مرحلہ وار ٹریکنگ، آٹو واٹس ایپ نوٹیفکیشن، اور میعاد ختم ہونے پر ریڈ الرٹ
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          {/* View Toggle */}
          <div className="flex bg-gray-100 p-1 rounded-xl border border-gray-200">
            <button
              onClick={() => setViewMode('kanban')}
              className={`p-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                viewMode === 'kanban' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'
              }`}
            >
              <Columns className="w-4 h-4" />
              کنبان
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                viewMode === 'list' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'
              }`}
            >
              <List className="w-4 h-4" />
              لسٹ
            </button>
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="w-full sm:w-auto px-5 py-2.5 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow-md shadow-emerald-200 transition flex items-center justify-center gap-1.5"
          >
            <Plus className="w-4 h-4 shrink-0" />
            + نیا ویزہ درج کریں
          </button>
        </div>
      </div>

      {/* Top 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <PremiumCard
          title="دستاویزات موصول"
          value={docsReceived}
          subtitle="کاغذات ویریفائی ہو رہے ہیں"
          icon={FileText}
          gradient="cyan"
          trend="مرحلہ 1"
        />
        <PremiumCard
          title="سفارت خانے میں (Embassy)"
          value={inEmbassy}
          subtitle="کیس جمع ہے"
          icon={Building2}
          gradient="amber"
          trend="مرحلہ 2"
        />
        <PremiumCard
          title="ویزہ پرنٹ ہو گیا"
          value={printed}
          subtitle="ویزہ تیار ہے"
          icon={CheckCircle}
          gradient="emerald"
          trend="مرحلہ 3"
        />
        <PremiumCard
          title="پاسپورٹ موصول / واپس"
          value={returned}
          subtitle="حاجی کے سپردگی کے لیے"
          icon={FileCheck2}
          gradient="rose"
          trend="مرحلہ 4"
        />
      </div>

      {/* SEARCH BAR */}
      <div className="relative w-full sm:w-80">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="پاسپورٹ نمبر یا ویزہ نمبر سرچ کریں..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:border-purple-500 shadow-sm"
        />
      </div>

      {/* KANBAN BOARD VIEW */}
      {viewMode === 'kanban' ? (
        <DndContext onDragEnd={handleDragEnd}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-start">
            {COLUMNS.map((col) => {
              const colVisas = filteredVisas.filter((v: any) => (v.status || 'document_pending') === col.id);
              return <KanbanColumn key={col.id} col={col} visas={colVisas} />;
            })}
          </div>
        </DndContext>
      ) : (
        /* LIST VIEW */
        <ContentCard>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-700">
              <thead className="bg-gray-50 text-gray-500 uppercase tracking-wider text-[11px] border-b border-gray-100">
                <tr>
                  <th className="p-4">پاسپورٹ نمبر</th>
                  <th className="p-4">ویزہ کیٹیگری</th>
                  <th className="p-4">سفارت خانہ</th>
                  <th className="p-4">ویزہ نمبر</th>
                  <th className="p-4">میعاد</th>
                  <th className="p-4">موجودہ مرحلہ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredVisas.map((v: any) => (
                  <tr key={v.id} className="hover:bg-gray-50/60 transition">
                    <td className="p-4 font-mono font-bold text-sky-700">{v.passport_no}</td>
                    <td className="p-4 uppercase">{v.visa_type}</td>
                    <td className="p-4">{v.embassy || '-'}</td>
                    <td className="p-4 font-mono text-emerald-700">{v.visa_number || '-'}</td>
                    <td className="p-4">{formatDate(v.expiry_date)}</td>
                    <td className="p-4">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-gray-100 text-gray-800">
                        {v.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </ContentCard>
      )}

      {/* CREATE VISA MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white border border-gray-100 rounded-[28px] p-6 sm:p-8 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-6">
              <h3 className="text-lg font-bold text-gray-900">+ نیا عمرہ ویزہ ریکارڈ</h3>
              <button
                onClick={() => setShowModal(false)}
                className="w-8 h-8 rounded-lg bg-gray-100 text-gray-500 hover:text-gray-900 flex items-center justify-center text-sm font-bold"
              >
                ✕
              </button>
            </div>

            {errorMsg && (
              <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleCreateVisa} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">پاسپورٹ نمبر *</label>
                <input
                  type="text"
                  required
                  placeholder="AK1234567"
                  value={formData.passport_no}
                  onChange={(e) => setFormData({ ...formData, passport_no: e.target.value.toUpperCase() })}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-xs font-mono uppercase font-black focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">سفارت خانہ (Embassy)</label>
                  <input
                    type="text"
                    value={formData.embassy}
                    onChange={(e) => setFormData({ ...formData, embassy: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">ابتدائی سٹیٹس</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-xs"
                  >
                    <option value="document_pending">دستاویزات زیرِ التواء</option>
                    <option value="in_embassy">سفارت خانے میں (In Embassy)</option>
                    <option value="printed">ویزہ پرنٹ ہو گیا (Printed)</option>
                    <option value="returned">پاسپورٹ موصول (Returned)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">ویزہ نمبر</label>
                  <input
                    type="text"
                    placeholder="V12345678"
                    value={formData.visa_number}
                    onChange={(e) => setFormData({ ...formData, visa_number: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">تاریخ تنسیخ (Expiry Date)</label>
                  <input
                    type="date"
                    value={formData.expiry_date}
                    onChange={(e) => setFormData({ ...formData, expiry_date: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-xs"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-5 py-2.5 rounded-full border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-50"
                >
                  منسوخ کریں
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow-md shadow-emerald-200 disabled:opacity-50"
                >
                  {submitting ? 'محفوظ ہو رہا ہے...' : 'ویزہ محفوظ کریں'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
