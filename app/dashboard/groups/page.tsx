'use client';

import { useState } from 'react';
import Link from 'next/link';
import useSWR from 'swr';
import {
  Users,
  Plus,
  Calendar,
  Plane,
  Building2,
  DollarSign,
  ArrowRight,
  Clock,
  Sparkles,
  ChevronRight,
  CheckCircle2,
} from 'lucide-react';
import dayjs from 'dayjs';
import { formatCurrency, formatDate } from '@/lib/utils';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function GroupsPage() {
  const { data, mutate, isLoading } = useSWR('/api/groups', fetcher);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const [formData, setFormData] = useState({
    group_name: '',
    departure_date: '',
    return_date: '',
    airline: 'Saudi Airlines',
    total_seats: '40',
    makkah_hotel: 'Swissotel Makkah',
    madina_hotel: 'Anwar Al Madinah',
    price_per_person: '285000',
  });

  const groups = data?.groups || [];

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const resData = await res.json();
      if (!res.ok) {
        setErrorMsg(resData.error || 'گروپ بنانے میں خرابی');
        setSubmitting(false);
        return;
      }

      mutate();
      setShowModal(false);
      setFormData({
        group_name: '',
        departure_date: '',
        return_date: '',
        airline: 'Saudi Airlines',
        total_seats: '40',
        makkah_hotel: 'Swissotel Makkah',
        madina_hotel: 'Anwar Al Madinah',
        price_per_person: '285000',
      });
    } catch (err: any) {
      setErrorMsg('نیٹ ورک ایرر: دوبارہ کوشش کریں');
    } finally {
      setSubmitting(false);
    }
  };

  const calculateDaysLeft = (depDate?: string | null) => {
    if (!depDate) return null;
    const diff = dayjs(depDate).diff(dayjs(), 'day');
    return diff;
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-white">عمرہ و حج گروپ مینجمنٹ</h1>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-semibold">
              ماڈیول 1
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            گروپس اوکیوپینسی، سیٹ الاٹمنٹ، کاؤنٹ ڈاؤن اور زائرین کا مکمل انتظام
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 transition flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          + نیا گروپ بنائیں (New Group)
        </button>
      </div>

      {/* Groups List Grid */}
      {isLoading ? (
        <div className="py-24 text-center text-slate-500">
          <div className="inline-block animate-spin text-2xl mb-2">⏳</div>
          <p className="text-sm">گروپس لوڈ ہو رہے ہیں...</p>
        </div>
      ) : groups.length === 0 ? (
        <div className="p-16 text-center rounded-3xl bg-slate-950/60 border border-slate-800 text-slate-400">
          <Users className="w-12 h-12 mx-auto mb-3 opacity-30 text-emerald-400" />
          <h3 className="text-base font-bold text-white">کوئی گروپ موجود نہیں</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            اوپر دیے گئے بٹن پر کلک کر کے اپنا پہلا عمرہ یا حج گروپ بنائیں جیسے کہ "Umrah Group 15 Dec 2026 - 40 Persons"۔
          </p>
          <button
            onClick={() => setShowModal(true)}
            className="mt-4 px-4 py-2 rounded-xl bg-emerald-500 text-slate-950 text-xs font-bold"
          >
            + پہلا گروپ بنائیں
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {groups.map((grp: any) => {
            const booked = grp.booked_seats || 0;
            const total = grp.total_seats || 40;
            const percentage = Math.min(100, Math.round((booked / total) * 100));
            const daysLeft = calculateDaysLeft(grp.departure_date);

            return (
              <div
                key={grp.id}
                className="rounded-3xl bg-slate-950/80 border border-slate-800 p-6 hover:border-emerald-500/40 transition shadow-xl flex flex-col justify-between group"
              >
                <div>
                  {/* Card Header & Countdown */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-[11px] font-bold border border-emerald-500/20">
                      {grp.status === 'open' ? 'بکنگ جاری ہے (Open)' : 'مکمل (Closed)'}
                    </span>

                    {daysLeft !== null && (
                      <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold flex items-center gap-1 ${
                        daysLeft <= 7
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          : 'bg-slate-800 text-slate-300'
                      }`}>
                        <Clock className="w-3 h-3" />
                        {daysLeft > 0 ? `روانگی: ${daysLeft} دن باقی` : 'روانہ ہو چکا'}
                      </span>
                    )}
                  </div>

                  <h3 className="font-extrabold text-base text-white group-hover:text-emerald-400 transition leading-snug">
                    {grp.group_name}
                  </h3>

                  {/* Occupancy Progress Bar */}
                  <div className="mt-4 p-3.5 rounded-2xl bg-slate-900 border border-slate-800/80">
                    <div className="flex items-center justify-between text-xs mb-1.5 font-medium">
                      <span className="text-slate-400">سیٹوں کی اوکیوپینسی:</span>
                      <span className="text-emerald-400 font-bold">
                        {booked} / {total} سیٹیں ({percentage}%)
                      </span>
                    </div>
                    <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between items-center mt-1.5 text-[10px] text-slate-400">
                      <span>خالی سیٹیں: {Math.max(0, total - booked)}</span>
                      <span>بک شدہ: {booked}</span>
                    </div>
                  </div>

                  {/* Group Details */}
                  <div className="mt-4 space-y-2 text-xs text-slate-300 border-t border-slate-900 pt-3">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-500" />
                        تاریخ روانگی:
                      </span>
                      <span className="font-semibold text-white">{formatDate(grp.departure_date)}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 flex items-center gap-1.5">
                        <Plane className="w-3.5 h-3.5 text-slate-500" />
                        ایئرلائن:
                      </span>
                      <span className="font-semibold text-white">{grp.airline || 'Scheduled'}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-slate-500" />
                        مکہ / مدینہ ہوٹل:
                      </span>
                      <span className="font-semibold text-white truncate max-w-[140px]">
                        {grp.makkah_hotel || 'swissotel'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 flex items-center gap-1.5">
                        <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                        پیکج فی کس:
                      </span>
                      <span className="font-bold text-emerald-400">{formatCurrency(grp.price_per_person)}</span>
                    </div>
                  </div>
                </div>

                {/* Footer Buttons */}
                <div className="mt-5 pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                  <Link
                    href={`/dashboard/groups/${grp.id}/profit`}
                    className="px-3 py-1.5 rounded-xl bg-teal-500/10 hover:bg-teal-500/20 text-teal-300 text-xs font-semibold border border-teal-500/30 transition flex items-center gap-1"
                  >
                    <span>💰</span> گروپ منافع
                  </Link>

                  <Link
                    href={`/dashboard/groups/${grp.id}`}
                    className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-emerald-500 hover:text-slate-950 text-white text-xs font-bold transition flex items-center gap-1.5"
                  >
                    تفصیل اور زائرین
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* CREATE GROUP MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">+ نیا گروپ بنائیں</h3>
                  <p className="text-xs text-slate-400">عمرہ یا حج گروپ کی مکمل تفصیلات درج کریں</p>
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

            <form onSubmit={handleCreateGroup} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  گروپ کا نام (Group Name)*
                </label>
                <input
                  type="text"
                  required
                  placeholder='مثال: "Umrah Group 15 Dec 2026 - 40 Persons"'
                  value={formData.group_name}
                  onChange={(e) => setFormData({ ...formData, group_name: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    روانگی کی تاریخ (Departure Date)
                  </label>
                  <input
                    type="date"
                    value={formData.departure_date}
                    onChange={(e) => setFormData({ ...formData, departure_date: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    واپسی کی تاریخ (Return Date)
                  </label>
                  <input
                    type="date"
                    value={formData.return_date}
                    onChange={(e) => setFormData({ ...formData, return_date: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    ایئرلائن (Airline)
                  </label>
                  <input
                    type="text"
                    value={formData.airline}
                    onChange={(e) => setFormData({ ...formData, airline: e.target.value })}
                    placeholder="Saudi Airlines / PIA / Airblue"
                    className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    کل سیٹیں (Total Seats)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.total_seats}
                    onChange={(e) => setFormData({ ...formData, total_seats: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    مکہ ہوٹل (Makkah Hotel)
                  </label>
                  <input
                    type="text"
                    value={formData.makkah_hotel}
                    onChange={(e) => setFormData({ ...formData, makkah_hotel: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    مدینہ ہوٹل (Madina Hotel)
                  </label>
                  <input
                    type="text"
                    value={formData.madina_hotel}
                    onChange={(e) => setFormData({ ...formData, madina_hotel: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  پیکج قیمت فی کس (Price Per Person - PKR)
                </label>
                <input
                  type="number"
                  value={formData.price_per_person}
                  onChange={(e) => setFormData({ ...formData, price_per_person: e.target.value })}
                  placeholder="285000"
                  className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs placeholder-slate-500 focus:outline-none focus:border-emerald-500"
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
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 text-xs font-bold shadow-lg shadow-emerald-500/20 disabled:opacity-50"
                >
                  {submitting ? 'محفوظ ہو رہا ہے...' : 'گروپ محفوظ کریں'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
