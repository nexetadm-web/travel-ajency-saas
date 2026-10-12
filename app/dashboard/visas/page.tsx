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

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const COLUMNS = [
  { id: 'document_pending', title: 'دستاویزات زیرِ التواء', color: 'border-amber-500/40 text-amber-400 bg-amber-500/10' },
  { id: 'in_embassy', title: 'سفارت خانے میں (In Embassy)', color: 'border-sky-500/40 text-sky-400 bg-sky-500/10' },
  { id: 'printed', title: 'ویزہ پرنٹ ہو گیا (Printed)', color: 'border-emerald-500/40 text-emerald-400 bg-emerald-500/10' },
  { id: 'returned', title: 'پاسپورٹ موصول (Returned)', color: 'border-purple-500/40 text-purple-400 bg-purple-500/10' },
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
      className={`p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-md transition cursor-grab active:cursor-grabbing hover:border-slate-700 select-none space-y-2.5 ${
        isDragging ? 'opacity-50 ring-2 ring-emerald-500' : ''
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <span className="font-bold text-white text-xs block truncate">{visa.pilgrim_name}</span>
          <span className="font-mono text-sky-400 text-[11px] font-bold block">{visa.passport_no}</span>
        </div>
        <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 text-[10px] font-bold uppercase">
          {visa.visa_type || 'Umrah'}
        </span>
      </div>

      {/* 30-Day Expiry Red Badge Alert */}
      {isExpiringSoon && (
        <div className="px-2.5 py-1 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-[10px] font-bold flex items-center gap-1.5 animate-pulse">
          <AlertTriangle className="w-3 h-3 text-rose-400" />
          <span>میعاد 30 دن سے کم ہے! ({formatDate(visa.expiry_date)})</span>
        </div>
      )}

      <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400">
        <span>سفارت خانہ: {visa.embassy || 'Saudi Embassy'}</span>
        {visa.visa_number && <span className="font-mono text-emerald-400">#{visa.visa_number}</span>}
      </div>
    </div>
  );
}

function KanbanColumn({ col, visas }: { col: typeof COLUMNS[0]; visas: any[] }) {
  const { setNodeRef, isOver } = useDroppable({
    id: col.id,
  });

  return (
    <div
      ref={setNodeRef}
      className={`flex flex-col rounded-3xl bg-slate-950/80 border p-4 min-h-[480px] transition ${
        isOver ? 'ring-2 ring-emerald-500/50 bg-slate-900/60' : 'border-slate-800'
      }`}
    >
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${col.color}`}>
            {col.title}
          </span>
        </div>
        <span className="text-xs font-bold text-slate-400">{visas.length}</span>
      </div>

      <div className="space-y-3 flex-1 overflow-y-auto">
        {visas.map((v) => (
          <KanbanCard key={v.id} visa={v} />
        ))}
        {visas.length === 0 && (
          <div className="h-32 flex items-center justify-center text-slate-600 text-xs border border-dashed border-slate-850 rounded-2xl">
            یہاں ویزہ کارڈ ڈریگ کریں
          </div>
        )}
      </div>
    </div>
  );
}

export default function VisasKanbanPage() {
  const { data, mutate, isLoading } = useSWR('/api/visas', fetcher);
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const [formData, setFormData] = useState({
    passport_no: '',
    visa_type: 'umrah',
    embassy: 'Saudi Embassy Islamabad',
    submission_date: '',
    visa_number: '',
    issue_date: '',
    expiry_date: '',
    status: 'document_pending',
    agent_fee: '5000',
    embassy_fee: '42000',
  });

  const allVisas = data?.visas || [];

  const filtered = allVisas.filter((v: any) =>
    v.passport_no?.toLowerCase().includes(search.toLowerCase()) ||
    v.pilgrim_name?.toLowerCase().includes(search.toLowerCase()) ||
    (v.visa_number && v.visa_number.includes(search))
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    const visaId = active.id as string;
    const newStatus = over.id as string;

    const currentVisa = allVisas.find((v: any) => v.id === visaId);
    if (!currentVisa || currentVisa.status === newStatus) return;

    // Optimistic Update
    const updatedVisas = allVisas.map((v: any) =>
      v.id === visaId ? { ...v, status: newStatus } : v
    );
    mutate({ visas: updatedVisas }, false);

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

      const resData = await res.json();
      if (!res.ok) {
        setErrorMsg(resData.error || 'ویزہ محفوظ کرنے میں خرابی');
        setSubmitting(false);
        return;
      }

      mutate();
      setShowModal(false);
      setFormData({
        passport_no: '',
        visa_type: 'umrah',
        embassy: 'Saudi Embassy Islamabad',
        submission_date: '',
        visa_number: '',
        issue_date: '',
        expiry_date: '',
        status: 'document_pending',
        agent_fee: '5000',
        embassy_fee: '42000',
      });
    } catch (err: any) {
      setErrorMsg('نیٹ ورک خرابی');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-white">ویزہ ٹریکنگ کنبان بورڈ</h1>
            <span className="px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-400 text-xs font-semibold">
              ماڈیول 3
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            ڈریگ اینڈ ڈراپ، 30 دن کی میعاد الرٹ، اور ویزہ پرنٹ ہونے پر خودکار واٹس ایپ اطلاع
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* View Toggle */}
          <div className="p-1 rounded-xl bg-slate-900 border border-slate-800 flex items-center">
            <button
              onClick={() => setViewMode('kanban')}
              className={`p-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                viewMode === 'kanban' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Columns className="w-3.5 h-3.5" />
              کنبان
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                viewMode === 'list' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              لسٹ ویو
            </button>
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-purple-600/20 transition flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            + نیا ویزہ درج کریں
          </button>
        </div>
      </div>

      {/* SEARCH BAR */}
      <div className="relative max-w-sm">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
        <input
          type="text"
          placeholder="پاسپورٹ یا درخواست گزار تلاش کریں..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
        />
      </div>

      {/* KANBAN BOARD VIEW (@dnd-kit) */}
      {viewMode === 'kanban' ? (
        <DndContext onDragEnd={handleDragEnd}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {COLUMNS.map((col) => (
              <KanbanColumn
                key={col.id}
                col={col}
                visas={filtered.filter((v: any) => v.status === col.id)}
              />
            ))}
          </div>
        </DndContext>
      ) : (
        /* LIST VIEW */
        <div className="rounded-2xl border border-slate-800 bg-slate-950/60 overflow-x-auto shadow-xl">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/90 text-slate-400 border-b border-slate-800 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="p-3.5">درخواست گزار</th>
                <th className="p-3.5">پاسپورٹ نمبر</th>
                <th className="p-3.5">ویزہ قسم</th>
                <th className="p-3.5">سفارت خانہ</th>
                <th className="p-3.5">تاریخ اجراء / میعاد</th>
                <th className="p-3.5">سٹیٹس</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-850">
              {filtered.map((v: any) => (
                <tr key={v.id} className="hover:bg-slate-900/40 transition">
                  <td className="p-3.5 font-bold text-white">{v.pilgrim_name}</td>
                  <td className="p-3.5 font-mono text-sky-400 font-bold">{v.passport_no}</td>
                  <td className="p-3.5 uppercase">{v.visa_type}</td>
                  <td className="p-3.5">{v.embassy || 'Saudi Embassy'}</td>
                  <td className="p-3.5 text-slate-400">
                    {formatDate(v.issue_date)} - {formatDate(v.expiry_date)}
                  </td>
                  <td className="p-3.5">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-purple-500/10 text-purple-400 border border-purple-500/20">
                      {v.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* CREATE VISA MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-6">
              <h3 className="text-lg font-bold text-white">+ نیا ویزہ درج کریں</h3>
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

            <form onSubmit={handleCreateVisa} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">پاسپورٹ نمبر*</label>
                  <input
                    type="text"
                    required
                    placeholder="AK1234567"
                    value={formData.passport_no}
                    onChange={(e) => setFormData({ ...formData, passport_no: e.target.value.toUpperCase() })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs font-mono uppercase focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">ویزہ قسم</label>
                  <select
                    value={formData.visa_type}
                    onChange={(e) => setFormData({ ...formData, visa_type: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-purple-500"
                  >
                    <option value="umrah">عمرہ ویزہ (Umrah)</option>
                    <option value="hajj">حج ویزہ (Hajj)</option>
                    <option value="tourist">ٹورسٹ ویزہ (Tourist)</option>
                    <option value="visit">فیملی وزٹ ویزہ (Visit)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">سفارت خانہ (Embassy)</label>
                  <input
                    type="text"
                    value={formData.embassy}
                    onChange={(e) => setFormData({ ...formData, embassy: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">ویزہ نمبر (اگر موجود ہو)</label>
                  <input
                    type="text"
                    placeholder="E-12345678"
                    value={formData.visa_number}
                    onChange={(e) => setFormData({ ...formData, visa_number: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">تاریخ اجراء (Issue Date)</label>
                  <input
                    type="date"
                    value={formData.issue_date}
                    onChange={(e) => setFormData({ ...formData, issue_date: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">تاریخ میعاد (Expiry Date)</label>
                  <input
                    type="date"
                    value={formData.expiry_date}
                    onChange={(e) => setFormData({ ...formData, expiry_date: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
                >
                  منسوخ
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-md shadow-purple-600/20"
                >
                  {submitting ? 'محفوظ ہو رہا ہے...' : 'ویزہ داخل کریں'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
